/** Element categories as used in the periodic table */
export type ElementCategory =
  | "alkali-metal"
  | "alkaline-earth-metal"
  | "transition-metal"
  | "post-transition-metal"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type Metallicity = "metal" | "metalloid" | "nonmetal" | "unknown";

export type StandardState = "Solid" | "Liquid" | "Gas" | "Expected to be a Solid" | "Expected to be a Gas" | "";

export type Block = "s" | "p" | "d" | "f" | "unknown";

/** Core element data model (~100 fields) */
export interface Element {
  // Core
  atomic_number: number;
  symbol: string;
  name: string;
  atomic_mass: number;
  atomic_mass_unit: string;

  // Classification
  category: ElementCategory;
  category_label: string;
  category_color: string;
  metallicity: Metallicity;
  group: number;
  period: number;
  table_row: number;
  table_column: number;
  block: Block;
  is_radioactive: boolean;

  // Appearance
  cpk_hex_color: string | null;
  appearance: string | null;
  standard_state: StandardState;

  // Atomic
  electron_configuration: string | null;
  electrons_per_shell: number[];
  oxidation_states: number[];

  // Physical
  density: number | null;
  density_unit: string;
  melting_point: number | null;
  melting_point_unit: string;
  boiling_point: number | null;
  boiling_point_unit: string;
  speed_of_sound: number | null;

  // Chemical
  electronegativity_pauling: number | null;
  electron_affinity: number | null;
  electron_affinity_unit: string;

  // Radii
  atomic_radius: number | null;
  atomic_radius_unit: string;
  covalent_radius: string | null;
  van_der_waals_radius: string | null;

  // Ionization
  ionization_energy: number | null;
  ionization_energy_unit: string;
  ionization_energies: number[];

  // Thermodynamic
  heat_of_fusion: string | null;
  heat_of_vaporization: string | null;
  specific_heat_capacity: number | null;
  thermal_conductivity: number | null;
  thermal_expansion: string | null;

  // Electromagnetic
  magnetic_ordering: string | null;
  magnetic_susceptibility: string | null;
  electrical_resistivity: string | null;

  // Mechanical
  youngs_modulus: number | null;
  shear_modulus: number | null;
  bulk_modulus: number | null;
  poisson_ratio: number | null;
  mohs_hardness: number | null;
  brinell_hardness: number | null;
  vickers_hardness: number | null;

  // Crystal
  crystal_structure: string | null;
  space_group_number: string | null;
  lattice_constant: string | null;

  // History
  year_discovered: string | null;
  discovered_by: string | null;
  named_by: string | null;
  name_origin: string | null;
  cas_number: string | null;

  // Description
  summary: string | null;

  // Abundance
  abundance_crust: string | null;
  abundance_ocean: string | null;
  abundance_universe: string | null;
  abundance_human_body: string | null;
}

/** Compound data from curated dataset */
export interface Compound {
  formula: string;
  name: string;
  description: string;
  uses?: string;
}

/** Category metadata */
export interface CategoryInfo {
  label: string;
  color: string;
}

/** Property coloring mode for the periodic table */
export type ColoringMode =
  | "category"
  | "state"
  | "atomic-mass"
  | "atomic-radius"
  | "electronegativity"
  | "density"
  | "melting-point"
  | "boiling-point"
  | "year-discovered";

/** Map coloring mode to display label */
export const COLORING_MODE_LABELS: Record<ColoringMode, string> = {
  category: "Group",
  state: "State",
  "atomic-mass": "Mass",
  "atomic-radius": "Radius",
  electronegativity: "EN",
  density: "Density",
  "melting-point": "M.P.",
  "boiling-point": "B.P.",
  "year-discovered": "Year",
};
