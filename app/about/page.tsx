import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how WatchComparisonAI compares luxury watches, scores AI-assisted verdicts, uses verified watch data, and supports the site through affiliate links.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About WatchComparisonAI",
    description:
      "How WatchComparisonAI uses canonical specs, wearability notes, AI-assisted scoring, and affiliate links to help enthusiasts compare watches.",
    url: "/about",
  },
};

const methodSteps = [
  {
    label: "Source",
    title: "Start with structured watch data",
    body: "The comparison engine uses the canonical specs stored in WatchComparisonAI: dimensions, movement details, materials, bracelet and clasp data, MSRP, feature flags, and existing wearability notes. Manufacturer pages are preferred when specs are sourced, with trusted retailers and dealers used when official pages do not provide enough detail.",
  },
  {
    label: "Score",
    title: "Translate specs into ownership tradeoffs",
    body: "Scores are not just a count of bigger numbers. The AI weighs each category by how the listed specs affect real ownership: fit, comfort, daily practicality, movement quality, finishing, brand appeal, value, and collector interest.",
  },
  {
    label: "Explain",
    title: "Show the decision, not only the data",
    body: "The output is designed to help a buyer decide which watch better fits their priorities. Missing specs are called out as missing rather than guessed, and confidence is lower when the saved data does not support a strong conclusion.",
  },
];

const scoreCategories = [
  {
    title: "Movement",
    body: "Rates the caliber type, accuracy claims, power reserve, technical sophistication, serviceability, and long-term reliability implied by the saved specs.",
  },
  {
    title: "Case & Wearability",
    body: "Evaluates diameter, thickness, lug-to-lug span, case shape, weight, bracelet or strap setup, and how those dimensions translate to comfort on different wrists.",
  },
  {
    title: "Dial & Legibility",
    body: "Looks at dial layout, hand and marker contrast, date placement, lume information, visual balance, and how quickly the watch can be read in everyday use.",
  },
  {
    title: "Materials & Finishing",
    body: "Weighs case metal, crystal, bezel material, bracelet construction, clasp quality, finishing variety, and whether the execution feels appropriate for the price tier.",
  },
  {
    title: "Features & Functionality",
    body: "Measures practical capability such as water resistance, complications, travel or sport utility, magnetic resistance, timing bezels, micro-adjustment, and everyday convenience.",
  },
  {
    title: "Brand & Heritage",
    body: "Considers brand reputation, historical relevance, model-line significance, manufacturing credibility, collector awareness, and the prestige attached to ownership.",
  },
  {
    title: "Value Proposition",
    body: "Compares what the watch offers for its MSRP or saved market context, including movement quality, finishing, features, brand strength, and ownership upside for the money.",
  },
  {
    title: "Ownership Experience",
    body: "Assesses the likely daily experience after purchase: durability, versatility, maintenance expectations, resale confidence, service access, and how easy the watch is to live with.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border border-white/10 bg-black/25 p-5 shadow-aureate sm:p-7 lg:p-9">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne"
            >
              WatchComparisonAI
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="border border-champagne/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian"
              >
                Compare
              </Link>
              <Link
                href="/"
                className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
              >
                Home
              </Link>
            </div>
          </nav>

          <div className="grid gap-8 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pewter">
                Method, scoring, and revenue model
              </p>
              <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.95] text-platinum sm:text-6xl lg:text-7xl">
                Built to make watch comparisons more useful.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-pewter sm:text-lg">
              WatchComparisonAI is designed for enthusiasts who want more than a
              manufacturer spec sheet. The goal is to combine verified specs,
              practical wearability context, and AI-assisted interpretation into
              a decision tool that makes tradeoffs easier to see.
            </p>
          </div>
        </header>

        <section className="grid gap-4 py-6 sm:py-8 lg:grid-cols-3">
          {methodSteps.map((step) => (
            <article
              key={step.label}
              className="border border-white/10 bg-white/[0.035] p-5 shadow-aureate"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
                {step.label}
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-tight text-platinum">
                {step.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-pewter">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 border border-white/10 bg-black/20 p-5 shadow-aureate sm:p-7 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              How scores work
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-platinum sm:text-5xl">
              A scorecard for enthusiast priorities.
            </h2>
            <p className="mt-5 text-sm leading-7 text-pewter">
              Each AI comparison produces category scores out of 10. Those
              scores reflect the saved specs and notes available for the two
              watches at the time of comparison, not live market data or hidden
              paid placement.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {scoreCategories.map((category) => (
              <div
                key={category.title}
                className="border border-white/10 bg-white/[0.035] p-4"
              >
                <h3 className="text-sm font-semibold text-platinum">
                  {category.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-pewter">
                  {category.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 py-6 sm:py-8 lg:grid-cols-2">
          <article className="border border-white/10 bg-white/[0.035] p-5 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              AI guardrails
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-platinum">
              AI explains the data; it does not replace verification.
            </h2>
            <p className="mt-5 text-sm leading-7 text-pewter">
              The AI is instructed to use only the watch data already saved in
              WatchComparisonAI. If a specification is missing, the comparison
              should say it is not listed instead of guessing. Scores and
              verdicts are meant to guide shortlisting, not serve as final
              authentication, valuation, or service advice.
            </p>
          </article>

          <article className="border border-champagne/20 bg-black/25 p-5 shadow-aureate sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              Affiliate revenue
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-platinum">
              The site can earn from purchase links.
            </h2>
            <p className="mt-5 text-sm leading-7 text-pewter">
              WatchComparisonAI is expected to support itself through affiliate
              links when retailer listings are available. Those links may earn a
              commission if a visitor buys through them, at no additional cost
              to the buyer. Affiliate availability should not determine the AI
              verdict; comparisons are based on saved specs, wearability notes,
              and buyer priorities first.
            </p>
          </article>
        </section>

        <section className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-black/20 p-5 shadow-aureate sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
              Ready to compare?
            </p>
            <h2 className="mt-2 font-serif text-3xl text-platinum">
              Put two references side by side.
            </h2>
          </div>
          <Link
            href="/compare"
            className="border border-champagne bg-champagne px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-platinum"
          >
            Start Comparing
          </Link>
        </section>
      </div>
    </main>
  );
}
