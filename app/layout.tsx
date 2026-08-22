import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://deezwatchez.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Watch Compare AI",
    template: "%s | Watch Compare AI",
  },
  description:
    "Compare luxury watches side by side with collector-grade specs, wearability notes, and AI-assisted comparison tools.",
  applicationName: "Watch Compare AI",
  keywords: [
    "luxury watch comparison",
    "watch specs",
    "watch size comparison",
    "watch wearability",
    "compare watches",
    "collector watches",
  ],
  authors: [{ name: "Watch Compare AI" }],
  creator: "Watch Compare AI",
  publisher: "Watch Compare AI",
  openGraph: {
    type: "website",
    siteName: "Watch Compare AI",
    title: "Watch Compare AI",
    description:
      "Compare luxury watches side by side with collector-grade specs and AI-assisted insights.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Compare AI",
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
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
