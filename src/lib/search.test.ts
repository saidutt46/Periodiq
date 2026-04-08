import { describe, it, expect } from "vitest";
import { searchElements, filterByCategory, getCategoryOptions } from "./search";
import type { Element } from "./types";

/* ─── Test fixtures ─── */
const makeElement = (overrides: Partial<Element>): Element => ({
  atomic_number: 1,
  symbol: "H",
  name: "Hydrogen",
  atomic_mass: 1.008,
  atomic_mass_unit: "u",
  category: "nonmetal",
  category_label: "Nonmetal",
  category_color: "#2ed573",
  metallicity: "nonmetal",
  group: 1,
  period: 1,
  table_row: 1,
  table_column: 1,
  block: "s",
  is_radioactive: false,
  cpk_hex_color: "FFFFFF",
  appearance: null,
  standard_state: "Gas",
  electron_configuration: "1s1",
  electrons_per_shell: [1],
  oxidation_states: [1, -1],
  density: 0.00008988,
  density_unit: "g/cm³",
  melting_point: 13.81,
  melting_point_unit: "K",
  boiling_point: 20.28,
  boiling_point_unit: "K",
  speed_of_sound: null,
  electronegativity_pauling: 2.2,
  electron_affinity: 0.754,
  electron_affinity_unit: "kJ/mol",
  atomic_radius: 120,
  atomic_radius_unit: "pm",
  covalent_radius: "31",
  van_der_waals_radius: "120",
  ionization_energy: 13.598,
  ionization_energy_unit: "eV",
  ionization_energies: [1312],
  heat_of_fusion: null,
  heat_of_vaporization: null,
  specific_heat_capacity: null,
  thermal_conductivity: null,
  thermal_expansion: null,
  magnetic_ordering: null,
  magnetic_susceptibility: null,
  electrical_resistivity: null,
  youngs_modulus: null,
  shear_modulus: null,
  bulk_modulus: null,
  poisson_ratio: null,
  mohs_hardness: null,
  brinell_hardness: null,
  vickers_hardness: null,
  crystal_structure: null,
  space_group_number: null,
  lattice_constant: null,
  year_discovered: "1766",
  discovered_by: null,
  named_by: null,
  name_origin: null,
  cas_number: null,
  summary: null,
  abundance_crust: null,
  abundance_ocean: null,
  abundance_universe: null,
  abundance_human_body: null,
  ...overrides,
});

const elements: Element[] = [
  makeElement({ atomic_number: 1, symbol: "H", name: "Hydrogen", category: "nonmetal", category_label: "Nonmetal" }),
  makeElement({ atomic_number: 2, symbol: "He", name: "Helium", category: "noble-gas", category_label: "Noble Gas" }),
  makeElement({ atomic_number: 26, symbol: "Fe", name: "Iron", category: "transition-metal", category_label: "Transition Metal" }),
  makeElement({ atomic_number: 67, symbol: "Ho", name: "Holmium", category: "lanthanide", category_label: "Lanthanide" }),
  makeElement({ atomic_number: 108, symbol: "Hs", name: "Hassium", category: "unknown", category_label: "Unknown" }),
  makeElement({ atomic_number: 79, symbol: "Au", name: "Gold", category: "transition-metal", category_label: "Transition Metal" }),
  makeElement({ atomic_number: 80, symbol: "Hg", name: "Mercury", category: "transition-metal", category_label: "Transition Metal" }),
  makeElement({ atomic_number: 10, symbol: "Ne", name: "Neon", category: "noble-gas", category_label: "Noble Gas" }),
];

/* ─── Tests ─── */

describe("searchElements", () => {
  it("returns empty array for empty query", () => {
    expect(searchElements(elements, "")).toEqual([]);
    expect(searchElements(elements, "   ")).toEqual([]);
  });

  it("finds element by exact symbol (case-insensitive)", () => {
    const results = searchElements(elements, "Fe");
    expect(results[0].element.symbol).toBe("Fe");
    expect(results[0].matchType).toBe("exact-symbol");

    const resultsLower = searchElements(elements, "fe");
    expect(resultsLower[0].element.symbol).toBe("Fe");
    expect(resultsLower[0].matchType).toBe("exact-symbol");
  });

  it("finds element by exact atomic number", () => {
    const results = searchElements(elements, "26");
    expect(results[0].element.symbol).toBe("Fe");
    expect(results[0].matchType).toBe("exact-number");
  });

  it("finds element by exact name", () => {
    const results = searchElements(elements, "iron");
    expect(results[0].element.symbol).toBe("Fe");
    expect(results[0].matchType).toBe("exact-name");
  });

  it("finds elements by name prefix", () => {
    const results = searchElements(elements, "hel");
    expect(results[0].element.symbol).toBe("He");
    expect(results[0].matchType).toBe("starts-with");
  });

  it("finds elements by symbol prefix", () => {
    const results = searchElements(elements, "h");
    // H (exact starts-with on symbol) should rank higher than Ho, Hs, Hg (also start with H)
    expect(results[0].element.symbol).toBe("H");
  });

  it("finds elements by name substring", () => {
    const results = searchElements(elements, "ium");
    // Should find Helium, Holmium, Hassium
    const names = results.map((r) => r.element.name);
    expect(names).toContain("Helium");
    expect(names).toContain("Holmium");
    expect(names).toContain("Hassium");
    expect(results[0].matchType).toBe("contains");
  });

  it("returns no results for nonsense query", () => {
    const results = searchElements(elements, "xyz");
    expect(results).toHaveLength(0);
  });

  it("ranks exact symbol above starts-with above contains", () => {
    const results = searchElements(elements, "he");
    // "He" is exact symbol match → highest
    expect(results[0].element.symbol).toBe("He");
    expect(results[0].score).toBeGreaterThan(results[1]?.score || 0);
  });

  it("ranks exact number match highest", () => {
    const results = searchElements(elements, "2");
    // 2 = exact number for Helium, but also "contains" for 26
    expect(results[0].element.symbol).toBe("He");
    expect(results[0].matchType).toBe("exact-number");
  });

  it("handles single character search", () => {
    const results = searchElements(elements, "g");
    // Should find Gold (contains "g" in name)
    const names = results.map((r) => r.element.name);
    expect(names).toContain("Gold");
  });

  it("sorts ties by atomic number ascending", () => {
    const results = searchElements(elements, "ium");
    // All are "contains" with same score — should be ordered by atomic number
    const numbers = results.map((r) => r.element.atomic_number);
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
    }
  });
});

describe("filterByCategory", () => {
  it("filters elements by category", () => {
    const nobles = filterByCategory(elements, "noble-gas");
    expect(nobles).toHaveLength(2);
    expect(nobles[0].symbol).toBe("He");
    expect(nobles[1].symbol).toBe("Ne");
  });

  it("returns empty for category with no elements", () => {
    const result = filterByCategory(elements, "actinide");
    expect(result).toHaveLength(0);
  });
});

describe("getCategoryOptions", () => {
  it("returns categories with correct counts", () => {
    const options = getCategoryOptions(elements);

    const transitionMetal = options.find((o) => o.category === "transition-metal");
    expect(transitionMetal?.count).toBe(3); // Fe, Au, Hg

    const nobleGas = options.find((o) => o.category === "noble-gas");
    expect(nobleGas?.count).toBe(2); // He, Ne
  });

  it("sorts by count descending", () => {
    const options = getCategoryOptions(elements);
    for (let i = 1; i < options.length; i++) {
      expect(options[i].count).toBeLessThanOrEqual(options[i - 1].count);
    }
  });

  it("includes labels", () => {
    const options = getCategoryOptions(elements);
    const noble = options.find((o) => o.category === "noble-gas");
    expect(noble?.label).toBe("Noble Gas");
  });
});
