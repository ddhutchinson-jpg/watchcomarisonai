import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <section className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl overflow-hidden border border-white/10 bg-black/30 px-5 py-6 shadow-aureate sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(215,189,125,0.05)_0_1px,transparent_1px_18px)]" />
          <div className="absolute -right-32 top-10 h-[42rem] w-[42rem] rounded-full border border-champagne/10 bg-[radial-gradient(circle,rgba(215,189,125,0.08),transparent_58%),repeating-radial-gradient(circle,transparent_0_17px,rgba(255,255,255,0.045)_18px_19px)]" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between gap-10">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne">
              WatchComparisonAI
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/about"
                className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
              >
                About
              </Link>
              <Link
                href="/compare"
                className="border border-champagne/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian"
              >
                Compare
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 gap-10 py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-pewter">
                Collector-grade watch comparison
              </p>
              <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.02] text-platinum sm:text-6xl lg:text-7xl">
                The Smarter Way to Compare Watches
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-pewter sm:text-lg">
                AI-powered analysis that turns watch specs into confident decisions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/compare"
                  className="border border-champagne bg-champagne px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-obsidian transition hover:bg-platinum"
                >
                  Start Comparing
                </Link>
                <Link
                  href="/about"
                  className="border border-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
                >
                  How It Works
                </Link>
              </div>
            </div>

            <div className="relative min-h-[24rem] overflow-hidden border border-white/10 bg-black/45 shadow-[0_32px_100px_rgba(0,0,0,0.62)] sm:min-h-[30rem] lg:min-h-[36rem]">
              <Image
                src="/home-watch-hero.png"
                alt="Black luxury dive watch with bezel, indices, hands, and water droplets"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover object-[57%_50%] opacity-90 mix-blend-lighten"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_45%,transparent_0_32%,rgba(0,0,0,0.22)_48%,rgba(0,0,0,0.78)_100%),linear-gradient(90deg,rgba(0,0,0,0.42),transparent_42%,rgba(0,0,0,0.12))]" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(215,189,125,0.055)_0_1px,transparent_1px_18px)] opacity-70 mix-blend-screen" />
              <div className="absolute bottom-5 left-5 border border-white/15 bg-black/55 px-4 py-3 backdrop-blur-sm sm:bottom-7 sm:left-7">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-champagne">
                  AI Scorecard
                </p>
                <p className="mt-1 font-serif text-2xl text-platinum">8 categories</p>
              </div>
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
        </div>
      </section>
    </main>
  );
}
