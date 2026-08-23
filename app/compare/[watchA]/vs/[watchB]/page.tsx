import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/app/BrandMark";
import { CompareClient } from "../../../CompareClient";
import {
  findWatchBySlug,
  loadWatches,
  watchIdForRoute,
} from "../../../watchData";
import {
  getOrCreatePairComparison,
  type PairComparisonResult,
} from "@/src/lib/pairComparison";
import { watchDisplayName, watchSlug } from "@/src/lib/watchRoutes";
import type { Watch } from "../../../CompareClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    watchA: string;
    watchB: string;
  }>;
};

function pairTitle(leftName: string, rightName: string) {
  return `${leftName} vs ${rightName}`;
}

function watchImageUrl(watch: Watch) {
  return watch.primary_image_url ?? watch.image_url ?? null;
}

function formatMsrp(watch: Watch) {
  const value = watch.msrp;
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return value ? String(value) : "MSRP not listed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: watch.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function compactSpec(value: string | number | boolean | null | undefined, unit = "") {
  if (value === null || value === undefined || value === "") {
    return "Not listed";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return `${value}${unit}`;
}

function WatchHeroCard({
  watch,
}: {
  watch: Watch;
}) {
  const imageUrl = watchImageUrl(watch);
  const name = watchDisplayName(watch);

  return (
    <article className="grid h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-end gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <Link
          href={`/watches/${watchSlug(watch)}`}
          className="text-xs font-bold text-zinc-600 transition hover:text-red-600"
        >
          View details
        </Link>
      </div>
      <div
        className="grid h-72 place-items-center bg-zinc-100 bg-contain bg-center bg-no-repeat"
        style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}
      >
        {!imageUrl ? (
          <span className="text-sm font-semibold text-zinc-500">
            Image not listed
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 p-5">
        <div className="min-h-24">
          <h2 className="text-2xl font-extrabold leading-tight text-black">
            {name}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {watch.reference_number || "Reference not listed"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              Case
            </dt>
            <dd className="mt-1 font-bold text-black">
              {compactSpec(watch.case_size_mm ?? watch.case_size, "mm")}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              MSRP
            </dt>
            <dd className="mt-1 font-bold text-black">{formatMsrp(watch)}</dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              Movement
            </dt>
            <dd className="mt-1 font-bold text-black">
              {compactSpec(watch.movement_type)}
            </dd>
          </div>
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              Reserve
            </dt>
            <dd className="mt-1 font-bold text-black">
              {compactSpec(watch.power_reserve_hours, "h")}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { watchA: watchASlug, watchB: watchBSlug } = await params;
  const { watches } = await loadWatches();
  const watchA = findWatchBySlug(watches, watchASlug);
  const watchB = findWatchBySlug(watches, watchBSlug);

  if (!watchA || !watchB) {
    return {
      title: "Comparison Not Found",
      robots: { index: false, follow: true },
    };
  }

  const leftName = watchDisplayName(watchA);
  const rightName = watchDisplayName(watchB);
  const title = pairTitle(leftName, rightName);
  const canonical = `/compare/${watchSlug(watchA)}/vs/${watchSlug(watchB)}`;

  return {
    title,
    description: `Compare ${leftName} and ${rightName} across specs, proportions, movement details, wearability notes, reviews, and research context on DeezWatchez.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | DeezWatchez`,
      description: `Side-by-side specs, review notes, and ownership context for ${leftName} vs ${rightName}.`,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | DeezWatchez`,
      description: `Side-by-side specs, review notes, and ownership context for ${leftName} vs ${rightName}.`,
    },
  };
}

export default async function WatchPairPage({ params }: PageProps) {
  const { watchA: watchASlug, watchB: watchBSlug } = await params;
  const { watches, popularComparisons, error } = await loadWatches();
  const watchA = findWatchBySlug(watches, watchASlug);
  const watchB = findWatchBySlug(watches, watchBSlug);
  const watchAId = watchIdForRoute(watchA);
  const watchBId = watchIdForRoute(watchB);

  if (!watchA || !watchB || !watchAId || !watchBId || watchAId === watchBId) {
    notFound();
  }

  const leftName = watchDisplayName(watchA);
  const rightName = watchDisplayName(watchB);
  const canonical = `/compare/${watchSlug(watchA)}/vs/${watchSlug(watchB)}`;
  let initialComparison: PairComparisonResult | null = null;

  try {
    const pairReview = await getOrCreatePairComparison(watchAId, watchBId, {
      recordEvent: true,
    });
    initialComparison = {
      summary: pairReview.comparison.summary,
      movement_comparison: pairReview.comparison.movement_comparison,
      fit_comparison: pairReview.comparison.fit_comparison,
      daily_wear_comparison: pairReview.comparison.daily_wear_comparison,
      value_comparison: pairReview.comparison.value_comparison,
      enthusiast_take: pairReview.comparison.enthusiast_take,
      recommended_for: pairReview.comparison.recommended_for,
      confidence_score: Number(pairReview.comparison.confidence_score),
    };
  } catch {
    initialComparison = null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pairTitle(leftName, rightName),
    url: canonical,
    description: `Side-by-side watch comparison for ${leftName} and ${rightName}.`,
    about: [
      {
        "@type": "Product",
        name: leftName,
        identifier: watchA.reference_number,
        brand: watchA.brand_name ?? watchA.brand,
      },
      {
        "@type": "Product",
        name: rightName,
        identifier: watchB.reference_number,
        brand: watchB.brand_name ?? watchB.brand,
      },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pairTitle(leftName, rightName),
          item: canonical,
        },
      ],
    },
  };

  return (
    <main className="min-h-screen bg-[#fbfbfa] px-3 py-4 text-black sm:px-6 sm:py-6 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-aureate">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <div className="px-5 py-4 sm:px-7">
              <BrandMark />
            </div>
            <div className="flex items-center gap-2 pr-4 sm:gap-3 sm:pr-7">
              <Link
                href="/"
                className="rounded-md border border-red-600/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-600 hover:text-white sm:px-4 sm:tracking-[0.18em]"
              >
                New Search
              </Link>
              <Link
                href="/about"
                className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600 sm:px-4 sm:tracking-[0.18em]"
              >
                About
              </Link>
            </div>
          </nav>

          <div className="border-t border-zinc-200 px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600 sm:text-sm sm:tracking-[0.24em]">
                1v1 Watch Comparison
              </p>
              <h1 className="mx-auto mt-3 max-w-4xl text-2xl font-extrabold leading-tight text-black sm:mt-4 sm:text-4xl lg:text-5xl">
                {pairTitle(leftName, rightName)}
              </h1>
              <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:mt-4 sm:leading-7">
                A focused side-by-side page for specs, fit, movement details,
                review notes, and enthusiast context.
              </p>
            </div>

            <div className="mt-7 grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] lg:items-stretch">
              <WatchHeroCard watch={watchA} />
              <div className="grid h-16 w-16 place-items-center self-center justify-self-center rounded-full bg-red-600 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(216,25,43,0.28)]">
                VS
              </div>
              <WatchHeroCard watch={watchB} />
            </div>
          </div>
        </header>

        <section className="py-6 sm:py-8">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-900">
              Unable to load watches: {error}
            </div>
          ) : (
            <CompareClient
              watches={watches}
              defaultWatchAId={watchAId}
              defaultWatchBId={watchBId}
              popularComparisons={popularComparisons}
              presentation="pair"
              initialComparison={initialComparison}
            />
          )}
        </section>
      </div>
    </main>
  );
}
