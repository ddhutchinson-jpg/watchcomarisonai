import { CompareClient, type Watch } from "./CompareClient";
import { supabase } from "@/src/lib/supabaseClient";

const watchColumns = [
  "id",
  "image_url",
  "brand",
  "collection",
  "model",
  "reference_number",
  "case_size",
  "thickness",
  "lug_to_lug",
  "lug_width",
  "movement_type",
  "caliber",
  "power_reserve",
  "water_resistance",
  "bracelet_taper",
  "clasp_type",
  "micro_adjustment",
  "wearability_notes",
  "review_status",
].join(",");

async function loadWatches() {


const { data, error } = await supabase
  .from("watch_comparison_view")
  .select("*")
  .order("brand_name", { ascending: true });

  return {
    watches: (data ?? []) as Watch[],
    error: error?.message ?? null,
  };
}

export default async function ComparePage() {
  const { watches, error } = await loadWatches();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            WatchComparisonAI
          </p>
          <div className="mt-5 max-w-4xl">
            <h1 className="font-serif text-5xl leading-tight text-platinum sm:text-6xl lg:text-7xl">
              Compare watches with collector-grade detail.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-pewter sm:text-lg">
              Search references and evaluate proportions, movement specs,
              bracelet engineering, and real-world wearability side by side.
            </p>
          </div>
        </header>

        <section className="py-6 sm:py-8">
          {error ? (
            <div className="rounded border border-red-400/30 bg-red-950/30 p-8 text-sm text-red-100">
              Unable to load watches: {error}
            </div>
          ) : (
            <CompareClient watches={watches} />
          )}
        </section>
      </div>
    </main>
  );
}
