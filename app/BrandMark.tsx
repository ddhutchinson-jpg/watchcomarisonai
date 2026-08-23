import Image from "next/image";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex h-11 w-44 items-center transition sm:h-12 sm:w-52"
      aria-label="DeezWatchez home"
    >
      <Image
        src="/deezwatchez-logo-light.png"
        alt="DeezWatchez"
        width={1000}
        height={311}
        className="h-9 w-auto object-contain transition group-hover:brightness-95 sm:h-10"
        sizes="(min-width: 640px) 13rem, 11rem"
        priority
      />
    </Link>
  );
}
