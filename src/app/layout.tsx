import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Periodiq | Interactive Periodic Table",
    template: "%s | Periodiq",
  },
  description:
    "The most beautiful periodic table on the web. Explore 118 elements with 3D atom visualizations, real-time property coloring, electron orbital shapes, and deep element data.",
  keywords: [
    "periodic table",
    "chemistry",
    "elements",
    "interactive",
    "3D atom visualization",
    "electron orbitals",
    "element properties",
    "chemical elements",
    "periodic table of elements",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://periodiq.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "Periodiq",
    title: "Periodiq | Interactive Periodic Table",
    description:
      "Explore 118 elements with 3D atom visualizations, real-time property coloring, electron orbital shapes, and deep element data.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Periodiq | Interactive Periodic Table",
    description:
      "The most beautiful periodic table on the web. 3D visualizations, 118 elements, real-time property coloring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "theme-color": "#06060b",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Periodiq",
    description: "Interactive periodic table with 3D atom visualizations, electron orbitals, and deep element data.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
