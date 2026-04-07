import type { Element, Compound, CategoryInfo, ElementCategory } from "@/lib/types";
import elementsJson from "@/data/elements.json";
import compoundsJson from "@/data/compounds.json";
import categoriesJson from "@/data/categories.json";

/** All 118 elements, typed */
export const elements: Element[] = elementsJson as Element[];

/** Compounds indexed by element symbol */
export const compoundsBySymbol: Record<string, Compound[]> =
  compoundsJson as Record<string, Compound[]>;

/** Category metadata */
export const categories: Record<string, CategoryInfo> =
  categoriesJson as Record<string, CategoryInfo>;

/** CSS variable name for a given category */
export function getCategoryCssVar(category: ElementCategory): string {
  const map: Record<ElementCategory, string> = {
    "alkali-metal": "--cat-alkali-metal",
    "alkaline-earth-metal": "--cat-alkaline-earth-metal",
    "transition-metal": "--cat-transition-metal",
    "post-transition-metal": "--cat-post-transition-metal",
    metalloid: "--cat-metalloid",
    nonmetal: "--cat-nonmetal",
    halogen: "--cat-halogen",
    "noble-gas": "--cat-noble-gas",
    lanthanide: "--cat-lanthanide",
    actinide: "--cat-actinide",
    unknown: "--cat-unknown",
  };
  return map[category] ?? "--cat-unknown";
}

/** Lookup element by atomic number */
export function getElementById(atomicNumber: number): Element | undefined {
  return elements.find((e) => e.atomic_number === atomicNumber);
}

/** Lookup element by symbol (case-insensitive) */
export function getElementBySymbol(symbol: string): Element | undefined {
  const normalized = symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
  return elements.find((e) => e.symbol === normalized);
}

/** Get compounds for an element */
export function getCompoundsForElement(symbol: string): Compound[] {
  return compoundsBySymbol[symbol] ?? [];
}
