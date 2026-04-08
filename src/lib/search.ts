import type { Element, ElementCategory } from "@/lib/types";

/** Search result with relevance score */
export interface SearchResult {
  element: Element;
  score: number;
  matchType: "exact-symbol" | "exact-number" | "exact-name" | "starts-with" | "contains";
}

/** Category filter option */
export interface CategoryOption {
  category: ElementCategory;
  label: string;
  count: number;
}

/**
 * Search elements by query string.
 * Matches against: name, symbol, atomic number.
 * Returns results sorted by relevance (best match first).
 */
export function searchElements(
  elements: Element[],
  query: string
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const qLower = q.toLowerCase();
  const qNumber = parseInt(q, 10);
  const isNumeric = !isNaN(qNumber) && String(qNumber) === q;

  const results: SearchResult[] = [];

  for (const el of elements) {
    const symbolLower = el.symbol.toLowerCase();
    const nameLower = el.name.toLowerCase();

    // Exact atomic number match
    if (isNumeric && el.atomic_number === qNumber) {
      results.push({ element: el, score: 100, matchType: "exact-number" });
      continue;
    }

    // Exact symbol match (case-insensitive)
    if (symbolLower === qLower) {
      results.push({ element: el, score: 95, matchType: "exact-symbol" });
      continue;
    }

    // Exact name match
    if (nameLower === qLower) {
      results.push({ element: el, score: 90, matchType: "exact-name" });
      continue;
    }

    // Symbol starts with query
    if (symbolLower.startsWith(qLower)) {
      results.push({ element: el, score: 70, matchType: "starts-with" });
      continue;
    }

    // Name starts with query
    if (nameLower.startsWith(qLower)) {
      results.push({ element: el, score: 60, matchType: "starts-with" });
      continue;
    }

    // Name contains query
    if (nameLower.includes(qLower)) {
      results.push({ element: el, score: 40, matchType: "contains" });
      continue;
    }

    // Partial number match (e.g. "2" matches 2, 20-29, 120, etc.)
    if (isNumeric && String(el.atomic_number).includes(q)) {
      results.push({ element: el, score: 20, matchType: "contains" });
      continue;
    }
  }

  // Sort by score descending, then by atomic number ascending for ties
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.element.atomic_number - b.element.atomic_number;
  });
}

/**
 * Filter elements by category.
 */
export function filterByCategory(
  elements: Element[],
  category: ElementCategory
): Element[] {
  return elements.filter((el) => el.category === category);
}

/**
 * Get category options with element counts for the quick filter menu.
 */
export function getCategoryOptions(elements: Element[]): CategoryOption[] {
  const counts = new Map<ElementCategory, number>();
  const labels = new Map<ElementCategory, string>();

  for (const el of elements) {
    counts.set(el.category, (counts.get(el.category) || 0) + 1);
    if (!labels.has(el.category)) {
      labels.set(el.category, el.category_label);
    }
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      label: labels.get(category) || category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
