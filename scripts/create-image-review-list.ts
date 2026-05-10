import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

type WatchImageReviewRow = {
  watch_id: string | number | null;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
  primary_image_url: string | null;
};

const outputColumns = [
  "watch_id",
  "brand_name",
  "collection_name",
  "model_name",
  "reference_number",
  "official_search_query",
  "suggested_source_url",
  "suggested_image_url",
  "reviewer_notes",
];

function csvEscape(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function officialSearchQuery(row: WatchImageReviewRow) {
  return [
    row.brand_name,
    row.collection_name,
    row.model_name,
    row.reference_number,
    "official product image",
  ]
    .filter(Boolean)
    .join(" ");
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }

  const supabase = createClient<{
    public: {
      Views: {
        watch_comparison_view: {
          Row: WatchImageReviewRow;
        };
      };
    };
  }>(supabaseUrl, supabasePublishableKey);

  const { data, error } = await supabase
    .schema("public")
    .from("watch_comparison_view")
    .select(
      [
        "watch_id",
        "brand_name",
        "collection_name",
        "model_name",
        "reference_number",
        "primary_image_url",
      ].join(","),
    )
    .is("primary_image_url", null)
    .order("brand_name", { ascending: true })
    .order("collection_name", { ascending: true })
    .order("model_name", { ascending: true })
    .returns<WatchImageReviewRow[]>();

  if (error) {
    throw new Error(`Failed to load watches: ${error.message}`);
  }

  const rows = data ?? [];
  const csvRows = [
    outputColumns.join(","),
    ...rows.map((row) =>
      [
        row.watch_id,
        row.brand_name,
        row.collection_name,
        row.model_name,
        row.reference_number,
        officialSearchQuery(row),
        "",
        "",
        "",
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  const outputPath = resolve("image-review-list.csv");
  await writeFile(outputPath, `${csvRows.join("\n")}\n`, "utf8");

  console.log(`Wrote ${rows.length} watches to ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
