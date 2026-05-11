"use client";

import { useMemo, useState } from "react";

export type Watch = {
  id?: string | number | null;
  watch_id?: string | number | null;
  image_url?: string | null;
  primary_image_url?: string | null;
  brand?: string | null;
  brand_name?: string | null;
  collection?: string | null;
  collection_name?: string | null;
  model?: string | null;
  model_name?: string | null;
  reference_number?: string | null;
  case_material?: string | null;
  case_size?: string | number | null;
  case_size_mm?: string | number | null;
  thickness?: string | number | null;
  case_thickness_mm?: string | number | null;
  lug_to_lug?: string | number | null;
  lug_to_lug_mm?: string | number | null;
  lug_width?: string | number | null;
  lug_width_mm?: string | number | null;
  weight_grams?: string | number | null;
  date_display?: boolean | null;
  has_chronograph?: boolean | null;
  has_gmt?: boolean | null;
  movement_type?: string | null;
  caliber?: string | null;
  power_reserve?: string | number | null;
  power_reserve_hours?: string | number | null;
  water_resistance?: string | number | null;
  water_resistance_m?: string | number | null;
  bracelet_taper?: string | null;
  bracelet_taper_from_mm?: string | number | null;
  bracelet_taper_to_mm?: string | number | null;
  clasp_type?: string | null;
  micro_adjustment?: string | null;
  micro_adjustment_mm?: string | number | null;
  wearability_notes?: string | null;
  overall_wearability_summary?: string | null;
  comfort_notes?: string | null;
  review_status?: string | null;
};

const fields: Array<{ label: string; key: keyof Watch }> = [
  { label: "Brand", key: "brand" },
  { label: "Collection", key: "collection" },
  { label: "Model", key: "model" },
  { label: "Reference Number", key: "reference_number" },
  { label: "Case Material", key: "case_material" },
  { label: "Case Size", key: "case_size" },
  { label: "Thickness", key: "thickness" },
  { label: "Lug-to-Lug", key: "lug_to_lug" },
  { label: "Lug Width", key: "lug_width" },
  { label: "Weight", key: "weight_grams" },
  { label: "Date", key: "date_display" },
  { label: "Chronograph", key: "has_chronograph" },
  { label: "GMT", key: "has_gmt" },
  { label: "Movement Type", key: "movement_type" },
  { label: "Caliber", key: "caliber" },
  { label: "Power Reserve", key: "power_reserve" },
  { label: "Water Resistance", key: "water_resistance" },
  { label: "Bracelet Taper", key: "bracelet_taper" },
  { label: "Clasp Type", key: "clasp_type" },
  { label: "Micro-Adjustment", key: "micro_adjustment" },
  { label: "Wearability Notes", key: "wearability_notes" },
];

function watchKey(watch: Watch | null | undefined, index = 0) {
  return String(
    watch?.watch_id ??
      watch?.id ??
      watch?.reference_number ??
      `${watchBrand(watch) ?? "watch"}-${watchCollection(watch) ?? ""}-${watchModel(watch) ?? ""}-${index}`,
  );
}

function watchBrand(watch: Watch | null | undefined) {
  return watch?.brand_name ?? watch?.brand ?? null;
}

function watchCollection(watch: Watch | null | undefined) {
  return watch?.collection_name ?? watch?.collection ?? null;
}

function watchModel(watch: Watch | null | undefined) {
  return watch?.model_name ?? watch?.model ?? null;
}

function watchImageUrl(watch: Watch | null | undefined) {
  return watch?.primary_image_url ?? watch?.image_url ?? null;
}

function withMm(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} mm`;
}

function withHours(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} hours`;
}

function withMeters(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} m`;
}

function withGrams(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} g`;
}

function watchName(watch: Watch) {
  return [watchBrand(watch), watchCollection(watch), watchModel(watch), watch.reference_number]
    .filter(Boolean)
    .join(" ");
}

function display(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return "Not listed";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function fieldValue(watch: Watch | null, key: keyof Watch) {
  if (!watch) {
    return null;
  }

  switch (key) {
    case "brand":
      return watchBrand(watch);
    case "collection":
      return watchCollection(watch);
    case "model":
      return watchModel(watch);
    case "image_url":
      return watchImageUrl(watch);
    case "case_size":
      return watch.case_size ?? withMm(watch.case_size_mm);
    case "thickness":
      return watch.thickness ?? withMm(watch.case_thickness_mm);
    case "lug_to_lug":
      return watch.lug_to_lug ?? withMm(watch.lug_to_lug_mm);
    case "lug_width":
      return watch.lug_width ?? withMm(watch.lug_width_mm);
    case "weight_grams":
      return withGrams(watch.weight_grams);
    case "power_reserve":
      return watch.power_reserve ?? withHours(watch.power_reserve_hours);
    case "water_resistance":
      return watch.water_resistance ?? withMeters(watch.water_resistance_m);
    case "bracelet_taper":
      if (watch.bracelet_taper) {
        return watch.bracelet_taper;
      }
      if (watch.bracelet_taper_from_mm || watch.bracelet_taper_to_mm) {
        return `${display(watch.bracelet_taper_from_mm)} mm to ${display(
          watch.bracelet_taper_to_mm,
        )} mm`;
      }
      return null;
    case "micro_adjustment":
      return watch.micro_adjustment ?? withMm(watch.micro_adjustment_mm);
    case "wearability_notes":
      return (
        watch.wearability_notes ??
        watch.overall_wearability_summary ??
        watch.comfort_notes
      );
    default:
      return watch[key];
  }
}

function hasFitMeasurements(watch: Watch) {
  return Boolean(
    fieldValue(watch, "case_size") ||
      fieldValue(watch, "thickness") ||
      fieldValue(watch, "lug_to_lug"),
  );
}

function parseMeasurementMm(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const match = String(value).match(/[\d.]+/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMm(value: number | null) {
  if (value === null) {
    return "Not listed";
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)} mm`;
}

function formatDelta(valueA: number | null, valueB: number | null) {
  if (valueA === null || valueB === null) {
    return "Need both measurements";
  }

  const delta = Math.abs(valueA - valueB);
  if (delta < 0.05) {
    return "Matched";
  }

  const larger = valueA > valueB ? "Watch A" : "Watch B";
  return `${larger} +${delta.toFixed(1)} mm`;
}

function statusBadgeClasses(status?: string | null) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
    case "rejected":
      return "border-red-300/30 bg-red-400/10 text-red-100";
    case "pending":
    case "in_review":
      return "border-amber-300/30 bg-amber-400/10 text-amber-100";
    case "draft":
      return "border-sky-300/30 bg-sky-400/10 text-sky-100";
    default:
      return "border-white/15 bg-white/[0.06] text-pewter";
  }
}

function ReviewStatusBadge({ status }: { status?: string | null }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusBadgeClasses(
        status,
      )}`}
    >
      {status ? status.replaceAll("_", " ") : "Status not listed"}
    </span>
  );
}

function KeyMeasure({
  label,
  value,
}: {
  label: string;
  value: Watch[keyof Watch];
}) {
  return (
    <div className="border-l border-champagne/30 pl-4">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-pewter">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-platinum">{display(value)}</dd>
    </div>
  );
}

function DimensionCompareStrip({
  label,
  valueA,
  valueB,
  max = 52,
}: {
  label: string;
  valueA: Watch[keyof Watch];
  valueB: Watch[keyof Watch];
  max?: number;
}) {
  const parsedA = parseMeasurementMm(valueA);
  const parsedB = parseMeasurementMm(valueB);
  const widthA = parsedA ? Math.max(12, Math.min(100, (parsedA / max) * 100)) : 0;
  const widthB = parsedB ? Math.max(12, Math.min(100, (parsedB / max) * 100)) : 0;

  return (
    <div className="border-t border-white/10 py-4 first:border-t-0">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-platinum">{label}</h3>
        <p className="text-xs uppercase tracking-[0.16em] text-champagne/80">
          {formatDelta(parsedA, parsedB)}
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3 text-sm">
          <span className="text-pewter">Watch A</span>
          <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full rounded-full bg-champagne"
              style={{ width: `${widthA}%` }}
            />
          </span>
          <span className="text-right font-medium text-platinum">
            {formatMm(parsedA)}
          </span>
        </div>
        <div className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3 text-sm">
          <span className="text-pewter">Watch B</span>
          <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full rounded-full bg-cognac"
              style={{ width: `${widthB}%` }}
            />
          </span>
          <span className="text-right font-medium text-platinum">
            {formatMm(parsedB)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CollectorRead({
  watchA,
  watchB,
}: {
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  if (!watchA || !watchB) {
    return null;
  }

  const caseA = parseMeasurementMm(fieldValue(watchA, "case_size"));
  const caseB = parseMeasurementMm(fieldValue(watchB, "case_size"));
  const lugA = parseMeasurementMm(fieldValue(watchA, "lug_to_lug"));
  const lugB = parseMeasurementMm(fieldValue(watchB, "lug_to_lug"));
  const thicknessA = parseMeasurementMm(fieldValue(watchA, "thickness"));
  const thicknessB = parseMeasurementMm(fieldValue(watchB, "thickness"));

  const reads = [
    formatDelta(caseA, caseB) !== "Need both measurements"
      ? `Diameter: ${formatDelta(caseA, caseB).toLowerCase()}.`
      : null,
    formatDelta(lugA, lugB) !== "Need both measurements"
      ? `Lug-to-lug: ${formatDelta(lugA, lugB).toLowerCase()}.`
      : null,
    formatDelta(thicknessA, thicknessB) !== "Need both measurements"
      ? `Thickness: ${formatDelta(thicknessA, thicknessB).toLowerCase()}.`
      : null,
    fieldValue(watchA, "micro_adjustment") ||
    fieldValue(watchB, "micro_adjustment")
      ? `Micro-adjust: A ${display(fieldValue(watchA, "micro_adjustment"))}, B ${display(
          fieldValue(watchB, "micro_adjustment"),
        )}.`
      : null,
  ].filter(Boolean);

  return (
    <section className="grid gap-6 border border-white/10 bg-white/[0.035] p-5 shadow-aureate lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-champagne/80">
          Collector read
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-platinum sm:text-4xl">
          The proportions tell the first story.
        </h2>
        <p className="mt-4 text-sm leading-6 text-pewter">
          This view is built for the details enthusiasts usually have to hunt
          across reviews: wrist presence, case height, bracelet taper, clasp
          behavior, and practical adjustability.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <KeyMeasure label="Case A" value={fieldValue(watchA, "case_size")} />
          <KeyMeasure label="Case B" value={fieldValue(watchB, "case_size")} />
          <KeyMeasure label="Water" value={fieldValue(watchA, "water_resistance")} />
        </div>
      </div>
      <div className="border-y border-white/10">
        <DimensionCompareStrip
          label="Case diameter"
          valueA={fieldValue(watchA, "case_size")}
          valueB={fieldValue(watchB, "case_size")}
        />
        <DimensionCompareStrip
          label="Lug-to-lug"
          valueA={fieldValue(watchA, "lug_to_lug")}
          valueB={fieldValue(watchB, "lug_to_lug")}
          max={60}
        />
        <DimensionCompareStrip
          label="Thickness"
          valueA={fieldValue(watchA, "thickness")}
          valueB={fieldValue(watchB, "thickness")}
          max={20}
        />
        {reads.length ? (
          <p className="border-t border-white/10 py-4 text-sm leading-6 text-pewter">
            {reads.join(" ")}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SearchableWatchSelect({
  label,
  watches,
  selectedKey,
  onSelect,
}: {
  label: string;
  watches: Watch[];
  selectedKey: string | null;
  onSelect: (watchKey: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listboxId = `${label.toLowerCase().replaceAll(" ", "-")}-watch-options`;

  const selectedWatch = useMemo(
    () =>
      watches.find((watch, index) => watchKey(watch, index) === selectedKey) ??
      null,
    [selectedKey, watches],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return watches.slice(0, 10);
    }

    return watches
      .filter((watch) => watchName(watch).toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [query, watches]);

  return (
    <div className="relative">
      <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.28em] text-champagne/80">
        {label}
      </label>
      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        className="flex h-14 w-full items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.06] px-4 text-left text-base font-semibold text-platinum outline-none transition hover:border-champagne/50 hover:bg-white/[0.08] focus:border-champagne/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-champagne/20"
      >
        <span className="min-w-0 truncate">
          {selectedWatch ? watchName(selectedWatch) : "Search brand, model, reference"}
        </span>
        <span className="shrink-0 text-champagne" aria-hidden="true">
          {open ? "Close" : "Change"}
        </span>
      </button>
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded border border-champagne/40 bg-[#f4f0e8] p-2 text-obsidian shadow-aureate"
        >
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter watches"
            className="mb-2 h-11 w-full rounded border border-[#c7b57e] bg-white px-3 text-sm font-semibold text-obsidian outline-none placeholder:text-[#6f6758] focus:border-[#8d6a2d] focus:ring-2 focus:ring-[#d8c391]/50"
          />
          {filtered.length ? (
            filtered.map((watch, index) => (
              <button
                key={watchKey(watch, index)}
                type="button"
                role="option"
                aria-selected={watchKey(watch, index) === selectedKey}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(watchKey(watch, index));
                  setOpen(false);
                  setQuery("");
                }}
                className="block w-full rounded bg-transparent px-3 py-3 text-left text-obsidian transition hover:bg-[#ded0a8] hover:text-obsidian focus:bg-[#ded0a8] focus:text-obsidian focus:outline-none"
              >
                <span className="block text-sm font-semibold text-obsidian">
                  {watchName(watch)}
                </span>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5425]">
                  {watch.reference_number || "Reference not listed"}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-sm text-pewter">No matches found.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function WatchCard({ watch, label }: { watch: Watch | null; label: string }) {
  if (!watch) {
    return (
      <section className="flex min-h-[24rem] items-center justify-center rounded border border-white/10 bg-white/[0.04] p-8 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne/70">
            {label}
          </p>
          <p className="mt-4 text-sm text-pewter">Select a watch to begin.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded border border-white/10 bg-white/[0.045] shadow-aureate">
      <div className="aspect-[4/3] bg-[#f4f0e8] p-8">
        {watchImageUrl(watch) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={watchImageUrl(watch) ?? ""}
            alt={watchName(watch)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm uppercase tracking-[0.2em] text-[#7a7468]">
            Image not listed
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne/70">
          {label}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-platinum sm:text-4xl">
          {watchBrand(watch) || "Unknown Brand"}
        </h2>
        <p className="mt-2 text-base text-pewter">
          {[watchCollection(watch), watchModel(watch)].filter(Boolean).join(" ") ||
            "Model not listed"}
        </p>
        <div className="mt-4">
          <ReviewStatusBadge status={watch.review_status} />
        </div>
      </div>
    </section>
  );
}

function ComparisonTable({
  watchA,
  watchB,
}: {
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded border border-white/10 bg-white/[0.045] shadow-aureate">
      <div className="grid grid-cols-[8.5rem_1fr_1fr] border-b border-white/10 bg-black/20 text-xs font-semibold uppercase tracking-[0.2em] text-champagne/80 sm:grid-cols-[12rem_1fr_1fr]">
        <div className="px-3 py-4 sm:px-5">Spec</div>
        <div className="px-3 py-4 sm:px-5">Watch A</div>
        <div className="px-3 py-4 sm:px-5">Watch B</div>
      </div>
      <dl className="divide-y divide-white/10">
        {fields.map((field) => (
          <div
            key={field.key}
            className="grid grid-cols-[8.5rem_1fr_1fr] text-sm sm:grid-cols-[12rem_1fr_1fr]"
          >
            <dt className="px-3 py-4 text-pewter sm:px-5">{field.label}</dt>
            <dd className="border-l border-white/10 px-3 py-4 font-medium leading-6 text-platinum sm:px-5">
              {display(fieldValue(watchA, field.key))}
            </dd>
            <dd className="border-l border-white/10 px-3 py-4 font-medium leading-6 text-platinum sm:px-5">
              {display(fieldValue(watchB, field.key))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CompareClient({ watches }: { watches: Watch[] }) {
  const watchesWithMeasurements = watches.filter(hasFitMeasurements);
  const defaultWatchA = watchesWithMeasurements[0] ?? watches[0];
  const defaultWatchB =
    watchesWithMeasurements.find(
      (watch, index) => watchKey(watch, index) !== watchKey(defaultWatchA),
    ) ??
    watchesWithMeasurements[1] ??
    watches[1];
  const [watchAKey, setWatchAKey] = useState<string | null>(
    defaultWatchA ? watchKey(defaultWatchA) : null,
  );
  const [watchBKey, setWatchBKey] = useState<string | null>(
    defaultWatchB ? watchKey(defaultWatchB, 1) : null,
  );

  const watchA = useMemo(
    () =>
      watches.find((watch, index) => watchKey(watch, index) === watchAKey) ??
      null,
    [watchAKey, watches],
  );
  const watchB = useMemo(
    () =>
      watches.find((watch, index) => watchKey(watch, index) === watchBKey) ??
      null,
    [watchBKey, watches],
  );

  if (watches.length === 0) {
    return (
      <div className="rounded border border-white/10 bg-white/[0.04] p-8 text-sm text-pewter">
        No watches are available yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 rounded border border-white/10 bg-black/20 p-4 sm:grid-cols-2 sm:p-5">
        <SearchableWatchSelect
          label="Watch A"
          watches={watches}
          selectedKey={watchAKey}
          onSelect={setWatchAKey}
        />
        <SearchableWatchSelect
          label="Watch B"
          watches={watches}
          selectedKey={watchBKey}
          onSelect={setWatchBKey}
        />
      </div>

      <div className="mt-6">
        <CollectorRead watchA={watchA} watchB={watchB} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <WatchCard label="Watch A" watch={watchA} />
        <WatchCard label="Watch B" watch={watchB} />
      </div>

      <ComparisonTable watchA={watchA} watchB={watchB} />
    </>
  );
}
