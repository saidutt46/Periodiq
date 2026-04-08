"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Element, Compound } from "@/lib/types";
import { getCategoryCssVar } from "@/lib/data";
import { CATEGORY_CSS_VAR } from "@/lib/chemistry/colors";
import { SHELL_NAMES } from "./AtomVisualization";
import styles from "./DetailPage.module.css";

/* Lazy-load the 3D atom to avoid SSR issues */
const AtomVisualization = dynamic(() => import("./AtomVisualization"), {
  ssr: false,
  loading: () => (
    <div className={styles.atomCanvas}>
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-dim)",
        fontSize: "13px",
      }}>
        Loading visualization...
      </div>
    </div>
  ),
});

/* ─── types ─── */
type Tab = "overview" | "properties" | "electrons" | "compounds" | "history";

interface ElementDetailClientProps {
  element: Element;
  compounds: Compound[];
  prevElement: { symbol: string; name: string } | null;
  nextElement: { symbol: string; name: string } | null;
}

/* ─── helpers ─── */
const SHELL_LABELS = ["1s", "2s2p", "3s3p3d", "4s4p4d4f", "5s5p5d5f", "6s6p6d", "7s7p"];

function formatElectronConfig(config: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const segments = config.split(/\s+/);
  segments.forEach((seg, i) => {
    const coreMatch = seg.match(/^(\[.+?\])(.*)$/);
    if (coreMatch) {
      parts.push(<span key={`core-${i}`} style={{ color: "var(--text-muted)" }}>{coreMatch[1]}</span>);
      if (coreMatch[2]) {
        parts.push(formatOrbital(coreMatch[2], `orb-${i}`));
      }
    } else {
      parts.push(formatOrbital(seg, `orb-${i}`));
    }
    if (i < segments.length - 1) parts.push(" ");
  });
  return parts;
}

function formatOrbital(orbital: string, key: string): React.ReactNode {
  const match = orbital.match(/^(\d+[spdf])(\d+)$/);
  if (match) {
    return (
      <span key={key}>
        {match[1]}<sup>{match[2]}</sup>
      </span>
    );
  }
  return <span key={key}>{orbital}</span>;
}

function kelvinToCelsius(k: number): string {
  return `${Math.round(k - 273.15)} °C`;
}

function formatValue(val: string | number | null | undefined, fallback = "—"): string {
  if (val == null || val === "") return fallback;
  return String(val);
}

/* ─── Main component ─── */
export default function ElementDetailClient({
  element: el,
  compounds,
  prevElement,
  nextElement,
}: ElementDetailClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const catColor = CATEGORY_CSS_VAR[el.category] || "var(--cat-unknown)";
  const cssVarName = getCategoryCssVar(el.category);

  // Get the actual hex color for R3F (needs raw hex, not CSS var)
  const categoryHex = useMemo(() => {
    const colorMap: Record<string, string> = {
      "alkali-metal": "#ff4d6a",
      "alkaline-earth-metal": "#ff9f43",
      "transition-metal": "#4facfe",
      "post-transition-metal": "#5ab4ac",
      "metalloid": "#ffc048",
      "nonmetal": "#2ed573",
      "halogen": "#a78bfa",
      "noble-gas": "#f472b6",
      "lanthanide": "#22d3ee",
      "actinide": "#fb923c",
      "unknown": "#555568",
    };
    return colorMap[el.category] || "#555568";
  }, [el.category]);

  const oxStates = el.oxidation_states?.length
    ? el.oxidation_states.map((s) => (s > 0 ? `+${s}` : `${s}`)).join(", ")
    : null;

  // Shell bar max electron count (for scaling)
  const maxShellElectrons = Math.max(...(el.electrons_per_shell || [1]));

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "properties", label: "Properties" },
    { id: "electrons", label: "Electrons" },
    { id: "compounds", label: "Compounds" },
    { id: "history", label: "History" },
  ];

  return (
    <div
      className={styles.detailPage}
      style={{ "--cat-color": catColor, "--viz-glow": categoryHex } as React.CSSProperties}
    >
      {/* ─── Top bar ─── */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Table
        </Link>

        <div className={styles.topBarCenter}>
          <span className={styles.topBarNumber}>#{el.atomic_number}</span>
          <span className={styles.topBarElement}>{el.name}</span>
        </div>

        <div className={styles.topBarRight}>
          {prevElement ? (
            <Link
              href={`/element/${prevElement.symbol}`}
              className={styles.navArrow}
              title={`Previous: ${prevElement.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          ) : (
            <span className={styles.navArrow} style={{ opacity: 0.3, cursor: "default" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          )}

          {nextElement ? (
            <Link
              href={`/element/${nextElement.symbol}`}
              className={styles.navArrow}
              title={`Next: ${nextElement.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <span className={styles.navArrow} style={{ opacity: 0.3, cursor: "default" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* ─── Left: 3D Visualization ─── */}
      <div className={styles.vizPanel}>
        {/* Floating data labels */}
        <div className={`${styles.vizLabel} ${styles.vizLabelMass}`}>
          <div className={styles.vizLabelTitle}>Atomic Mass</div>
          <div className={styles.vizLabelValue}>
            {el.atomic_mass?.toFixed(3)} <span className={styles.vizLabelUnit}>u</span>
          </div>
        </div>

        <div className={`${styles.vizLabel} ${styles.vizLabelConfig}`}>
          <div className={styles.vizLabelTitle}>Configuration</div>
          <div className={styles.vizLabelValue} style={{ fontSize: 14 }}>
            {el.electron_configuration ? formatElectronConfig(el.electron_configuration) : "—"}
          </div>
        </div>

        <div className={`${styles.vizLabel} ${styles.vizLabelState}`}>
          <div className={styles.vizLabelTitle}>State</div>
          <div className={styles.vizLabelValue} style={{ fontSize: 14 }}>
            {el.standard_state || "Unknown"}
          </div>
        </div>

        {/* 3D Atom Canvas */}
        <div className={styles.atomCanvas}>
          <AtomVisualization
            electronsPerShell={el.electrons_per_shell || []}
            categoryColor={categoryHex}
            atomicNumber={el.atomic_number}
            symbol={el.symbol}
          />
        </div>

        {/* Shell electron count bar */}
        {el.electrons_per_shell && el.electrons_per_shell.length > 0 && (
          <div className={styles.shellBar}>
            {el.electrons_per_shell.map((count, i) => (
              <div key={i} className={styles.shellItem}>
                <div className={styles.shellCount}>{count}</div>
                <div
                  className={styles.shellBarFill}
                  style={{
                    height: `${(count / maxShellElectrons) * 80}px`,
                    background: `linear-gradient(180deg, ${categoryHex}, color-mix(in srgb, ${categoryHex} 40%, transparent))`,
                  }}
                />
                <div className={styles.shellLabel}>{SHELL_NAMES[i] || `${i + 1}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Right: Data Panel ─── */}
      <div className={styles.dataPanel}>
        {/* Element header */}
        <div className={styles.elementHeader}>
          <div className={styles.elementTitleRow}>
            <span className={styles.elementSymbolLarge} style={{ color: catColor }}>
              {el.symbol}
            </span>
            <div className={styles.elementNameGroup}>
              <h1>{el.name}</h1>
              <div className={styles.elementSubtitle}>
                <span>#{el.atomic_number}</span>
                <span className={styles.sep} />
                <span>Period {el.period}</span>
                <span className={styles.sep} />
                <span>Group {el.group || "—"}</span>
                <span className={styles.sep} />
                <span>Block {el.block}</span>
              </div>
            </div>
          </div>
          <div
            className={styles.categoryPill}
            style={{
              background: `color-mix(in srgb, ${catColor} 10%, transparent)`,
              color: catColor,
              border: `1px solid color-mix(in srgb, ${catColor} 20%, transparent)`,
            }}
          >
            <span className={styles.categoryDot} style={{ background: catColor }} />
            {el.category_label}
          </div>
        </div>

        {/* Quick stats */}
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Atomic Mass</div>
            <div className={styles.statValue}>
              {el.atomic_mass?.toFixed(3)}<span className={styles.statUnit}>u</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Density</div>
            <div className={styles.statValue}>
              {el.density != null ? (
                <>{el.density < 0.01 ? el.density.toExponential(2) : el.density}<span className={styles.statUnit}>g/cm&sup3;</span></>
              ) : "—"}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Melting Point</div>
            <div className={styles.statValue}>
              {el.melting_point != null ? (
                <>{el.melting_point}<span className={styles.statUnit}>K</span></>
              ) : "—"}
            </div>
            {el.melting_point != null && (
              <div className={styles.statSecondary}>{kelvinToCelsius(el.melting_point)}</div>
            )}
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Boiling Point</div>
            <div className={styles.statValue}>
              {el.boiling_point != null ? (
                <>{el.boiling_point}<span className={styles.statUnit}>K</span></>
              ) : "—"}
            </div>
            {el.boiling_point != null && (
              <div className={styles.statSecondary}>{kelvinToCelsius(el.boiling_point)}</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabNav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent} key={activeTab}>
          {activeTab === "overview" && <OverviewTab element={el} />}
          {activeTab === "properties" && <PropertiesTab element={el} />}
          {activeTab === "electrons" && <ElectronsTab element={el} catColor={categoryHex} />}
          {activeTab === "compounds" && <CompoundsTab compounds={compounds} catColor={catColor} />}
          {activeTab === "history" && <HistoryTab element={el} catColor={categoryHex} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ element: el }: { element: Element }) {
  return (
    <>
      {el.summary && (
        <div className={styles.overviewDescription}>
          <span className={styles.firstLetter}>{el.summary.charAt(0)}</span>
          {el.summary.slice(1).split("\n")[0]}
        </div>
      )}

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Appearance & Classification</div>
        <div className={styles.propGrid}>
          <PropRow label="Appearance" value={el.appearance} />
          <PropRow label="State at STP" value={el.standard_state || null} />
          <PropRow label="Crystal Structure" value={el.crystal_structure} />
          <PropRow label="Magnetic Ordering" value={el.magnetic_ordering} />
          <PropRow label="Metallicity" value={el.metallicity} />
          {el.is_radioactive && <PropRow label="Radioactive" value="Yes" />}
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Key Properties</div>
        <div className={styles.propGrid}>
          <PropRow label="Electronegativity" value={el.electronegativity_pauling} unit="Pauling" />
          <PropRow label="Electron Affinity" value={el.electron_affinity} unit={el.electron_affinity_unit || "kJ/mol"} />
          <PropRow
            label="Oxidation States"
            value={el.oxidation_states?.length ? el.oxidation_states.map((s) => (s > 0 ? `+${s}` : `${s}`)).join(", ") : null}
          />
          <PropRow label="Ionization Energy" value={el.ionization_energy} unit={el.ionization_energy_unit || "eV"} />
        </div>
      </div>
    </>
  );
}

/* ─── Properties Tab ─── */
function PropertiesTab({ element: el }: { element: Element }) {
  return (
    <>
      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Physical Properties</div>
        <div className={styles.propGrid}>
          <PropRow label="Density" value={el.density} unit={el.density_unit || "g/cm³"} />
          <PropRow label="Melting Point" value={el.melting_point} unit="K" />
          <PropRow label="Boiling Point" value={el.boiling_point} unit="K" />
          <PropRow label="Speed of Sound" value={el.speed_of_sound} unit="m/s" />
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Chemical Properties</div>
        <div className={styles.propGrid}>
          <PropRow label="Electronegativity" value={el.electronegativity_pauling} unit="Pauling" />
          <PropRow label="Electron Affinity" value={el.electron_affinity} unit={el.electron_affinity_unit || "kJ/mol"} />
          <PropRow
            label="Oxidation States"
            value={el.oxidation_states?.length ? el.oxidation_states.map((s) => (s > 0 ? `+${s}` : `${s}`)).join(", ") : null}
          />
          <PropRow label="Ionization Energy" value={el.ionization_energy} unit={el.ionization_energy_unit || "eV"} />
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Thermodynamic</div>
        <div className={styles.propGrid}>
          <PropRow label="Heat of Fusion" value={el.heat_of_fusion} unit="kJ/mol" />
          <PropRow label="Heat of Vaporization" value={el.heat_of_vaporization} unit="kJ/mol" />
          <PropRow label="Specific Heat" value={el.specific_heat_capacity} unit="J/(mol·K)" />
          <PropRow label="Thermal Conductivity" value={el.thermal_conductivity} unit="W/(m·K)" />
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Mechanical</div>
        <div className={styles.propGrid}>
          <PropRow label="Young's Modulus" value={el.youngs_modulus} unit="GPa" />
          <PropRow label="Shear Modulus" value={el.shear_modulus} unit="GPa" />
          <PropRow label="Bulk Modulus" value={el.bulk_modulus} unit="GPa" />
          <PropRow label="Poisson Ratio" value={el.poisson_ratio} />
          <PropRow label="Mohs Hardness" value={el.mohs_hardness} />
          <PropRow label="Vickers Hardness" value={el.vickers_hardness} unit="MPa" />
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Atomic Radii</div>
        <div className={styles.propGrid}>
          <PropRow label="Atomic (empirical)" value={el.atomic_radius} unit={el.atomic_radius_unit || "pm"} />
          <PropRow label="Covalent" value={el.covalent_radius} unit="pm" />
          <PropRow label="Van der Waals" value={el.van_der_waals_radius} unit="pm" />
        </div>
      </div>

      <div className={styles.propSection}>
        <div className={styles.propSectionTitle}>Electromagnetic</div>
        <div className={styles.propGrid}>
          <PropRow label="Magnetic Ordering" value={el.magnetic_ordering} />
          <PropRow label="Electrical Resistivity" value={el.electrical_resistivity} unit="Ω·m" />
        </div>
      </div>
    </>
  );
}

/* ─── Electrons Tab ─── */
function ElectronsTab({ element: el, catColor }: { element: Element; catColor: string }) {
  const maxIE = el.ionization_energies?.length
    ? Math.max(...el.ionization_energies)
    : el.ionization_energy || 1;

  return (
    <>
      {/* Electron configuration display */}
      {el.electron_configuration && (
        <div className={styles.electronConfigDisplay}>
          {formatElectronConfig(el.electron_configuration)}
        </div>
      )}

      {/* Shell visualization */}
      {el.electrons_per_shell && el.electrons_per_shell.length > 0 && (
        <div className={styles.shellViz}>
          {el.electrons_per_shell.map((count, i) => (
            <ShellCircleItem key={i} index={i} count={count} catColor={catColor} isLast={i === el.electrons_per_shell.length - 1} />
          ))}
        </div>
      )}

      {/* Ionization energies chart */}
      {el.ionization_energies && el.ionization_energies.length > 0 ? (
        <div className={styles.ionizationChart}>
          <div className={styles.ionizationChartTitle}>Ionization Energies (eV)</div>
          <div className={styles.ionizationBars}>
            {el.ionization_energies.slice(0, 8).map((energy, i) => (
              <div key={i} className={styles.ionizationBar}>
                <div className={styles.ionizationBarValue}>{energy.toFixed(1)}</div>
                <div
                  className={styles.ionizationBarFill}
                  style={{
                    height: `${(energy / maxIE) * 90}px`,
                    background: `linear-gradient(180deg, ${catColor}, color-mix(in srgb, ${catColor} 30%, transparent))`,
                  }}
                />
                <div className={styles.ionizationBarLabel}>{ordinal(i + 1)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : el.ionization_energy ? (
        <div className={styles.ionizationChart}>
          <div className={styles.ionizationChartTitle}>First Ionization Energy</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, textAlign: "center", padding: 16, color: "var(--text-primary)" }}>
            {el.ionization_energy} <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{el.ionization_energy_unit || "eV"}</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ShellCircleItem({ index, count, catColor, isLast }: { index: number; count: number; catColor: string; isLast: boolean }) {
  return (
    <>
      <div className={styles.shellCircle}>
        <div
          className={styles.shellRing}
          style={{
            borderColor: `color-mix(in srgb, ${catColor} 30%, transparent)`,
            color: catColor,
          }}
        >
          {count}
        </div>
        <div className={styles.shellRingLabel}>
          {SHELL_NAMES[index]} ({SHELL_LABELS[index] || `${index + 1}`})
        </div>
      </div>
      {!isLast && <span className={styles.shellArrow}>&rarr;</span>}
    </>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/* ─── Compounds Tab ─── */
function CompoundsTab({ compounds, catColor }: { compounds: Compound[]; catColor: string }) {
  if (!compounds || compounds.length === 0) {
    return <div className={styles.emptyState}>No compound data available for this element.</div>;
  }

  return (
    <>
      {compounds.map((c, i) => (
        <div key={i} className={styles.compoundCard}>
          <div className={styles.compoundFormula} style={{ color: catColor }}>
            {c.formula}
          </div>
          <div className={styles.compoundInfo}>
            <div className={styles.compoundName}>{c.name}</div>
            <div className={styles.compoundDesc}>{c.description}</div>
          </div>
          <span className={styles.compoundArrow}>&rsaquo;</span>
        </div>
      ))}

      <button className={styles.exploreMoreBtn}>
        Explore more compounds via PubChem
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </button>
    </>
  );
}

/* ─── History Tab ─── */
function HistoryTab({ element: el, catColor }: { element: Element; catColor: string }) {
  const hasDiscovery = el.year_discovered || el.discovered_by;

  return (
    <>
      <div className={styles.timeline}>
        {el.year_discovered && (
          <div className={styles.timelineItem} style={{ "--cat-color": catColor } as React.CSSProperties}>
            <div className={styles.timelineYear}>{el.year_discovered}</div>
            <div className={styles.timelineTitle}>Discovery</div>
            <div className={styles.timelineText}>
              {el.discovered_by
                ? `Discovered by ${el.discovered_by}.`
                : `First known use dates to ${el.year_discovered}.`}
            </div>
          </div>
        )}
      </div>

      {el.name_origin && (
        <div className={`${styles.propSection} ${styles.etymologySection}`}>
          <div className={styles.propSectionTitle}>Etymology</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {el.name_origin}
          </div>
        </div>
      )}

      {!hasDiscovery && !el.name_origin && (
        <div className={styles.emptyState}>No historical data available for this element.</div>
      )}

      {/* Additional info */}
      <div className={styles.propSection} style={{ marginTop: 24 }}>
        <div className={styles.propSectionTitle}>Identifiers</div>
        <div className={styles.propGrid}>
          <PropRow label="CAS Number" value={el.cas_number} />
          <PropRow label="Named By" value={el.named_by} />
        </div>
      </div>
    </>
  );
}

/* ─── Reusable property row ─── */
function PropRow({
  label,
  value,
  unit,
  full,
}: {
  label: string;
  value?: string | number | null;
  unit?: string;
  full?: boolean;
}) {
  const display = formatValue(value);
  const isMissing = display === "—";

  return (
    <div className={`${styles.propRow} ${full ? styles.propRowFull : ""}`} style={isMissing ? { opacity: 0.4 } : undefined}>
      <span className={styles.propRowLabel}>{label}</span>
      <span className={styles.propRowValue}>
        {display}
        {unit && !isMissing && <span className={styles.propUnit}> {unit}</span>}
      </span>
    </div>
  );
}
