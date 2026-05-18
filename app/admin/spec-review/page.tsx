import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type WatchReviewRow = {
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
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

const coreFields = new Set(mvpFields.slice(0, 14));

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

async function loadReviewData() {
  const { data: watches, error: watchesError } = await supabaseAdmin
    .from("watch_comparison_view")
    .select(
      [
        "watch_id",
        "brand_name",
        "collection_name",
        "model_name",
        "reference_number",
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

  const incompleteWatches = (watches ?? [])
    .map((watch) => ({
      watch,
      missing: missingFields(watch),
    }))
    .filter((item) => item.missing.length > 0)
    .sort((a, b) => {
      const coreA = a.missing.filter((field) => coreFields.has(field)).length;
      const coreB = b.missing.filter((field) => coreFields.has(field)).length;
      return coreB - coreA || b.missing.length - a.missing.length;
    })
    .slice(0, 100);

  const watchIds = incompleteWatches.map((item) => item.watch.watch_id);
  const { data: candidates, error: candidatesError } =
    watchIds.length > 0
      ? await supabaseAdmin
          .from("watch_spec_candidates")
          .select(
            "id,watch_id,field_name,candidate_value,candidate_unit,source_url,source_name,source_type,confidence_score",
          )
          .in("watch_id", watchIds)
          .order("created_at", { ascending: false })
          .returns<SpecCandidate[]>()
      : { data: [], error: null };

  if (candidatesError) {
    throw new Error(candidatesError.message);
  }

  return {
    incompleteWatches,
    candidates: candidates ?? [],
  };
}

export default async function SpecReviewPage() {
  const { incompleteWatches, candidates } = await loadReviewData();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            Internal Spec Review
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-platinum sm:text-6xl">
            Source missing watch specs.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-pewter sm:text-lg">
            Add sourced candidate values here first. Approved promotion into the
            canonical watch tables comes after review.
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {incompleteWatches.length === 0 ? (
            <div className="border border-white/10 bg-white/[0.04] p-8 text-pewter">
              No missing specs found.
            </div>
          ) : (
            incompleteWatches.map(({ watch, missing }, index) => {
              const existingCandidates = candidates.filter(
                (candidate) => candidate.watch_id === watch.watch_id,
              );

              return (
                <details
                  key={watch.watch_id}
                  open={index < 3}
                  className="border border-white/10 bg-white/[0.04] shadow-aureate"
                >
                  <summary className="cursor-pointer list-none border-b border-white/10 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne/80">
                            {watch.brand_name}
                          </p>
                          <span className="border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-pewter">
                            {missing.length} missing
                          </span>
                          <span className="border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-pewter">
                            {existingCandidates.length} candidates
                          </span>
                          <span className="border border-champagne/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-champagne">
                            Toggle
                          </span>
                        </div>
                        <h2 className="mt-2 font-serif text-2xl text-platinum">
                          {watchName(watch)}
                        </h2>
                      </div>
                      <div className="flex max-w-3xl flex-wrap gap-2 lg:justify-end">
                        {missing.slice(0, 12).map((field) => (
                          <span
                            key={field}
                            className="border border-champagne/20 bg-black/20 px-2 py-1 text-[0.68rem] font-semibold text-champagne"
                          >
                            {field}
                          </span>
                        ))}
                        {missing.length > 12 ? (
                          <span className="px-2 py-1 text-xs text-pewter">
                            +{missing.length - 12} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </summary>

                  <div className="grid gap-4 p-4">
                    {existingCandidates.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="min-w-[64rem]">
                          <div className="grid grid-cols-[12rem_1fr_5rem_12rem_9rem_6rem_7rem] gap-2 border-b border-white/10 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-pewter">
                            <span>Field</span>
                            <span>Value</span>
                            <span>Unit</span>
                            <span>Source</span>
                            <span>Type</span>
                            <span>Conf.</span>
                            <span />
                          </div>
                          <div className="grid gap-2 pt-2">
                            {existingCandidates.map((candidate) => (
                              <form
                                action={updateSpecCandidate}
                                key={candidate.id}
                                className="grid grid-cols-[12rem_1fr_5rem_12rem_9rem_6rem_7rem] gap-2 text-sm"
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
                                <button
                                  type="submit"
                                  className="h-10 rounded border border-champagne/40 px-2 text-xs font-bold uppercase tracking-[0.14em] text-champagne transition hover:bg-champagne hover:text-obsidian"
                                >
                                  Save
                                </button>
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
                      <input type="hidden" name="watch_id" value={watch.watch_id} />

                      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_5rem_1fr]">
                        <label className="grid gap-2 text-sm font-semibold text-platinum">
                        Field
                        <select
                          name="field_name"
                          className="h-11 rounded border border-white/10 bg-[#f4f0e8] px-3 text-obsidian"
                          required
                        >
                          {candidateFieldOptions(missing).map((field) => (
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
                </details>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
