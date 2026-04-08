import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { elements, getElementBySymbol, getCompoundsForElement } from "@/lib/data";
import ElementDetailClient from "@/components/detail/ElementDetailClient";

/* ─── SSG: generate all 118 element pages at build time ─── */
export function generateStaticParams() {
  return elements.map((el) => ({
    symbol: el.symbol,
  }));
}

/* ─── Dynamic metadata per element ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  const el = getElementBySymbol(symbol);
  if (!el) return { title: "Element Not Found — Periodiq" };

  return {
    title: `${el.name} (${el.symbol}) — Periodiq`,
    description: el.summary
      ? el.summary.slice(0, 160)
      : `Explore ${el.name}, element ${el.atomic_number} on the periodic table. Interactive 3D atom visualization, properties, electron configuration, and more.`,
  };
}

/* ─── Page component ─── */
export default async function ElementDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const el = getElementBySymbol(symbol);

  if (!el) notFound();

  const compounds = getCompoundsForElement(el.symbol);

  // Prev/next elements
  const prevEl = el.atomic_number > 1
    ? elements.find((e) => e.atomic_number === el.atomic_number - 1)
    : null;
  const nextEl = el.atomic_number < 118
    ? elements.find((e) => e.atomic_number === el.atomic_number + 1)
    : null;

  return (
    <ElementDetailClient
      element={el}
      compounds={compounds}
      prevElement={prevEl ? { symbol: prevEl.symbol, name: prevEl.name } : null}
      nextElement={nextEl ? { symbol: nextEl.symbol, name: nextEl.name } : null}
    />
  );
}
