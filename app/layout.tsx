import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://watchcompareai.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WatchComparisonAI",
    template: "%s | WatchComparisonAI",
  },
  description:
    "Compare luxury watches side by side with collector-grade specs, wearability notes, and AI-assisted comparison tools.",
  applicationName: "WatchComparisonAI",
  keywords: [
    "luxury watch comparison",
    "watch specs",
    "watch size comparison",
    "watch wearability",
    "compare watches",
    "collector watches",
  ],
  authors: [{ name: "WatchComparisonAI" }],
  creator: "WatchComparisonAI",
  publisher: "WatchComparisonAI",
  openGraph: {
    type: "website",
    siteName: "WatchComparisonAI",
    title: "WatchComparisonAI",
    description:
      "Compare luxury watches side by side with collector-grade specs and AI-assisted insights.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchComparisonAI",
    description:
      "Compare luxury watches side by side with collector-grade specs and AI-assisted insights.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
