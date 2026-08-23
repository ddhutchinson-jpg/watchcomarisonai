"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Watch } from "./compare/CompareClient";
import {
  normalizeNamePart,
  watchDisplayName,
  watchSlug,
} from "@/src/lib/watchRoutes";

type ConciergeCategory = {
  label: string;
  matcher: (watch: Watch) => boolean;
};

type ConciergeApiResult = {
  categories?: string[];
  watchIds?: string[];
  summary?: string;
  error?: string;
};

const defaultPrompts = [
  "First serious watch under $5k",
  "Dive watch for daily wear",
  "GMT for travel",
  "Dress watch for a wedding",
  "Small wrist luxury watch",
  "Best value automatic under $3k",
  "Integrated bracelet alternatives",
  "Chronograph with strong heritage",
];

function watchBrand(watch: Watch) {
  return watch.brand_name ?? watch.brand ?? "Unknown";
}

function watchCollection(watch: Watch) {
  return watch.collection_name ?? watch.collection ?? null;
}

function watchModel(watch: Watch) {
  return watch.model_name ?? watch.model ?? null;
}

function watchImageUrl(watch: Watch) {
  return watch.primary_image_url ?? watch.image_url ?? null;
}

function watchKey(watch: Watch) {
  return String(
    watch.watch_id ??
      watch.id ??
      watch.reference_number ??
      watchSlug(watch),
  );
}

function numericPrice(watch: Watch) {
  const value = Number(watch.msrp);
  return Number.isFinite(value) ? value : null;
}

function watchMsrp(watch: Watch) {
  const value = watch.msrp;
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return value ? `MSRP ${value}` : null;
  }

  return `MSRP ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: watch.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric)}`;
}

function searchCorpus(watch: Watch) {
  return [
    watchDisplayName(watch),
    watch.reference_number,
    watch.case_material,
    watch.bezel_type,
    watch.dial_color,
    watch.movement_type,
    watch.bracelet_type,
    watch.overall_wearability_summary,
    watch.wearability_notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function categoryForQuery(query: string): ConciergeCategory[] {
  const normalized = query.toLowerCase();
  const categories: ConciergeCategory[] = [];
  const budgetMatch = normalized.match(
    /(?:under|below|less than|sub)\s*\$?\s*(\d+(?:\.\d+)?)\s*(k|m|thousand)?/,
  );

  if (budgetMatch) {
    const amount = Number.parseFloat(budgetMatch[1]);
    const multiplier = budgetMatch[2]?.startsWith("m")
      ? 1_000_000
      : budgetMatch[2]
        ? 1_000
        : 1;
    const budget = amount * multiplier;

    categories.push({
      label: `Under ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        notation: budget >= 1000 ? "compact" : "standard",
      }).format(budget)}`,
      matcher: (watch) => {
        const price = numericPrice(watch);
        return price !== null && price <= budget;
      },
    });
  }

  if (/\b(dive|diver|water|bezel|swim|ocean)\b/.test(normalized)) {
    categories.push({
      label: "Dive watches",
      matcher: (watch) => {
        const corpus = searchCorpus(watch);
        return /dive|diver|bezel|water/.test(corpus) || Number(watch.water_resistance_m) >= 150;
      },
    });
  }

  if (/\b(gmt|travel|timezone|time zone)\b/.test(normalized)) {
    categories.push({
      label: "GMT / travel",
      matcher: (watch) => Boolean(watch.has_gmt) || /gmt|travel/.test(searchCorpus(watch)),
    });
  }

  if (/\b(dress|wedding|formal|suit|slim)\b/.test(normalized)) {
    categories.push({
      label: "Dress watches",
      matcher: (watch) => /dress|slim|leather|formal|polished/.test(searchCorpus(watch)),
    });
  }

  if (/\b(daily|everyday|versatile|one watch|first)\b/.test(normalized)) {
    categories.push({
      label: "Daily wear",
      matcher: (watch) => /daily|versatile|comfort|wearability|bracelet/.test(searchCorpus(watch)),
    });
  }

  if (/\b(automatic|mechanical|movement)\b/.test(normalized)) {
    categories.push({
      label: "Automatic",
      matcher: (watch) => /automatic|mechanical/.test(searchCorpus(watch)),
    });
  }

  if (/\b(small|smaller|wrist|36|37|38|39|compact)\b/.test(normalized)) {
    categories.push({
      label: "Compact fit",
      matcher: (watch) => {
        const size = Number(watch.case_size_mm ?? watch.case_size);
        return Number.isFinite(size) ? size <= 39 : /compact|small|wearability/.test(searchCorpus(watch));
      },
    });
  }

  categories.push({
    label: "Compare top picks",
    matcher: () => true,
  });

  return categories.slice(0, 6);
}

function matcherForCategory(label: string) {
  return categoryForQuery(label)[0]?.matcher ?? ((watch: Watch) => {
    const normalized = normalizeNamePart(label).toLowerCase();

    if (!normalized) {
      return true;
    }

    return normalized
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .some((term) => searchCorpus(watch).includes(term));
  });
}

function queryMatchesWatch(watch: Watch, query: string) {
  const normalized = normalizeNamePart(query).toLowerCase();

  if (!normalized) {
    return true;
  }

  return normalized
    .split(/\s+/)
    .filter((term) => term.length > 1 && !["for", "and", "the", "with"].includes(term))
    .some((term) => searchCorpus(watch).includes(term));
}

export function HomeConcierge({ watches }: { watches: Watch[] }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [aiCategoryLabels, setAiCategoryLabels] = useState<string[]>([]);
  const [aiWatchKeys, setAiWatchKeys] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [compareKeys, setCompareKeys] = useState<string[]>([]);
  const categories = useMemo(
    () =>
      (aiCategoryLabels.length
        ? aiCategoryLabels.map((label) => ({
            label,
            matcher: matcherForCategory(label),
          }))
        : categoryForQuery(query)),
    [aiCategoryLabels, query],
  );
  const activeMatcher = categories.find((category) => category.label === activeCategory)?.matcher;
  const visibleWatches = useMemo(() => {
    const aiOrderedWatches = aiWatchKeys
      .map((key) => watches.find((watch) => watchKey(watch) === key))
      .filter((watch): watch is Watch => Boolean(watch));

    if (aiOrderedWatches.length) {
      return aiOrderedWatches
        .filter((watch) => (activeMatcher ? activeMatcher(watch) : true))
        .slice(0, 6);
    }

    const matches = watches
      .filter((watch) => queryMatchesWatch(watch, submittedQuery))
      .filter((watch) => (activeMatcher ? activeMatcher(watch) : true));

    return (matches.length ? matches : watches).slice(0, 6);
  }, [activeMatcher, aiWatchKeys, submittedQuery, watches]);
  const comparePair = useMemo(
    () =>
      compareKeys
        .map((key) => watches.find((watch) => watchKey(watch) === key))
        .filter((watch): watch is Watch => Boolean(watch)),
    [compareKeys, watches],
  );

  useEffect(() => {
    const nextQuery = query.trim();

    if (nextQuery.length < 3) {
      setAiCategoryLabels([]);
      setIsLoadingCategories(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoadingCategories(true);

      fetch("/api/concierge-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "categories", query: nextQuery }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = (await response.json()) as ConciergeApiResult;

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to generate categories.");
          }

          setAiCategoryLabels(payload.categories?.filter(Boolean).slice(0, 6) ?? []);
        })
        .catch((error) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          setAiCategoryLabels([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoadingCategories(false);
          }
        });
    }, 650);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  function runPrompt(nextQuery: string) {
    setQuery(nextQuery);
    setActiveCategory(null);
    setAiCategoryLabels([]);
    setAiSummary(null);
    setSearchError(null);
  }

  function addToCompare(watch: Watch) {
    const key = watchKey(watch);

    setCompareKeys((current) => {
      if (current.includes(key) || current.length >= 2) {
        return current;
      }

      return [...current, key];
    });
  }

  function removeFromCompare(watch: Watch) {
    const key = watchKey(watch);
    setCompareKeys((current) => current.filter((item) => item !== key));
  }

  async function runConciergeSearch() {
    const nextQuery = query.trim();

    if (!nextQuery || isSearching) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setActiveCategory(null);

    try {
      const response = await fetch("/api/concierge-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery }),
      });
      const payload = (await response.json()) as ConciergeApiResult;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to run concierge search.");
      }

      setSubmittedQuery(nextQuery);
      setAiCategoryLabels(payload.categories?.filter(Boolean).slice(0, 6) ?? []);
      setAiWatchKeys(payload.watchIds?.filter(Boolean).slice(0, 6) ?? []);
      setAiSummary(payload.summary ?? null);
    } catch (error) {
      setSubmittedQuery(nextQuery);
      setAiCategoryLabels([]);
      setAiWatchKeys([]);
      setAiSummary(null);
      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to run concierge search.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="grid gap-8">
      <div className="grid gap-6 rounded-lg border-2 border-black bg-white p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:p-6 lg:p-7">
        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_9.5rem]"
          onSubmit={(event) => {
            event.preventDefault();
            void runConciergeSearch();
          }}
        >
          <label className="sr-only" htmlFor="home-ai-search">
            AI powered watch search
          </label>
          <input
            id="home-ai-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveCategory(null);
              setAiCategoryLabels([]);
              setAiSummary(null);
              setSearchError(null);
            }}
            className="min-h-14 rounded-md border border-zinc-200 bg-zinc-50 px-4 text-base font-semibold text-black outline-none transition placeholder:text-zinc-500 focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10 sm:min-h-20 sm:px-5 sm:text-xl"
            placeholder="Search in natural language: budget, style, wrist fit, occasion, specs, or watches you are considering..."
          />
          <button
            type="submit"
            disabled={isSearching}
            className="min-h-11 w-full self-center rounded-md bg-red-600 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.1em] text-white transition hover:bg-black disabled:cursor-wait disabled:bg-zinc-300 sm:tracking-[0.12em]"
          >
            {isSearching ? "Searching" : "Ask Concierge"}
          </button>
        </form>

        {aiSummary || searchError ? (
          <p
            className={`rounded-md px-3 py-2 text-sm font-semibold ${
              searchError
                ? "bg-red-50 text-red-800"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {searchError
              ? "AI search is unavailable, so local matching is being shown."
              : aiSummary}
          </p>
        ) : null}

        <div className="grid gap-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600">
            {isLoadingCategories
              ? "Generating categories"
              : "Categories generated from this search"}
          </p>
          <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.label}
              type="button"
              aria-pressed={activeCategory === category.label}
              onClick={() =>
                setActiveCategory((current) =>
                  current === category.label ? null : category.label,
                )
              }
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-800 transition hover:border-red-600 hover:text-red-700 aria-pressed:border-red-600 aria-pressed:bg-red-600 aria-pressed:text-white"
            >
              {category.label}
            </button>
          ))}
          </div>
        </div>

        <div className="grid gap-3 border-t border-zinc-200 pt-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-zinc-500">
            Try a search
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {defaultPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => runPrompt(prompt)}
                className="min-h-12 rounded-md bg-zinc-100 px-3 py-2 text-left text-xs font-bold leading-5 text-zinc-700 transition hover:bg-zinc-200 hover:text-black"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="order-2 lg:order-none">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">
                Concierge matches
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-black sm:text-3xl">
                {submittedQuery
                  ? "Watches surfaced from your criteria"
                  : "Most popular watches right now"}
              </h2>
            </div>
            <span className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600">
              {visibleWatches.length} shown
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleWatches.map((watch, index) => {
              const imageUrl = watchImageUrl(watch);
              const isInCompare = compareKeys.includes(watchKey(watch));
              const isCompareFull = compareKeys.length >= 2;
              return (
                <article
                  key={`${watchSlug(watch)}-${index}`}
                  className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_16px_42px_rgba(0,0,0,0.07)]"
                >
                  <Link
                    href={`/watches/${watchSlug(watch)}`}
                    className="block"
                    aria-label={`View ${watchDisplayName(watch)}`}
                  >
                    <div
                      className="grid min-h-52 place-items-center bg-zinc-100 bg-contain bg-center bg-no-repeat"
                      style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
                    >
                      {!imageUrl ? (
                        <span className="text-sm font-semibold text-zinc-500">
                          Image not listed
                        </span>
                      ) : null}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-red-600">
                        {watchBrand(watch)}
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold leading-tight text-black">
                        {watchCollection(watch) ?? watchModel(watch) ?? watchDisplayName(watch)}
                      </h3>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        {watch.reference_number || "Reference not listed"}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-zinc-600">
                      {[watch.case_size_mm ? `${watch.case_size_mm}mm` : null, watch.movement_type, watchMsrp(watch)]
                        .filter(Boolean)
                        .join(" / ") || "Specs available on detail page"}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-sm">
                      <Link
                        href={`/watches/${watchSlug(watch)}`}
                        className="font-bold text-black transition hover:text-red-600"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        disabled={isInCompare || isCompareFull}
                        onClick={() => addToCompare(watch)}
                        className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                      >
                        {isInCompare ? "In compare" : "Add to compare"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="order-1 h-fit rounded-lg bg-black p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:p-5 lg:order-none lg:mt-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-500">
            Compare tray
          </p>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight">
            Ready for a 1v1
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            The homepage keeps discovery here. Users only leave when they open
            a watch detail page or commit to a comparison.
          </p>
          <div className="mt-5 grid gap-2">
            {comparePair.map((watch) => (
              <div
                key={watchSlug(watch)}
                className="flex items-start justify-between gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold"
              >
                <span>{watchDisplayName(watch)}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(watch)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  aria-label={`Remove ${watchDisplayName(watch)} from compare tray`}
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {comparePair.length === 2 ? (
            <Link
              href={`/compare/${watchSlug(comparePair[0])}/vs/${watchSlug(comparePair[1])}`}
              className="mt-5 grid min-h-12 place-items-center rounded-md bg-red-600 px-4 text-center text-xs font-extrabold uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-black sm:text-sm sm:tracking-[0.14em]"
            >
              Open 1v1 comparison
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 grid min-h-12 w-full cursor-not-allowed place-items-center rounded-md bg-zinc-700 px-4 text-center text-xs font-extrabold uppercase tracking-[0.1em] text-zinc-400 sm:text-sm sm:tracking-[0.14em]"
            >
              Open 1v1 comparison
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
