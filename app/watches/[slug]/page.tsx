import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import {
  reviewParagraphs,
  watchDisplayName,
  watchSlug,
} from "@/src/lib/watchRoutes";

export const dynamic = "force-dynamic";

type WatchDetailRow = Record<string, unknown> & {
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
  primary_image_url?: string | null;
  image_url?: string | null;
  affiliate_url?: string | null;
  affiliate_partner?: string | null;
  overall_wearability_summary?: string | null;
  wearability_notes?: string | null;
  comfort_notes?: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const specSections: Array<{
  title: string;
  fields: Array<{ label: string; key: string; unit?: string; currency?: boolean }>;
}> = [
  {
    title: "Buying Context",
    fields: [
      { label: "MSRP", key: "msrp", currency: true },
      { label: "Brand", key: "brand_name" },
      { label: "Collection", key: "collection_name" },
      { label: "Model", key: "model_name" },
      { label: "Reference", key: "reference_number" },
    ],
  },
  {
    title: "Fit And Case",
    fields: [
      { label: "Case Size", key: "case_size_mm", unit: "mm" },
      { label: "Thickness", key: "case_thickness_mm", unit: "mm" },
      { label: "Lug-to-Lug", key: "lug_to_lug_mm", unit: "mm" },
      { label: "Lug Width", key: "lug_width_mm", unit: "mm" },
      { label: "Weight", key: "weight_grams", unit: "g" },
      { label: "Case Material", key: "case_material" },
      { label: "Water Resistance", key: "water_resistance_m", unit: "m" },
    ],
  },
  {
    title: "Movement And Function",
    fields: [
      { label: "Movement Type", key: "movement_type" },
      { label: "Caliber", key: "caliber" },
      { label: "Power Reserve", key: "power_reserve_hours", unit: "hours" },
      { label: "Frequency", key: "frequency_vph", unit: "vph" },
      { label: "Accuracy", key: "accuracy_claim" },
      { label: "COSC", key: "cosc_certified" },
      { label: "METAS", key: "metas_certified" },
      { label: "GMT", key: "has_gmt" },
      { label: "Chronograph", key: "has_chronograph" },
    ],
  },
  {
    title: "Bracelet And Wearability",
    fields: [
      { label: "Bracelet Type", key: "bracelet_type" },
      { label: "Bracelet Material", key: "bracelet_material" },
      { label: "Clasp", key: "clasp_type" },
      { label: "Micro-Adjustment", key: "micro_adjustment_mm", unit: "mm" },
      { label: "Adjustment System", key: "adjustment_system_normalized" },
      { label: "Tool-Free Adjustment", key: "tool_free_adjustment" },
    ],
  },
];

function valueFor(watch: WatchDetailRow, key: string) {
  return watch[key];
}

function displayValue(
  watch: WatchDetailRow,
  field: { key: string; unit?: string; currency?: boolean },
) {
  const value = valueFor(watch, field.key);

  if (value === null || value === undefined || value === "") {
    return "Not listed";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (field.currency) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(watch.currency ?? "USD"),
        maximumFractionDigits: 0,
      }).format(numericValue);
    }
  }

  if (field.unit) {
    return `${value} ${field.unit}`;
  }

  return String(value);
}

function reviewText(watch: WatchDetailRow) {
  return (
    watch.overall_wearability_summary ??
    watch.wearability_notes ??
    watch.comfort_notes ??
    null
  );
}

function imageUrl(watch: WatchDetailRow) {
  return watch.primary_image_url ?? watch.image_url ?? null;
}

async function loadApprovedWatches() {
  const { data, error } = await supabaseAdmin
    .from("watch_comparison_view")
    .select("*")
    .eq("review_status", "approved")
    .order("brand_name", { ascending: true })
    .returns<WatchDetailRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function loadWatch(slug: string) {
  const watches = await loadApprovedWatches();
  return watches.find((watch) => watchSlug(watch) === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const watch = await loadWatch(slug);

  if (!watch) {
    return {
      title: "Watch Not Found",
    };
  }

  const name = watchDisplayName(watch);
  const reference = watch.reference_number ? ` ${watch.reference_number}` : "";

  return {
    title: `${name}${reference}`,
    description: `Review ${name}${reference} with collector-grade specs, AI wearability notes, and buying-context details from Watch Compare AI.`,
    alternates: {
      canonical: `/watches/${watchSlug(watch)}`,
    },
    openGraph: {
      title: `${name}${reference} | Watch Compare AI`,
      description: `Collector-grade specs and AI wearability notes for ${name}${reference}.`,
      url: `/watches/${watchSlug(watch)}`,
    },
  };
}

export default async function WatchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const watch = await loadWatch(slug);

  if (!watch) {
    notFound();
  }

  const name = watchDisplayName(watch);
  const paragraphs = reviewParagraphs(reviewText(watch));
  const productImage = imageUrl(watch);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border border-white/10 bg-black/25 p-5 shadow-aureate sm:p-7 lg:p-9">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne"
            >
              Watch Compare AI
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="border border-champagne/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian"
              >
                Compare
              </Link>
              <Link
                href="/about"
                className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
              >
                About
              </Link>
            </div>
          </nav>

          <div className="grid gap-8 pt-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pewter">
                {watch.reference_number || "Reference not listed"}
              </p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] text-platinum sm:text-6xl lg:text-7xl">
                {name}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-pewter sm:text-base">
                Single-watch specs, wearability context, and AI-assisted review
                notes for buyers who want to understand the watch before
                comparing it against another reference.
              </p>
            </div>

            {productImage ? (
              <a
                href={watch.affiliate_url ?? productImage}
                target="_blank"
                rel="noreferrer sponsored"
                className="block min-h-72 border border-white/10 bg-white bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${productImage}")` }}
                aria-label={`${name} product image`}
              />
            ) : (
              <div className="grid min-h-72 place-items-center border border-white/10 bg-white/[0.035] text-center text-sm text-pewter">
                Image not listed
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="border border-champagne/20 bg-black/25 p-5 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              AI Review
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-platinum">
              Wearability and ownership read
            </h2>
            <div className="mt-5 grid gap-4 text-sm leading-7 text-pewter sm:text-base sm:leading-8">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-pewter">
              Generated from the watch data currently available in
              Watch Compare AI and intended as a quick review, not a substitute
              for manually verified specs.
            </p>
          </article>

          <article className="border border-white/10 bg-white/[0.035] p-5 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              Key Specs
            </p>
            <dl className="mt-5 grid gap-px bg-white/10 text-sm sm:grid-cols-2">
              {[
                { label: "MSRP", key: "msrp", currency: true },
                { label: "Case Size", key: "case_size_mm", unit: "mm" },
                { label: "Thickness", key: "case_thickness_mm", unit: "mm" },
                { label: "Lug-to-Lug", key: "lug_to_lug_mm", unit: "mm" },
                { label: "Movement", key: "movement_type" },
                { label: "Caliber", key: "caliber" },
                { label: "Power Reserve", key: "power_reserve_hours", unit: "hours" },
                { label: "Water Resistance", key: "water_resistance_m", unit: "m" },
              ].map((field) => (
                <div key={field.key} className="bg-[#100f0d] p-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-pewter">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-platinum">
                    {displayValue(watch, field)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        <section className="grid gap-5 border border-white/10 bg-black/20 p-5 shadow-aureate sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
                Complete Spec Sheet
              </p>
              <h2 className="mt-2 font-serif text-3xl text-platinum">
                Saved comparison data
              </h2>
            </div>
            <Link
              href="/compare"
              className="border border-champagne bg-champagne px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-platinum"
            >
              Compare This Watch
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {specSections.map((section) => (
              <article key={section.title} className="border border-white/10 bg-white/[0.025]">
                <h3 className="bg-[#0d0c0a] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-champagne">
                  {section.title}
                </h3>
                <dl className="divide-y divide-white/10">
                  {section.fields.map((field) => (
                    <div key={field.key} className="grid grid-cols-[10rem_1fr] text-sm">
                      <dt className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-pewter">
                        {field.label}
                      </dt>
                      <dd className="border-l border-white/10 px-4 py-3 font-medium text-platinum">
                        {displayValue(watch, field)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
