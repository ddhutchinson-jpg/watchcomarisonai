import { BrandMark } from "@/app/BrandMark";
import { CompareLoadingMessage } from "./CompareLoadingMessage";

export default function CompareLoading() {
  return (
    <main className="min-h-screen bg-[#fbfbfa] px-3 py-4 text-black sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-aureate">
          <nav className="border-b border-zinc-200 px-5 py-4 sm:px-7">
            <BrandMark />
          </nav>

          <div className="grid min-h-[26rem] place-items-center px-5 py-12 text-center sm:px-8">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-600 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(216,25,43,0.28)]">
                VS
              </div>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">
                Building 1v1 comparison
              </p>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight text-black sm:text-4xl">
                <CompareLoadingMessage />
              </h1>
              <div className="mx-auto mt-7 h-2 max-w-sm overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
