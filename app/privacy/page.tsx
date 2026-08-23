import Link from "next/link";
import type { Metadata } from "next";
import { ContactFormButton } from "../ContactFormButton";
import { BrandMark } from "../BrandMark";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for DeezWatchez, including comparison activity, analytics, and service providers.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | DeezWatchez",
    description:
      "How DeezWatchez handles comparison activity, analytics, and service providers.",
    url: "/privacy",
  },
};

const policySections = [
  {
    title: "Information We Collect",
    body: "DeezWatchez may collect basic usage information when visitors use the site, including watch comparison events, compared watch references, timestamps, page activity, browser or device context, and technical logs used to keep the site working.",
  },
  {
    title: "Information We Do Not Intentionally Collect",
    body: "The site does not currently provide user accounts, collect payment information, or intentionally collect sensitive personal information. If those features are added, this policy will be updated.",
  },
  {
    title: "How We Use Information",
    body: "Usage data helps improve the comparison experience, understand popular watch pairs, debug errors, protect the site from abuse, and decide which specs or watches should be reviewed next.",
  },
  {
    title: "Service Providers",
    body: "DeezWatchez uses third-party infrastructure and tools to operate the site. These may include Supabase for database and event storage, Vercel for hosting and deployment, OpenAI for generated comparison notes, analytics tools if enabled, and email or messaging providers if notifications are added later.",
  },
  {
    title: "Cookies And Local Storage",
    body: "The site may use cookies, local storage, or similar technologies for normal site operation, analytics, security, and remembering interface state. Browser settings can usually limit or remove these technologies.",
  },
  {
    title: "Data Sharing",
    body: "DeezWatchez does not sell personal information. Data may be shared with service providers that help run the site, when required by law, or when needed to protect the site, visitors, or others.",
  },
  {
    title: "Your Choices",
    body: "Visitors can request information about privacy practices or ask for deletion of personal information that DeezWatchez can reasonably identify. Some technical logs and aggregate analytics may be retained for security, debugging, or business records.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="border border-white/10 bg-black/25 p-5 shadow-aureate sm:p-7 lg:p-9">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <BrandMark />
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="border border-champagne/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-obsidian"
              >
                Search
              </Link>
              <Link
                href="/about"
                className="border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pewter transition hover:border-champagne/40 hover:text-champagne"
              >
                About
              </Link>
            </div>
          </nav>

          <div className="grid gap-8 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pewter">
                Last updated June 4, 2026
              </p>
              <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.95] text-platinum sm:text-6xl lg:text-7xl">
                Privacy Policy
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-pewter sm:text-lg">
              This page explains how DeezWatchez handles information used
              to operate the search and comparison experience, improve the site, and
              understand which watch comparisons visitors find useful.
            </p>
          </div>
        </header>

        <section className="grid gap-4 py-6 sm:py-8 lg:grid-cols-2">
          {policySections.map((section) => (
            <article
              key={section.title}
              className="border border-white/10 bg-white/[0.035] p-5 shadow-aureate sm:p-6"
            >
              <h2 className="font-serif text-3xl leading-tight text-platinum">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-pewter">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-8 border border-champagne/20 bg-black/25 p-5 shadow-aureate sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-champagne/80">
            Questions
          </p>
          <h2 className="mt-3 font-serif text-3xl text-platinum">
            Privacy requests can be reviewed manually.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-pewter">
            If you have a privacy question or request, contact DeezWatchez.
            This policy should be reviewed periodically as analytics, email
            summaries, accounts, or other product features are added.
          </p>
          <ContactFormButton
            defaultReason="Privacy request"
            subject="Privacy Request"
            className="mt-6 inline-flex border border-champagne bg-champagne px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-platinum"
          />
        </section>
      </div>
    </main>
  );
}
