import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { HomeConcierge } from "./HomeConcierge";
import { loadWatches } from "./compare/watchData";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { watches, error } = await loadWatches();

  return (
    <main className="min-h-screen bg-[#fbfbfa] px-4 py-5 text-black sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_26px_90px_rgba(0,0,0,0.09)]">
        <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:px-8">
          <BrandMark />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/about"
              className="rounded-md border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-700 transition hover:border-red-600 hover:text-red-700"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="rounded-md border border-zinc-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-700 transition hover:border-red-600 hover:text-red-700"
            >
              Privacy
            </Link>
          </div>
        </nav>

        <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-900">
              Unable to load watches: {error}
            </div>
          ) : (
            <HomeConcierge watches={watches} />
          )}
        </div>
      </section>
    </main>
  );
}
