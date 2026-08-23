import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { watchSlug, type WatchRouteParts } from "@/src/lib/watchRoutes";
import { loadPopularComparisons } from "./compare/watchData";
import type { Watch } from "./compare/CompareClient";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://deezwatchez.com";

type SitemapWatch = WatchRouteParts &
  Pick<Watch, "id" | "watch_id">;

type SavedPairComparison = {
  watch_a_id: string;
  watch_b_id: string;
  updated_at: string | null;
};

function watchId(watch: SitemapWatch) {
  const id = watch.watch_id ?? watch.id;
  return id === null || id === undefined ? null : String(id);
}

function pairRoute(watchA: WatchRouteParts, watchB: WatchRouteParts) {
  return `${siteUrl}/compare/${watchSlug(watchA)}/vs/${watchSlug(watchB)}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { data: watches, error } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("id,watch_id,brand_name,collection_name,model_name,reference_number")
    .eq("review_status", "approved")
    .returns<SitemapWatch[]>();

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ] satisfies MetadataRoute.Sitemap;

  if (error) {
    console.error("Unable to load watches for sitemap.", error);
    return staticRoutes;
  }

  const approvedWatches = watches ?? [];
  const watchById = new Map(
    approvedWatches
      .map((watch) => {
        const id = watchId(watch);
        return id ? ([id, watch] as const) : null;
      })
      .filter((entry): entry is readonly [string, SitemapWatch] => Boolean(entry)),
  );

  const watchRoutes = approvedWatches
    .map((watch) => watchSlug(watch))
    .filter(Boolean)
    .map((slug) => ({
      url: `${siteUrl}/watches/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) satisfies MetadataRoute.Sitemap;

  const pairRoutes = new Map<string, MetadataRoute.Sitemap[number]>();

  const { data: savedPairComparisons, error: savedPairError } =
    await supabaseAdmin
      .from("watch_pair_comparisons")
      .select("watch_a_id,watch_b_id,updated_at")
      .order("updated_at", { ascending: false })
      .limit(200)
      .returns<SavedPairComparison[]>();

  if (savedPairError && !["42P01", "PGRST106", "PGRST205"].includes(savedPairError.code ?? "")) {
    console.error("Unable to load saved pair comparisons for sitemap.", savedPairError);
  }

  for (const comparison of savedPairComparisons ?? []) {
    const watchA = watchById.get(comparison.watch_a_id);
    const watchB = watchById.get(comparison.watch_b_id);

    if (!watchA || !watchB) {
      continue;
    }

    const url = pairRoute(watchA, watchB);
    pairRoutes.set(url, {
      url,
      lastModified: comparison.updated_at
        ? new Date(comparison.updated_at)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.78,
    });
  }

  for (const comparison of await loadPopularComparisons(approvedWatches, 50)) {
    const watchA = watchById.get(comparison.watchAId);
    const watchB = watchById.get(comparison.watchBId);

    if (!watchA || !watchB) {
      continue;
    }

    const url = pairRoute(watchA, watchB);
    pairRoutes.set(url, {
        url,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
    });
  }

  return [...staticRoutes, ...watchRoutes, ...pairRoutes.values()];
}
