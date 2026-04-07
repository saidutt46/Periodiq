import type { Element } from "@/lib/types";

/**
 * Determines the state of matter for an element at a given temperature (in Kelvin).
 *
 * Uses melting and boiling points from the element data.
 * Returns null if insufficient data to determine state.
 *
 * Note: This is a simplified model. Real phase diagrams are pressure-dependent
 * and some elements (like Carbon) sublimate. For educational purposes,
 * we treat this as a simple solid → liquid → gas progression at 1 atm.
 */
export type PhaseState = "solid" | "liquid" | "gas" | "unknown";

export function getStateAtTemperature(
  element: Element,
  temperatureK: number
): PhaseState {
  const mp = element.melting_point;
  const bp = element.boiling_point;

  // Special case: Helium never solidifies at 1 atm
  // It remains liquid below its boiling point (4.22K) at normal pressure
  if (element.atomic_number === 2) {
    return temperatureK < (bp ?? 4.22) ? "liquid" : "gas";
  }

  // If we have neither, we can't determine state
  if (mp === null && bp === null) return "unknown";

  // If we only have melting point
  if (mp !== null && bp === null) {
    return temperatureK < mp ? "solid" : "liquid";
  }

  // If we only have boiling point
  if (mp === null && bp !== null) {
    return temperatureK < bp ? "solid" : "gas";
  }

  // We have both
  if (mp !== null && bp !== null) {
    if (temperatureK < mp) return "solid";
    if (temperatureK < bp) return "liquid";
    return "gas";
  }

  return "unknown";
}

/** Color for a phase state — matches the colors in getElementTileColors state mode */
export function getPhaseColor(state: PhaseState): string {
  switch (state) {
    case "solid":
      return "#64748b";    // Slate — neutral, grounded
    case "liquid":
      return "#f472b6";    // Pink — stands out, rare
    case "gas":
      return "#22d3ee";    // Cyan — airy, bright
    case "unknown":
      return "var(--cat-unknown)";
  }
}

/**
 * Key temperature points for reference display.
 */
export const TEMPERATURE_MARKERS = [
  { temp: 0, label: "0 K", description: "Absolute Zero" },
  { temp: 77, label: "77 K", description: "Liquid N₂" },
  { temp: 195, label: "195 K", description: "Dry Ice" },
  { temp: 234, label: "234 K", description: "Hg melts" },
  { temp: 273, label: "273 K", description: "Water freezes" },
  { temp: 293, label: "293 K", description: "Room temp" },
  { temp: 373, label: "373 K", description: "Water boils" },
  { temp: 601, label: "601 K", description: "Pb melts" },
  { temp: 1811, label: "1811 K", description: "Fe melts" },
  { temp: 3695, label: "3695 K", description: "W melts" },
  { temp: 5778, label: "5778 K", description: "Sun surface" },
] as const;
