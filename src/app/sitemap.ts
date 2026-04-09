import type { MetadataRoute } from "next";
import { elements } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://periodiq.vercel.app";

  const elementPages = elements.map((el) => ({
    url: `${baseUrl}/element/${el.symbol}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...elementPages,
  ];
}
