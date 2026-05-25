import { CompareClient, type Watch } from "./CompareClient";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Luxury Watches",
  description:
    "Compare luxury watches by case size, thickness, lug-to-lug, movement, bracelet engineering, MSRP, and collector-focused wearability details.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare Luxury Watches | WatchComparisonAI",
    description:
      "Choose two watches and compare collector-grade specs, proportions, movement details, and AI-assisted review notes side by side.",
    url: "/compare",
    images: [
      {
        url: "/stats-watch-dial.png",
        width: 1024,
        height: 1024,
        alt: "WatchComparisonAI luxury watch dial stats graphic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Luxury Watches | WatchComparisonAI",
    description:
      "Compare collector-grade specs, proportions, movement details, and AI-assisted watch insights side by side.",
    images: ["/stats-watch-dial.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type ComparisonEvent = {
  watch_a_id: string;
  watch_b_id: string;
  pair_key: string;
};

const popularityWindowDays = 90;

function isMissingEventsTableError(errorCode?: string) {
  return ["42P01", "PGRST106", "PGRST205"].includes(errorCode ?? "");
}

async function loadPopularDefaultPair(availableWatchIds: Set<string>) {
  const since = new Date(
    Date.now() - popularityWindowDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("watch_comparison_events")
    .select("watch_a_id,watch_b_id,pair_key")
    .gte("created_at", since)
    .returns<ComparisonEvent[]>();

  if (error) {
    if (isMissingEventsTableError(error.code)) {
      return null;
    }

    throw new Error(error.message);
  }

  const pairCounts = new Map<
    string,
    { watchAId: string; watchBId: string; count: number }
  >();

  for (const event of data ?? []) {
    if (
      !availableWatchIds.has(event.watch_a_id) ||
      !availableWatchIds.has(event.watch_b_id)
    ) {
      continue;
    }

    const current = pairCounts.get(event.pair_key) ?? {
      watchAId: event.watch_a_id,
      watchBId: event.watch_b_id,
      count: 0,
    };

    current.count += 1;
    pairCounts.set(event.pair_key, current);
  }

  const popularPair = [...pairCounts.values()].sort(
    (left, right) => right.count - left.count,
  )[0];

  return popularPair
    ? {
        watchAId: popularPair.watchAId,
        watchBId: popularPair.watchBId,
      }
    : null;
}

async function loadWatches() {
  const { data, error } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("*")
    .eq("is_featured", true)
    .eq("review_status", "approved")
    .order("brand_name", { ascending: true });

  const watches = (data ?? []) as Watch[];
  const availableWatchIds = new Set(
    watches
      .map((watch) => watch.watch_id)
      .filter((id): id is string => typeof id === "string"),
  );
  const defaultPair =
    availableWatchIds.size > 0
      ? await loadPopularDefaultPair(availableWatchIds)
      : null;

  return {
    watches,
    defaultPair,
    error: error?.message ?? null,
  };
}

function HeaderStatsDial({
  watchCount,
  brandCount,
}: {
  watchCount: number;
  brandCount: number;
}) {
  return (
    <div
      aria-label={`${watchCount} watches and ${brandCount} brands`}
      className="relative h-44 w-44 shrink-0 overflow-hidden rounded border border-white/10 bg-black shadow-aureate sm:h-56 sm:w-56 md:h-64 md:w-64"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="object-cover object-center"
        fill
        sizes="(min-width: 768px) 16rem, (min-width: 640px) 14rem, 11rem"
        src="/stats-watch-dial.png"
      />
      <div className="absolute left-[36%] top-[57.5%] grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
        <span className="font-serif text-2xl leading-none text-[#25221e] drop-shadow-[0_1px_0_rgba(255,255,255,0.34)] sm:text-3xl md:text-4xl">
          {watchCount}
        </span>
        <span className="sr-only">watches</span>
        <span className="mt-1 font-serif text-[0.38rem] uppercase tracking-[0.18em] text-[#3d3830] sm:text-[0.46rem] md:text-[0.54rem]">
          Watches
        </span>
      </div>

      <div className="absolute left-[61%] top-[57.5%] grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center">
        <span className="font-serif text-2xl leading-none text-[#25221e] drop-shadow-[0_1px_0_rgba(255,255,255,0.34)] sm:text-3xl md:text-4xl">
          {brandCount}
        </span>
        <span className="sr-only">brands</span>
        <span className="mt-1 font-serif text-[0.38rem] uppercase tracking-[0.18em] text-[#3d3830] sm:text-[0.46rem] md:text-[0.54rem]">
          Brands
        </span>
      </div>
    </div>
  );
}

export default async function ComparePage() {
  const { watches, defaultPair, error } = await loadWatches();
  const brandCount = new Set(
    watches
      .map((watch) => watch.brand_name)
      .filter((brand): brand is string => Boolean(brand)),
  ).size;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="grid overflow-hidden border border-white/10 bg-black/25 shadow-aureate md:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="flex min-h-44 flex-col justify-center p-5 sm:min-h-56 sm:p-7 md:min-h-64">
            <nav className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne"
              >
                WatchComparisonAI
              </Link>
              <Link
                href="/about"
                className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
              >
                About
              </Link>
            </nav>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[0.98] text-platinum sm:text-5xl lg:text-6xl">
              Compare Watches With Collector-Grade Detail
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-pewter sm:text-base sm:leading-7">
              Evaluate references side by side across case proportions,
              movement architecture, bracelet engineering, MSRP, and real-world
              wearability.
            </p>
          </div>
          <div className="flex items-center justify-center border-t border-white/10 bg-black/20 p-4 md:border-l md:border-t-0">
            <HeaderStatsDial
              watchCount={watches.length}
              brandCount={brandCount}
            />
          </div>
        </header>

        <section className="py-6 sm:py-8">
          {error ? (
            <div className="rounded border border-red-400/30 bg-red-950/30 p-8 text-sm text-red-100">
              Unable to load watches: {error}
            </div>
          ) : (
            <CompareClient
              watches={watches}
              defaultWatchAId={defaultPair?.watchAId ?? null}
              defaultWatchBId={defaultPair?.watchBId ?? null}
            />
          )}
        </section>
      </div>
    </main>
  );
}
