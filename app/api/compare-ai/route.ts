import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type WatchComparisonRow = Record<string, unknown> & {
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
};

type PairComparison = {
  summary: string;
  fit_comparison: string;
  movement_comparison: string;
  value_comparison: string;
  daily_wear_comparison: string;
  enthusiast_take: string;
  recommended_for: string[];
  confidence_score: number;
};

const comparisonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "fit_comparison",
    "movement_comparison",
    "value_comparison",
    "daily_wear_comparison",
    "enthusiast_take",
    "recommended_for",
    "confidence_score",
  ],
  properties: {
    summary: { type: "string" },
    fit_comparison: { type: "string" },
    movement_comparison: { type: "string" },
    value_comparison: { type: "string" },
    daily_wear_comparison: { type: "string" },
    enthusiast_take: { type: "string" },
    recommended_for: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
    },
    confidence_score: { type: "number", minimum: 0, maximum: 1 },
  },
};

function normalizePair(watchAId: string, watchBId: string) {
  return [watchAId, watchBId].sort();
}

function compactWatch(watch: WatchComparisonRow) {
  return {
    watch_id: watch.watch_id,
    brand: watch.brand_name,
    collection: watch.collection_name,
    model: watch.model_name,
    reference: watch.reference_number,
    msrp: watch.msrp,
    currency: watch.currency,
    case_material: watch.case_material,
    case_size_mm: watch.case_size_mm,
    case_thickness_mm: watch.case_thickness_mm,
    lug_to_lug_mm: watch.lug_to_lug_mm,
    lug_width_mm: watch.lug_width_mm,
    weight_grams: watch.weight_grams,
    water_resistance_m: watch.water_resistance_m,
    movement_type: watch.movement_type,
    caliber: watch.caliber,
    power_reserve_hours: watch.power_reserve_hours,
    date_display: watch.date_display,
    has_chronograph: watch.has_chronograph,
    has_gmt: watch.has_gmt,
    clasp_type: watch.clasp_type,
    micro_adjustment_mm: watch.micro_adjustment_mm,
    adjustment_system_normalized: watch.adjustment_system_normalized,
    overall_wearability_summary: watch.overall_wearability_summary,
    comfort_notes: watch.comfort_notes,
    updated_at: watch.updated_at,
  };
}

function snapshotHash(watches: WatchComparisonRow[]) {
  const payload = watches
    .map(compactWatch)
    .sort((a, b) => a.watch_id.localeCompare(b.watch_id));

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function comparisonPrompt(watches: WatchComparisonRow[]) {
  return `Compare these two watches for an enthusiast buyer using only the provided WatchComparisonAI data.

Rules:
- Do not invent missing specs.
- If a field is missing, say it is not yet listed instead of guessing.
- Keep the tone confident, concise, and premium.
- Make the recommendation useful for fit, daily wear, movement, budget/value, and enthusiast appeal.
- Avoid saying this was cached or stored.

Watch data:
${JSON.stringify(watches.map(compactWatch), null, 2)}`;
}

function parseResponseOutput(response: Record<string, unknown>) {
  const outputText = response.output_text;

  if (typeof outputText === "string") {
    return JSON.parse(outputText) as PairComparison;
  }

  const output = response.output;

  if (!Array.isArray(output)) {
    throw new Error("OpenAI response did not include output text.");
  }

  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item)) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") {
        return JSON.parse(text) as PairComparison;
      }
    }
  }

  throw new Error("OpenAI response did not include parseable JSON.");
}

async function generateComparison(watches: WatchComparisonRow[]) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "You are WatchComparisonAI, a precise luxury watch comparison assistant. Return only valid JSON that matches the requested schema.",
      input: comparisonPrompt(watches),
      text: {
        format: {
          type: "json_schema",
          name: "watch_pair_comparison",
          strict: true,
          schema: comparisonSchema,
        },
      },
      max_output_tokens: 900,
    }),
  });

  const json = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      typeof json.error === "object" && json.error && "message" in json.error
        ? String((json.error as { message: unknown }).message)
        : "OpenAI request failed.",
    );
  }

  return {
    comparison: parseResponseOutput(json),
    model,
    rawResponse: json,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      watchAId?: unknown;
      watchBId?: unknown;
    };

    if (typeof body.watchAId !== "string" || typeof body.watchBId !== "string") {
      return NextResponse.json(
        { error: "watchAId and watchBId are required." },
        { status: 400 },
      );
    }

    if (body.watchAId === body.watchBId) {
      return NextResponse.json(
        { error: "Choose two different watches to compare." },
        { status: 400 },
      );
    }

    const [watchAId, watchBId] = normalizePair(body.watchAId, body.watchBId);

    const { data: watches, error: watchesError } = await supabaseAdmin
      .from("watch_comparison_view")
      .select("*")
      .in("watch_id", [watchAId, watchBId])
      .returns<WatchComparisonRow[]>();

    if (watchesError) {
      throw new Error(watchesError.message);
    }

    if (!watches || watches.length !== 2) {
      return NextResponse.json(
        { error: "Unable to find both watches for comparison." },
        { status: 404 },
      );
    }

    const hash = snapshotHash(watches);

    const { data: cached, error: cachedError } = await supabaseAdmin
      .from("watch_pair_comparisons")
      .select("*")
      .eq("watch_a_id", watchAId)
      .eq("watch_b_id", watchBId)
      .eq("spec_snapshot_hash", hash)
      .maybeSingle();

    if (cachedError) {
      throw new Error(cachedError.message);
    }

    if (cached) {
      return NextResponse.json({
        source: "saved",
        comparison: cached,
      });
    }

    const generated = await generateComparison(watches);

    if (!generated) {
      return NextResponse.json(
        {
          error:
            "AI comparison is ready to wire up, but OPENAI_API_KEY is not configured yet.",
        },
        { status: 503 },
      );
    }

    const { comparison, model, rawResponse } = generated;
    const { data: saved, error: saveError } = await supabaseAdmin
      .from("watch_pair_comparisons")
      .upsert(
        {
          watch_a_id: watchAId,
          watch_b_id: watchBId,
          summary: comparison.summary,
          fit_comparison: comparison.fit_comparison,
          movement_comparison: comparison.movement_comparison,
          value_comparison: comparison.value_comparison,
          daily_wear_comparison: comparison.daily_wear_comparison,
          enthusiast_take: comparison.enthusiast_take,
          recommended_for: comparison.recommended_for,
          confidence_score: comparison.confidence_score,
          model_used: model,
          spec_snapshot_hash: hash,
          raw_response: rawResponse,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "watch_a_id,watch_b_id" },
      )
      .select("*")
      .single();

    if (saveError) {
      throw new Error(saveError.message);
    }

    return NextResponse.json({
      source: "generated",
      comparison: saved,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create AI comparison.",
      },
      { status: 500 },
    );
  }
}
