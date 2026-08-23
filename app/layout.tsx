import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://deezwatchez.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DeezWatchez",
    template: "%s | DeezWatchez",
  },
  description:
    "Search luxury watches, review collector-grade specs, and open side-by-side comparisons for popular references.",
  applicationName: "DeezWatchez",
  keywords: [
    "luxury watch comparison",
    "watch specs",
    "watch size comparison",
    "watch wearability",
    "compare watches",
    "collector watches",
  ],
  authors: [{ name: "DeezWatchez" }],
  creator: "DeezWatchez",
  publisher: "DeezWatchez",
  openGraph: {
    type: "website",
    siteName: "DeezWatchez",
    title: "DeezWatchez",
    description:
      "Search luxury watches and compare specs, fit, movement details, reviews, and research context.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeezWatchez",
    description:
      "Search luxury watches and compare specs, fit, movement details, reviews, and research context.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
