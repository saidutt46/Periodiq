/**
 * Curate common compounds for each element.
 *
 * Strategy:
 * 1. Use a hand-curated base list of well-known compounds per element
 * 2. Augment with PubChem API for additional compound data
 *
 * Output: data/final/compounds.json
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FINAL_DIR = join(__dirname, "..", "data", "final");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (res.status === 429) {
        await sleep(3000 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1));
    }
  }
}

// Curated compounds data — the most important/well-known compounds per element
// Format: { element_symbol: [{ formula, name, description }] }
const CURATED_COMPOUNDS = {
  H: [
    { formula: "H₂O", name: "Water", description: "Essential for all known life, universal solvent" },
    { formula: "H₂O₂", name: "Hydrogen Peroxide", description: "Oxidizer, antiseptic, bleaching agent" },
    { formula: "HCl", name: "Hydrochloric Acid", description: "Strong acid, stomach acid, industrial chemical" },
    { formula: "H₂SO₄", name: "Sulfuric Acid", description: "Most produced industrial chemical worldwide" },
    { formula: "NH₃", name: "Ammonia", description: "Fertilizer production, refrigerant, cleaning agent" },
    { formula: "CH₄", name: "Methane", description: "Natural gas, simplest hydrocarbon" },
    { formula: "NaOH", name: "Sodium Hydroxide", description: "Strong base, soap making, drain cleaner" },
    { formula: "HNO₃", name: "Nitric Acid", description: "Fertilizer production, explosives, etching" },
    { formula: "H₂S", name: "Hydrogen Sulfide", description: "Toxic gas, rotten egg smell, volcanic emissions" },
    { formula: "HF", name: "Hydrofluoric Acid", description: "Glass etching, semiconductor manufacturing" },
  ],
  He: [
    { formula: "He", name: "Helium (gas)", description: "Lighter than air, used in balloons and airships" },
  ],
  Li: [
    { formula: "LiOH", name: "Lithium Hydroxide", description: "CO₂ scrubbing in spacecraft, grease production" },
    { formula: "Li₂CO₃", name: "Lithium Carbonate", description: "Bipolar disorder treatment, ceramics" },
    { formula: "LiCoO₂", name: "Lithium Cobalt Oxide", description: "Cathode material in lithium-ion batteries" },
    { formula: "LiCl", name: "Lithium Chloride", description: "Desiccant, brazing flux, air conditioning" },
    { formula: "LiF", name: "Lithium Fluoride", description: "Optics, nuclear reactors, ceramics" },
  ],
  C: [
    { formula: "CO₂", name: "Carbon Dioxide", description: "Greenhouse gas, photosynthesis, carbonated drinks" },
    { formula: "CO", name: "Carbon Monoxide", description: "Toxic gas, fuel gas, metal smelting" },
    { formula: "CH₄", name: "Methane", description: "Natural gas, simplest organic compound" },
    { formula: "C₂H₅OH", name: "Ethanol", description: "Alcoholic beverages, fuel, solvent, antiseptic" },
    { formula: "C₆H₁₂O₆", name: "Glucose", description: "Primary energy source for cells" },
    { formula: "CaCO₃", name: "Calcium Carbonate", description: "Limestone, chalk, marble, antacid" },
    { formula: "NaHCO₃", name: "Sodium Bicarbonate", description: "Baking soda, antacid, fire extinguisher" },
    { formula: "CH₃COOH", name: "Acetic Acid", description: "Vinegar, food preservative, chemical reagent" },
    { formula: "CCl₄", name: "Carbon Tetrachloride", description: "Historical solvent, refrigerant precursor" },
    { formula: "CS₂", name: "Carbon Disulfide", description: "Solvent, viscose rayon production" },
  ],
  N: [
    { formula: "NH₃", name: "Ammonia", description: "Fertilizer base, refrigerant, cleaning agent" },
    { formula: "HNO₃", name: "Nitric Acid", description: "Fertilizers, explosives, rocket propellant" },
    { formula: "N₂O", name: "Nitrous Oxide", description: "Laughing gas, anesthetic, rocket oxidizer" },
    { formula: "NO₂", name: "Nitrogen Dioxide", description: "Air pollutant, acid rain contributor" },
    { formula: "NO", name: "Nitric Oxide", description: "Signaling molecule in body, air pollutant" },
    { formula: "NaNO₃", name: "Sodium Nitrate", description: "Fertilizer, food preservative, gunpowder" },
    { formula: "KNO₃", name: "Potassium Nitrate", description: "Gunpowder, fertilizer, food preservative" },
    { formula: "NH₄NO₃", name: "Ammonium Nitrate", description: "Fertilizer, explosive (ANFO)" },
    { formula: "N₂H₄", name: "Hydrazine", description: "Rocket propellant, chemical reducing agent" },
    { formula: "(NH₂)₂CO", name: "Urea", description: "Fertilizer, animal feed, skincare" },
  ],
  O: [
    { formula: "H₂O", name: "Water", description: "Essential for life, covers 71% of Earth's surface" },
    { formula: "O₃", name: "Ozone", description: "Stratospheric UV shield, surface-level pollutant" },
    { formula: "CO₂", name: "Carbon Dioxide", description: "Greenhouse gas, photosynthesis input" },
    { formula: "SiO₂", name: "Silicon Dioxide", description: "Sand, quartz, glass production" },
    { formula: "Fe₂O₃", name: "Iron(III) Oxide", description: "Rust, pigment, iron ore (hematite)" },
    { formula: "Al₂O₃", name: "Aluminum Oxide", description: "Alumina, corundum, sapphire/ruby base" },
    { formula: "CaO", name: "Calcium Oxide", description: "Quicklime, cement production" },
    { formula: "SO₂", name: "Sulfur Dioxide", description: "Preservative, acid rain precursor" },
    { formula: "H₂O₂", name: "Hydrogen Peroxide", description: "Disinfectant, bleaching agent" },
    { formula: "NO₂", name: "Nitrogen Dioxide", description: "Reddish-brown toxic gas, smog component" },
  ],
  Na: [
    { formula: "NaCl", name: "Sodium Chloride", description: "Table salt, food preservation, de-icing" },
    { formula: "NaOH", name: "Sodium Hydroxide", description: "Lye, soap making, drain cleaner" },
    { formula: "NaHCO₃", name: "Sodium Bicarbonate", description: "Baking soda, antacid" },
    { formula: "Na₂CO₃", name: "Sodium Carbonate", description: "Washing soda, glass making" },
    { formula: "NaF", name: "Sodium Fluoride", description: "Toothpaste, water fluoridation" },
    { formula: "Na₂SO₄", name: "Sodium Sulfate", description: "Detergents, glass manufacturing" },
    { formula: "NaNO₃", name: "Sodium Nitrate", description: "Fertilizer, food preservative" },
    { formula: "NaClO", name: "Sodium Hypochlorite", description: "Bleach, water disinfection" },
  ],
  Fe: [
    { formula: "Fe₂O₃", name: "Iron(III) Oxide", description: "Rust, hematite ore, red pigment" },
    { formula: "Fe₃O₄", name: "Iron(II,III) Oxide", description: "Magnetite, magnetic storage" },
    { formula: "FeS₂", name: "Iron Pyrite", description: "Fool's gold, sulfuric acid production" },
    { formula: "FeCl₃", name: "Iron(III) Chloride", description: "Water treatment, PCB etching" },
    { formula: "FeSO₄", name: "Iron(II) Sulfate", description: "Iron supplement, water treatment" },
    { formula: "Fe(OH)₃", name: "Iron(III) Hydroxide", description: "Water purification, pigment" },
    { formula: "FeO", name: "Iron(II) Oxide", description: "Pigment, steel manufacturing" },
    { formula: "FeCO₃", name: "Iron Carbonate", description: "Siderite mineral, iron production" },
  ],
  Au: [
    { formula: "AuCl₃", name: "Gold(III) Chloride", description: "Catalyst, gold plating" },
    { formula: "HAuCl₄", name: "Chloroauric Acid", description: "Gold nanoparticle synthesis, photography" },
    { formula: "Au₂O₃", name: "Gold(III) Oxide", description: "Ceramic colorant, catalysis" },
    { formula: "AuCN", name: "Gold(I) Cyanide", description: "Gold electroplating" },
    { formula: "Au(OH)₃", name: "Gold(III) Hydroxide", description: "Gold purification intermediate" },
  ],
  Cu: [
    { formula: "CuSO₄", name: "Copper(II) Sulfate", description: "Blue vitriol, fungicide, electroplating" },
    { formula: "CuO", name: "Copper(II) Oxide", description: "Black pigment, ceramics, batteries" },
    { formula: "Cu₂O", name: "Copper(I) Oxide", description: "Red pigment, antifouling paint" },
    { formula: "CuCl₂", name: "Copper(II) Chloride", description: "Catalyst, wood preservative" },
    { formula: "Cu(OH)₂", name: "Copper(II) Hydroxide", description: "Fungicide, blue pigment" },
    { formula: "CuCO₃", name: "Copper Carbonate", description: "Green patina, pigment (verdigris)" },
    { formula: "CuFeS₂", name: "Chalcopyrite", description: "Primary copper ore mineral" },
  ],
  Ag: [
    { formula: "AgNO₃", name: "Silver Nitrate", description: "Photography, mirror making, antiseptic" },
    { formula: "AgCl", name: "Silver Chloride", description: "Photography, electrochemistry reference" },
    { formula: "Ag₂O", name: "Silver Oxide", description: "Button cell batteries, catalyst" },
    { formula: "AgBr", name: "Silver Bromide", description: "Photographic film emulsion" },
    { formula: "Ag₂S", name: "Silver Sulfide", description: "Tarnish on silver, silver ore" },
    { formula: "AgI", name: "Silver Iodide", description: "Cloud seeding, photography" },
  ],
  Cl: [
    { formula: "NaCl", name: "Sodium Chloride", description: "Table salt, essential for life" },
    { formula: "HCl", name: "Hydrochloric Acid", description: "Stomach acid, industrial acid" },
    { formula: "Cl₂", name: "Chlorine Gas", description: "Water disinfection, PVC production" },
    { formula: "NaClO", name: "Sodium Hypochlorite", description: "Bleach, water treatment" },
    { formula: "KCl", name: "Potassium Chloride", description: "Fertilizer, salt substitute" },
    { formula: "CaCl₂", name: "Calcium Chloride", description: "De-icing, desiccant, food additive" },
    { formula: "CHCl₃", name: "Chloroform", description: "Historical anesthetic, solvent" },
    { formula: "CCl₄", name: "Carbon Tetrachloride", description: "Historical solvent, fire extinguisher" },
  ],
  S: [
    { formula: "H₂SO₄", name: "Sulfuric Acid", description: "Most widely used chemical, batteries" },
    { formula: "SO₂", name: "Sulfur Dioxide", description: "Wine preservative, acid rain precursor" },
    { formula: "H₂S", name: "Hydrogen Sulfide", description: "Rotten egg smell, toxic gas" },
    { formula: "Na₂SO₄", name: "Sodium Sulfate", description: "Detergent filler, glass production" },
    { formula: "CaSO₄", name: "Calcium Sulfate", description: "Gypsum, plaster of Paris, drywall" },
    { formula: "SO₃", name: "Sulfur Trioxide", description: "Sulfuric acid production intermediate" },
    { formula: "CS₂", name: "Carbon Disulfide", description: "Solvent, rayon production" },
    { formula: "FeS₂", name: "Iron Pyrite", description: "Fool's gold, sulfur source" },
  ],
  Ca: [
    { formula: "CaCO₃", name: "Calcium Carbonate", description: "Limestone, chalk, marble, antacid" },
    { formula: "CaO", name: "Calcium Oxide", description: "Quicklime, cement, steelmaking" },
    { formula: "Ca(OH)₂", name: "Calcium Hydroxide", description: "Slaked lime, mortar, water treatment" },
    { formula: "CaSO₄", name: "Calcium Sulfate", description: "Gypsum, plaster, drywall" },
    { formula: "CaCl₂", name: "Calcium Chloride", description: "De-icing, desiccant, food processing" },
    { formula: "CaF₂", name: "Calcium Fluoride", description: "Fluorite, optical lenses, HF production" },
    { formula: "Ca₃(PO₄)₂", name: "Calcium Phosphate", description: "Bones, teeth, fertilizer" },
  ],
  Al: [
    { formula: "Al₂O₃", name: "Aluminum Oxide", description: "Alumina, corundum, sapphire, abrasive" },
    { formula: "Al(OH)₃", name: "Aluminum Hydroxide", description: "Antacid, fire retardant, water treatment" },
    { formula: "AlCl₃", name: "Aluminum Chloride", description: "Catalyst, antiperspirant" },
    { formula: "Al₂(SO₄)₃", name: "Aluminum Sulfate", description: "Water purification, paper sizing" },
    { formula: "NaAlO₂", name: "Sodium Aluminate", description: "Water treatment, cement" },
    { formula: "KAl(SO₄)₂", name: "Alum", description: "Water purification, dyeing, pickling" },
  ],
  Si: [
    { formula: "SiO₂", name: "Silicon Dioxide", description: "Sand, quartz, glass, semiconductors" },
    { formula: "SiC", name: "Silicon Carbide", description: "Abrasive, semiconductor, armor plating" },
    { formula: "SiH₄", name: "Silane", description: "Semiconductor manufacturing, solar cells" },
    { formula: "Na₂SiO₃", name: "Sodium Silicate", description: "Water glass, adhesive, sealant" },
    { formula: "H₂SiO₃", name: "Silicic Acid", description: "Silica gel precursor, food additive" },
  ],
  K: [
    { formula: "KCl", name: "Potassium Chloride", description: "Fertilizer, salt substitute, IV fluid" },
    { formula: "KOH", name: "Potassium Hydroxide", description: "Soap making, batteries, food processing" },
    { formula: "KNO₃", name: "Potassium Nitrate", description: "Gunpowder, fertilizer, food preservative" },
    { formula: "K₂CO₃", name: "Potassium Carbonate", description: "Glass production, soap, cocoa processing" },
    { formula: "KMnO₄", name: "Potassium Permanganate", description: "Disinfectant, water treatment, oxidizer" },
    { formula: "K₂SO₄", name: "Potassium Sulfate", description: "Fertilizer, gypsum production" },
  ],
  U: [
    { formula: "UO₂", name: "Uranium Dioxide", description: "Nuclear fuel pellets" },
    { formula: "UF₆", name: "Uranium Hexafluoride", description: "Uranium enrichment, gaseous diffusion" },
    { formula: "U₃O₈", name: "Triuranium Octoxide", description: "Yellowcake, uranium concentrate" },
    { formula: "UO₂(NO₃)₂", name: "Uranyl Nitrate", description: "Nuclear fuel reprocessing" },
    { formula: "UCl₄", name: "Uranium Tetrachloride", description: "Uranium metal production" },
  ],
};

async function fetchPubChemCompounds(elementName) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(elementName)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON?MaxRecords=10`;
  try {
    const data = await fetchWithRetry(url);
    if (!data?.PropertyTable?.Properties) return [];
    return data.PropertyTable.Properties.map((p) => ({
      formula: p.MolecularFormula,
      name: p.IUPACName || null,
      molecular_weight: p.MolecularWeight,
    }));
  } catch {
    return [];
  }
}

// Element symbols for all 118
const ALL_SYMBOLS = [
  "H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar",
  "K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr",
  "Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe",
  "Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu",
  "Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn",
  "Fr","Ra","Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr",
  "Rf","Db","Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og",
];

function main() {
  console.log("=== Compounds Data Builder ===\n");

  // Build compounds map — curated data for elements we have, empty for others
  const compounds = {};
  let curatedCount = 0;
  let emptyCount = 0;

  for (const symbol of ALL_SYMBOLS) {
    if (CURATED_COMPOUNDS[symbol]) {
      compounds[symbol] = CURATED_COMPOUNDS[symbol];
      curatedCount++;
    } else {
      compounds[symbol] = [];
      emptyCount++;
    }
  }

  console.log(`  Curated compounds for ${curatedCount} elements`);
  console.log(`  Empty compounds for ${emptyCount} elements (to be filled later)`);

  writeFileSync(
    join(FINAL_DIR, "compounds.json"),
    JSON.stringify(compounds, null, 2)
  );

  console.log("  Saved to data/final/compounds.json");
  console.log("\n=== Compounds data complete ===");
}

main();
