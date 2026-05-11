import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <Link
        href="/compare"
        className="rounded border border-champagne/40 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-champagne transition hover:border-champagne hover:bg-champagne hover:text-obsidian"
      >
        Open Compare
      </Link>
    </main>
  );
}
