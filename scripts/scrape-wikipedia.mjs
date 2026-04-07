/**
 * Scrape Wikipedia for detailed element data via the MediaWiki API.
 *
 * Strategy: Fetch "Template:Infobox {element}" pages which contain the actual
 * infobox key-value data (the element articles just transclude these templates).
 *
 * Also fetches article summaries for descriptions.
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, "..", "data", "raw");

const WIKI_API = "https://en.wikipedia.org/w/api.php";

// Element names matching their Wikipedia article titles
const ELEMENTS = [
  "Hydrogen", "Helium", "Lithium", "Beryllium", "Boron", "Carbon",
  "Nitrogen", "Oxygen", "Fluorine", "Neon", "Sodium", "Magnesium",
  "Aluminium", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Argon",
  "Potassium", "Calcium", "Scandium", "Titanium", "Vanadium", "Chromium",
  "Manganese", "Iron", "Cobalt", "Nickel", "Copper", "Zinc",
  "Gallium", "Germanium", "Arsenic", "Selenium", "Bromine", "Krypton",
  "Rubidium", "Strontium", "Yttrium", "Zirconium", "Niobium", "Molybdenum",
  "Technetium", "Ruthenium", "Rhodium", "Palladium", "Silver", "Cadmium",
  "Indium", "Tin", "Antimony", "Tellurium", "Iodine", "Xenon",
  "Caesium", "Barium", "Lanthanum", "Cerium", "Praseodymium", "Neodymium",
  "Promethium", "Samarium", "Europium", "Gadolinium", "Terbium", "Dysprosium",
  "Holmium", "Erbium", "Thulium", "Ytterbium", "Lutetium", "Hafnium",
  "Tantalum", "Tungsten", "Rhenium", "Osmium", "Iridium", "Platinum",
  "Gold", "Mercury (element)", "Thallium", "Lead", "Bismuth", "Polonium",
  "Astatine", "Radon", "Francium", "Radium", "Actinium", "Thorium",
  "Protactinium", "Uranium", "Neptunium", "Plutonium", "Americium", "Curium",
  "Berkelium", "Californium", "Einsteinium", "Fermium", "Mendelevium", "Nobelium",
  "Lawrencium", "Rutherfordium", "Dubnium", "Seaborgium", "Bohrium", "Hassium",
  "Meitnerium", "Darmstadtium", "Roentgenium", "Copernicium", "Nihonium", "Flerovium",
  "Moscovium", "Livermorium", "Tennessine", "Oganesson",
];

// Template page names (lowercase for the template lookup)
const TEMPLATE_NAMES = ELEMENTS.map((name) => {
  // "Mercury (element)" -> "mercury" for the template
  const clean = name.replace(/ \(element\)/, "").toLowerCase();
  return `Template:Infobox ${clean}`;
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1));
    }
  }
}

async function fetchSummary(title) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "extracts",
    exintro: "1",
    explaintext: "1",
    format: "json",
    redirects: "1",
  });
  const data = await fetchWithRetry(`${WIKI_API}?${params}`);
  const page = Object.values(data.query.pages)[0];
  return page?.extract || null;
}

async function fetchInfoboxTemplate(templatePage) {
  const params = new URLSearchParams({
    action: "parse",
    page: templatePage,
    prop: "wikitext",
    format: "json",
  });
  const data = await fetchWithRetry(`${WIKI_API}?${params}`);
  const wikitext = data?.parse?.wikitext?.["*"] || "";
  return parseInfobox(wikitext);
}

function parseInfobox(wikitext) {
  const props = {};
  const lines = wikitext.split("\n");

  for (const line of lines) {
    const match = line.match(/^\s*\|([^=]+?)=\s*(.*)/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      value = cleanWikitext(value);
      if (value && value !== "—" && value !== "–" && value !== "N/A" && value !== "(none)") {
        props[key] = value;
      }
    }
  }

  return props;
}

function cleanWikitext(text) {
  if (!text) return "";
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2")
    .replace(/\{\{val\|([^|}]*)[^}]*\}\}/gi, "$1")
    .replace(/\{\{convert\|([^|}]*)\|([^|}]*)[^}]*\}\}/gi, "$1 $2")
    .replace(/\{\{chem2?\|([^}]*)\}\}/gi, "$1")
    .replace(/\{\{sub\|([^}]*)\}\}/gi, "₍$1₎")
    .replace(/\{\{sup\|([^}]*)\}\}/gi, "⁽$1⁾")
    .replace(/\{\{nowrap\|([^}]*)\}\}/gi, "$1")
    .replace(/\{\{([^{}|]*)\}\}/g, "$1")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeElement(raw, atomicNumber) {
  const get = (key) => raw[key] || null;
  const getFloat = (...keys) => {
    for (const key of keys) {
      const v = raw[key];
      if (!v) continue;
      // Extract first number from the value, handling negatives and decimals
      const match = v.match(/([-−]?\d+\.?\d*)/);
      if (match) {
        const num = parseFloat(match[1].replace("−", "-"));
        if (!isNaN(num)) return num;
      }
    }
    return null;
  };

  return {
    atomic_number: atomicNumber,

    // Appearance
    appearance: get("appearance"),

    // Physical
    crystal_structure: get("crystal structure"),
    speed_of_sound: getFloat("speed of sound"),
    speed_of_sound_rod: getFloat("speed of sound rod"),

    // Density
    density: getFloat("density gpcm3nrt", "density gplstp"),
    density_liquid: getFloat("density gpcm3bp"),

    // Temperatures
    melting_point_k: getFloat("melting point K"),
    melting_point_c: getFloat("melting point C"),
    boiling_point_k: getFloat("boiling point K"),
    boiling_point_c: getFloat("boiling point C"),
    triple_point_k: getFloat("triple point K"),
    triple_point_kpa: getFloat("triple point kPa"),
    critical_point_k: getFloat("critical point K"),
    critical_point_mpa: getFloat("critical point MPa"),

    // Thermal
    thermal_conductivity: getFloat("thermal conductivity"),
    thermal_expansion: getFloat("thermal expansion"),
    heat_capacity: getFloat("heat capacity"),
    heat_of_fusion: get("heat fusion"),
    heat_of_vaporization: get("heat vaporization"),

    // Mechanical
    mohs_hardness: getFloat("mohs hardness"),
    brinell_hardness: getFloat("brinell hardness"),
    vickers_hardness: getFloat("vickers hardness"),
    youngs_modulus: getFloat("Young's modulus"),
    shear_modulus: getFloat("shear modulus"),
    bulk_modulus: getFloat("bulk modulus"),
    poisson_ratio: getFloat("Poisson ratio"),

    // Electromagnetic
    magnetic_ordering: get("magnetic ordering"),
    magnetic_susceptibility: get("molar magnetic susceptibility"),
    electrical_resistivity: get("electrical resistivity"),
    electrical_resistivity_value: getFloat("electrical resistivity"),

    // Electrochemistry
    electronegativity: getFloat("electronegativity"),

    // Atomic radii
    covalent_radius: getFloat("covalent radius"),
    van_der_waals_radius: getFloat("Van der Waals radius"),

    // Ionization energies
    ionization_energy_1st: getFloat("1st ionization energy"),
    ionization_energy_2nd: getFloat("2nd ionization energy"),
    ionization_energy_3rd: getFloat("3rd ionization energy"),

    // Crystal
    lattice_constants: get("lattice constants"),
    space_group_number: get("space group number") || null,

    // Naming/discovery
    named_by: get("named by"),
    discovery_date: get("discovery date"),
    discovered_by: get("discovered by"),
    first_isolation_by: get("first isolation by"),
    first_isolation_date: get("first isolation date"),
    named_after: get("named after"),

    // Identifiers
    cas_number: get("CAS number"),

    // Raw keys for debugging
    _field_count: Object.keys(raw).length,
    _raw: raw,
  };
}

async function main() {
  console.log("=== Wikipedia Element Scraper ===\n");

  const elements = [];

  for (let i = 0; i < ELEMENTS.length; i++) {
    const name = ELEMENTS[i];
    const templatePage = TEMPLATE_NAMES[i];
    const atomicNumber = i + 1;
    process.stdout.write(`  [${atomicNumber}/118] ${name}...`);

    try {
      const [summary, infobox] = await Promise.all([
        fetchSummary(name),
        fetchInfoboxTemplate(templatePage),
      ]);

      const normalized = normalizeElement(infobox, atomicNumber);
      normalized.summary = summary;
      normalized.wikipedia_title = name;

      elements.push(normalized);
      console.log(` OK (${Object.keys(infobox).length} infobox fields)`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
      elements.push({
        atomic_number: atomicNumber,
        wikipedia_title: name,
        error: err.message,
      });
    }

    await sleep(200);
  }

  writeFileSync(
    join(RAW_DIR, "wikipedia-elements.json"),
    JSON.stringify(elements, null, 2)
  );

  const successful = elements.filter((e) => !e.error).length;
  const withFields = elements.filter((e) => e._field_count > 0).length;
  console.log(`\n  Saved ${successful}/118 elements (${withFields} with infobox data)`);
  console.log("\n=== Wikipedia scraping complete ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
