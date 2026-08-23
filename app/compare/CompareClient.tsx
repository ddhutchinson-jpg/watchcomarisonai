"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  normalizeNamePart,
  watchDisplayName,
  watchSlug,
} from "@/src/lib/watchRoutes";
import { CompareLaunchLink } from "./CompareLaunchLink";

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
  crown_type?: string | null;
  helium_escape_valve?: boolean | null;
  caseback_type?: string | null;
  caseback_description?: string | null;
  bezel_type?: string | null;
  bezel_material?: string | null;
  bezel_insert_material?: string | null;
  crystal_type?: string | null;
  crystal_coating?: string | null;
  dial_color?: string | null;
  dial_texture?: string | null;
  dial_finish_raw?: string | null;
  indices_type?: string | null;
  lume_type?: string | null;
  date_display?: boolean | null;
  has_chronograph?: boolean | null;
  has_gmt?: boolean | null;
  movement_type?: string | null;
  caliber?: string | null;
  jewels?: string | number | null;
  frequency_hz?: string | number | null;
  frequency_vph?: string | number | null;
  power_reserve?: string | number | null;
  power_reserve_hours?: string | number | null;
  accuracy_claim?: string | null;
  cosc_certified?: boolean | null;
  metas_certified?: boolean | null;
  magnetic_resistance_gauss?: string | number | null;
  water_resistance?: string | number | null;
  water_resistance_m?: string | number | null;
  bracelet_taper?: string | null;
  bracelet_taper_from_mm?: string | number | null;
  bracelet_taper_to_mm?: string | number | null;
  bracelet_type?: string | null;
  bracelet_material?: string | null;
  bracelet_finish_raw?: string | null;
  link_design_raw?: string | null;
  clasp_type?: string | null;
  micro_adjustment?: string | null;
  micro_adjustment_mm?: string | number | null;
  micro_adjustment_positions?: string | number | null;
  adjustment_system_normalized?: string | null;
  adjustment_system_raw?: string | null;
  tool_free_adjustment?: boolean | null;
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

export type PopularComparison = {
  watchAId: string;
  watchBId: string;
  count: number;
};

const fieldSections: Array<{
  title: string;
  fields: Array<{ label: string; key: keyof Watch; emphasis?: boolean }>;
}> = [
  {
    title: "Reference Details",
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
      { label: "Crown", key: "crown_type" },
      { label: "Helium Valve", key: "helium_escape_valve" },
      { label: "Caseback", key: "caseback_type" },
      { label: "Caseback Details", key: "caseback_description" },
    ],
  },
  {
    title: "Bezel, Crystal, And Dial",
    fields: [
      { label: "Bezel Type", key: "bezel_type" },
      { label: "Bezel Material", key: "bezel_material" },
      { label: "Bezel Insert", key: "bezel_insert_material" },
      { label: "Crystal", key: "crystal_type" },
      { label: "Crystal Coating", key: "crystal_coating" },
      { label: "Dial Color", key: "dial_color" },
      { label: "Dial Texture", key: "dial_texture" },
      { label: "Dial Finish", key: "dial_finish_raw" },
      { label: "Indices", key: "indices_type" },
      { label: "Lume", key: "lume_type" },
    ],
  },
  {
    title: "Movement And Function",
    fields: [
      { label: "Movement Type", key: "movement_type", emphasis: true },
      { label: "Caliber", key: "caliber", emphasis: true },
      { label: "Power Reserve", key: "power_reserve" },
      { label: "Jewels", key: "jewels" },
      { label: "Frequency", key: "frequency_vph" },
      { label: "Accuracy", key: "accuracy_claim" },
      { label: "COSC Certified", key: "cosc_certified" },
      { label: "METAS Certified", key: "metas_certified" },
      { label: "Magnetic Resistance", key: "magnetic_resistance_gauss" },
      { label: "Date", key: "date_display" },
      { label: "Chronograph", key: "has_chronograph" },
      { label: "GMT", key: "has_gmt" },
    ],
  },
  {
    title: "Bracelet, Clasp, And Wearability",
    fields: [
      { label: "Bracelet Type", key: "bracelet_type" },
      { label: "Bracelet Material", key: "bracelet_material" },
      { label: "Bracelet Finish", key: "bracelet_finish_raw" },
      { label: "Link Design", key: "link_design_raw" },
      { label: "Bracelet Taper", key: "bracelet_taper" },
      { label: "Clasp Type", key: "clasp_type", emphasis: true },
      { label: "Micro-Adjustment", key: "micro_adjustment", emphasis: true },
      { label: "Micro-Adjustment Positions", key: "micro_adjustment_positions" },
      { label: "Adjustment System", key: "adjustment_system_normalized" },
      { label: "Adjustment Details", key: "adjustment_system_raw" },
      { label: "Tool-Free Adjustment", key: "tool_free_adjustment" },
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

function withVph(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} vph`;
}

function withGauss(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${value} gauss`;
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

function compareText(left?: string | null, right?: string | null) {
  return (left ?? "").localeCompare(right ?? "", undefined, {
    sensitivity: "base",
  });
}

function watchName(watch: Watch) {
  return watchDisplayName(watch);
}

function shortWatchName(watch: Watch) {
  const brand = watchBrand(watch);
  const collection = watchCollection(watch);
  const model = watchModel(watch);
  const shouldShowCollection =
    collection &&
    (!model || !normalizeNamePart(model).startsWith(normalizeNamePart(collection)));
  const compactModel = model
    ?.replace(/\bblack lacquered polished\b/gi, "")
    .replace(/\bblue dial on bracelet\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return [brand, shouldShowCollection ? collection : null, compactModel]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function watchSearchText(watch: Watch) {
  return [watchName(watch), watch.reference_number].filter(Boolean).join(" ");
}

function pairPath(watchA: Watch, watchB: Watch) {
  return `/compare/${watchSlug(watchA)}/vs/${watchSlug(watchB)}`;
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
    case "frequency_vph":
      if (watch.frequency_vph && watch.frequency_hz) {
        return `${withVph(watch.frequency_vph)} / ${watch.frequency_hz} Hz`;
      }
      return withVph(watch.frequency_vph) ?? (watch.frequency_hz ? `${watch.frequency_hz} Hz` : null);
    case "magnetic_resistance_gauss":
      return withGauss(watch.magnetic_resistance_gauss);
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
      return (
        watch.micro_adjustment ??
        withMm(watch.micro_adjustment_mm) ??
        watch.adjustment_system_normalized ??
        watch.adjustment_system_raw
      );
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

function KeyMeasure({
  label,
  value,
}: {
  label: string;
  value: Watch[keyof Watch];
}) {
  return (
    <div className="border-l border-red-600/35 pl-4">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-black">
        {display(value)}
      </dd>
    </div>
  );
}

function WatchColumnHeader({
  watch,
  label,
}: {
  watch: Watch | null;
  label: string;
}) {
  if (!watch) {
    return (
      <div className="min-h-28 border-l border-zinc-200 px-3 py-4 sm:px-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-red-600/80">
          {label}
        </p>
        <p className="mt-3 text-sm text-zinc-600">Select a watch</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-28 flex-col border-l border-zinc-200 px-3 py-4 sm:px-5">
      <div>
        <h3 className="text-sm font-semibold leading-5 text-black sm:text-base">
          {watchName(watch)}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
          {watch.reference_number || "Reference not listed"}
        </p>
      </div>
      <Link
        href={`/watches/${watchSlug(watch)}`}
        className="mt-auto inline-flex w-fit border border-red-600/40 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-red-600 transition hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
      >
        View Details
      </Link>
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
    <div className="border-t border-zinc-200 py-4 first:border-t-0">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-black">{label}</h3>
        <p className="text-xs uppercase tracking-[0.16em] text-red-600/80">
          {formatDelta(parsedA, parsedB)}
        </p>
      </div>
      <div className="grid gap-3">
        <div className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3 text-sm">
          <span className="text-zinc-600">Watch A</span>
          <span className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <span
              className="block h-full rounded-full bg-red-600"
              style={{ width: `${widthA}%` }}
            />
          </span>
          <span className="text-right font-medium text-black">
            {formatMm(parsedA)}
          </span>
        </div>
        <div className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3 text-sm">
          <span className="text-zinc-600">Watch B</span>
          <span className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <span
              className="block h-full rounded-full bg-cognac"
              style={{ width: `${widthB}%` }}
            />
          </span>
          <span className="text-right font-medium text-black">
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

  return (
    <section className="grid gap-6 border border-zinc-200 bg-white p-5 shadow-aureate sm:p-6 lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600/80">
          Collector read
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight text-black sm:text-5xl">
          The proportions tell the first story.
        </h2>
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          This view is built for the details enthusiasts usually have to hunt
          across reviews: wrist presence, case height, bracelet taper, clasp
          behavior, and practical adjustability.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <KeyMeasure label="Watch A" value={fieldValue(watchA, "case_size")} />
          <KeyMeasure label="Watch B" value={fieldValue(watchB, "case_size")} />
        </div>
      </div>
      <div className="border-y border-zinc-200 bg-zinc-50 px-1">
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
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const listboxId = `${label.toLowerCase().replaceAll(" ", "-")}-watch-options`;

  const selectedWatch = useMemo(
    () =>
      watches.find((watch, index) => watchKey(watch, index) === selectedKey) ??
      null,
    [selectedKey, watches],
  );

  const brands = useMemo(() => {
    const countByBrand = new Map<string, number>();

    for (const watch of watches) {
      const brand = watchBrand(watch) ?? "Unknown Brand";
      countByBrand.set(brand, (countByBrand.get(brand) ?? 0) + 1);
    }

    return [...countByBrand.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((left, right) =>
        left.brand.localeCompare(right.brand, undefined, {
          sensitivity: "base",
        }),
      );
  }, [watches]);

  const filteredBrands = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return brands;
    }

    return brands.filter(({ brand }) =>
      brand.toLowerCase().includes(normalized),
    );
  }, [brands, query]);

  const brandWatches = useMemo(() => {
    if (!selectedBrand) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    return watches
      .filter((watch) => (watchBrand(watch) ?? "Unknown Brand") === selectedBrand)
      .filter((watch) =>
        normalized
          ? watchSearchText(watch).toLowerCase().includes(normalized)
          : true,
      )
      .sort(
        (left, right) =>
          compareText(watchCollection(left), watchCollection(right)) ||
          compareText(watchModel(left), watchModel(right)) ||
          compareText(left.reference_number, right.reference_number),
      );
  }, [query, selectedBrand, watches]);

  return (
    <div className="relative min-w-0">
      <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.28em] text-red-600/80">
        {label}
      </label>
      <button
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setSelectedBrand(null);
          setOpen((current) => !current);
        }}
        className="flex min-h-16 w-full min-w-0 items-center justify-between gap-2 overflow-hidden border border-zinc-200 bg-white px-3 py-3 text-left text-sm font-semibold text-black outline-none transition hover:border-red-600/50 hover:bg-zinc-50 focus:border-red-600/70 focus:bg-zinc-50 focus:ring-2 focus:ring-red-600/20 sm:gap-4 sm:px-4 sm:text-base"
      >
        <span className="block min-w-0 flex-1 truncate">
          {selectedWatch ? (
            <>
              <span className="sm:hidden">{shortWatchName(selectedWatch)}</span>
              <span className="hidden sm:inline">{watchName(selectedWatch)}</span>
            </>
          ) : (
            "Select brand, then watch"
          )}
        </span>
        <span className="shrink-0 border-l border-zinc-200 pl-3 text-[0.68rem] uppercase tracking-[0.14em] text-red-600 sm:pl-4 sm:text-xs sm:tracking-[0.18em]" aria-hidden="true">
          {open ? "Close" : "Select"}
        </span>
      </button>
      {open ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-lg border border-red-600/30 bg-white p-2 text-black shadow-aureate"
        >
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={selectedBrand ? "Filter watches" : "Filter brands"}
            className="mb-2 h-11 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-black outline-none placeholder:text-zinc-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
          {selectedBrand ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand(null);
                  setQuery("");
                }}
                className="mb-2 block w-full rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-zinc-700 transition hover:bg-zinc-200 focus:bg-zinc-200 focus:outline-none"
              >
                Back to brands
              </button>
              {brandWatches.length ? (
                brandWatches.map((watch, index) => (
                  <button
                    key={watchKey(watch, index)}
                    type="button"
                    role="option"
                    aria-selected={watchKey(watch, index) === selectedKey}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelect(watchKey(watch, index));
                      setOpen(false);
                      setSelectedBrand(null);
                      setQuery("");
                    }}
                    className="block w-full rounded-md bg-transparent px-3 py-3 text-left text-black transition hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                  >
                    <span className="block text-sm font-semibold text-black">
                      {watchName(watch)}
                    </span>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                      {watch.reference_number || "Reference not listed"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-[#6f6758]">
                  No watches found for {selectedBrand}.
                </div>
              )}
            </>
          ) : filteredBrands.length ? (
            filteredBrands.map(({ brand, count }) => (
              <button
                key={brand}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSelectedBrand(brand);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-3 rounded-md bg-transparent px-3 py-3 text-left text-black transition hover:bg-red-50 focus:bg-red-50 focus:outline-none"
              >
                <span className="block text-sm font-semibold text-black">
                  {brand}
                </span>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                  {count} watches
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-sm text-[#6f6758]">
              No brands found.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BenchImagePreview({
  watch,
  label,
}: {
  watch: Watch | null;
  label: string;
}) {
  const imageUrl = watchImageUrl(watch);

  return (
    <section className="grid min-h-72 overflow-hidden border border-zinc-200 bg-white shadow-aureate sm:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="flex flex-col justify-between gap-5 p-4 sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600/80">
            {label}
          </p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-black">
            {watch ? watchName(watch) : "Select a watch"}
          </h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
            {watch?.reference_number || "Reference not listed"}
          </p>
        </div>
        {watch ? (
          <Link
            href={`/watches/${watchSlug(watch)}`}
            className="inline-flex w-fit border border-red-600/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-600 transition hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white focus:outline-none focus:ring-2 focus:ring-red-600/30"
          >
            View Details
          </Link>
        ) : null}
      </div>
      {watch && imageUrl ? (
        <div
          aria-label={`${watchName(watch)} product image`}
          className="min-h-72 border-t border-zinc-200 bg-white bg-contain bg-center bg-no-repeat sm:min-h-full sm:border-l sm:border-t-0"
          role="img"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      ) : (
        <div className="grid min-h-72 place-items-center border-t border-zinc-200 bg-zinc-50 px-4 text-center text-sm text-zinc-600 sm:min-h-full sm:border-l sm:border-t-0">
          Image not listed
        </div>
      )}
    </section>
  );
}

function SpecSection({
  section,
  watchA,
  watchB,
}: {
  section: (typeof fieldSections)[number];
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-b border-zinc-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-4 bg-zinc-50 px-3 py-3 text-left sm:px-5 md:pointer-events-none"
      >
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-red-600">
          {section.title}
        </h3>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600 md:hidden">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>
      <div className={`${expanded ? "block" : "hidden"} md:block`}>
        <dl className="divide-y divide-zinc-200">
          {section.fields.map((field) => (
            <div
              key={field.key}
              className={`grid grid-cols-[6.5rem_1fr_1fr] text-xs transition hover:bg-white sm:grid-cols-[12rem_1fr_1fr] sm:text-sm ${
                field.emphasis ? "bg-white/[0.018]" : ""
              }`}
            >
              <dt
                className={`px-3 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.1em] sm:px-5 sm:py-4 sm:text-xs sm:tracking-[0.14em] ${
                  field.emphasis ? "text-black" : "text-zinc-600"
                }`}
              >
                {field.label}
              </dt>
              <dd className="border-l border-zinc-200 px-3 py-3 font-medium leading-5 text-black sm:px-5 sm:py-4 sm:leading-6">
                {display(fieldValue(watchA, field.key))}
              </dd>
              <dd className="border-l border-zinc-200 px-3 py-3 font-medium leading-5 text-black sm:px-5 sm:py-4 sm:leading-6">
                {display(fieldValue(watchB, field.key))}
              </dd>
            </div>
          ))}
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
    <section className="mt-6 overflow-x-auto border border-zinc-200 bg-white shadow-aureate">
      <div className="min-w-[42rem] sm:min-w-0">
      <div className="grid grid-cols-[6.5rem_1fr_1fr] border-b border-zinc-200 bg-zinc-50 sm:grid-cols-[12rem_1fr_1fr]">
        <div className="px-3 py-4 sm:px-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Compared
          </p>
        </div>
        <WatchColumnHeader
          watch={watchA}
          label={watchA ? watchName(watchA) : "First reference"}
        />
        <WatchColumnHeader
          watch={watchB}
          label={watchB ? watchName(watchB) : "Second reference"}
        />
      </div>
      {fieldSections.map((section) => (
        <SpecSection
          key={section.title}
          section={section}
          watchA={watchA}
          watchB={watchB}
        />
      ))}
      </div>
    </section>
  );
}

function normalizeRecommendationText(value: string | null | undefined) {
  return normalizeNamePart(value).toLowerCase();
}

function recommendationMatchesWatch(item: string, watch: Watch | null) {
  if (!watch) {
    return false;
  }

  const itemText = normalizeRecommendationText(item);
  const name = normalizeRecommendationText(watchName(watch));
  const reference = normalizeRecommendationText(watch.reference_number);
  const brand = normalizeRecommendationText(watchBrand(watch));
  const model = normalizeRecommendationText(watchModel(watch));

  return Boolean(
    (name && (itemText.startsWith(name) || itemText.includes(name))) ||
      (reference && itemText.includes(reference)) ||
      (brand && model && itemText.includes(brand) && itemText.includes(model)),
  );
}

function recommendationCopy(item: string) {
  const separatorIndex = item.indexOf(":");

  if (separatorIndex === -1) {
    return capitalizeFirstLetter(item);
  }

  return capitalizeFirstLetter(item.slice(separatorIndex + 1).trim());
}

function capitalizeFirstLetter(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function groupedRecommendations(
  items: string[],
  watchA: Watch | null,
  watchB: Watch | null,
) {
  return items.reduce(
    (groups, item) => {
      const normalized = normalizeRecommendationText(item);

      if (normalized.startsWith("either watch")) {
        groups.either.push(recommendationCopy(item));
      } else if (recommendationMatchesWatch(item, watchA)) {
        groups.watchA.push(recommendationCopy(item));
      } else if (recommendationMatchesWatch(item, watchB)) {
        groups.watchB.push(recommendationCopy(item));
      } else {
        groups.either.push(item);
      }

      return groups;
    },
    { watchA: [] as string[], watchB: [] as string[], either: [] as string[] },
  );
}

function recommendationIcon(item: string) {
  const text = normalizeRecommendationText(item);

  if (/\b(msrp|price|cost|value|money|budget|affordable|overpriced|undervalued)\b/.test(text)) {
    return "•";
  }

  if (/\b(dial|design|style|aesthetic|visual|look|finishing|finish|polished|luxury feel)\b/.test(text)) {
    return "⌚";
  }

  if (/\b(movement|caliber|accuracy|power reserve|spring drive|quartz|automatic|manual|cosc|metas|technical|engineering)\b/.test(text)) {
    return "⚙️";
  }

  if (/\b(wrist|fit|comfort|wear|wearability|smaller|larger|diameter|thickness|lug|lightweight|weight)\b/.test(text)) {
    return "👌";
  }

  if (/\b(dive|diver|water|sports|sport|travel|gmt|practical|daily|versatile|utility|micro-adjustment)\b/.test(text)) {
    return "🧭";
  }

  if (/\b(collector|collectors|heritage|prestige|brand|reputation|desirability|enthusiast|icon|cachet)\b/.test(text)) {
    return "🏆";
  }

  return "💎";
}

function cleanVerdictText(text: string | null | undefined) {
  if (!text) {
    return null;
  }

  const withoutScoreSections = text
    .replace(
      /\b(?:category\s*)?score(?:card|s)?(?:\s+summary)?\s*:?\s*[\s\S]*?(?=\bfinal\s+verdict\b|$)/gi,
      "",
    )
    .replace(
      /^(?:[-*]\s*)?(?:movement|case\s*&\s*wearability|dial\s*&\s*legibility|materials\s*&\s*finishing|features\s*&\s*functionality|brand\s*&\s*heritage|value\s+proposition|ownership\s+experience)\s*:.*\b\d{1,2}(?:\.\d+)?\s*\/\s*10\b.*$/gim,
      "",
    )
    .replace(/^.*\bscore(?:card|s)?\b.*$/gim, "");

  const lines = withoutScoreSections
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const keptLines = lines.filter((line, index) => {
    if (/^(pros|cons|scorecard)\s*:/i.test(line)) {
      return false;
    }

    if (/^scorecard\b/i.test(line)) {
      return false;
    }

    const nextLine = lines[index + 1];
    if (nextLine && /^pros\s*:/i.test(nextLine)) {
      return false;
    }

    return true;
  });

  return keptLines
    .join("\n")
    .replace(/\bPros:\s*[\s\S]*?(?=\bCons:|\bScorecard:|\bFinal verdict:|$)/gi, "")
    .replace(/\bCons:\s*[\s\S]*?(?=\bScorecard:|\bFinal verdict:|$)/gi, "")
    .replace(/\bScorecard:\s*[\s\S]*?(?=\bFinal verdict:|$)/gi, "")
    .replace(/\bFinal verdict\s*:\s*/i, "")
    .trim() || null;
}

function DecisionSummary({
  recommendations,
  watchA,
  watchB,
}: {
  recommendations: string[];
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  const groups = groupedRecommendations(recommendations, watchA, watchB);
  const columns = [
    {
      key: "watch-a",
      label: "Best fit",
      name: watchA ? watchName(watchA) : "First reference",
      items: groups.watchA,
      border: "border-red-600/35",
    },
    {
      key: "watch-b",
      label: "Best fit",
      name: watchB ? watchName(watchB) : "Second reference",
      items: groups.watchB,
      border: "border-cognac/45",
    },
  ];

  return (
    <div className="grid gap-4 border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600/80">
            Decision snapshot
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-black">
            Best suited for
          </h3>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {columns.map((column) => (
          <section
            key={column.key}
            className={`border ${column.border} bg-white p-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-zinc-600">
                  {column.label}
                </p>
                <h4 className="mt-2 text-base font-semibold leading-6 text-black">
                  {column.name}
                </h4>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-zinc-600">
              {column.items.length ? (
                column.items.map((item) => (
                  <li key={item} className="grid grid-cols-[1.5rem_1fr] gap-2">
                    <span aria-hidden="true" className="text-base leading-6">
                      {recommendationIcon(item)}
                    </span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="grid grid-cols-[1.5rem_1fr] gap-2">
                  <span aria-hidden="true" className="text-base leading-6">
                    🕰️
                  </span>
                  <span>No explicit preference-fit points for this watch yet.</span>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>

      {groups.either.length ? (
        <section className="border border-zinc-200 bg-white p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-zinc-600">
            Either watch
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-zinc-600 sm:grid-cols-2">
            {groups.either.map((item) => (
              <li key={item} className="grid grid-cols-[1.5rem_1fr] gap-2">
                <span aria-hidden="true" className="text-base leading-6">
                  {recommendationIcon(item)}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PairComparisonPanel({
  watchA,
  watchB,
  panelRef,
  initialComparison = null,
}: {
  watchA: Watch | null;
  watchB: Watch | null;
  panelRef?: RefObject<HTMLElement | null>;
  initialComparison?: PairComparisonResult | null;
}) {
  const [comparison, setComparison] = useState<PairComparisonResult | null>(
    initialComparison,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aId = watchId(watchA);
  const bId = watchId(watchB);
  const pairRequestKey =
    aId && bId && aId !== bId ? [aId, bId].sort().join(":") : null;
  const verdictText = cleanVerdictText(comparison?.enthusiast_take);

  useEffect(() => {
    if (!pairRequestKey || !aId || !bId) {
      setComparison(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (initialComparison) {
      setComparison(initialComparison);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    async function loadComparison() {
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

        if (active) {
          setComparison(payload.comparison);
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to compare these watches.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComparison();

    return () => {
      active = false;
    };
  }, [aId, bId, initialComparison, pairRequestKey]);

  return (
    <section
      ref={panelRef}
      className="scroll-mt-4 border border-red-600/20 bg-white p-5 shadow-aureate sm:p-6"
    >
      <div className="grid gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-600">
            Pair Review
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-black sm:text-4xl">
            Head-to-head enthusiast verdict
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Built from the saved specs and wearability notes for these two
            watches, then weighed against enthusiast priorities like fit,
            movement quality, practicality, finishing, value, and collector
            appeal.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-5 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-5">
          <div className="h-5 w-4/5 animate-pulse bg-zinc-100" />
          <div className="grid gap-px bg-zinc-100 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4">
                <div className="h-3 w-28 animate-pulse bg-red-100" />
                <div className="mt-3 h-4 w-full animate-pulse bg-zinc-100" />
                <div className="mt-2 h-4 w-3/4 animate-pulse bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {comparison ? (
        <div className="mt-6 grid gap-4 border-t border-zinc-200 pt-5">
          <p className="text-base leading-7 text-black">{comparison.summary}</p>
          <div className="grid gap-px bg-zinc-100 md:grid-cols-2">
            {[
              ["Movement", comparison.movement_comparison],
              ["Case & Wearability", comparison.fit_comparison],
              ["Daily Use, Dial & Materials", comparison.daily_wear_comparison],
              ["Brand, Ownership & Value", comparison.value_comparison],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-red-600/80">
                  {label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-black">
                  {value || "Not enough verified data listed yet."}
                </p>
              </div>
            ))}
          </div>
          {verdictText ? (
            <p className="whitespace-pre-line border-l border-red-600/40 pl-4 text-sm leading-6 text-zinc-600">
              {verdictText}
            </p>
          ) : null}
          {comparison.recommended_for?.length ? (
            <DecisionSummary
              recommendations={comparison.recommended_for}
              watchA={watchA}
              watchB={watchB}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PopularComparisons({
  comparisons,
  watches,
  onSelectPair,
}: {
  comparisons: PopularComparison[];
  watches: Watch[];
  onSelectPair: (comparison: PopularComparison) => void;
}) {
  if (comparisons.length === 0) {
    return null;
  }

  const watchById = new Map(
    watches
      .map((watch) => {
        const id = watchId(watch);
        return id ? ([id, watch] as const) : null;
      })
      .filter((entry): entry is readonly [string, Watch] => Boolean(entry)),
  );

  return (
    <section className="mt-5 border-t border-zinc-200 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600/80">
            Need a second watch?
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Load a popular pairing or open its dedicated 1v1 page.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {comparisons.map((comparison) => {
          const watchA = watchById.get(comparison.watchAId);
          const watchB = watchById.get(comparison.watchBId);

          if (!watchA || !watchB) {
            return null;
          }

          return (
            <div
              key={`${comparison.watchAId}:${comparison.watchBId}`}
              className="group min-h-28 border border-zinc-200 bg-white p-3 text-left transition hover:border-red-600/45 hover:bg-red-50 sm:min-h-36 sm:p-4"
            >
              <p className="text-sm font-semibold leading-5 text-black">
                {watchName(watchA)}
              </p>
              <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-zinc-600">
                vs
              </p>
              <p className="mt-2 text-sm font-semibold leading-5 text-black">
                {watchName(watchB)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPair(comparison)}
                  className="border border-red-600/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white focus:outline-none"
                >
                  Load pair
                </button>
                <CompareLaunchLink
                  href={pairPath(watchA, watchB)}
                  className="border border-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600 focus:border-red-600/40 focus:text-red-600 focus:outline-none"
                >
                  1v1 page
                </CompareLaunchLink>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CompareClient({
  watches,
  defaultWatchAId,
  defaultWatchBId,
  popularComparisons = [],
  presentation = "bench",
  initialComparison = null,
}: {
  watches: Watch[];
  defaultWatchAId?: string | null;
  defaultWatchBId?: string | null;
  popularComparisons?: PopularComparison[];
  presentation?: "bench" | "pair";
  initialComparison?: PairComparisonResult | null;
}) {
  const aiPanelRef = useRef<HTMLElement | null>(null);
  const watchesWithMeasurements = watches.filter(hasFitMeasurements);
  const popularWatchA = defaultWatchAId
    ? watches.find((watch) => watchId(watch) === defaultWatchAId)
    : null;
  const popularWatchB = defaultWatchBId
    ? watches.find((watch) => watchId(watch) === defaultWatchBId)
    : null;
  const defaultWatchA = popularWatchA ?? watchesWithMeasurements[0] ?? watches[0];
  const defaultWatchB = popularWatchB;
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

  function selectPopularComparison(comparison: PopularComparison) {
    const nextWatchA = watches.find(
      (watch) => watchId(watch) === comparison.watchAId,
    );
    const nextWatchB = watches.find(
      (watch) => watchId(watch) === comparison.watchBId,
    );

    setWatchAKey(nextWatchA ? watchKey(nextWatchA) : null);
    setWatchBKey(nextWatchB ? watchKey(nextWatchB) : null);

    window.requestAnimationFrame(() => {
      aiPanelRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  }

  if (watches.length === 0) {
    return (
      <div className="rounded border border-zinc-200 bg-white p-8 text-sm text-zinc-600">
        No watches are listed yet.
      </div>
    );
  }

  return (
    <>
      {presentation === "bench" ? (
        <div className="border border-zinc-200 bg-white p-4 shadow-aureate sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600/80">
                Comparison bench
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Search by brand or reference, then compare proportions, specs,
                reviews, and research context.
              </p>
            </div>
            {watchA && watchB ? (
              <CompareLaunchLink
                href={pairPath(watchA, watchB)}
                className="border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600"
              >
                Open 1v1 Page
              </CompareLaunchLink>
            ) : null}
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
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BenchImagePreview watch={watchA} label="Watch A" />
            <BenchImagePreview watch={watchB} label="Watch B" />
          </div>
          <PopularComparisons
            comparisons={popularComparisons}
            watches={watches}
            onSelectPair={selectPopularComparison}
          />
        </div>
      ) : null}

      {presentation === "bench" ? (
        <div className="mt-5">
          <CollectorRead watchA={watchA} watchB={watchB} />
        </div>
      ) : null}

      <div className={presentation === "pair" ? "" : "mt-6"}>
        <PairComparisonPanel
          watchA={watchA}
          watchB={watchB}
          panelRef={aiPanelRef}
          initialComparison={initialComparison}
        />
      </div>

      <ComparisonTable watchA={watchA} watchB={watchB} />
    </>
  );
}
