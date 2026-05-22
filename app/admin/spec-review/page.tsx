import { revalidatePath } from "next/cache";
import Link from "next/link";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type WatchReviewRow = {
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
  review_status: string | null;
  msrp: string | number | null;
  currency: string | null;
  case_material: string | null;
  case_size_mm: string | number | null;
  case_thickness_mm: string | number | null;
  lug_to_lug_mm: string | number | null;
  lug_width_mm: string | number | null;
  weight_grams: string | number | null;
  water_resistance_m: string | number | null;
  date_display: boolean | null;
  has_chronograph: boolean | null;
  has_gmt: boolean | null;
  movement_type: string | null;
  caliber: string | null;
  power_reserve_hours: string | number | null;
  bracelet_taper_from_mm: string | number | null;
  bracelet_taper_to_mm: string | number | null;
  clasp_type: string | null;
  micro_adjustment_mm: string | number | null;
  adjustment_system_normalized: string | null;
  overall_wearability_summary: string | null;
  comfort_notes: string | null;
};

type SpecCandidate = {
  id: string;
  watch_id: string;
  field_name: string;
  candidate_value: string;
  candidate_unit: string | null;
  source_url: string | null;
  source_name: string | null;
  source_type: string;
  confidence_score: string | number | null;
};

type CandidateCount = {
  watch_id: string;
  count: number;
};

type WatchSpecRow = {
  id: string;
  watch_id: string;
  [key: string]: string | number | boolean | null | undefined;
};

type PromotionCandidate = SpecCandidate & {
  created_at: string | null;
};

const sourceTypes = [
  "manufacturer",
  "retailer",
  "review",
  "forum",
  "video",
  "ai_inferred",
  "unknown",
];

const mvpFields = [
  "case_material",
  "msrp",
  "case_size_mm",
  "case_thickness_mm",
  "lug_to_lug_mm",
  "lug_width_mm",
  "weight_grams",
  "water_resistance_m",
  "date_display",
  "has_chronograph",
  "has_gmt",
  "movement_type",
  "caliber",
  "power_reserve_hours",
  "bracelet_taper_from_mm",
  "bracelet_taper_to_mm",
  "clasp_type",
  "micro_adjustment_mm",
  "adjustment_system_normalized",
  "overall_wearability_summary",
];

const launchReadyStatus = "approved";
const needsReviewStatus = "review";

const watchSpecFields = [
  "case_material",
  "case_size_mm",
  "case_thickness_mm",
  "lug_to_lug_mm",
  "lug_width_mm",
  "case_finish",
  "case_shape",
  "weight_grams",
  "water_resistance_m",
  "water_resistance_bar",
  "crown_type",
  "crown_guards",
  "pushers",
  "helium_escape_valve",
  "caseback_type",
  "caseback_description",
  "bezel_type",
  "bezel_material",
  "bezel_insert_material",
  "bezel_color",
  "bezel_action",
  "crystal_type",
  "crystal_shape",
  "crystal_coating",
  "dial_color",
  "dial_texture",
  "dial_finish_normalized",
  "dial_finish_raw",
  "indices_type",
  "hand_style",
  "lume_type",
  "lume_color",
  "date_display",
  "day_display",
  "running_seconds",
  "movement_type",
  "caliber",
  "in_house",
  "jewels",
  "frequency_hz",
  "frequency_vph",
  "power_reserve_hours",
  "accuracy_claim",
  "cosc_certified",
  "metas_certified",
  "escapement_notes",
  "complications",
  "rotor_type",
  "magnetic_resistance_gauss",
  "bracelet_included",
  "bracelet_type",
  "bracelet_material",
  "bracelet_reference_number",
  "bracelet_finish_normalized",
  "bracelet_finish_raw",
  "bracelet_taper_from_mm",
  "bracelet_taper_to_mm",
  "link_design_normalized",
  "link_design_raw",
  "end_link_type",
  "quick_release",
  "clasp_type",
  "clasp_finish_normalized",
  "clasp_finish_raw",
  "clasp_reference_code",
  "micro_adjustment_mm",
  "micro_adjustment_positions",
  "adjustment_system_normalized",
  "adjustment_system_raw",
  "tool_free_adjustment",
  "wears_true_small_large",
  "comfort_notes",
  "thickness_profile",
  "bracelet_comfort_notes",
  "clasp_comfort_notes",
  "overall_wearability_summary",
  "ai_summary",
  "spec_completeness_score",
  "has_chronograph",
  "has_gmt",
];

const watchSpecFieldSet = new Set(watchSpecFields);

const numericFields = new Set([
  "case_size_mm",
  "case_thickness_mm",
  "lug_to_lug_mm",
  "lug_width_mm",
  "weight_grams",
  "water_resistance_m",
  "water_resistance_bar",
  "jewels",
  "frequency_hz",
  "frequency_vph",
  "power_reserve_hours",
  "magnetic_resistance_gauss",
  "bracelet_taper_from_mm",
  "bracelet_taper_to_mm",
  "micro_adjustment_mm",
  "micro_adjustment_positions",
  "spec_completeness_score",
]);

const booleanFields = new Set([
  "crown_guards",
  "pushers",
  "helium_escape_valve",
  "date_display",
  "day_display",
  "running_seconds",
  "in_house",
  "cosc_certified",
  "metas_certified",
  "bracelet_included",
  "quick_release",
  "tool_free_adjustment",
  "has_chronograph",
  "has_gmt",
]);

function watchName(watch: WatchReviewRow) {
  return [
    watch.brand_name,
    watch.collection_name,
    watch.model_name,
    watch.reference_number,
  ]
    .filter(Boolean)
    .join(" ");
}

function missingFields(watch: WatchReviewRow) {
  return [
    !watch.case_material ? "case_material" : null,
    !watch.msrp ? "msrp" : null,
    !watch.case_size_mm ? "case_size_mm" : null,
    !watch.case_thickness_mm ? "case_thickness_mm" : null,
    !watch.lug_to_lug_mm ? "lug_to_lug_mm" : null,
    !watch.lug_width_mm ? "lug_width_mm" : null,
    !watch.weight_grams ? "weight_grams" : null,
    !watch.water_resistance_m ? "water_resistance_m" : null,
    watch.date_display === null ? "date_display" : null,
    watch.has_chronograph === null ? "has_chronograph" : null,
    watch.has_gmt === null ? "has_gmt" : null,
    !watch.movement_type ? "movement_type" : null,
    !watch.caliber ? "caliber" : null,
    !watch.power_reserve_hours ? "power_reserve_hours" : null,
    !watch.bracelet_taper_from_mm ? "bracelet_taper_from_mm" : null,
    !watch.bracelet_taper_to_mm ? "bracelet_taper_to_mm" : null,
    !watch.clasp_type ? "clasp_type" : null,
    !watch.micro_adjustment_mm && !watch.adjustment_system_normalized
      ? "micro_adjustment_mm"
      : null,
    !watch.micro_adjustment_mm && !watch.adjustment_system_normalized
      ? "adjustment_system_normalized"
      : null,
    !watch.overall_wearability_summary && !watch.comfort_notes
      ? "overall_wearability_summary"
      : null,
  ].filter((field): field is string => Boolean(field));
}

function candidateFieldOptions(missing: string[]) {
  return [...missing, ...mvpFields.filter((field) => !missing.includes(field))];
}

function hasCanonicalValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase();

  if (["true", "yes", "y", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "n", "0"].includes(normalized)) {
    return false;
  }

  return null;
}

function parseCandidateValue(fieldName: string, candidateValue: string) {
  if (booleanFields.has(fieldName)) {
    return parseBoolean(candidateValue);
  }

  if (numericFields.has(fieldName)) {
    const parsed = Number.parseFloat(candidateValue.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return candidateValue.trim();
}

function compareText(left?: string | null, right?: string | null) {
  return (left ?? "").localeCompare(right ?? "", undefined, {
    sensitivity: "base",
  });
}

async function loadCandidateCounts(watchIds: string[]) {
  const candidateRows: Pick<SpecCandidate, "watch_id">[] = [];
  const pageSize = 1000;

  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabaseAdmin
      .from("watch_spec_candidates")
      .select("watch_id")
      .in("watch_id", watchIds)
      .range(start, start + pageSize - 1)
      .returns<Pick<SpecCandidate, "watch_id">[]>();

    if (error) {
      throw new Error(error.message);
    }

    candidateRows.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }
  }

  const countByWatchId = new Map<string, number>();

  for (const row of candidateRows) {
    countByWatchId.set(row.watch_id, (countByWatchId.get(row.watch_id) ?? 0) + 1);
  }

  return [...countByWatchId.entries()].map(([watch_id, count]) => ({
    watch_id,
    count,
  }));
}

async function addSpecCandidate(formData: FormData) {
  "use server";

  const watchId = String(formData.get("watch_id") ?? "");
  const fieldName = String(formData.get("field_name") ?? "");
  const candidateValue = String(formData.get("candidate_value") ?? "").trim();
  const candidateUnit = String(formData.get("candidate_unit") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const sourceName = String(formData.get("source_name") ?? "").trim();
  const sourceType = String(formData.get("source_type") ?? "unknown");
  const confidenceText = String(formData.get("confidence_score") ?? "").trim();
  const extractionNotes = String(formData.get("extraction_notes") ?? "").trim();
  const evidenceExcerpt = String(formData.get("evidence_excerpt") ?? "").trim();

  if (!watchId || !fieldName || !candidateValue) {
    throw new Error("Watch, field, and candidate value are required.");
  }

  const confidenceScore = confidenceText ? Number(confidenceText) : null;

  if (
    confidenceScore !== null &&
    (!Number.isFinite(confidenceScore) ||
      confidenceScore < 0 ||
      confidenceScore > 1)
  ) {
    throw new Error("Confidence score must be between 0 and 1.");
  }

  const { error } = await supabaseAdmin.from("watch_spec_candidates").insert({
    watch_id: watchId,
    field_name: fieldName,
    candidate_value: candidateValue,
    candidate_unit: candidateUnit || null,
    source_url: sourceUrl || null,
    source_name: sourceName || null,
    source_type: sourceTypes.includes(sourceType) ? sourceType : "unknown",
    confidence_score: confidenceScore,
    extraction_notes: extractionNotes || null,
    evidence_excerpt: evidenceExcerpt || null,
    review_status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/spec-review");
}

async function updateSpecCandidate(formData: FormData) {
  "use server";

  const candidateId = String(formData.get("candidate_id") ?? "");
  const candidateValue = String(formData.get("candidate_value") ?? "").trim();
  const candidateUnit = String(formData.get("candidate_unit") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const sourceName = String(formData.get("source_name") ?? "").trim();
  const sourceType = String(formData.get("source_type") ?? "unknown");
  const confidenceText = String(formData.get("confidence_score") ?? "").trim();

  if (!candidateId || !candidateValue) {
    throw new Error("Candidate id and value are required.");
  }

  const confidenceScore = confidenceText ? Number(confidenceText) : null;

  if (
    confidenceScore !== null &&
    (!Number.isFinite(confidenceScore) ||
      confidenceScore < 0 ||
      confidenceScore > 1)
  ) {
    throw new Error("Confidence score must be between 0 and 1.");
  }

  const { error } = await supabaseAdmin
    .from("watch_spec_candidates")
    .update({
      candidate_value: candidateValue,
      candidate_unit: candidateUnit || null,
      source_url: sourceUrl || null,
      source_name: sourceName || null,
      source_type: sourceTypes.includes(sourceType) ? sourceType : "unknown",
      confidence_score: confidenceScore,
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidateId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/spec-review");
}

async function deleteSpecCandidate(formData: FormData) {
  "use server";

  const candidateId = String(formData.get("candidate_id") ?? "");

  if (!candidateId) {
    throw new Error("Candidate id is required.");
  }

  const { error } = await supabaseAdmin
    .from("watch_spec_candidates")
    .delete()
    .eq("id", candidateId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/spec-review");
}

async function promoteCandidateSpecsForWatch(watchId: string) {
  const { data: watch, error: watchError } = await supabaseAdmin
    .from("watches")
    .select("id, msrp")
    .eq("id", watchId)
    .single<{ id: string; msrp: number | string | null }>();

  if (watchError) {
    throw new Error(watchError.message);
  }

  const { data: existingSpec, error: specLoadError } = await supabaseAdmin
    .from("watch_specs")
    .select("*")
    .eq("watch_id", watchId)
    .maybeSingle<WatchSpecRow>();

  if (specLoadError) {
    throw new Error(specLoadError.message);
  }

  let spec = existingSpec;

  if (!spec) {
    const { data: insertedSpec, error: insertSpecError } = await supabaseAdmin
      .from("watch_specs")
      .insert({ watch_id: watchId })
      .select("*")
      .single<WatchSpecRow>();

    if (insertSpecError) {
      throw new Error(insertSpecError.message);
    }

    spec = insertedSpec;
  }

  const { data: candidates, error: candidatesError } = await supabaseAdmin
    .from("watch_spec_candidates")
    .select(
      "id,watch_id,field_name,candidate_value,candidate_unit,source_url,source_name,source_type,confidence_score,created_at",
    )
    .eq("watch_id", watchId)
    .returns<PromotionCandidate[]>();

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  const rankedCandidates = [...(candidates ?? [])].sort((a, b) => {
    const confidenceDelta =
      Number(b.confidence_score ?? 0) - Number(a.confidence_score ?? 0);

    if (confidenceDelta !== 0) {
      return confidenceDelta;
    }

    return (
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
    );
  });

  const specUpdates: Record<string, string | number | boolean> = {};
  const watchUpdates: Record<string, number> = {};

  for (const candidate of rankedCandidates) {
    if (candidate.field_name === "msrp" && !hasCanonicalValue(watch.msrp)) {
      const parsedMsrp = Number.parseFloat(
        candidate.candidate_value.replace(/,/g, ""),
      );

      if (Number.isFinite(parsedMsrp)) {
        watchUpdates.msrp = parsedMsrp;
      }

      continue;
    }

    if (!watchSpecFieldSet.has(candidate.field_name)) {
      continue;
    }

    if (
      hasCanonicalValue(spec[candidate.field_name]) ||
      hasCanonicalValue(specUpdates[candidate.field_name])
    ) {
      continue;
    }

    const parsedValue = parseCandidateValue(
      candidate.field_name,
      candidate.candidate_value,
    );

    if (parsedValue !== null && parsedValue !== "") {
      specUpdates[candidate.field_name] = parsedValue;
    }
  }

  if (Object.keys(watchUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from("watches")
      .update({
        ...watchUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", watchId);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (Object.keys(specUpdates).length > 0) {
    const { error } = await supabaseAdmin
      .from("watch_specs")
      .update({
        ...specUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", spec.id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

async function updateLaunchReady(formData: FormData) {
  "use server";

  const watchId = String(formData.get("watch_id") ?? "");
  const launchReady = String(formData.get("launch_ready") ?? "") === "true";

  if (!watchId) {
    throw new Error("Watch id is required.");
  }

  if (launchReady) {
    await promoteCandidateSpecsForWatch(watchId);
  }

  const { error } = await supabaseAdmin
    .from("watches")
    .update({
      review_status: launchReady ? launchReadyStatus : needsReviewStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", watchId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/spec-review");
}

async function syncCanonicalSpecs(formData: FormData) {
  "use server";

  const watchId = String(formData.get("watch_id") ?? "");

  if (!watchId) {
    throw new Error("Watch id is required.");
  }

  await promoteCandidateSpecsForWatch(watchId);
  revalidatePath("/admin/spec-review");
}

async function loadReviewData(selectedWatchId?: string) {
  const { data: watches, error: watchesError } = await supabaseAdmin
    .from("watch_comparison_view")
    .select(
      [
        "watch_id",
        "brand_name",
        "collection_name",
        "model_name",
        "reference_number",
        "review_status",
        "msrp",
        "currency",
        "case_material",
        "case_size_mm",
        "case_thickness_mm",
        "lug_to_lug_mm",
        "lug_width_mm",
        "weight_grams",
        "water_resistance_m",
        "date_display",
        "has_chronograph",
        "has_gmt",
        "movement_type",
        "caliber",
        "power_reserve_hours",
        "bracelet_taper_from_mm",
        "bracelet_taper_to_mm",
        "clasp_type",
        "micro_adjustment_mm",
        "adjustment_system_normalized",
        "overall_wearability_summary",
        "comfort_notes",
      ].join(","),
    )
    .eq("is_featured", true)
    .order("brand_name", { ascending: true })
    .order("collection_name", { ascending: true })
    .order("model_name", { ascending: true })
    .returns<WatchReviewRow[]>();

  if (watchesError) {
    throw new Error(watchesError.message);
  }

  const reviewItems = (watches ?? [])
    .map((watch) => ({
      watch,
      missing: missingFields(watch),
    }))
    .sort((a, b) => {
      return (
        compareText(a.watch.brand_name, b.watch.brand_name) ||
        compareText(a.watch.collection_name, b.watch.collection_name) ||
        compareText(a.watch.model_name, b.watch.model_name) ||
        compareText(a.watch.reference_number, b.watch.reference_number)
      );
    });

  const selectedReviewItem =
    reviewItems.find((item) => item.watch.watch_id === selectedWatchId) ??
    reviewItems[0] ??
    null;

  const watchIds = reviewItems.map((item) => item.watch.watch_id);
  const candidateCounts =
    watchIds.length > 0 ? await loadCandidateCounts(watchIds) : [];

  const { data: candidates, error: candidatesError } =
    selectedReviewItem !== null
      ? await supabaseAdmin
          .from("watch_spec_candidates")
          .select(
            "id,watch_id,field_name,candidate_value,candidate_unit,source_url,source_name,source_type,confidence_score",
          )
          .eq("watch_id", selectedReviewItem.watch.watch_id)
          .order("created_at", { ascending: false })
          .returns<SpecCandidate[]>()
      : { data: [], error: null };

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  return {
    reviewItems,
    selectedReviewItem,
    candidateCounts,
    candidates: candidates ?? [],
  };
}

type SpecReviewPageProps = {
  searchParams?: Promise<{
    watch?: string;
  }>;
};

function candidateCountFor(counts: CandidateCount[], watchId: string) {
  return counts.find((count) => count.watch_id === watchId)?.count ?? 0;
}

function isLaunchReady(watch: WatchReviewRow) {
  return watch.review_status === launchReadyStatus;
}

export default async function SpecReviewPage({
  searchParams,
}: SpecReviewPageProps) {
  const params = await searchParams;
  const selectedWatchId = params?.watch;
  const { reviewItems, selectedReviewItem, candidateCounts, candidates } =
    await loadReviewData(selectedWatchId);
  const readyCount = reviewItems.filter((item) =>
    isLaunchReady(item.watch),
  ).length;
  const missingCount = reviewItems.filter((item) => item.missing.length > 0).length;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[112rem]">
        <header className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            Internal Spec Review
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-platinum sm:text-6xl">
            Source missing watch specs.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-pewter sm:text-lg">
            Add sourced candidate values here first. Approved promotion into the
            canonical watch tables comes after review. Mark a watch launch ready
            once its specs are reviewed and it is ready for the public MVP.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter">
            <span className="border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {readyCount} launch ready
            </span>
            <span className="border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {reviewItems.length - readyCount} still reviewing
            </span>
            <span className="border border-white/10 bg-white/[0.04] px-3 py-1.5">
              {missingCount} with missing canonical specs
            </span>
          </div>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]">
          {reviewItems.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.04] p-8 text-pewter lg:col-span-2">
              No featured MVP watches found.
            </div>
          ) : (
            <>
              <aside className="h-fit border border-white/10 bg-white/[0.04]">
                <div className="border-b border-white/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-champagne">
                    Watches
                  </p>
                  <p className="mt-1 text-sm text-pewter">
                    {reviewItems.length} MVP watches
                  </p>
                </div>
                <div className="grid max-h-[70vh] overflow-y-auto">
                  {reviewItems.map(({ watch, missing }) => {
                    const isSelected =
                      watch.watch_id === selectedReviewItem?.watch.watch_id;
                    const ready = isLaunchReady(watch);
                    const count = candidateCountFor(
                      candidateCounts,
                      watch.watch_id,
                    );

                    return (
                      <div
                        className={`border-b border-white/10 p-3 transition hover:bg-white/[0.06] ${
                          isSelected
                            ? "bg-champagne/10 text-platinum"
                            : "text-pewter"
                        }`}
                        key={watch.watch_id}
                      >
                        <Link href={`/admin/spec-review?watch=${watch.watch_id}`}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne/80">
                              {watch.brand_name}
                            </p>
                            <span className="text-xs text-pewter">
                              {count} candidates
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-platinum">
                            {watchName(watch)}
                          </p>
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <form action={updateLaunchReady}>
                            <input
                              type="hidden"
                              name="watch_id"
                              value={watch.watch_id}
                            />
                            <input
                              type="hidden"
                              name="launch_ready"
                              value={ready ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className={`border px-2 py-0.5 text-[0.68rem] font-semibold transition ${
                                ready
                                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-300 hover:text-obsidian"
                                  : "border-white/10 bg-black/20 text-pewter hover:border-champagne/40 hover:text-champagne"
                              }`}
                            >
                              {ready ? "launch ready" : "mark ready"}
                            </button>
                          </form>
                          <span className="border border-white/10 bg-black/20 px-2 py-0.5 text-[0.68rem] text-pewter">
                            {missing.length} missing
                          </span>
                          {missing.slice(0, 2).map((field) => (
                            <span
                              className="border border-champagne/20 bg-black/20 px-2 py-0.5 text-[0.68rem] text-champagne"
                              key={field}
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>

              {selectedReviewItem ? (
                <div className="border border-white/10 bg-white/[0.04] shadow-aureate">
                  <div className="border-b border-white/10 p-4">
                    <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne/80">
                          {selectedReviewItem.watch.brand_name}
                        </p>
                        <h2 className="mt-2 font-serif text-2xl text-platinum">
                          {watchName(selectedReviewItem.watch)}
                        </h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <form action={updateLaunchReady}>
                            <input
                              type="hidden"
                              name="watch_id"
                              value={selectedReviewItem.watch.watch_id}
                            />
                            <input
                              type="hidden"
                              name="launch_ready"
                              value={
                                isLaunchReady(selectedReviewItem.watch)
                                  ? "false"
                                  : "true"
                              }
                            />
                            <button
                              type="submit"
                              className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition ${
                                isLaunchReady(selectedReviewItem.watch)
                                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-300 hover:text-obsidian"
                                  : "border-champagne/40 text-champagne hover:bg-champagne hover:text-obsidian"
                              }`}
                            >
                              {isLaunchReady(selectedReviewItem.watch)
                                ? "Launch ready"
                                : "Mark launch ready"}
                            </button>
                          </form>
                          <form action={syncCanonicalSpecs}>
                            <input
                              type="hidden"
                              name="watch_id"
                              value={selectedReviewItem.watch.watch_id}
                            />
                            <button
                              type="submit"
                              className="border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
                            >
                              Sync specs
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="flex max-w-3xl flex-wrap gap-2 xl:justify-end">
                        {selectedReviewItem.missing.slice(0, 12).map((field) => (
                          <span
                            key={field}
                            className="border border-champagne/20 bg-black/20 px-2 py-1 text-[0.68rem] font-semibold text-champagne"
                          >
                            {field}
                          </span>
                        ))}
                        {selectedReviewItem.missing.length > 12 ? (
                          <span className="px-2 py-1 text-xs text-pewter">
                            +{selectedReviewItem.missing.length - 12} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-4">
                    {candidates.length > 0 ? (
                      <div className="overflow-x-auto contain-content">
                        <div className="min-w-[52rem]">
                          <div className="grid grid-cols-[10rem_minmax(12rem,1fr)_4rem_10rem_8rem_5rem_10rem] gap-2 border-b border-white/10 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-pewter">
                            <span>Field</span>
                            <span>Value</span>
                            <span>Unit</span>
                            <span>Source</span>
                            <span>Type</span>
                            <span>Conf.</span>
                            <span />
                          </div>
                          <div className="grid gap-2 pt-2">
                            {candidates.map((candidate) => (
                              <form
                                action={updateSpecCandidate}
                                key={candidate.id}
                                className="grid grid-cols-[10rem_minmax(12rem,1fr)_4rem_10rem_8rem_5rem_10rem] gap-2 text-sm"
                              >
                                <input
                                  type="hidden"
                                  name="candidate_id"
                                  value={candidate.id}
                                />
                                <div className="flex min-h-10 items-center border border-white/10 bg-black/20 px-2 font-semibold text-champagne">
                                  {candidate.field_name}
                                </div>
                                <input
                                  name="candidate_value"
                                  defaultValue={candidate.candidate_value}
                                  className="h-10 rounded border border-white/10 bg-[#f4f0e8] px-2 text-obsidian"
                                />
                                <input
                                  name="candidate_unit"
                                  defaultValue={candidate.candidate_unit ?? ""}
                                  className="h-10 rounded border border-white/10 bg-[#f4f0e8] px-2 text-obsidian"
                                  placeholder="unit"
                                />
                                <input
                                  name="source_name"
                                  defaultValue={candidate.source_name ?? ""}
                                  className="h-10 rounded border border-white/10 bg-[#f4f0e8] px-2 text-obsidian"
                                  placeholder="Source"
                                />
                                <select
                                  name="source_type"
                                  defaultValue={candidate.source_type}
                                  className="h-10 rounded border border-white/10 bg-[#f4f0e8] px-2 text-obsidian"
                                >
                                  {sourceTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name="confidence_score"
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  defaultValue={
                                    candidate.confidence_score === null
                                      ? ""
                                      : String(candidate.confidence_score)
                                  }
                                  className="h-10 rounded border border-white/10 bg-[#f4f0e8] px-2 text-obsidian"
                                  placeholder="0.90"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="submit"
                                    className="h-10 rounded border border-champagne/40 px-2 text-xs font-bold uppercase tracking-[0.14em] text-champagne transition hover:bg-champagne hover:text-obsidian"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="submit"
                                    formAction={deleteSpecCandidate}
                                    className="h-10 rounded border border-red-400/50 px-2 text-xs font-bold uppercase tracking-[0.14em] text-red-200 transition hover:bg-red-400 hover:text-obsidian"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </form>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <details className="border border-white/10 bg-black/20">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-bold uppercase tracking-[0.16em] text-champagne">
                        Add Candidate
                      </summary>
                      <form action={addSpecCandidate} className="grid gap-3 border-t border-white/10 p-3">
                      <input type="hidden" name="watch_id" value={selectedReviewItem.watch.watch_id} />

                      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_5rem_1fr]">
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                        Field
                        <select
                          name="field_name"
                          className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                          required
                        >
                          {candidateFieldOptions(selectedReviewItem.missing).map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </label>

                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Candidate value
                          <input
                            name="candidate_value"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                            required
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Unit
                          <input
                            name="candidate_unit"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                            placeholder="USD for MSRP, mm/g/etc."
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Source name
                          <input
                            name="source_name"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                            placeholder="Official product page"
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-[1fr_10rem_7rem]">
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Source URL
                          <input
                            name="source_url"
                            type="url"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Source type
                          <select
                            name="source_type"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                            defaultValue="manufacturer"
                          >
                            {sourceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Confidence
                          <input
                            name="confidence_score"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                            placeholder="0.90"
                          />
                        </label>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Notes
                          <textarea
                            name="extraction_notes"
                            rows={2}
                            className="rounded border border-white/10 bg-[#f4f0e8] px-3 py-2 text-obsidian"
                          />
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                          Evidence excerpt
                          <textarea
                            name="evidence_excerpt"
                            rows={2}
                            className="rounded border border-white/10 bg-[#f4f0e8] px-3 py-2 text-obsidian"
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="h-11 rounded bg-champagne px-4 text-sm font-bold uppercase tracking-[0.18em] text-obsidian transition hover:bg-platinum lg:w-fit"
                      >
                        Add Candidate
                      </button>
                      </form>
                    </details>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
