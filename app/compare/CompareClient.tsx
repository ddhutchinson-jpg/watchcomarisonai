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
  msrp?: string | number | null;
  currency?: string | null;
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

type PairComparisonResult = {
  summary: string;
  fit_comparison: string | null;
  movement_comparison: string | null;
  value_comparison: string | null;
  daily_wear_comparison: string | null;
  enthusiast_take: string | null;
  recommended_for: string[] | null;
  confidence_score: string | number | null;
};

const fieldSections: Array<{
  title: string;
  fields: Array<{ label: string; key: keyof Watch; emphasis?: boolean }>;
}> = [
  {
    title: "Buying Context",
    fields: [
      { label: "MSRP", key: "msrp", emphasis: true },
      { label: "Brand", key: "brand" },
      { label: "Collection", key: "collection" },
      { label: "Model", key: "model" },
      { label: "Reference", key: "reference_number" },
    ],
  },
  {
    title: "Fit And Case",
    fields: [
      { label: "Case Size", key: "case_size", emphasis: true },
      { label: "Thickness", key: "thickness", emphasis: true },
      { label: "Lug-to-Lug", key: "lug_to_lug", emphasis: true },
      { label: "Lug Width", key: "lug_width" },
      { label: "Weight", key: "weight_grams" },
      { label: "Case Material", key: "case_material" },
      { label: "Water Resistance", key: "water_resistance" },
    ],
  },
  {
    title: "Movement And Function",
    fields: [
      { label: "Movement Type", key: "movement_type", emphasis: true },
      { label: "Caliber", key: "caliber", emphasis: true },
      { label: "Power Reserve", key: "power_reserve" },
      { label: "Date", key: "date_display" },
      { label: "Chronograph", key: "has_chronograph" },
      { label: "GMT", key: "has_gmt" },
    ],
  },
  {
    title: "Bracelet And Wearability",
    fields: [
      { label: "Bracelet Taper", key: "bracelet_taper" },
      { label: "Clasp Type", key: "clasp_type", emphasis: true },
      { label: "Micro-Adjustment", key: "micro_adjustment", emphasis: true },
      { label: "Wearability Notes", key: "wearability_notes" },
    ],
  },
];

function watchKey(watch: Watch | null | undefined, index = 0) {
  return String(
    watch?.watch_id ??
      watch?.id ??
      watch?.reference_number ??
      `${watchBrand(watch) ?? "watch"}-${watchCollection(watch) ?? ""}-${watchModel(watch) ?? ""}-${index}`,
  );
}

function watchId(watch: Watch | null | undefined) {
  const id = watch?.watch_id ?? watch?.id;
  return id === null || id === undefined ? null : String(id);
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

function withCurrency(value: Watch[keyof Watch], currency = "USD") {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function normalizeNamePart(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function stripRepeatedCollection(collection: string, model: string) {
  const normalizedCollection = collection.toLowerCase();
  const normalizedModel = model.toLowerCase();

  if (normalizedModel === normalizedCollection) {
    return "";
  }

  if (normalizedModel.startsWith(`${normalizedCollection} `)) {
    return model.slice(collection.length).trim();
  }

  return model;
}

function watchName(watch: Watch) {
  const brand = normalizeNamePart(watchBrand(watch));
  const collection = normalizeNamePart(watchCollection(watch));
  const model = stripRepeatedCollection(
    collection,
    normalizeNamePart(watchModel(watch)),
  );

  return [brand, collection, model].filter(Boolean).join(" ");
}

function watchSearchText(watch: Watch) {
  return [watchName(watch), watch.reference_number].filter(Boolean).join(" ");
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
    case "msrp":
      return withCurrency(watch.msrp, watch.currency ?? "USD");
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

function aiReviewText(watch: Watch | null) {
  return (
    watch?.overall_wearability_summary ??
    watch?.wearability_notes ??
    watch?.comfort_notes ??
    null
  );
}

function AIReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-fit border border-champagne/40 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian focus:bg-champagne focus:text-obsidian focus:outline-none focus:ring-2 focus:ring-champagne/30"
    >
      AI Review
    </button>
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
    <div className="border-l border-champagne/35 pl-4">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-pewter">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-platinum">
        {display(value)}
      </dd>
    </div>
  );
}

function WatchIdentity({ watch }: { watch: Watch }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-champagne/80">
        {watch.reference_number || "Reference not listed"}
      </p>
      <h3 className="mt-2 font-serif text-3xl leading-none text-platinum">
        {watchBrand(watch) || "Unknown Brand"}
      </h3>
      <p className="mt-2 text-sm leading-5 text-pewter">
        {[watchCollection(watch), watchModel(watch)].filter(Boolean).join(" ") ||
          "Model not listed"}
      </p>
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
    <section className="grid gap-6 border border-white/10 bg-white/[0.035] p-5 shadow-aureate sm:p-6 lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-champagne/80">
          Collector read
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-platinum sm:text-5xl">
          The proportions tell the first story.
        </h2>
        <p className="mt-4 text-sm leading-6 text-pewter">
          This view is built for the details enthusiasts usually have to hunt
          across reviews: wrist presence, case height, bracelet taper, clasp
          behavior, and practical adjustability.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <KeyMeasure label="Watch A" value={fieldValue(watchA, "case_size")} />
          <KeyMeasure label="Watch B" value={fieldValue(watchB, "case_size")} />
          <KeyMeasure label="Budget" value={fieldValue(watchA, "msrp")} />
        </div>
      </div>
      <div className="border-y border-white/10 bg-black/10 px-1">
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
      .filter((watch) => watchSearchText(watch).toLowerCase().includes(normalized))
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
        className="flex min-h-16 w-full items-center justify-between gap-4 border border-white/10 bg-[#12100d] px-4 py-3 text-left text-base font-semibold text-platinum outline-none transition hover:border-champagne/50 hover:bg-[#171410] focus:border-champagne/70 focus:bg-[#171410] focus:ring-2 focus:ring-champagne/20"
      >
        <span className="min-w-0 truncate">
          {selectedWatch ? watchName(selectedWatch) : "Search brand, model, reference"}
        </span>
        <span className="shrink-0 border-l border-white/10 pl-4 text-xs uppercase tracking-[0.18em] text-champagne" aria-hidden="true">
          {open ? "Close" : "Search"}
        </span>
      </button>
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-80 w-full overflow-auto border border-champagne/40 bg-[#f4f0e8] p-2 text-obsidian shadow-aureate"
        >
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter watches"
            className="mb-2 h-11 w-full border border-[#c7b57e] bg-white px-3 text-sm font-semibold text-obsidian outline-none placeholder:text-[#6f6758] focus:border-[#8d6a2d] focus:ring-2 focus:ring-[#d8c391]/50"
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
                className="block w-full bg-transparent px-3 py-3 text-left text-obsidian transition hover:bg-[#ded0a8] hover:text-obsidian focus:bg-[#ded0a8] focus:text-obsidian focus:outline-none"
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

function WatchCard({
  watch,
  label,
  onOpenReview,
}: {
  watch: Watch | null;
  label: string;
  onOpenReview: (watch: Watch) => void;
}) {
  if (!watch) {
    return (
      <section className="flex min-h-[24rem] items-center justify-center border border-white/10 bg-white/[0.04] p-8 text-center">
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
    <section className="overflow-hidden border border-white/10 bg-white/[0.045] shadow-aureate">
      <div className="relative grid min-h-[21rem] border-b border-white/10 bg-[#11100e] sm:grid-cols-[4rem_1fr]">
        <div className="hidden border-r border-white/10 bg-black/20 px-3 py-5 sm:block">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne/70 [writing-mode:vertical-rl]">
            {label}
          </p>
        </div>
        <div className="relative overflow-hidden p-6 sm:p-7">
          <div className="absolute inset-0 opacity-60 [background:repeating-radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0_1px,transparent_1px_10px)]" />
          <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(115deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_12px)]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne/15" />
          <div className="relative flex h-full min-h-[17rem] flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne/80">
                {watch.reference_number || "Reference not listed"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-pewter">
                  Case
                </p>
                <p className="mt-1 font-serif text-4xl leading-none text-platinum">
                  {display(fieldValue(watch, "case_size"))}
                </p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-pewter">
                  Thick
                </p>
                <p className="mt-1 font-serif text-4xl leading-none text-platinum">
                  {display(fieldValue(watch, "thickness"))}
                </p>
              </div>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-pewter">
                  Water
                </p>
                <p className="mt-1 font-serif text-4xl leading-none text-platinum">
                  {display(fieldValue(watch, "water_resistance"))}
                </p>
              </div>
            </div>
            <div className="h-px bg-white/10" />
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne/70">
            {label}
          </p>
          <AIReviewButton onClick={() => onOpenReview(watch)} />
        </div>
        <div className="mt-4">
          <WatchIdentity watch={watch} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-px bg-white/10 text-sm lg:grid-cols-4">
          <div className="bg-[#100f0d] p-3">
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-pewter">
              MSRP
            </dt>
            <dd className="mt-1 text-base font-semibold text-platinum">
              {display(fieldValue(watch, "msrp"))}
            </dd>
          </div>
          <div className="bg-[#100f0d] p-3">
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-pewter">
              Size
            </dt>
            <dd className="mt-1 text-base font-semibold text-platinum">
              {display(fieldValue(watch, "case_size"))}
            </dd>
          </div>
          <div className="bg-[#100f0d] p-3">
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-pewter">
              Movement
            </dt>
            <dd className="mt-1 text-base font-semibold text-platinum">
              {display(fieldValue(watch, "movement_type"))}
            </dd>
          </div>
          <div className="bg-[#100f0d] p-3">
            <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-pewter">
              Water
            </dt>
            <dd className="mt-1 text-base font-semibold text-platinum">
              {display(fieldValue(watch, "water_resistance"))}
            </dd>
          </div>
        </dl>
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
    <section className="mt-6 overflow-hidden border border-white/10 bg-white/[0.045] shadow-aureate">
      <div className="grid grid-cols-[7.5rem_1fr_1fr] border-b border-white/10 bg-black/30 text-xs font-semibold uppercase tracking-[0.2em] text-champagne/80 sm:grid-cols-[12rem_1fr_1fr]">
        <div className="px-3 py-4 sm:px-5">Spec</div>
        <div className="px-3 py-4 sm:px-5">Watch A</div>
        <div className="px-3 py-4 sm:px-5">Watch B</div>
      </div>
      <div>
        {fieldSections.map((section) => (
          <section key={section.title} className="border-b border-white/10 last:border-b-0">
            <div className="bg-[#0d0c0a] px-3 py-3 sm:px-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-champagne">
                {section.title}
              </h3>
            </div>
            <dl className="divide-y divide-white/10">
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  className={`grid grid-cols-[7.5rem_1fr_1fr] text-sm transition hover:bg-white/[0.035] sm:grid-cols-[12rem_1fr_1fr] ${
                    field.emphasis ? "bg-white/[0.018]" : ""
                  }`}
                >
                  <dt
                    className={`px-3 py-4 text-xs font-semibold uppercase tracking-[0.14em] sm:px-5 ${
                      field.emphasis ? "text-platinum" : "text-pewter"
                    }`}
                  >
                    {field.label}
                  </dt>
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
        ))}
      </div>
    </section>
  );
}

function AIReviewModal({
  watch,
  onClose,
}: {
  watch: Watch | null;
  onClose: () => void;
}) {
  if (!watch) {
    return null;
  }

  const review = aiReviewText(watch);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close AI review"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-review-title"
        className="relative w-full max-w-2xl border border-champagne/25 bg-[#11100e] p-5 shadow-aureate sm:p-7"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">
              AI Review
            </p>
            <h2
              id="ai-review-title"
              className="mt-3 font-serif text-4xl leading-none text-platinum"
            >
              {watchName(watch)}
            </h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-pewter">
              {watch.reference_number || "Reference not listed"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pewter">
            AI-generated wearability summary
          </p>
          <p className="text-base leading-8 text-platinum">
            {review ??
              "This watch does not have an AI wearability review yet. Once the summary is added, it will appear here for a quick collector-style read."}
          </p>
          <p className="border-t border-white/10 pt-4 text-xs leading-5 text-pewter">
            Generated from the watch data currently available in
            WatchComparisonAI and intended as a quick review, not a substitute
            for manually verified specs.
          </p>
        </div>
      </section>
    </div>
  );
}

function PairComparisonPanel({
  watchA,
  watchB,
}: {
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  const [comparison, setComparison] = useState<PairComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aId = watchId(watchA);
  const bId = watchId(watchB);
  const canCompare = Boolean(aId && bId && aId !== bId);

  async function compareWithAI() {
    if (!aId || !bId || aId === bId) return;

    setLoading(true);
    setError(null);
    setComparison(null);

    try {
      const response = await fetch("/api/compare-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchAId: aId, watchBId: bId }),
      });
      const payload = (await response.json()) as {
        comparison?: PairComparisonResult;
        error?: string;
      };

      if (!response.ok || !payload.comparison) {
        throw new Error(payload.error ?? "Unable to compare these watches.");
      }

      setComparison(payload.comparison);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to compare these watches.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-champagne/20 bg-black/25 p-5 shadow-aureate sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">
            AI Pair Review
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-platinum sm:text-4xl">
            Ask AI for the tradeoffs between these two watches.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-pewter">
            The response is generated only when prompted. If this pair has been
            reviewed before and the specs have not changed, WatchComparisonAI
            reuses the saved review behind the scenes.
          </p>
        </div>
        <button
          type="button"
          disabled={!canCompare || loading}
          onClick={compareWithAI}
          className="h-12 border border-champagne bg-champagne px-5 text-sm font-bold uppercase tracking-[0.18em] text-obsidian transition hover:bg-platinum disabled:cursor-not-allowed disabled:border-white/15 disabled:bg-white/10 disabled:text-pewter"
        >
          {loading ? "Building Review..." : "Compare With AI"}
        </button>
      </div>

      {error ? (
        <p className="mt-5 border border-red-300/25 bg-red-950/25 p-4 text-sm leading-6 text-red-100">
          {error}
        </p>
      ) : null}

      {comparison ? (
        <div className="mt-6 grid gap-4 border-t border-white/10 pt-5">
          <p className="text-base leading-7 text-platinum">{comparison.summary}</p>
          <div className="grid gap-px bg-white/10 md:grid-cols-2">
            {[
              ["Fit", comparison.fit_comparison],
              ["Movement", comparison.movement_comparison],
              ["Value", comparison.value_comparison],
              ["Daily Wear", comparison.daily_wear_comparison],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#100f0d] p-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-champagne/80">
                  {label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-platinum">
                  {value || "Not enough verified data listed yet."}
                </p>
              </div>
            ))}
          </div>
          {comparison.enthusiast_take ? (
            <p className="border-l border-champagne/40 pl-4 text-sm leading-6 text-pewter">
              {comparison.enthusiast_take}
            </p>
          ) : null}
          {comparison.recommended_for?.length ? (
            <div className="flex flex-wrap gap-2">
              {comparison.recommended_for.map((item) => (
                <span
                  key={item}
                  className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pewter"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
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
  const [reviewWatch, setReviewWatch] = useState<Watch | null>(null);

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
      <div className="border border-white/10 bg-black/25 p-4 shadow-aureate sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-champagne/80">
              Comparison bench
            </p>
            <p className="mt-2 text-sm text-pewter">
              Pick two references to compare proportions, specs, and buying
              context.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pewter">
            {watches.length} active MVP watches
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      <div className="mt-5">
        <CollectorRead watchA={watchA} watchB={watchB} />
      </div>

      <div className="mt-6">
        <PairComparisonPanel watchA={watchA} watchB={watchB} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <WatchCard
          label="Watch A"
          watch={watchA}
          onOpenReview={setReviewWatch}
        />
        <WatchCard
          label="Watch B"
          watch={watchB}
          onOpenReview={setReviewWatch}
        />
      </div>

      <ComparisonTable watchA={watchA} watchB={watchB} />
      <AIReviewModal watch={reviewWatch} onClose={() => setReviewWatch(null)} />
    </>
  );
}
