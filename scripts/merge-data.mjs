/**
 * Merge data from all scraped sources into the final unified element dataset.
 *
 * Priority order (higher wins for conflicts):
 * 1. PubChem (most structured/authoritative for core fields)
 * 2. Wikipedia (best for descriptions, discovery, mechanical/thermal props)
 * 3. Manual overrides (data/overrides.json if it exists)
 *
 * Output: data/final/elements.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, "..", "data", "raw");
const FINAL_DIR = join(__dirname, "..", "data", "final");

// Standard element categories with consistent naming
const CATEGORY_MAP = {
  "Alkali metal": "alkali-metal",
  "Alkaline earth metal": "alkaline-earth-metal",
  "Transition metal": "transition-metal",
  "Post-transition metal": "post-transition-metal",
  Metalloid: "metalloid",
  "Nonmetal": "nonmetal",
  "Reactive nonmetal": "nonmetal",
  Halogen: "halogen",
  "Noble gas": "noble-gas",
  Lanthanide: "lanthanide",
  Actinide: "actinide",
  "Unknown, probably transition metal": "unknown",
  "Unknown, probably post-transition metal": "unknown",
  "Unknown, probably metalloid": "unknown",
  "Unknown, predicted to be noble gas": "unknown",
  "Unknown chemical properties": "unknown",
};

// Standard category display info
const CATEGORY_INFO = {
  "alkali-metal": { label: "Alkali Metal", color: "#ff6b6b" },
  "alkaline-earth-metal": { label: "Alkaline Earth Metal", color: "#ffd93d" },
  "transition-metal": { label: "Transition Metal", color: "#6bcb77" },
  "post-transition-metal": { label: "Post-transition Metal", color: "#4d96ff" },
  metalloid: { label: "Metalloid", color: "#ff922b" },
  nonmetal: { label: "Nonmetal", color: "#20c997" },
  halogen: { label: "Halogen", color: "#a855f7" },
  "noble-gas": { label: "Noble Gas", color: "#f472b6" },
  lanthanide: { label: "Lanthanide", color: "#38bdf8" },
  actinide: { label: "Actinide", color: "#fb923c" },
  unknown: { label: "Unknown", color: "#6b7280" },
};

// Metal/Metalloid/Nonmetal classification
const METALLICITY = {
  "alkali-metal": "metal",
  "alkaline-earth-metal": "metal",
  "transition-metal": "metal",
  "post-transition-metal": "metal",
  lanthanide: "metal",
  actinide: "metal",
  metalloid: "metalloid",
  nonmetal: "nonmetal",
  halogen: "nonmetal",
  "noble-gas": "nonmetal",
  unknown: "unknown",
};

// Group and period data (standard periodic table layout)
const ELEMENT_POSITIONS = buildPositionMap();

function buildPositionMap() {
  // [atomic_number]: { group, period }
  // Group 0 means lanthanide/actinide row
  const positions = {};

  // Period 1
  positions[1] = { group: 1, period: 1 };
  positions[2] = { group: 18, period: 1 };

  // Period 2
  positions[3] = { group: 1, period: 2 };
  positions[4] = { group: 2, period: 2 };
  for (let i = 5; i <= 10; i++) positions[i] = { group: i + 8, period: 2 };

  // Period 3
  positions[11] = { group: 1, period: 3 };
  positions[12] = { group: 2, period: 3 };
  for (let i = 13; i <= 18; i++) positions[i] = { group: i, period: 3 };

  // Period 4
  positions[19] = { group: 1, period: 4 };
  positions[20] = { group: 2, period: 4 };
  for (let i = 21; i <= 30; i++) positions[i] = { group: i - 18, period: 4 };
  for (let i = 31; i <= 36; i++) positions[i] = { group: i - 18, period: 4 };

  // Period 5
  positions[37] = { group: 1, period: 5 };
  positions[38] = { group: 2, period: 5 };
  for (let i = 39; i <= 48; i++) positions[i] = { group: i - 36, period: 5 };
  for (let i = 49; i <= 54; i++) positions[i] = { group: i - 36, period: 5 };

  // Period 6
  positions[55] = { group: 1, period: 6 };
  positions[56] = { group: 2, period: 6 };
  // Lanthanides (57-71) - they sit in period 6 but are shown separately
  for (let i = 57; i <= 71; i++) positions[i] = { group: i - 54, period: 8 }; // Row 8 = lanthanide row
  for (let i = 72; i <= 80; i++) positions[i] = { group: i - 68, period: 6 };
  for (let i = 81; i <= 86; i++) positions[i] = { group: i - 68, period: 6 };

  // Period 7
  positions[87] = { group: 1, period: 7 };
  positions[88] = { group: 2, period: 7 };
  // Actinides (89-103) - they sit in period 7 but are shown separately
  for (let i = 89; i <= 103; i++) positions[i] = { group: i - 86, period: 9 }; // Row 9 = actinide row
  for (let i = 104; i <= 112; i++) positions[i] = { group: i - 100, period: 7 };
  for (let i = 113; i <= 118; i++) positions[i] = { group: i - 100, period: 7 };

  return positions;
}

// Block classification
function getBlock(atomicNumber) {
  const z = atomicNumber;
  if ([1, 2].includes(z)) return z === 2 ? "s" : "s";
  if (z >= 3 && z <= 4) return "s";
  if (z >= 5 && z <= 10) return "p";
  if (z >= 11 && z <= 12) return "s";
  if (z >= 13 && z <= 18) return "p";
  if (z >= 19 && z <= 20) return "s";
  if (z >= 21 && z <= 30) return "d";
  if (z >= 31 && z <= 36) return "p";
  if (z >= 37 && z <= 38) return "s";
  if (z >= 39 && z <= 48) return "d";
  if (z >= 49 && z <= 54) return "p";
  if (z >= 55 && z <= 56) return "s";
  if (z >= 57 && z <= 71) return "f";
  if (z >= 72 && z <= 80) return "d";
  if (z >= 81 && z <= 86) return "p";
  if (z >= 87 && z <= 88) return "s";
  if (z >= 89 && z <= 103) return "f";
  if (z >= 104 && z <= 112) return "d";
  if (z >= 113 && z <= 118) return "p";
  return "unknown";
}

// Electrons per shell
const ELECTRONS_PER_SHELL = {
  1: [1], 2: [2], 3: [2,1], 4: [2,2], 5: [2,3], 6: [2,4], 7: [2,5], 8: [2,6],
  9: [2,7], 10: [2,8], 11: [2,8,1], 12: [2,8,2], 13: [2,8,3], 14: [2,8,4],
  15: [2,8,5], 16: [2,8,6], 17: [2,8,7], 18: [2,8,8], 19: [2,8,8,1],
  20: [2,8,8,2], 21: [2,8,9,2], 22: [2,8,10,2], 23: [2,8,11,2],
  24: [2,8,13,1], 25: [2,8,13,2], 26: [2,8,14,2], 27: [2,8,15,2],
  28: [2,8,16,2], 29: [2,8,18,1], 30: [2,8,18,2], 31: [2,8,18,3],
  32: [2,8,18,4], 33: [2,8,18,5], 34: [2,8,18,6], 35: [2,8,18,7],
  36: [2,8,18,8], 37: [2,8,18,8,1], 38: [2,8,18,8,2], 39: [2,8,18,9,2],
  40: [2,8,18,10,2], 41: [2,8,18,12,1], 42: [2,8,18,13,1],
  43: [2,8,18,13,2], 44: [2,8,18,15,1], 45: [2,8,18,16,1],
  46: [2,8,18,18], 47: [2,8,18,18,1], 48: [2,8,18,18,2],
  49: [2,8,18,18,3], 50: [2,8,18,18,4], 51: [2,8,18,18,5],
  52: [2,8,18,18,6], 53: [2,8,18,18,7], 54: [2,8,18,18,8],
  55: [2,8,18,18,8,1], 56: [2,8,18,18,8,2], 57: [2,8,18,18,9,2],
  58: [2,8,18,19,9,2], 59: [2,8,18,21,8,2], 60: [2,8,18,22,8,2],
  61: [2,8,18,23,8,2], 62: [2,8,18,24,8,2], 63: [2,8,18,25,8,2],
  64: [2,8,18,25,9,2], 65: [2,8,18,27,8,2], 66: [2,8,18,28,8,2],
  67: [2,8,18,29,8,2], 68: [2,8,18,30,8,2], 69: [2,8,18,31,8,2],
  70: [2,8,18,32,8,2], 71: [2,8,18,32,9,2], 72: [2,8,18,32,10,2],
  73: [2,8,18,32,11,2], 74: [2,8,18,32,12,2], 75: [2,8,18,32,13,2],
  76: [2,8,18,32,14,2], 77: [2,8,18,32,15,2], 78: [2,8,18,32,17,1],
  79: [2,8,18,32,18,1], 80: [2,8,18,32,18,2], 81: [2,8,18,32,18,3],
  82: [2,8,18,32,18,4], 83: [2,8,18,32,18,5], 84: [2,8,18,32,18,6],
  85: [2,8,18,32,18,7], 86: [2,8,18,32,18,8],
  87: [2,8,18,32,18,8,1], 88: [2,8,18,32,18,8,2],
  89: [2,8,18,32,18,9,2], 90: [2,8,18,32,18,10,2],
  91: [2,8,18,32,20,9,2], 92: [2,8,18,32,21,9,2],
  93: [2,8,18,32,22,9,2], 94: [2,8,18,32,24,8,2],
  95: [2,8,18,32,25,8,2], 96: [2,8,18,32,25,9,2],
  97: [2,8,18,32,27,8,2], 98: [2,8,18,32,28,8,2],
  99: [2,8,18,32,29,8,2], 100: [2,8,18,32,30,8,2],
  101: [2,8,18,32,31,8,2], 102: [2,8,18,32,32,8,2],
  103: [2,8,18,32,32,8,3], 104: [2,8,18,32,32,10,2],
  105: [2,8,18,32,32,11,2], 106: [2,8,18,32,32,12,2],
  107: [2,8,18,32,32,13,2], 108: [2,8,18,32,32,14,2],
  109: [2,8,18,32,32,15,2], 110: [2,8,18,32,32,16,2],
  111: [2,8,18,32,32,17,2], 112: [2,8,18,32,32,18,2],
  113: [2,8,18,32,32,18,3], 114: [2,8,18,32,32,18,4],
  115: [2,8,18,32,32,18,5], 116: [2,8,18,32,32,18,6],
  117: [2,8,18,32,32,18,7], 118: [2,8,18,32,32,18,8],
};

function parseOxidationStates(str) {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n));
}

function main() {
  console.log("=== Merging Element Data ===\n");

  // Load raw data
  const pubchemPath = join(RAW_DIR, "pubchem-elements.json");
  const wikiPath = join(RAW_DIR, "wikipedia-elements.json");
  const pubchemDetailsPath = join(RAW_DIR, "pubchem-details.json");

  if (!existsSync(pubchemPath)) {
    console.error("Missing pubchem-elements.json — run scrape:pubchem first");
    process.exit(1);
  }

  const pubchem = JSON.parse(readFileSync(pubchemPath, "utf8"));
  const wikipedia = existsSync(wikiPath)
    ? JSON.parse(readFileSync(wikiPath, "utf8"))
    : [];
  const pubchemDetails = existsSync(pubchemDetailsPath)
    ? JSON.parse(readFileSync(pubchemDetailsPath, "utf8"))
    : {};

  console.log(`  PubChem: ${pubchem.length} elements`);
  console.log(`  Wikipedia: ${wikipedia.length} elements`);
  console.log(`  PubChem details: ${Object.keys(pubchemDetails).length} elements`);

  // Build lookup maps
  const wikiByNumber = {};
  for (const el of wikipedia) {
    wikiByNumber[el.atomic_number] = el;
  }

  // Merge into final dataset
  const elements = pubchem.map((pc) => {
    const z = pc.atomic_number;
    const wiki = wikiByNumber[z] || {};
    const pcDetail = pubchemDetails[z] || {};
    const pos = ELEMENT_POSITIONS[z] || { group: null, period: null };
    const category = CATEGORY_MAP[pc.group_block] || "unknown";

    return {
      // === Core ===
      atomic_number: z,
      symbol: pc.symbol,
      name: pc.name,
      atomic_mass: pc.atomic_mass,
      atomic_mass_unit: "u",

      // === Classification ===
      category,
      category_label: CATEGORY_INFO[category]?.label || "Unknown",
      category_color: CATEGORY_INFO[category]?.color || "#6b7280",
      metallicity: METALLICITY[category] || "unknown",
      group: pos.group,
      period: pos.period <= 7 ? pos.period : pos.period === 8 ? 6 : 7,
      table_row: pos.period, // Actual row in table layout (8=lanthanide, 9=actinide)
      table_column: pos.group,
      block: getBlock(z),
      is_radioactive: z >= 84 || [43, 61].includes(z),

      // === Appearance ===
      cpk_hex_color: pc.cpk_hex_color,
      appearance: wiki.appearance || null,
      standard_state: pc.standard_state,

      // === Atomic Properties ===
      electron_configuration: pc.electron_configuration,
      electrons_per_shell: ELECTRONS_PER_SHELL[z] || [],
      oxidation_states: parseOxidationStates(pc.oxidation_states),

      // === Physical Properties ===
      density: pc.density ?? wiki.density ?? null,
      density_unit: "g/cm³",
      melting_point: pc.melting_point,
      melting_point_unit: "K",
      boiling_point: pc.boiling_point,
      boiling_point_unit: "K",
      speed_of_sound: wiki.speed_of_sound || null,

      // === Chemical Properties ===
      electronegativity_pauling: pc.electronegativity,
      electron_affinity: pc.electron_affinity,
      electron_affinity_unit: "kJ/mol",
      // === Atomic Radii ===
      atomic_radius: pc.atomic_radius,
      atomic_radius_unit: "pm",
      covalent_radius: wiki.covalent_radius || null,
      van_der_waals_radius: wiki.van_der_waals_radius || null,

      // === Ionization Energies ===
      ionization_energy: pc.ionization_energy,
      ionization_energy_unit: "eV",
      ionization_energies: [
        wiki.ionization_energy_1st,
        wiki.ionization_energy_2nd,
        wiki.ionization_energy_3rd,
      ].filter(Boolean),

      // === Thermodynamic Properties ===
      heat_of_fusion: wiki.heat_of_fusion || null,
      heat_of_vaporization: wiki.heat_of_vaporization || null,
      specific_heat_capacity: wiki.heat_capacity || null,
      thermal_conductivity: wiki.thermal_conductivity,
      thermal_expansion: wiki.thermal_expansion || null,

      // === Electromagnetic Properties ===
      magnetic_ordering: wiki.magnetic_ordering || null,
      magnetic_susceptibility: wiki.magnetic_susceptibility || null,
      electrical_resistivity: wiki.electrical_resistivity || null,

      // === Mechanical Properties ===
      youngs_modulus: wiki.youngs_modulus,
      shear_modulus: wiki.shear_modulus,
      bulk_modulus: wiki.bulk_modulus,
      poisson_ratio: wiki.poisson_ratio,
      mohs_hardness: wiki.mohs_hardness,
      brinell_hardness: wiki.brinell_hardness,
      vickers_hardness: wiki.vickers_hardness,

      // === Crystal Structure ===
      crystal_structure: wiki.crystal_structure || null,
      space_group_number: wiki.space_group_number || null,
      lattice_constant: wiki.lattice_constant || null,

      // === History ===
      year_discovered: pc.year_discovered,
      discovered_by: wiki.discovered_by || null,
      named_by: wiki.named_by || null,
      name_origin: wiki.name_origin || null,
      cas_number: wiki.cas_number || null,

      // === Description ===
      summary: wiki.summary || null,

      // === Abundance (to be filled by additional scrapers) ===
      abundance_crust: wiki.abundance_crust || null,
      abundance_ocean: wiki.abundance_ocean || null,
      abundance_universe: null,
      abundance_human_body: null,
    };
  });

  // Save final dataset
  writeFileSync(
    join(FINAL_DIR, "elements.json"),
    JSON.stringify(elements, null, 2)
  );

  // Also save the category reference
  writeFileSync(
    join(FINAL_DIR, "categories.json"),
    JSON.stringify(CATEGORY_INFO, null, 2)
  );

  // Stats
  const fieldCounts = {};
  for (const el of elements) {
    for (const [key, val] of Object.entries(el)) {
      if (val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        fieldCounts[key] = (fieldCounts[key] || 0) + 1;
      }
    }
  }

  console.log(`\n  Output: ${elements.length} elements to data/final/elements.json`);
  console.log(`  Fields with data:`);
  const sorted = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sorted) {
    const pct = Math.round((count / 118) * 100);
    const bar = pct === 100 ? "█" : pct > 80 ? "▓" : pct > 50 ? "▒" : "░";
    console.log(`    ${bar} ${key}: ${count}/118 (${pct}%)`);
  }

  console.log("\n=== Merge complete ===");
}

main();
