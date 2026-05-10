export default function CompareLoading() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            WatchComparisonAI
          </p>
          <div className="mt-5 max-w-4xl">
            <h1 className="font-serif text-5xl leading-tight text-platinum sm:text-6xl lg:text-7xl">
              Compare watches with collector-grade detail.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-pewter sm:text-lg">
              Search references and evaluate proportions, movement specs,
              bracelet engineering, and real-world wearability side by side.
            </p>
          </div>
        </header>

        <section className="py-6 sm:py-8">
          <div className="rounded border border-white/10 bg-white/[0.04] p-8 text-sm text-pewter">
            Loading watches...
          </div>
        </section>
      </div>
    </main>
  );
}
