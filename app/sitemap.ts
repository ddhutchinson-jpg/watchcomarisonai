import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { watchSlug, type WatchRouteParts } from "@/src/lib/watchRoutes";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://watchcompareai.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const { data: watches } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("brand_name,collection_name,model_name,reference_number")
    .eq("review_status", "approved")
    .returns<WatchRouteParts[]>();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/compare`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...((watches ?? []).map((watch) => ({
      url: `${siteUrl}/watches/${watchSlug(watch)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })) satisfies MetadataRoute.Sitemap),
  ];
}
