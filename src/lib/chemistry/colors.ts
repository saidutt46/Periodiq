import type { Element, ColoringMode, ElementCategory } from "@/lib/types";

/**
 * Each property mode has its own monochromatic color family.
 * Low values = dark/muted, high values = bright/vivid.
 * Elements with no data = dimmed.
 */

interface PropertyColorConfig {
  range: [number, number];
  /** HSL hue for this property's color family */
  hue: number;
  /** Saturation range: [low_value_sat, high_value_sat] */
  sat: [number, number];
  /** Lightness range: [low_value_light, high_value_light] */
  light: [number, number];
  /** Label for the legend */
  lowLabel: string;
  highLabel: string;
  unit: string;
}

const PROPERTY_COLORS: Record<string, PropertyColorConfig> = {
  "atomic-mass": {
    range: [1, 295],
    hue: 210,          // Blue family
    sat: [50, 80],
    light: [20, 45],
    lowLabel: "Light",
    highLabel: "Heavy",
    unit: "u",
  },
  "atomic-radius": {
    range: [120, 350],
    hue: 275,          // Purple family
    sat: [45, 75],
    light: [18, 48],
    lowLabel: "Small",
    highLabel: "Large",
    unit: "pm",
  },
  electronegativity: {
    range: [0.7, 4.0],
    hue: 160,          // Teal/emerald family
    sat: [50, 80],
    light: [18, 42],
    lowLabel: "Low",
    highLabel: "High",
    unit: "",
  },
  density: {
    range: [0.00008, 23],
    hue: 185,          // Cyan family
    sat: [50, 85],
    light: [18, 42],
    lowLabel: "Light",
    highLabel: "Dense",
    unit: "g/cm³",
  },
  "melting-point": {
    range: [0.95, 3823],
    hue: 35,           // Amber/gold family
    sat: [60, 90],
    light: [18, 45],
    lowLabel: "Low",
    highLabel: "High",
    unit: "K",
  },
  "boiling-point": {
    range: [4.2, 5869],
    hue: 0,            // Red family
    sat: [55, 80],
    light: [18, 42],
    lowLabel: "Low",
    highLabel: "High",
    unit: "K",
  },
  "year-discovered": {
    range: [1669, 2010],
    hue: 25,           // Warm orange
    sat: [40, 80],
    light: [18, 48],
    lowLabel: "1669",
    highLabel: "2010",
    unit: "",
  },
};

/** Get the raw numeric property value for a given coloring mode */
export function getPropertyValue(
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
      if (element.year_discovered === "Ancient") return 1600; // Map ancient to below range (darkest)
      const year = parseInt(element.year_discovered ?? "", 10);
      return isNaN(year) ? null : year;
    }
    default:
      return null;
  }
}

/** Format a property value for display inside the tile */
export function formatPropertyValue(
  element: Element,
  mode: ColoringMode
): string | null {
  // Show raw "Ancient" label for year mode
  if (mode === "year-discovered" && element.year_discovered === "Ancient") {
    return "Ancient";
  }
  const val = getPropertyValue(element, mode);
  if (val === null) return null;

  switch (mode) {
    case "atomic-mass":
      return val < 10 ? val.toFixed(3) : val.toFixed(1);
    case "atomic-radius":
      return `${Math.round(val)}`;
    case "electronegativity":
      return val.toFixed(2);
    case "density":
      return val < 0.01 ? val.toExponential(1) : val < 1 ? val.toFixed(2) : val.toFixed(1);
    case "melting-point":
    case "boiling-point":
      return Math.round(val).toString();
    case "year-discovered":
      return val <= 0 ? "Ancient" : val.toString();
    default:
      return val.toString();
  }
}

/**
 * Get the color config for a property mode (used for legend rendering).
 */
export function getPropertyColorConfig(mode: ColoringMode): PropertyColorConfig | null {
  return PROPERTY_COLORS[mode] ?? null;
}

/**
 * Generate a CSS gradient string for the legend bar of a property mode.
 */
export function getPropertyGradientCSS(mode: ColoringMode): string | null {
  const config = PROPERTY_COLORS[mode];
  if (!config) return null;

  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const s = config.sat[0] + t * (config.sat[1] - config.sat[0]);
    const l = config.light[0] + t * (config.light[1] - config.light[0]);
    return `hsl(${config.hue}, ${s}%, ${l}%)`;
  });

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

/**
 * Returns tile colors for an element based on current coloring mode.
 */
export function getElementTileColors(
  element: Element,
  mode: ColoringMode
): { bg: string | null; accent: string; hasData: boolean } {
  if (mode === "category") {
    const cssVar = `var(--cat-${element.category})`;
    return { bg: cssVar, accent: cssVar, hasData: true };
  }

  if (mode === "state") {
    const state = (element.standard_state || "").toLowerCase();
    let color: string;
    if (state.includes("gas")) color = "#22d3ee";      // bright cyan
    else if (state.includes("liquid")) color = "#f472b6"; // pink
    else color = "#64748b";                               // slate
    return { bg: color, accent: color, hasData: true };
  }

  const config = PROPERTY_COLORS[mode];
  if (!config) return { bg: null, accent: "var(--cat-unknown)", hasData: false };

  const value = getPropertyValue(element, mode);
  if (value === null) {
    return { bg: null, accent: "var(--cat-unknown)", hasData: false };
  }

  const t = Math.max(0, Math.min(1, (value - config.range[0]) / (config.range[1] - config.range[0])));
  const s = config.sat[0] + t * (config.sat[1] - config.sat[0]);
  const l = config.light[0] + t * (config.light[1] - config.light[0]);
  const color = `hsl(${config.hue}, ${s}%, ${l}%)`;

  return { bg: color, accent: color, hasData: true };
}

/** Category CSS variable map */
export const CATEGORY_CSS_VAR: Record<ElementCategory, string> = {
  "alkali-metal": "var(--cat-alkali-metal)",
  "alkaline-earth-metal": "var(--cat-alkaline-earth-metal)",
  "transition-metal": "var(--cat-transition-metal)",
  "post-transition-metal": "var(--cat-post-transition-metal)",
  metalloid: "var(--cat-metalloid)",
  nonmetal: "var(--cat-nonmetal)",
  halogen: "var(--cat-halogen)",
  "noble-gas": "var(--cat-noble-gas)",
  lanthanide: "var(--cat-lanthanide)",
  actinide: "var(--cat-actinide)",
  unknown: "var(--cat-unknown)",
};
