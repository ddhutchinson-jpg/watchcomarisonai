import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 transition"
      aria-label="DeezWatchez home"
    >
      <span className="grid size-9 place-items-center rounded-md bg-red-600 text-sm font-black text-white shadow-sm shadow-red-600/20">
        DW
      </span>
      <span className="text-lg font-black tracking-normal text-black transition group-hover:text-red-600 sm:text-xl">
        DeezWatchez
      </span>
    </Link>
  );
}
