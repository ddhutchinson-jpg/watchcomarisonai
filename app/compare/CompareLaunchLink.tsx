"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import { CompareLoadingMessage } from "./CompareLoadingMessage";

const launchDelayMs = 5000;

type CompareLaunchLinkProps = {
  href: string;
  children: ReactNode;
  className: string;
  ariaLabel?: string;
};

export function CompareLaunchLink({
  href,
  children,
  className,
  ariaLabel,
}: CompareLaunchLinkProps) {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function openComparison(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    setIsLaunching(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      router.push(href);
    }, launchDelayMs);
  }

  return (
    <>
      <a
        href={href}
        aria-label={ariaLabel}
        aria-busy={isLaunching}
        aria-disabled={isLaunching}
        onClick={openComparison}
        className={className}
      >
        {children}
      </a>

      {isLaunching ? (
        <div
          className="fixed inset-0 z-[80] bg-[#fbfbfa] px-3 py-4 text-black sm:px-6 sm:py-6 lg:px-10"
          role="status"
          aria-live="polite"
          aria-label="Building 1v1 comparison"
        >
          <div className="mx-auto max-w-7xl">
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-aureate">
              <nav className="border-b border-zinc-200 px-5 py-4 sm:px-7">
                <span className="inline-flex h-11 w-44 items-center sm:h-12 sm:w-52">
                  <Image
                    src="/deezwatchez-logo-light.png"
                    alt="DeezWatchez"
                    width={1000}
                    height={311}
                    className="h-9 w-auto object-contain sm:h-10"
                    sizes="(min-width: 640px) 13rem, 11rem"
                    priority
                  />
                </span>
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
        </div>
      ) : null}
    </>
  );
}
