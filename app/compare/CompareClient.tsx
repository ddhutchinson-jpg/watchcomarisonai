"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  normalizeNamePart,
  watchDisplayName,
  watchSlug,
} from "@/src/lib/watchRoutes";

export type Watch = {
  id?: string | number | null;
  watch_id?: string | number | null;
  image_url?: string | null;
  primary_image_url?: string | null;
  affiliate_url?: string | null;
  affiliate_partner?: string | null;
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

function watchAffiliateUrl(watch: Watch | null | undefined) {
  return watch?.affiliate_url ?? null;
}

function watchAffiliatePartner(watch: Watch | null | undefined) {
  return watch?.affiliate_partner ?? "Retailer";
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
          setSelectedBrand(null);
          setOpen((current) => !current);
        }}
        className="flex min-h-16 w-full items-center justify-between gap-4 border border-white/10 bg-[#12100d] px-4 py-3 text-left text-base font-semibold text-platinum outline-none transition hover:border-champagne/50 hover:bg-[#171410] focus:border-champagne/70 focus:bg-[#171410] focus:ring-2 focus:ring-champagne/20"
      >
        <span className="min-w-0 truncate">
          {selectedWatch ? watchName(selectedWatch) : "Select brand, then watch"}
        </span>
        <span className="shrink-0 border-l border-white/10 pl-4 text-xs uppercase tracking-[0.18em] text-champagne" aria-hidden="true">
          {open ? "Close" : "Select"}
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
            placeholder={selectedBrand ? "Filter watches" : "Filter brands"}
            className="mb-2 h-11 w-full border border-[#c7b57e] bg-white px-3 text-sm font-semibold text-obsidian outline-none placeholder:text-[#6f6758] focus:border-[#8d6a2d] focus:ring-2 focus:ring-[#d8c391]/50"
          />
          {selectedBrand ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand(null);
                  setQuery("");
                }}
                className="mb-2 block w-full border border-[#c7b57e] bg-[#ece3cf] px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-[#6f5425] transition hover:bg-[#ded0a8] focus:bg-[#ded0a8] focus:outline-none"
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
                className="flex w-full items-center justify-between gap-3 bg-transparent px-3 py-3 text-left text-obsidian transition hover:bg-[#ded0a8] hover:text-obsidian focus:bg-[#ded0a8] focus:text-obsidian focus:outline-none"
              >
                <span className="block text-sm font-semibold text-obsidian">
                  {brand}
                </span>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f5425]">
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

function WatchCard({
  watch,
  label,
}: {
  watch: Watch | null;
  label: string;
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
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne/70">
            {label}
          </p>
          <Link
            href={`/watches/${watchSlug(watch)}`}
            className="inline-flex w-fit border border-champagne/40 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian focus:bg-champagne focus:text-obsidian focus:outline-none focus:ring-2 focus:ring-champagne/30"
          >
            View Details
          </Link>
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
    return "💰";
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

const scorecardCategories = [
  "Movement",
  "Case & Wearability",
  "Dial & Legibility",
  "Materials & Finishing",
  "Features & Functionality",
  "Brand & Heritage",
  "Value Proposition",
  "Ownership Experience",
];

type ScorecardRow = {
  category: string;
  watchA: number | null;
  watchB: number | null;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreAliases(watch: Watch | null) {
  if (!watch) {
    return [];
  }

  return [
    watchName(watch),
    watch.reference_number,
    watchBrand(watch),
    watchCollection(watch),
    watchModel(watch),
  ]
    .map((value) => normalizeNamePart(value))
    .filter((value, index, values) => value && values.indexOf(value) === index);
}

function findLastAliasIndex(text: string, aliases: string[]) {
  const normalized = text.toLowerCase();

  return aliases.reduce((lastIndex, alias) => {
    const index = normalized.lastIndexOf(alias.toLowerCase());
    return Math.max(lastIndex, index);
  }, -1);
}

function scoreBlockOwner(
  precedingText: string,
  watchA: Watch | null,
  watchB: Watch | null,
) {
  const watchAIndex = findLastAliasIndex(precedingText, scoreAliases(watchA));
  const watchBIndex = findLastAliasIndex(precedingText, scoreAliases(watchB));

  if (watchAIndex === watchBIndex) {
    return null;
  }

  return watchAIndex > watchBIndex ? "watchA" : "watchB";
}

function scoreSectionOwner(
  section: string,
  watchA: Watch | null,
  watchB: Watch | null,
) {
  const heading = section.split(/\n+/)[0] ?? section;
  const watchAIndex = findLastAliasIndex(heading, scoreAliases(watchA));
  const watchBIndex = findLastAliasIndex(heading, scoreAliases(watchB));

  if (watchAIndex === watchBIndex) {
    return null;
  }

  return watchAIndex > watchBIndex ? "watchA" : "watchB";
}

function parseCategoryScore(block: string, category: string) {
  const match = block.match(
    new RegExp(`${escapeRegExp(category)}\\s*(?:[:\\-])?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:/\\s*10)?`, "i"),
  );

  if (!match) {
    return null;
  }

  const score = Number.parseFloat(match[1]);
  return Number.isFinite(score) ? score : null;
}

function findScoreAfterAlias(text: string, aliases: string[]) {
  const normalized = text.toLowerCase();

  for (const alias of aliases) {
    const index = normalized.indexOf(alias.toLowerCase());

    if (index === -1) {
      continue;
    }

    const afterAlias = text.slice(index + alias.length);
    const match = afterAlias.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*10)?/);

    if (match) {
      const score = Number.parseFloat(match[1]);
      return Number.isFinite(score) ? score : null;
    }
  }

  return null;
}

function parseScorecard(
  text: string | null | undefined,
  watchA: Watch | null,
  watchB: Watch | null,
) {
  if (!text) {
    return [];
  }

  const rows = scorecardCategories.map<ScorecardRow>((category) => ({
    category,
    watchA: null,
    watchB: null,
  }));
  const watchAAliases = scoreAliases(watchA);
  const watchBAliases = scoreAliases(watchB);
  const sections = text
    .split(/\n\s*\n+/)
    .map((section) => section.trim())
    .filter(Boolean);

  for (const section of sections) {
    const scorecardMatch = section.match(/scorecard:\s*([\s\S]*)/i);

    if (!scorecardMatch) {
      continue;
    }

    const owner = scoreSectionOwner(section, watchA, watchB);

    for (const row of rows) {
      const score = parseCategoryScore(scorecardMatch[1], row.category);

      if (score === null) {
        continue;
      }

      if (owner === "watchA") {
        row.watchA = score;
      } else if (owner === "watchB") {
        row.watchB = score;
      }
    }
  }

  const scorecardRegex = /scorecard:\s*([\s\S]*?)(?=\n\s*\n|final verdict:|$)/gi;
  let scorecardMatch: RegExpExecArray | null;

  while ((scorecardMatch = scorecardRegex.exec(text))) {
    const block = scorecardMatch[1];
    const owner = scoreBlockOwner(
      text.slice(Math.max(0, scorecardMatch.index - 500), scorecardMatch.index),
      watchA,
      watchB,
    );

    for (const row of rows) {
      const score = parseCategoryScore(block, row.category);

      if (score === null) {
        continue;
      }

      if (owner === "watchA" && row.watchA === null) {
        row.watchA = score;
      } else if (owner === "watchB" && row.watchB === null) {
        row.watchB = score;
      }
    }
  }

  for (const row of rows) {
    if (row.watchA !== null && row.watchB !== null) {
      continue;
    }

    const categoryMatch = text.match(
      new RegExp(`${escapeRegExp(row.category)}\\s*:\\s*([^\\n]+)`, "i"),
    );

    if (!categoryMatch) {
      continue;
    }

    row.watchA ??= findScoreAfterAlias(categoryMatch[1], watchAAliases);
    row.watchB ??= findScoreAfterAlias(categoryMatch[1], watchBAliases);
  }

  return rows.filter((row) => row.watchA !== null || row.watchB !== null);
}

function scoreWidth(score: number | null) {
  return `${Math.max(0, Math.min(100, ((score ?? 0) / 10) * 100))}%`;
}

function formatScore(score: number | null) {
  return score === null ? "--" : score.toFixed(1);
}

function cleanVerdictText(text: string | null | undefined) {
  if (!text) {
    return null;
  }

  const lines = text
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
    .trim() || null;
}

function Scorecard({
  rows,
  watchA,
  watchB,
}: {
  rows: ScorecardRow[];
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  if (!rows.length) {
    return null;
  }

  return (
    <div className="grid gap-4 border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne/80">
            Scorecard
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-platinum">
            Category scores out of 10
          </h3>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-2 md:grid-cols-[12rem_1fr_1fr] md:items-end">
          <span />
          <div className="border border-champagne/35 px-3 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-champagne/80">
              Watch A
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-platinum">
              {watchA ? watchName(watchA) : "Watch A"}
            </p>
          </div>
          <div className="border border-cognac/45 px-3 py-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cognac/90">
              Watch B
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-platinum">
              {watchB ? watchName(watchB) : "Watch B"}
            </p>
          </div>
        </div>
        {rows.map((row) => {
          const watchAWins = row.watchA !== null && row.watchB !== null && row.watchA > row.watchB;
          const watchBWins = row.watchA !== null && row.watchB !== null && row.watchB > row.watchA;

          return (
            <div key={row.category} className="grid gap-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0 md:grid-cols-[12rem_1fr_1fr] md:items-center">
              <p className="text-sm font-semibold text-platinum">{row.category}</p>
              <div>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-pewter">
                  <span className="md:hidden">Watch A</span>
                  <span className={watchAWins ? "text-champagne" : "text-platinum"}>{formatScore(row.watchA)}</span>
                </div>
                <div className="h-2 overflow-hidden bg-white/10">
                  <div className="h-full bg-champagne" style={{ width: scoreWidth(row.watchA) }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-pewter">
                  <span className="md:hidden">Watch B</span>
                  <span className={watchBWins ? "text-cognac" : "text-platinum"}>{formatScore(row.watchB)}</span>
                </div>
                <div className="h-2 overflow-hidden bg-white/10">
                  <div className="h-full bg-cognac" style={{ width: scoreWidth(row.watchB) }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
      label: "Watch A",
      name: watchA ? watchName(watchA) : "Watch A",
      items: groups.watchA,
      border: "border-champagne/35",
    },
    {
      key: "watch-b",
      label: "Watch B",
      name: watchB ? watchName(watchB) : "Watch B",
      items: groups.watchB,
      border: "border-cognac/45",
    },
  ];

  return (
    <div className="grid gap-4 border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-champagne/80">
            Decision snapshot
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-platinum">
            Best suited for
          </h3>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {columns.map((column) => (
          <section
            key={column.key}
            className={`border ${column.border} bg-white/[0.035] p-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-pewter">
                  {column.label}
                </p>
                <h4 className="mt-2 text-base font-semibold leading-6 text-platinum">
                  {column.name}
                </h4>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-pewter">
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
                  <span>No explicit buyer-fit points for this watch yet.</span>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>

      {groups.either.length ? (
        <section className="border border-white/10 bg-white/[0.025] p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-pewter">
            Either watch
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-pewter sm:grid-cols-2">
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
  const scorecardRows = parseScorecard(
    comparison?.enthusiast_take,
    watchA,
    watchB,
  );
  const verdictText = cleanVerdictText(comparison?.enthusiast_take);

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
            Ask AI for a head-to-head enthusiast verdict.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-pewter">
            Scores are based on the saved specs and wearability notes for these
            two watches, then weighted against enthusiast priorities like fit,
            movement quality, practicality, finishing, value, and collector
            appeal.
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
              ["Movement", comparison.movement_comparison],
              ["Case & Wearability", comparison.fit_comparison],
              ["Daily Use, Dial & Materials", comparison.daily_wear_comparison],
              ["Brand, Ownership & Value", comparison.value_comparison],
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
          <Scorecard rows={scorecardRows} watchA={watchA} watchB={watchB} />
          {verdictText ? (
            <p className="whitespace-pre-line border-l border-champagne/40 pl-4 text-sm leading-6 text-pewter">
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

function PurchaseCard({ watch, label }: { watch: Watch | null; label: string }) {
  const affiliateUrl = watchAffiliateUrl(watch);
  const imageUrl = watchImageUrl(watch);

  if (!watch || !affiliateUrl || !imageUrl) {
    return null;
  }

  const partner = watchAffiliatePartner(watch);

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noreferrer sponsored"
      className="group grid overflow-hidden border border-white/10 bg-white/[0.04] shadow-aureate transition hover:border-champagne/40 hover:bg-white/[0.06] sm:grid-cols-[11rem_1fr]"
    >
      <div
        aria-hidden="true"
        className="min-h-52 bg-white bg-contain bg-center bg-no-repeat sm:min-h-full"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      />
      <div className="flex flex-col justify-between gap-5 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-champagne/80">
            {label} Purchase Option
          </p>
          <h3 className="mt-3 font-serif text-2xl leading-tight text-platinum">
            {watchName(watch)}
          </h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter">
            {watch.reference_number || "Reference not listed"}
          </p>
          <p className="mt-4 text-sm leading-6 text-pewter">
            Available from {partner}. Open the retailer listing to view current
            availability, pricing, and purchase details.
          </p>
        </div>
        <span className="inline-flex w-fit border border-champagne/40 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-champagne transition group-hover:bg-champagne group-hover:text-obsidian">
          View Listing
        </span>
      </div>
    </a>
  );
}

function PurchaseOptionsPanel({
  watchA,
  watchB,
}: {
  watchA: Watch | null;
  watchB: Watch | null;
}) {
  const hasPurchaseOption =
    Boolean(watchAffiliateUrl(watchA) && watchImageUrl(watchA)) ||
    Boolean(watchAffiliateUrl(watchB) && watchImageUrl(watchB));

  if (!hasPurchaseOption) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <PurchaseCard watch={watchA} label="Watch A" />
      <PurchaseCard watch={watchB} label="Watch B" />
    </section>
  );
}

export function CompareClient({
  watches,
  defaultWatchAId,
  defaultWatchBId,
}: {
  watches: Watch[];
  defaultWatchAId?: string | null;
  defaultWatchBId?: string | null;
}) {
  const watchesWithMeasurements = watches.filter(hasFitMeasurements);
  const popularWatchA = defaultWatchAId
    ? watches.find((watch) => watchId(watch) === defaultWatchAId)
    : null;
  const popularWatchB = defaultWatchBId
    ? watches.find((watch) => watchId(watch) === defaultWatchBId)
    : null;
  const defaultWatchA = popularWatchA ?? watchesWithMeasurements[0] ?? watches[0];
  const defaultWatchB =
    popularWatchB ??
    watchesWithMeasurements.find((watch) => watchId(watch) !== watchId(defaultWatchA)) ??
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

      <div className="mt-6">
        <PurchaseOptionsPanel watchA={watchA} watchB={watchB} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <WatchCard label="Watch A" watch={watchA} />
        <WatchCard label="Watch B" watch={watchB} />
      </div>

      <ComparisonTable watchA={watchA} watchB={watchB} />
    </>
  );
}
