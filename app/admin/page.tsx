import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

type ComparisonEventRow = {
  watch_a_id: string;
  watch_b_id: string;
  pair_key: string;
  created_at: string;
};

type PairComparisonRow = {
  id: string;
  watch_a_id: string;
  watch_b_id: string;
  summary: string | null;
  confidence_score: string | number | null;
  model_used: string | null;
  created_at: string;
  updated_at: string;
};

type WatchLookupRow = {
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
};

type TopPair = {
  pairKey: string;
  watchAId: string;
  watchBId: string;
  requestCount: number;
};

const topPairWindowDays = 30;
const recentLimit = 10;

function isMissingMetricsTableError(errorCode?: string) {
  return ["42P01", "PGRST106", "PGRST205"].includes(errorCode ?? "");
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value: string | null) {
  if (!value) return "Not recorded";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function watchName(watch: WatchLookupRow | null | undefined) {
  if (!watch) return "Unknown watch";

  return [
    watch.brand_name,
    watch.collection_name,
    watch.model_name,
    watch.reference_number,
  ]
    .filter(Boolean)
    .join(" ");
}

function pairName(
  pair: { watchAId: string; watchBId: string },
  watchLookup: Map<string, WatchLookupRow>,
) {
  return `${watchName(watchLookup.get(pair.watchAId))} vs ${watchName(
    watchLookup.get(pair.watchBId),
  )}`;
}

async function countRows(
  table: "watch_comparison_events" | "watch_pair_comparisons",
  createdAfter?: string,
) {
  let query = supabaseAdmin.from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (createdAfter) {
    query = query.gte("created_at", createdAfter);
  }

  const { count, error } = await query;

  if (error) {
    if (isMissingMetricsTableError(error.code)) return null;
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function loadRecentEvents(since: string) {
  const { data, error } = await supabaseAdmin
    .from("watch_comparison_events")
    .select("watch_a_id,watch_b_id,pair_key,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000)
    .returns<ComparisonEventRow[]>();

  if (error) {
    if (isMissingMetricsTableError(error.code)) return null;
    throw new Error(error.message);
  }

  return data ?? [];
}

async function loadRecentComparisons() {
  const { data, error } = await supabaseAdmin
    .from("watch_pair_comparisons")
    .select(
      "id,watch_a_id,watch_b_id,summary,confidence_score,model_used,created_at,updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<PairComparisonRow[]>();

  if (error) {
    if (isMissingMetricsTableError(error.code)) return null;
    throw new Error(error.message);
  }

  return data ?? [];
}

async function loadWatchLookup(watchIds: string[]) {
  if (watchIds.length === 0) return new Map<string, WatchLookupRow>();

  const { data, error } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("watch_id,brand_name,collection_name,model_name,reference_number")
    .in("watch_id", watchIds)
    .returns<WatchLookupRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((watch) => [watch.watch_id, watch]));
}

function topPairsFromEvents(events: ComparisonEventRow[]) {
  const pairCounts = new Map<string, TopPair>();

  for (const event of events) {
    const current = pairCounts.get(event.pair_key) ?? {
      pairKey: event.pair_key,
      watchAId: event.watch_a_id,
      watchBId: event.watch_b_id,
      requestCount: 0,
    };

    current.requestCount += 1;
    pairCounts.set(event.pair_key, current);
  }

  return [...pairCounts.values()]
    .sort((left, right) => right.requestCount - left.requestCount)
    .slice(0, 5);
}

async function loadDashboardData() {
  const todayIso = startOfToday().toISOString();
  const topPairSinceIso = daysAgo(topPairWindowDays).toISOString();

  const [
    compareRequestsToday,
    newGenerationsToday,
    allCompareRequests,
    allGeneratedComparisons,
    recentEvents,
    recentComparisons,
  ] = await Promise.all([
    countRows("watch_comparison_events", todayIso),
    countRows("watch_pair_comparisons", todayIso),
    countRows("watch_comparison_events"),
    countRows("watch_pair_comparisons"),
    loadRecentEvents(topPairSinceIso),
    loadRecentComparisons(),
  ]);

  const topPairs = topPairsFromEvents(recentEvents ?? []);
  const latestComparisons = (recentComparisons ?? []).slice(0, recentLimit);
  const watchIds = new Set<string>();

  for (const pair of topPairs) {
    watchIds.add(pair.watchAId);
    watchIds.add(pair.watchBId);
  }

  for (const comparison of latestComparisons) {
    watchIds.add(comparison.watch_a_id);
    watchIds.add(comparison.watch_b_id);
  }

  const watchLookup = await loadWatchLookup([...watchIds]);

  return {
    compareRequestsToday,
    newGenerationsToday,
    savedComparisonReusesToday:
      compareRequestsToday === null || newGenerationsToday === null
        ? null
        : Math.max(compareRequestsToday - newGenerationsToday, 0),
    allCompareRequests,
    allGeneratedComparisons,
    topPairs,
    latestComparisons,
    watchLookup,
    eventsTableMissing: recentEvents === null || compareRequestsToday === null,
    comparisonsTableMissing:
      recentComparisons === null || newGenerationsToday === null,
  };
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | null;
  detail: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne/80">
        {label}
      </p>
      <p className="mt-3 font-serif text-4xl leading-none text-platinum">
        {value === null ? "n/a" : formatNumber(value)}
      </p>
      <p className="mt-3 text-sm leading-6 text-pewter">{detail}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-white/15 bg-black/20 p-5 text-sm leading-6 text-pewter">
      {message}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const dashboard = await loadDashboardData();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="border border-white/10 bg-black/25 p-5 shadow-aureate sm:p-7">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne"
            >
              Watch Compare AI
            </Link>
            <Link
              href="/admin/spec-review"
              className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
            >
              Spec Review
            </Link>
          </nav>
          <div className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-champagne/80">
                Admin Dashboard
              </p>
              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[0.98] text-platinum sm:text-5xl lg:text-6xl">
                AI Comparison Activity
              </h1>
            </div>
            <p className="text-sm leading-6 text-pewter">
              Daily compare demand, generated comparison volume, reuse activity,
              and the pairs people are asking for most.
            </p>
          </div>
        </header>

        {dashboard.eventsTableMissing || dashboard.comparisonsTableMissing ? (
          <div className="border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            Some metrics are unavailable because one or more comparison tracking
            tables could not be read. Apply the comparison event and pair
            comparison migrations to unlock the full dashboard.
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            detail="AI compare button requests since local midnight."
            label="Requests Today"
            value={dashboard.compareRequestsToday}
          />
          <MetricCard
            detail="New rows created in saved AI pair comparisons today."
            label="New AI Generations"
            value={dashboard.newGenerationsToday}
          />
          <MetricCard
            detail="Requests served from existing saved comparison rows today."
            label="Saved Reuses"
            value={dashboard.savedComparisonReusesToday}
          />
          <MetricCard
            detail="Lifetime compare requests recorded by the event table."
            label="All Requests"
            value={dashboard.allCompareRequests}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne/80">
                Top Pairs
              </p>
              <h2 className="mt-2 font-serif text-2xl text-platinum">
                Last {topPairWindowDays} Days
              </h2>
            </div>
            <div className="grid gap-3 p-4">
              {dashboard.topPairs.length > 0 ? (
                dashboard.topPairs.map((pair, index) => (
                  <div
                    className="grid gap-3 border border-white/10 bg-black/20 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center"
                    key={pair.pairKey}
                  >
                    <span className="font-serif text-2xl text-champagne">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold leading-6 text-platinum">
                      {pairName(pair, dashboard.watchLookup)}
                    </p>
                    <span className="w-fit border border-champagne/20 px-2 py-1 text-xs font-semibold text-champagne">
                      {formatNumber(pair.requestCount)} requests
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState message="No compare requests have been recorded in this window yet." />
              )}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne/80">
                    Generated Comparisons
                  </p>
                  <h2 className="mt-2 font-serif text-2xl text-platinum">
                    Last {recentLimit}
                  </h2>
                </div>
                <span className="text-xs text-pewter">
                  {dashboard.allGeneratedComparisons === null
                    ? "n/a"
                    : `${formatNumber(
                        dashboard.allGeneratedComparisons,
                      )} saved total`}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              {dashboard.latestComparisons.length > 0 ? (
                <table className="min-w-[40rem] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-pewter">
                      <th className="px-4 py-3 font-semibold">Pair</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                      <th className="px-4 py-3 font-semibold">Model</th>
                      <th className="px-4 py-3 font-semibold">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.latestComparisons.map((comparison) => (
                      <tr
                        className="border-b border-white/10 align-top last:border-b-0"
                        key={comparison.id}
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold leading-6 text-platinum">
                            {pairName(
                              {
                                watchAId: comparison.watch_a_id,
                                watchBId: comparison.watch_b_id,
                              },
                              dashboard.watchLookup,
                            )}
                          </p>
                          {comparison.summary ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-pewter">
                              {comparison.summary}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-pewter">
                          {formatDateTime(comparison.created_at)}
                        </td>
                        <td className="px-4 py-4 text-pewter">
                          {comparison.model_used ?? "Not recorded"}
                        </td>
                        <td className="px-4 py-4 text-pewter">
                          {comparison.confidence_score === null
                            ? "n/a"
                            : Number(comparison.confidence_score).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4">
                  <EmptyState message="No generated AI comparisons have been saved yet." />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
