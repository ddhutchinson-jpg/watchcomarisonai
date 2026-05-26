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

const COMPARISON_PROMPT_VERSION = "2026-05-24-recommended-for-watch-labels";

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

function pairKey(watchAId: string, watchBId: string) {
  return normalizePair(watchAId, watchBId).join(":");
}

async function recordComparisonEvent(watchAId: string, watchBId: string) {
  const { error } = await supabaseAdmin.from("watch_comparison_events").insert({
    watch_a_id: watchAId,
    watch_b_id: watchBId,
    pair_key: pairKey(watchAId, watchBId),
    source: "ai_compare",
  });

  if (
    error &&
    !["42P01", "PGRST106", "PGRST205"].includes(error.code ?? "")
  ) {
    throw new Error(error.message);
  }
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
    crown_type: watch.crown_type,
    helium_escape_valve: watch.helium_escape_valve,
    caseback_type: watch.caseback_type,
    caseback_description: watch.caseback_description,
    bezel_type: watch.bezel_type,
    bezel_material: watch.bezel_material,
    bezel_insert_material: watch.bezel_insert_material,
    crystal_type: watch.crystal_type,
    crystal_coating: watch.crystal_coating,
    dial_color: watch.dial_color,
    dial_texture: watch.dial_texture,
    dial_finish_raw: watch.dial_finish_raw,
    indices_type: watch.indices_type,
    lume_type: watch.lume_type,
    water_resistance_m: watch.water_resistance_m,
    movement_type: watch.movement_type,
    caliber: watch.caliber,
    jewels: watch.jewels,
    frequency_hz: watch.frequency_hz,
    frequency_vph: watch.frequency_vph,
    power_reserve_hours: watch.power_reserve_hours,
    accuracy_claim: watch.accuracy_claim,
    cosc_certified: watch.cosc_certified,
    metas_certified: watch.metas_certified,
    magnetic_resistance_gauss: watch.magnetic_resistance_gauss,
    date_display: watch.date_display,
    has_chronograph: watch.has_chronograph,
    has_gmt: watch.has_gmt,
    bracelet_taper_from_mm: watch.bracelet_taper_from_mm,
    bracelet_taper_to_mm: watch.bracelet_taper_to_mm,
    bracelet_type: watch.bracelet_type,
    bracelet_material: watch.bracelet_material,
    bracelet_finish_raw: watch.bracelet_finish_raw,
    link_design_raw: watch.link_design_raw,
    clasp_type: watch.clasp_type,
    micro_adjustment_mm: watch.micro_adjustment_mm,
    micro_adjustment_positions: watch.micro_adjustment_positions,
    adjustment_system_normalized: watch.adjustment_system_normalized,
    adjustment_system_raw: watch.adjustment_system_raw,
    tool_free_adjustment: watch.tool_free_adjustment,
    wearability_notes: watch.wearability_notes,
    overall_wearability_summary: watch.overall_wearability_summary,
    comfort_notes: watch.comfort_notes,
    updated_at: watch.updated_at,
  };
}

function snapshotHash(watches: WatchComparisonRow[]) {
  const payload = {
    prompt_version: COMPARISON_PROMPT_VERSION,
    watches: watches
      .map(compactWatch)
      .sort((a, b) => a.watch_id.localeCompare(b.watch_id)),
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function comparisonPrompt(watches: WatchComparisonRow[]) {
  return `Compare these two watches for a watch enthusiast who wants help deciding which one better fits their preferences.

Rules:
- Use the canonical Watch Compare AI specs and pre-existing wearability notes below as your source data.
- Do not invent missing specs, market prices, service costs, resale behavior, accuracy claims, or brand facts not present in the data.
- If a field is missing, say it is not yet listed instead of guessing.
- Explain how listed specifications translate into real-world wearability, ownership experience, and enthusiast appeal.
- Identify category winners only when the provided data supports a meaningful distinction. If neither watch clearly wins, call it a tie.
- Keep the tone objective, collector-literate, and premium. Be thorough, but concise enough for an on-page comparison module.
- Avoid saying this was cached or stored.

Required response shape:
- summary: Start with the practical buying decision in 2-4 sentences. Explain the strongest overall package when the data supports it, and note if the choice depends on priorities.
- movement_comparison: Compare movement type, caliber, power reserve, performance/accuracy, technical sophistication, serviceability, and long-term reliability when listed. End with "Winner:" or "Winner: Tie" based only on listed data.
- fit_comparison: Compare case diameter, thickness, lug-to-lug, weight, wrist presence, comfort, and suitability for different wrist sizes. Include the pre-existing wearability summaries when present. End with "Winner:" or "Winner: Tie".
- daily_wear_comparison: Compare dial/legibility, lume, materials, finishing, bracelet/strap, clasp, water resistance, complications, travel/sports suitability, and everyday practicality. End with "Winner:" or "Winner: Tie".
- value_comparison: Compare MSRP/value, brand and heritage signals available in the data, ownership practicality, durability, maintenance expectations, and collector appeal. Do not discuss current market price or resale unless listed. End with "Winner:" or "Winner: Tie".
- enthusiast_take: Include concise pros and cons for each watch, a category scorecard out of 10 for Movement, Case & Wearability, Dial & Legibility, Materials & Finishing, Features & Functionality, Brand & Heritage, Value Proposition, and Ownership Experience, then give a final verdict that weighs the categories collectively rather than simply counting wins.
- recommended_for: 2-5 short recommendations that distinguish buyer priorities, such as technical superiority, craftsmanship, design, daily practicality, value, collector interest, or wrist fit. Each item must begin with the recommended watch name, or "Either watch:" if the recommendation applies to both.
- confidence_score: Set 0.25-0.45 when many important specs are missing, 0.45-0.7 when the comparison is partially supported, and 0.7-0.95 only when the data is rich enough for a strong recommendation.

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
        "You are Watch Compare AI, a precise luxury watch comparison assistant. Return only valid JSON that matches the requested schema.",
      input: comparisonPrompt(watches),
      text: {
        format: {
          type: "json_schema",
          name: "watch_pair_comparison",
          strict: true,
          schema: comparisonSchema,
        },
      },
      max_output_tokens: 1600,
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

    await recordComparisonEvent(watchAId, watchBId);

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
