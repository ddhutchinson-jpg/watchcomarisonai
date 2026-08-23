import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import {
  reviewParagraphs,
  watchDisplayName,
  watchSlug,
} from "@/src/lib/watchRoutes";
import { recordWatchViewEvent } from "@/src/lib/watchMetrics";
import { BrandMark } from "@/app/BrandMark";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://deezwatchez.com";

type WatchDetailRow = Record<string, unknown> & {
  id?: string | null;
  watch_id: string;
  brand_name: string | null;
  collection_name: string | null;
  model_name: string | null;
  reference_number: string | null;
  primary_image_url?: string | null;
  image_url?: string | null;
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
    title: "Reference Details",
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

function absoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return null;
  }

  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
  }
}

function watchId(watch: WatchDetailRow) {
  return String(watch.watch_id ?? watch.id ?? watchSlug(watch));
}

function structuredSpecProperties(watch: WatchDetailRow) {
  return [
    { name: "Reference Number", value: watch.reference_number },
    { name: "Collection", value: watch.collection_name },
    { name: "Case Size", value: displayValue(watch, { key: "case_size_mm", unit: "mm" }) },
    { name: "Thickness", value: displayValue(watch, { key: "case_thickness_mm", unit: "mm" }) },
    { name: "Lug-to-Lug", value: displayValue(watch, { key: "lug_to_lug_mm", unit: "mm" }) },
    { name: "Movement", value: watch.movement_type },
    { name: "Caliber", value: watch.caliber },
    { name: "Power Reserve", value: displayValue(watch, { key: "power_reserve_hours", unit: "hours" }) },
    { name: "Water Resistance", value: displayValue(watch, { key: "water_resistance_m", unit: "m" }) },
  ]
    .filter((property) => property.value && property.value !== "Not listed")
    .map((property) => ({
      "@type": "PropertyValue",
      name: property.name,
      value: String(property.value),
    }));
}

function suggestedComparisons(watch: WatchDetailRow, watches: WatchDetailRow[]) {
  const currentId = watchId(watch);

  return watches
    .filter((candidate) => watchId(candidate) !== currentId)
    .sort((left, right) => {
      const leftSameBrand = left.brand_name === watch.brand_name ? 0 : 1;
      const rightSameBrand = right.brand_name === watch.brand_name ? 0 : 1;
      const leftSameCollection = left.collection_name === watch.collection_name ? 0 : 1;
      const rightSameCollection = right.collection_name === watch.collection_name ? 0 : 1;

      return (
        leftSameBrand - rightSameBrand ||
        leftSameCollection - rightSameCollection ||
        watchDisplayName(left).localeCompare(watchDisplayName(right))
      );
    })
    .slice(0, 4);
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
    description: `Review ${name}${reference} with collector-grade specs, wearability notes, and reference details from DeezWatchez.`,
    alternates: {
      canonical: `/watches/${watchSlug(watch)}`,
    },
    openGraph: {
      title: `${name}${reference} | DeezWatchez`,
      description: `Collector-grade specs and wearability notes for ${name}${reference}.`,
      url: `/watches/${watchSlug(watch)}`,
    },
  };
}

export default async function WatchDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const watches = await loadApprovedWatches();
  const watch = watches.find((candidate) => watchSlug(candidate) === slug) ?? null;

  if (!watch) {
    notFound();
  }

  await recordWatchViewEvent(watchId(watch));

  const name = watchDisplayName(watch);
  const paragraphs = reviewParagraphs(reviewText(watch));
  const productImage = imageUrl(watch);
  const productImageUrl = absoluteUrl(productImage);
  const comparisonSuggestions = suggestedComparisons(watch, watches);
  const canonical = `/watches/${watchSlug(watch)}`;
  const canonicalUrl = `${siteUrl}${canonical}`;
  const heroSpecs = [
    { label: "MSRP", key: "msrp", currency: true },
    { label: "Case", key: "case_size_mm", unit: "mm" },
    { label: "Movement", key: "movement_type" },
    { label: "Reserve", key: "power_reserve_hours", unit: "hours" },
  ];
  const keySpecs = [
    { label: "MSRP", key: "msrp", currency: true },
    { label: "Case Size", key: "case_size_mm", unit: "mm" },
    { label: "Thickness", key: "case_thickness_mm", unit: "mm" },
    { label: "Lug-to-Lug", key: "lug_to_lug_mm", unit: "mm" },
    { label: "Movement", key: "movement_type" },
    { label: "Caliber", key: "caliber" },
    { label: "Power Reserve", key: "power_reserve_hours", unit: "hours" },
    { label: "Water Resistance", key: "water_resistance_m", unit: "m" },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name,
        description: `Collector-grade specs and wearability notes for ${name}.`,
        mainEntity: {
          "@id": `${canonicalUrl}#product`,
        },
        breadcrumb: {
          "@id": `${canonicalUrl}#breadcrumb`,
        },
      },
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        name,
        brand: watch.brand_name
          ? {
              "@type": "Brand",
              name: watch.brand_name,
            }
          : undefined,
        model: watch.model_name ?? undefined,
        sku: watch.reference_number ?? watch.watch_id,
        mpn: watch.reference_number ?? undefined,
        image: productImageUrl ? [productImageUrl] : undefined,
        description: paragraphs[0],
        category: "Luxury watch",
        additionalProperty: structuredSpecProperties(watch),
        review: reviewText(watch)
          ? {
              "@type": "Review",
              name: `${name} watch review`,
              reviewBody: paragraphs.join("\n\n"),
              author: {
                "@type": "Organization",
                name: "DeezWatchez",
              },
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Watches",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#fbfbfa] px-3 py-4 text-black sm:px-6 sm:py-6 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-aureate">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <div className="px-5 py-4 sm:px-7">
              <BrandMark />
            </div>
            <div className="flex items-center gap-2 pr-4 sm:gap-3 sm:pr-7">
              <Link
                href="/"
                className="rounded-md border border-red-600/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-600 hover:text-white sm:px-4 sm:tracking-[0.18em]"
              >
                New Search
              </Link>
              <Link
                href="/about"
                className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600 sm:px-4 sm:tracking-[0.18em]"
              >
                About
              </Link>
            </div>
          </nav>

          <div className="grid gap-6 border-t border-zinc-200 px-4 py-6 sm:gap-8 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)] lg:items-stretch lg:px-9 lg:py-10">
            <div className="flex flex-col justify-between gap-6 sm:gap-8">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-600 sm:text-sm sm:tracking-[0.24em]">
                {watch.reference_number || "Reference not listed"}
                </p>
                <h1 className="mt-3 max-w-4xl text-2xl font-extrabold leading-tight text-black sm:mt-4 sm:text-4xl lg:text-5xl">
                  {name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:mt-4 sm:leading-7">
                  A focused detail page for specs, fit, movement notes, and
                  enthusiast context before opening a side-by-side comparison.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {heroSpecs.map((field) => (
                  <div key={field.key} className="rounded-lg bg-zinc-50 p-3">
                    <dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-sm font-bold leading-5 text-black">
                      {displayValue(watch, field)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {productImage ? (
              <div className="relative min-h-56 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:min-h-64 lg:min-h-[23rem]">
                <Image
                  src={productImage}
                  alt={`${name}${watch.reference_number ? ` ${watch.reference_number}` : ""} watch`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 36vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="grid min-h-56 place-items-center rounded-xl border border-zinc-200 bg-zinc-100 text-center text-sm text-zinc-600 sm:min-h-64 lg:min-h-[23rem]">
                Image not listed
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-5 py-5 sm:gap-6 sm:py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-xl border border-red-600/20 bg-white p-4 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600/80">
              Watch Review
            </p>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600/80">
              Key Specs
            </p>
            <dl className="mt-5 grid gap-px bg-zinc-100 text-sm sm:grid-cols-2">
              {keySpecs.map((field) => (
                <div key={field.key} className="bg-white p-4">
                  <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-zinc-600">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-black">
                    {displayValue(watch, field)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        {comparisonSuggestions.length ? (
          <section className="mb-5 grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-aureate sm:mb-6 sm:p-7">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-red-600/80">
              Suggested 1v1 comparison
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {comparisonSuggestions.map((candidate) => (
                <Link
                  key={watchSlug(candidate)}
                  href={`/compare/${watchSlug(watch)}/vs/${watchSlug(candidate)}`}
                  aria-label={`Open 1v1 comparison for ${name} vs ${watchDisplayName(candidate)}`}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-red-600/40 hover:bg-red-50"
                >
                  <p className="text-sm font-bold leading-6 text-black">
                    {name} vs {watchDisplayName(candidate)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-aureate sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-red-600/80">
                Complete Spec Sheet
              </h2>
            </div>
            <Link
              href="/"
              className="rounded-md border border-red-600 bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-black sm:px-5 sm:text-sm sm:tracking-[0.16em]"
            >
              New Search
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {specSections.map((section) => (
              <article key={section.title} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <h3 className="bg-zinc-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                  {section.title}
                </h3>
                <dl className="divide-y divide-zinc-200">
                  {section.fields.map((field) => (
                    <div key={field.key} className="grid grid-cols-[7.5rem_1fr] text-sm sm:grid-cols-[10rem_1fr]">
                      <dt className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-600 sm:px-4 sm:tracking-[0.12em]">
                        {field.label}
                      </dt>
                      <dd className="border-l border-zinc-200 px-3 py-3 font-medium text-black sm:px-4">
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
