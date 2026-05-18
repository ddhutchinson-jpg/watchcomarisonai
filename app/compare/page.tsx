import { CompareClient, type Watch } from "./CompareClient";
import { supabase } from "@/src/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function loadWatches() {
  const { data, error } = await supabase
    .from("watch_comparison_view")
    .select("*")
    .eq("is_featured", true)
    .order("brand_name", { ascending: true });

  return {
    watches: (data ?? []) as Watch[],
    error: error?.message ?? null,
  };
}

export default async function ComparePage() {
  const { watches, error } = await loadWatches();
  const brandCount = new Set(
    watches
      .map((watch) => watch.brand_name)
      .filter((brand): brand is string => Boolean(brand)),
  ).size;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
              WatchComparisonAI
            </p>
            <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter">
              <span className="border border-white/10 px-3 py-1.5">
                {watches.length} watches
              </span>
              <span className="border border-white/10 px-3 py-1.5">
                {brandCount} brands
              </span>
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.96] text-platinum sm:text-6xl lg:text-7xl">
              Compare watches with collector-grade detail.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-pewter sm:text-lg lg:justify-self-end">
              Search references and evaluate proportions, movement specs,
              bracelet engineering, MSRP, and real-world wearability side by
              side.
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
