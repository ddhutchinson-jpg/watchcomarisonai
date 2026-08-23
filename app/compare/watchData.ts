import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { watchSlug } from "@/src/lib/watchRoutes";
import type { PopularComparison, Watch } from "./CompareClient";

const defaultWatchReference = "L3.779.4.56.6";

type ComparisonEvent = {
  watch_a_id: string;
  watch_b_id: string;
  pair_key: string;
};

type WatchActivityEvent = {
  watch_id: string;
};

function isMissingEventsTableError(errorCode?: string) {
  return ["42P01", "PGRST106", "PGRST205"].includes(errorCode ?? "");
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function watchId(watch: Watch) {
  const id = watch.watch_id ?? watch.id;
  return id === null || id === undefined ? null : String(id);
}

export async function loadPopularComparisons(
  watches: Watch[],
  limit = 4,
): Promise<PopularComparison[]> {
  const availableWatchIds = new Set(
    watches.map(watchId).filter((id): id is string => Boolean(id)),
  );

  if (availableWatchIds.size === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("watch_comparison_events")
    .select("watch_a_id,watch_b_id,pair_key")
    .limit(5000)
    .returns<ComparisonEvent[]>();

  if (error) {
    if (isMissingEventsTableError(error.code)) {
      return [];
    }

    throw new Error(error.message);
  }

  const pairCounts = new Map<string, PopularComparison>();

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

  return [...pairCounts.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

async function sortWatchesByRecentPopularity(watches: Watch[]) {
  const watchIds = watches.map(watchId).filter((id): id is string => Boolean(id));

  if (!watchIds.length) {
    return watches;
  }

  const since = daysAgo(30).toISOString();
  const [
    { data: viewEvents, error: viewError },
    { data: searchEvents, error: searchError },
  ] = await Promise.all([
    supabaseAdmin
      .from("watch_view_events")
      .select("watch_id")
      .in("watch_id", watchIds)
      .gte("created_at", since)
      .limit(5000)
      .returns<WatchActivityEvent[]>(),
    supabaseAdmin
      .from("watch_search_events")
      .select("watch_id")
      .in("watch_id", watchIds)
      .gte("created_at", since)
      .limit(5000)
      .returns<WatchActivityEvent[]>(),
  ]);

  if (viewError && !isMissingEventsTableError(viewError.code)) {
    throw new Error(viewError.message);
  }

  if (searchError && !isMissingEventsTableError(searchError.code)) {
    throw new Error(searchError.message);
  }

  const activityCounts = new Map<string, number>();

  for (const event of [...(viewEvents ?? []), ...(searchEvents ?? [])]) {
    activityCounts.set(event.watch_id, (activityCounts.get(event.watch_id) ?? 0) + 1);
  }

  if (activityCounts.size === 0) {
    return watches;
  }

  return [...watches].sort((left, right) => {
    const leftCount = activityCounts.get(watchId(left) ?? "") ?? 0;
    const rightCount = activityCounts.get(watchId(right) ?? "") ?? 0;

    return (
      rightCount - leftCount ||
      String(left.brand_name ?? "").localeCompare(String(right.brand_name ?? "")) ||
      String(left.collection_name ?? "").localeCompare(String(right.collection_name ?? "")) ||
      String(left.model_name ?? "").localeCompare(String(right.model_name ?? ""))
    );
  });
}

export async function loadWatches() {
  const { data, error } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("*")
    .eq("is_featured", true)
    .eq("review_status", "approved")
    .order("brand_name", { ascending: true });

  const watches = await sortWatchesByRecentPopularity((data ?? []) as Watch[]);
  const defaultWatchA = watches.find(
    (watch) => watch.reference_number === defaultWatchReference,
  );
  const popularComparisons =
    watches.length > 0 ? await loadPopularComparisons(watches) : [];

  return {
    watches,
    defaultWatchAId:
      defaultWatchA?.watch_id === null || defaultWatchA?.watch_id === undefined
        ? null
        : String(defaultWatchA.watch_id),
    popularComparisons,
    error: error?.message ?? null,
  };
}

export function findWatchBySlug(watches: Watch[], slug: string) {
  return watches.find((watch) => watchSlug(watch) === slug) ?? null;
}

export function watchIdForRoute(watch: Watch | null | undefined) {
  const id = watch?.watch_id ?? watch?.id;
  return id === null || id === undefined ? null : String(id);
}
