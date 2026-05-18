import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-between border border-white/10 bg-black/20 px-5 py-6 shadow-aureate sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne">
            WatchComparisonAI
          </p>
          <Link
            href="/compare"
            className="border border-champagne/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian"
          >
            Compare
          </Link>
        </nav>

        <div className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pewter">
              Collector-grade watch comparison
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.92] text-platinum sm:text-7xl lg:text-8xl">
              Compare the watches that stay on your mind.
            </h1>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-base leading-7 text-pewter sm:text-lg">
              Evaluate fit, movement, bracelet engineering, MSRP, and
              real-world wearability before the shortlist becomes a purchase.
            </p>
            <Link
              href="/compare"
              className="mt-8 inline-flex border border-champagne bg-champagne px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-platinum"
            >
              Start Comparing
            </Link>
          </div>
        </div>

        <div className="grid border-t border-white/10 pt-5 text-sm text-pewter sm:grid-cols-3">
          <p className="py-2">
            <span className="block text-xs uppercase tracking-[0.22em] text-champagne">
              Fit
            </span>
            Diameter, thickness, lug-to-lug, weight
          </p>
          <p className="border-white/10 py-2 sm:border-l sm:px-5">
            <span className="block text-xs uppercase tracking-[0.22em] text-champagne">
              Spec
            </span>
            Caliber, reserve, water resistance, functions
          </p>
          <p className="border-white/10 py-2 sm:border-l sm:px-5">
            <span className="block text-xs uppercase tracking-[0.22em] text-champagne">
              Buy
            </span>
            MSRP-first context before affiliate links
          </p>
        </div>
      </section>
    </main>
  );
}
