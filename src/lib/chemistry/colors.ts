import type { Element, ColoringMode, ElementCategory } from "@/lib/types";

/**
 * Maps a numeric value to a color on a gradient scale.
 * Returns an HSL color string — hue shifts from cool (blue) to warm (red/gold).
 */
function valueToGradient(
  value: number | null,
  min: number,
  max: number
): string | null {
  if (value === null || value === undefined) return null;
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Blue (220) → Cyan (180) → Green (120) → Yellow (50) → Red (0)
  const hue = 220 - normalized * 220;
  return `hsl(${hue}, 70%, 55%)`;
}

/** Property ranges for gradient coloring (approximate across all elements) */
const PROPERTY_RANGES: Record<string, [number, number]> = {
  "atomic-mass": [1, 295],
  "atomic-radius": [25, 300],
  electronegativity: [0.7, 4.0],
  density: [0.00008, 23],
  "melting-point": [0.95, 3823],
  "boiling-point": [4.2, 5869],
  "year-discovered": [0, 2010],
};

/** Get the property value for a given coloring mode */
function getPropertyValue(
  element: Element,
  mode: ColoringMode
): number | null {
  switch (mode) {
    case "atomic-mass":
      return element.atomic_mass;
    case "atomic-radius":
      return element.atomic_radius;
    case "electronegativity":
      return element.electronegativity_pauling;
    case "density":
      return element.density;
    case "melting-point":
      return element.melting_point;
    case "boiling-point":
      return element.boiling_point;
    case "year-discovered": {
      const year = parseInt(element.year_discovered ?? "", 10);
      return isNaN(year) ? null : year;
    }
    default:
      return null;
  }
}

/**
 * Returns the CSS color for an element tile based on the current coloring mode.
 * For "category" mode, returns the CSS variable reference.
 * For "state" mode, returns a color based on standard state.
 * For property modes, returns an HSL gradient color.
 */
export function getElementColor(
  element: Element,
  mode: ColoringMode
): string | null {
  if (mode === "category") {
    return `var(--cat-${element.category})`;
  }

  if (mode === "state") {
    const state = (element.standard_state || "").toLowerCase();
    if (state.includes("solid")) return "var(--text-muted)";
    if (state.includes("liquid")) return "#4dabf7";
    if (state.includes("gas")) return "#69db7c";
    return "var(--cat-unknown)";
  }

  const range = PROPERTY_RANGES[mode];
  if (!range) return null;

  const value = getPropertyValue(element, mode);
  return valueToGradient(value, range[0], range[1]);
}

/** Category CSS variable map */
export const CATEGORY_CSS_VAR: Record<ElementCategory, string> = {
  "alkali-metal": "var(--cat-alkali-metal)",
  "alkaline-earth-metal": "var(--cat-alkaline-earth)",
  "transition-metal": "var(--cat-transition-metal)",
  "post-transition-metal": "var(--cat-post-transition)",
  metalloid: "var(--cat-metalloid)",
  nonmetal: "var(--cat-nonmetal)",
  halogen: "var(--cat-halogen)",
  "noble-gas": "var(--cat-noble-gas)",
  lanthanide: "var(--cat-lanthanide)",
  actinide: "var(--cat-actinide)",
  unknown: "var(--cat-unknown)",
};
