"use client";

import { useMemo, useState } from "react";

export type Watch = {
  id?: string | number | null;
  image_url?: string | null;
  brand?: string | null;
  collection?: string | null;
  model?: string | null;
  reference_number?: string | null;
  case_size?: string | number | null;
  thickness?: string | number | null;
  lug_to_lug?: string | number | null;
  lug_width?: string | number | null;
  movement_type?: string | null;
  caliber?: string | null;
  power_reserve?: string | number | null;
  water_resistance?: string | number | null;
  bracelet_taper?: string | null;
  clasp_type?: string | null;
  micro_adjustment?: string | null;
  wearability_notes?: string | null;
  review_status?: string | null;
};

const fields: Array<{ label: string; key: keyof Watch }> = [
  { label: "Brand", key: "brand" },
  { label: "Collection", key: "collection" },
  { label: "Model", key: "model" },
  { label: "Reference Number", key: "reference_number" },
  { label: "Case Size", key: "case_size" },
  { label: "Thickness", key: "thickness" },
  { label: "Lug-to-Lug", key: "lug_to_lug" },
  { label: "Lug Width", key: "lug_width" },
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
      watch?.reference_number ??
      `${watch?.brand_name ?? "watch"}-${watch?.collection_name ?? ""}-${watch?.model_name ?? ""}-${index}`,
  );
}

function watchName(watch: Watch) {
  return [watch.brand_name, watch.collection_name, watch.model_name, watch.reference_number]
    .filter(Boolean)
    .join(" ");
}

function display(value: Watch[keyof Watch]) {
  if (value === null || value === undefined || value === "") {
    return "Not listed";
  }

  return String(value);
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
      <input
        type="search"
        value={open ? query : selectedWatch ? watchName(selectedWatch) : query}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        placeholder="Search brand, model, reference"
        className="h-14 w-full rounded border border-white/10 bg-white/[0.06] px-4 text-base text-platinum outline-none transition placeholder:text-pewter/60 focus:border-champagne/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-champagne/20"
      />
      {open ? (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded border border-champagne/20 bg-[#14120f] p-2 shadow-aureate">
          {filtered.length ? (
            filtered.map((watch, index) => (
              <button
                key={watchKey(watch, index)}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(watchKey(watch, index));
                  setOpen(false);
                  setQuery("");
                }}
                className="block w-full rounded px-3 py-3 text-left transition hover:bg-champagne/10"
              >
                <span className="block text-sm font-semibold text-platinum">
                  {watchName(watch)}
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-pewter">
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
      <div className="aspect-[4/3] bg-[#0c0b0a]">
        {watch.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={watch.image_url}
            alt={watchName(watch)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm uppercase tracking-[0.24em] text-pewter">
            Image not listed
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne/70">
          {label}
        </p>
        <h2 className="mt-3 font-serif text-3xl text-platinum sm:text-4xl">
          {watch.brand_name || "Unknown Brand"}
        </h2>
        <p className="mt-2 text-base text-pewter">
          {[watch.collection_name, watch.model_name].filter(Boolean).join(" ") ||
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
              {display(watchA?.[field.key])}
            </dd>
            <dd className="border-l border-white/10 px-3 py-4 font-medium leading-6 text-platinum sm:px-5">
              {display(watchB?.[field.key])}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CompareClient({ watches }: { watches: Watch[] }) {
  const [defaultWatchA, defaultWatchB] = watches;
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

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <WatchCard label="Watch A" watch={watchA} />
        <WatchCard label="Watch B" watch={watchB} />
      </div>

      <ComparisonTable watchA={watchA} watchB={watchB} />
    </>
  );
}
