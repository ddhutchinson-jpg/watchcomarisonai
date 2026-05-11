import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

type ReviewedImageRow = {
  watch_id: string;
  brand_name: string;
  collection_name: string;
  model_name: string;
  reference_number: string;
  official_search_query: string;
  suggested_source_url: string;
  suggested_image_url: string;
  reviewer_notes: string;
};

type WatchesUpdate = {
  primary_image_url: string;
  image_source_url: string;
  image_source_name: string;
  image_review_status: string;
  image_license_notes: string;
};

const requiredColumns: Array<keyof ReviewedImageRow> = [
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

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((csvRow) =>
    csvRow.some((csvValue) => csvValue.trim().length > 0),
  );
}

function toObjects(rows: string[][]) {
  const [headers, ...dataRows] = rows;

  if (!headers) {
    throw new Error("image-review-list.csv is empty.");
  }

  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column),
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  return dataRows.map((dataRow) => {
    const row = {} as ReviewedImageRow;

    headers.forEach((header, index) => {
      if (requiredColumns.includes(header as keyof ReviewedImageRow)) {
        row[header as keyof ReviewedImageRow] = dataRow[index]?.trim() ?? "";
      }
    });

    return row;
  });
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

  const inputPath = resolve("image-review-list.csv");
  const csv = await readFile(inputPath, "utf8");
  const rows = toObjects(parseCsv(csv));

  const supabase = createClient<{
    public: {
      Tables: {
        watches: {
          Update: WatchesUpdate;
        };
      };
    };
  }>(supabaseUrl, supabasePublishableKey);

  const errors: string[] = [];
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.watch_id || !row.suggested_image_url) {
      skipped += 1;
      continue;
    }

    const { error } = await supabase
      .schema("public")
      .from("watches")
      .update({
        primary_image_url: row.suggested_image_url,
        image_source_url: row.suggested_source_url,
        image_source_name: "Official brand page",
        image_review_status: "approved",
        image_license_notes: row.reviewer_notes,
      })
      .eq("id", row.watch_id);

    if (error) {
      errors.push(`watch_id ${row.watch_id}: ${error.message}`);
    } else {
      updated += 1;
    }
  }

  console.log("Image import summary");
  console.log(`Processed: ${rows.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  if (errors.length > 0) {
    console.log("Errors:");
    errors.forEach((error) => console.log(`- ${error}`));
  } else {
    console.log("Errors: none");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
