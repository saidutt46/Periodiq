/**
 * Validate the final element dataset for completeness and correctness.
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FINAL_DIR = join(__dirname, "..", "data", "final");

// Fields that must exist for every element
const REQUIRED_FIELDS = [
  "atomic_number",
  "symbol",
  "name",
  "atomic_mass",
  "category",
  "group",
  "period",
  "block",
  "standard_state",
  "electrons_per_shell",
];

// Fields that should exist for most elements (>90%)
const EXPECTED_FIELDS = [
  "electronegativity_pauling",
  "density",
  "melting_point",
  "boiling_point",
  "electron_configuration",
  "ionization_energy",
  "atomic_radius",
  "cpk_hex_color",
  "year_discovered",
  "summary",
  "appearance",
];

function main() {
  console.log("=== Data Validation ===\n");

  const elements = JSON.parse(
    readFileSync(join(FINAL_DIR, "elements.json"), "utf8")
  );
  const compounds = JSON.parse(
    readFileSync(join(FINAL_DIR, "compounds.json"), "utf8")
  );

  let errors = 0;
  let warnings = 0;

  // Check element count
  if (elements.length !== 118) {
    console.error(`ERROR: Expected 118 elements, got ${elements.length}`);
    errors++;
  } else {
    console.log(`  ✓ 118 elements present`);
  }

  // Check required fields
  console.log("\n  Required fields:");
  for (const field of REQUIRED_FIELDS) {
    const missing = elements.filter(
      (e) => e[field] === null || e[field] === undefined || e[field] === ""
    );
    if (missing.length > 0) {
      console.error(
        `  ✗ ${field}: missing for ${missing.length} elements: ${missing.map((e) => e.symbol).join(", ")}`
      );
      errors++;
    } else {
      console.log(`  ✓ ${field}: 118/118`);
    }
  }

  // Check expected fields
  console.log("\n  Expected fields (>90% coverage):");
  for (const field of EXPECTED_FIELDS) {
    const present = elements.filter(
      (e) => e[field] !== null && e[field] !== undefined && e[field] !== ""
    );
    const pct = Math.round((present.length / 118) * 100);
    const status = pct >= 90 ? "✓" : pct >= 70 ? "⚠" : "✗";
    if (pct < 90) warnings++;
    console.log(`  ${status} ${field}: ${present.length}/118 (${pct}%)`);
  }

  // Check atomic number sequence
  const numbers = elements.map((e) => e.atomic_number);
  const expected = Array.from({ length: 118 }, (_, i) => i + 1);
  const missingNumbers = expected.filter((n) => !numbers.includes(n));
  if (missingNumbers.length > 0) {
    console.error(`\n  ✗ Missing atomic numbers: ${missingNumbers.join(", ")}`);
    errors++;
  } else {
    console.log(`\n  ✓ Atomic numbers 1-118 all present`);
  }

  // Check data types
  console.log("\n  Type checks:");
  for (const el of elements) {
    if (typeof el.atomic_number !== "number") {
      console.error(`  ✗ ${el.symbol}: atomic_number is not a number`);
      errors++;
    }
    if (typeof el.symbol !== "string" || el.symbol.length < 1 || el.symbol.length > 3) {
      console.error(`  ✗ ${el.atomic_number}: invalid symbol "${el.symbol}"`);
      errors++;
    }
    if (el.melting_point !== null && typeof el.melting_point !== "number") {
      console.error(`  ✗ ${el.symbol}: melting_point is not a number (${typeof el.melting_point})`);
      errors++;
    }
    if (el.boiling_point !== null && typeof el.boiling_point !== "number") {
      console.error(`  ✗ ${el.symbol}: boiling_point is not a number`);
      errors++;
    }
    if (!Array.isArray(el.electrons_per_shell)) {
      console.error(`  ✗ ${el.symbol}: electrons_per_shell is not an array`);
      errors++;
    }
  }
  if (errors === 0) console.log("  ✓ All type checks passed");

  // Check compounds
  console.log("\n  Compounds:");
  const symbolsWithCompounds = Object.entries(compounds).filter(
    ([, list]) => list.length > 0
  );
  console.log(`  ${symbolsWithCompounds.length}/118 elements have curated compounds`);

  // Sanity checks on values
  console.log("\n  Sanity checks:");
  const hydrogen = elements.find((e) => e.atomic_number === 1);
  if (hydrogen?.symbol !== "H") {
    console.error("  ✗ Element 1 is not Hydrogen");
    errors++;
  } else {
    console.log("  ✓ Element 1 is Hydrogen");
  }

  const oganesson = elements.find((e) => e.atomic_number === 118);
  if (oganesson?.symbol !== "Og") {
    console.error("  ✗ Element 118 is not Oganesson");
    errors++;
  } else {
    console.log("  ✓ Element 118 is Oganesson");
  }

  // Summary
  console.log(`\n${"=".repeat(40)}`);
  console.log(`  Errors:   ${errors}`);
  console.log(`  Warnings: ${warnings}`);
  console.log(`${"=".repeat(40)}`);

  if (errors > 0) {
    console.log("\n  ✗ Validation FAILED");
    process.exit(1);
  } else {
    console.log("\n  ✓ Validation PASSED");
  }
}

main();
