/**
 * Scrape PubChem REST API for base element dataset.
 * Source: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
 *
 * This gives us a clean structured dataset for all 118 elements with:
 * - Atomic number, symbol, name, atomic mass
 * - CPK hex color, electron configuration
 * - Electronegativity, atomic radius, ionization energy, electron affinity
 * - Oxidation states, standard state, bonding type, melting/boiling point
 * - Density, group/period, year discovered
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, "..", "data", "raw");

const PUBCHEM_URL =
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON";

// Also fetch detailed element pages for descriptions and additional data
const ELEMENT_DETAIL_URL =
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/element";

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  Rate limited, waiting ${delay * (i + 1)}ms...`);
        await sleep(delay * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries}: ${err.message}`);
      await sleep(delay);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeElement(raw) {
  return {
    atomic_number: raw.AtomicNumber,
    symbol: raw.Symbol,
    name: raw.Name,
    atomic_mass: raw.AtomicMass,
    cpk_hex_color: raw.CPKHexColor || null,
    electron_configuration: raw.ElectronConfiguration || null,
    electronegativity: raw.Electronegativity ?? null,
    atomic_radius: raw.AtomicRadius ?? null,
    ionization_energy: raw.IonizationEnergy ?? null,
    electron_affinity: raw.ElectronAffinity ?? null,
    oxidation_states: raw.OxidationStates || null,
    standard_state: raw.StandardState || null,
    melting_point: raw.MeltingPoint ?? null,
    boiling_point: raw.BoilingPoint ?? null,
    density: raw.Density ?? null,
    group_block: raw.GroupBlock || null,
    year_discovered: raw.YearDiscovered || null,
  };
}

async function main() {
  console.log("=== PubChem Periodic Table Scraper ===\n");

  // Step 1: Fetch the main periodic table dataset
  console.log("Fetching periodic table data from PubChem...");
  const data = await fetchWithRetry(PUBCHEM_URL);

  const rawElements = data.Table.Row.map((row) => {
    const cells = row.Cell;
    return {
      AtomicNumber: parseInt(cells[0], 10),
      Symbol: cells[1],
      Name: cells[2],
      AtomicMass: parseFloat(cells[3]) || null,
      CPKHexColor: cells[4] || null,
      ElectronConfiguration: cells[5] || null,
      Electronegativity: parseFloat(cells[6]) || null,
      AtomicRadius: parseFloat(cells[7]) || null,
      IonizationEnergy: parseFloat(cells[8]) || null,
      ElectronAffinity: parseFloat(cells[9]) || null,
      OxidationStates: cells[10] || null,
      StandardState: cells[11] || null,
      MeltingPoint: parseFloat(cells[12]) || null,
      BoilingPoint: parseFloat(cells[13]) || null,
      Density: parseFloat(cells[14]) || null,
      GroupBlock: cells[15] || null,
      YearDiscovered: cells[16] || null,
    };
  });

  console.log(`  Found ${rawElements.length} elements`);

  // Save raw response
  writeFileSync(
    join(RAW_DIR, "pubchem-raw.json"),
    JSON.stringify(data, null, 2)
  );
  console.log("  Saved raw response to data/raw/pubchem-raw.json");

  // Normalize
  const elements = rawElements.map(normalizeElement);

  // Save normalized
  writeFileSync(
    join(RAW_DIR, "pubchem-elements.json"),
    JSON.stringify(elements, null, 2)
  );
  console.log(`  Saved ${elements.length} normalized elements to data/raw/pubchem-elements.json`);

  // Step 2: Fetch additional detail for each element (descriptions, uses, etc.)
  console.log("\nFetching element details from PubChem PUG View...");
  const details = {};

  for (const el of elements) {
    const num = el.atomic_number;
    const url = `${ELEMENT_DETAIL_URL}/${num}/JSON`;
    process.stdout.write(`  [${num}/118] ${el.name}...`);

    try {
      const detail = await fetchWithRetry(url);
      const record = detail?.Record;

      // Extract sections we care about
      const sections = record?.Section || [];
      const extracted = { atomic_number: num };

      for (const section of sections) {
        const name = section.TOCHeading;

        if (name === "Experimental Properties") {
          extracted.experimental_properties = extractProperties(section);
        } else if (name === "Computed Properties") {
          extracted.computed_properties = extractProperties(section);
        } else if (name === "Summary") {
          extracted.summary = extractTextContent(section);
        } else if (name === "Names and Identifiers") {
          extracted.identifiers = extractTextContent(section);
        }
      }

      details[num] = extracted;
      console.log(" OK");
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
      details[num] = { atomic_number: num, error: err.message };
    }

    // Be nice to the API
    await sleep(300);
  }

  writeFileSync(
    join(RAW_DIR, "pubchem-details.json"),
    JSON.stringify(details, null, 2)
  );
  console.log(`\n  Saved element details to data/raw/pubchem-details.json`);

  console.log("\n=== PubChem scraping complete ===");
}

function extractProperties(section) {
  const props = {};
  const subsections = section.Section || [];
  for (const sub of subsections) {
    const key = sub.TOCHeading;
    const info = sub.Information || [];
    if (info.length > 0) {
      const val = info[0]?.Value;
      if (val?.StringWithMarkup) {
        props[key] = val.StringWithMarkup.map((s) => s.String).join(" ");
      } else if (val?.Number) {
        props[key] = val.Number[0];
        if (val.Unit) props[key + "_unit"] = val.Unit;
      }
    }
  }
  return props;
}

function extractTextContent(section) {
  const texts = [];
  const info = section.Information || [];
  for (const item of info) {
    const val = item?.Value?.StringWithMarkup;
    if (val) {
      texts.push(...val.map((s) => s.String));
    }
  }
  // Also check subsections
  const subs = section.Section || [];
  for (const sub of subs) {
    const subTexts = extractTextContent(sub);
    if (subTexts.length) texts.push(...subTexts);
  }
  return texts;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
