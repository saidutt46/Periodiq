"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORY_CSS_VAR } from "@/lib/chemistry/colors";
import { getElementById } from "@/lib/data";
import type { Element } from "@/lib/types";
import styles from "./Sidebar.module.css";

/** Format electron configuration with superscripts */
function formatElectronConfig(config: string): React.ReactNode[] {
  // Match patterns like "4s2", "3d6", "3p1" and wrap the numbers after letters as superscripts
  const parts: React.ReactNode[] = [];
  const regex = /(\[?\w+\]?)(\d+)([spdf])(\d+)/g;

  // Simpler approach: split on spaces and format each orbital
  const segments = config.split(/\s+/);
  segments.forEach((seg, i) => {
    // Match core like [Ar] or [Xe]
    const coreMatch = seg.match(/^(\[.+?\])(.*)$/);
    if (coreMatch) {
      parts.push(<span key={`core-${i}`} className={styles.configCore}>{coreMatch[1]}</span>);
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
  // Match "3d6" → "3d" + superscript "6"
  const match = orbital.match(/^(\d+[spdf])(\d+)$/);
  if (match) {
    return (
      <span key={key}>
        {match[1]}<sup className={styles.configSup}>{match[2]}</sup>
      </span>
    );
  }
  return <span key={key}>{orbital}</span>;
}

/** Truncate text at sentence boundary */
function truncateAtSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.substring(0, maxLen);
  const lastPeriod = truncated.lastIndexOf(". ");
  if (lastPeriod > maxLen * 0.5) {
    return truncated.substring(0, lastPeriod + 1);
  }
  return truncated.trimEnd() + "...";
}

export function Sidebar() {
  const element = useAppStore((s) => s.selectedElement);
  const selectElement = useAppStore((s) => s.selectElement);
  const [isVisible, setIsVisible] = useState(false);
  const [displayElement, setDisplayElement] = useState<Element | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle open/close animation
  useEffect(() => {
    if (element) {
      if (displayElement && displayElement.atomic_number !== element.atomic_number) {
        // Switching elements — crossfade
        setIsTransitioning(true);
        const timeout = setTimeout(() => {
          setDisplayElement(element);
          setIsTransitioning(false);
        }, 150);
        return () => clearTimeout(timeout);
      } else {
        setDisplayElement(element);
      }
      // Delay to trigger CSS transition
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setDisplayElement(null), 300);
      return () => clearTimeout(timeout);
    }
  }, [element]);

  // Escape to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") selectElement(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectElement]);

  // Click outside to close
  useEffect(() => {
    if (!element) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Don't close if clicking an element tile
        const target = e.target as HTMLElement;
        if (target.closest("[data-atomic-number]")) return;
        selectElement(null);
      }
    }
    // Delay to avoid closing immediately from the click that opened it
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", onClick);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", onClick);
    };
  }, [element, selectElement]);

  if (!displayElement) return null;

  const el = displayElement;
  const catVar = CATEGORY_CSS_VAR[el.category];
  const state = (el.standard_state || "").toLowerCase();
  const stateEffect = state.includes("gas") ? "gas" : state.includes("liquid") ? "liquid" : "solid";

  // Prev/next navigation
  const prevElement = el.atomic_number > 1 ? getElementById(el.atomic_number - 1) : null;
  const nextElement = el.atomic_number < 118 ? getElementById(el.atomic_number + 1) : null;

  // Format oxidation states
  const oxStates = el.oxidation_states?.length
    ? el.oxidation_states.map((s) => (s > 0 ? `+${s}` : `${s}`)).join(", ")
    : null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.backdrop} ${isVisible ? styles.backdropVisible : ""}`}
        onClick={() => selectElement(null)}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={`${styles.panel} ${isVisible ? styles.panelVisible : ""}`}
      >
        {/* Header controls */}
        <div className={styles.headerControls}>
          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={() => prevElement && selectElement(prevElement)}
              disabled={!prevElement}
              title={prevElement ? `Previous: ${prevElement.name}` : undefined}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              className={styles.navBtn}
              onClick={() => nextElement && selectElement(nextElement)}
              disabled={!nextElement}
              title={nextElement ? `Next: ${nextElement.name}` : undefined}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <button
            onClick={() => selectElement(null)}
            className={styles.closeBtn}
            title="Close (Esc)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content with crossfade */}
        <div className={`${styles.content} ${isTransitioning ? styles.contentFading : ""}`}>
          {/* Hero: symbol + name */}
          <div className={styles.hero}>
            <div className={styles.symbolBox} style={{ "--cat-color": catVar } as React.CSSProperties}>
              {/* Living background effect */}
              <div className={`${styles.symbolBg} ${styles[`symbolBg_${stateEffect}`]}`} style={{ "--cat-color": catVar } as React.CSSProperties} />
              {stateEffect === "gas" && (
                <div className={styles.symbolParticles}>
                  <span /><span /><span /><span /><span /><span />
                </div>
              )}
              <span className={styles.symbolText} style={{ color: catVar }}>
                {el.symbol}
              </span>
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.atomicNum}>#{el.atomic_number}</div>
              <h2 className={styles.elementName}>{el.name}</h2>
              <span className={styles.categoryBadge} style={{
                background: `color-mix(in srgb, ${catVar} 12%, transparent)`,
                color: catVar,
                borderColor: `color-mix(in srgb, ${catVar} 25%, transparent)`,
              }}>
                <span className={styles.badgeDot} style={{ background: catVar }} />
                {el.category_label}
              </span>
            </div>
          </div>

          {/* Appearance */}
          {el.appearance && (
            <div className={styles.appearance}>
              {el.appearance}
            </div>
          )}

          {/* Key stats — compact 2x3 grid */}
          <div className={styles.statsGrid}>
            <StatCard label="Mass" value={el.atomic_mass?.toFixed(3)} unit="u" />
            <StatCard label="Density" value={el.density != null ? (el.density < 0.01 ? el.density.toExponential(2) : el.density.toString()) : null} unit="g/cm³" />
            <StatCard label="M.P." value={el.melting_point?.toString()} unit="K" />
            <StatCard label="B.P." value={el.boiling_point?.toString()} unit="K" />
            <StatCard label="EN" value={el.electronegativity_pauling?.toString()} unit="Pauling" />
            <StatCard label="State" value={el.standard_state || null} />
          </div>

          {/* Electron configuration — clean inline */}
          {el.electron_configuration && (
            <div className={styles.electronConfig}>
              <div className={styles.electronValue}>
                {formatElectronConfig(el.electron_configuration)}
              </div>
              {el.electrons_per_shell?.length > 0 && (
                <div className={styles.shellDisplay}>
                  {el.electrons_per_shell.map((count, i) => (
                    <span key={i} className={styles.shellBadge} style={{ "--cat-color": catVar } as React.CSSProperties}>
                      {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Summary — first sentence only for sidebar */}
          {el.summary && (
            <p className={styles.summary}>
              {truncateAtSentence(el.summary, 200)}
            </p>
          )}

          {/* Deep Dive button */}
          <Link
            href={`/element/${el.symbol}`}
            className={styles.deepDiveBtn}
            onClick={() => selectElement(null)}
          >
            <span>Deep Dive</span>
            <span className={styles.deepDiveArrow}>&rarr;</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value?: string | null;
  unit?: string;
}) {
  const isMissing = !value;
  return (
    <div className={`${styles.statCard} ${isMissing ? styles.statCardMissing : ""}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>
        {value || "N/A"}
        {unit && value && (
          <span className={styles.statUnit}>{unit}</span>
        )}
      </div>
    </div>
  );
}
