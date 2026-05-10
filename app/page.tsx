import { supabase } from "@/src/lib/supabaseClient";

function display(value: unknown, suffix = "") {
  if (value === null || value === undefined || value === "") return "—";
  return `${value}${suffix}`;
}

export default async function ComparePage() {
  const { data: watches, error } = await supabase
    .from("watch_comparison_view")
    .select("*")
    .order("brand_name", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-950 px-8 py-12 text-neutral-100">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200">
          WatchComparisonAI
        </p>
        <h1 className="mt-8 max-w-5xl text-6xl font-semibold tracking-tight">
          Compare watches with collector-grade detail.
        </h1>
        <div className="mt-12 rounded-2xl border border-red-900/70 bg-red-950/30 p-8">
          <p className="text-lg text-red-100">
            Unable to load watches: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const left = watches?.[0];
  const right = watches?.[1];

  const rows = [
    ["Brand", left?.brand_name, right?.brand_name],
    ["Collection", left?.collection_name, right?.collection_name],
    ["Model", left?.model_name, right?.model_name],
    ["Reference", left?.reference_number, right?.reference_number],
    ["Case size", display(left?.case_size_mm, "mm"), display(right?.case_size_mm, "mm")],
    ["Thickness", display(left?.case_thickness_mm, "mm"), display(right?.case_thickness_mm, "mm")],
    ["Lug-to-lug", display(left?.lug_to_lug_mm, "mm"), display(right?.lug_to_lug_mm, "mm")],
    ["Lug width", display(left?.lug_width_mm, "mm"), display(right?.lug_width_mm, "mm")],
    ["Movement", left?.movement_type, right?.movement_type],
    ["Caliber", left?.caliber, right?.caliber],
    ["Power reserve", display(left?.power_reserve_hours, " hours"), display(right?.power_reserve_hours, " hours")],
    ["Water resistance", display(left?.water_resistance_m, "m"), display(right?.water_resistance_m, "m")],
    ["Bracelet taper", `${display(left?.bracelet_taper_from_mm)} → ${display(left?.bracelet_taper_to_mm)}mm`, `${display(right?.bracelet_taper_from_mm)} → ${display(right?.bracelet_taper_to_mm)}mm`],
    ["Clasp type", left?.clasp_type, right?.clasp_type],
    ["Micro-adjustment", display(left?.micro_adjustment_mm, "mm"), display(right?.micro_adjustment_mm, "mm")],
    ["Wearability notes", left?.overall_wearability_summary || left?.comfort_notes, right?.overall_wearability_summary || right?.comfort_notes],
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2b2619,transparent_35%),#050505] px-6 py-10 text-neutral-100">
      <section className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold uppercase tracking-[0.45em] text-amber-200">
          WatchComparisonAI
        </p>

        <h1 className="mt-10 max-w-5xl text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
          Compare watches with collector-grade detail.
        </h1>

        <p className="mt-8 max-w-4xl text-xl leading-9 text-neutral-400">
          Search references and evaluate proportions, movement specs, bracelet
          engineering, and real-world wearability side by side.
        </p>

        <div className="mt-12 border-t border-neutral-800 pt-10">
          {!watches?.length ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
              <p className="text-neutral-300">No watches found yet.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {[left, right].map((watch, index) => (
                  <article
                    key={watch?.watch_id ?? index}
                    className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-2xl"
                  >
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-200/80">
                      Watch {index === 0 ? "A" : "B"}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">
                      {watch?.brand_name} {watch?.model_name}
                    </h2>
                    <p className="mt-2 text-neutral-500">
                      Ref. {display(watch?.reference_number)}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Case</p>
                        <p className="text-lg">{display(watch?.case_size_mm, "mm")}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Movement</p>
                        <p className="text-lg">{display(watch?.movement_type)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Caliber</p>
                        <p className="text-lg">{display(watch?.caliber)}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Water Resistance</p>
                        <p className="text-lg">{display(watch?.water_resistance_m, "m")}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/80">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-neutral-900/80 text-sm uppercase tracking-[0.2em] text-neutral-400">
                    <tr>
                      <th className="w-1/5 p-5">Feature</th>
                      <th className="w-2/5 p-5">{left?.brand_name} {left?.model_name}</th>
                      <th className="w-2/5 p-5">{right?.brand_name} {right?.model_name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(([label, a, b]) => (
                      <tr key={label} className="border-t border-neutral-800">
                        <th className="p-5 align-top text-neutral-400">{label}</th>
                        <td className="p-5 align-top text-lg">{display(a)}</td>
                        <td className="p-5 align-top text-lg">{display(b)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}