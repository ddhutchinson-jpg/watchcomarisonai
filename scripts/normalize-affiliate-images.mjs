import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local", quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase URL and service role key are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const outputDir = path.join(process.cwd(), "public", "affiliate-images");
const canvas = {
  width: 640,
  height: 900,
  background: { r: 255, g: 255, b: 255, alpha: 1 },
};

function safeReference(referenceNumber) {
  return referenceNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function downloadImage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function normalizeImage(inputBuffer, outputPath) {
  const foreground = await sharp(inputBuffer)
    .trim({ background: "#ffffff", threshold: 28 })
    .resize({
      width: Math.round(canvas.width * 0.86),
      height: Math.round(canvas.height * 0.86),
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const normalized = await sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 4,
      background: canvas.background,
    },
  })
    .composite([{ input: foreground, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(outputPath, normalized);
}

async function loadAffiliateWatches(references) {
  let query = supabase
    .from("watches")
    .select(
      "id,reference_number,primary_image_url,affiliate_url,image_source_url",
    )
    .not("affiliate_url", "is", null)
    .not("primary_image_url", "is", null);

  if (references.length > 0) {
    query = query.in("reference_number", references);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function normalizeWatch(watch) {
  if (!watch.primary_image_url || watch.primary_image_url.startsWith("/")) {
    return {
      reference_number: watch.reference_number,
      skipped: "primary_image_url is already local or missing",
    };
  }

  const fileName = `${safeReference(watch.reference_number)}.png`;
  const relativeUrl = `/affiliate-images/${fileName}`;
  const outputPath = path.join(outputDir, fileName);
  const inputBuffer = await downloadImage(watch.primary_image_url);

  await normalizeImage(inputBuffer, outputPath);

  const { error } = await supabase
    .from("watches")
    .update({
      primary_image_url: relativeUrl,
      image_source_url: watch.image_source_url ?? watch.primary_image_url,
      image_source_name: "Normalized affiliate image",
      image_license_notes:
        "Normalized local image generated from affiliate retailer listing image; review permissions before production launch.",
      image_review_status: "needs_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", watch.id);

  if (error) {
    throw new Error(error.message);
  }

  return {
    reference_number: watch.reference_number,
    normalized_url: relativeUrl,
  };
}

async function main() {
  const references = process.argv.slice(2);
  await mkdir(outputDir, { recursive: true });

  const watches = await loadAffiliateWatches(references);
  const results = [];

  for (const watch of watches) {
    results.push(await normalizeWatch(watch));
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
