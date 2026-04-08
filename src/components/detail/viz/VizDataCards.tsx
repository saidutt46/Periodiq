"use client";

import type { Element } from "@/lib/types";
import styles from "../DetailPage.module.css";

const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"];

function formatElectronConfig(config: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const segments = config.split(/\s+/);
  segments.forEach((seg, i) => {
    const coreMatch = seg.match(/^(\[.+?\])(.*)$/);
    if (coreMatch) {
      parts.push(<span key={`core-${i}`} style={{ opacity: 0.5 }}>{coreMatch[1]}</span>);
      if (coreMatch[2]) {
        const match = coreMatch[2].match(/^(\d+[spdf])(\d+)$/);
        if (match) parts.push(<span key={`orb-${i}`}>{match[1]}<sup>{match[2]}</sup></span>);
        else parts.push(<span key={`orb-${i}`}>{coreMatch[2]}</span>);
      }
    } else {
      const match = seg.match(/^(\d+[spdf])(\d+)$/);
      if (match) parts.push(<span key={`orb-${i}`}>{match[1]}<sup>{match[2]}</sup></span>);
      else parts.push(<span key={`orb-${i}`}>{seg}</span>);
    }
    if (i < segments.length - 1) parts.push(" ");
  });
  return parts;
}

interface VizDataCardsProps {
  element: Element;
  categoryHex: string;
}

export default function VizDataCards({ element: el, categoryHex }: VizDataCardsProps) {
  const maxShellElectrons = Math.max(...(el.electrons_per_shell || [1]));

  return (
    <div className={styles.vizBottomInfo}>
      {/* Inline text stats */}
      <div className={styles.vizInlineStats}>
        <div className={styles.vizInlineStat}>
          <span className={styles.vizInlineLabel}>Mass</span>
          <span className={styles.vizInlineValue}>
            {el.atomic_mass?.toFixed(3)} <span className={styles.vizInlineUnit}>u</span>
          </span>
        </div>
        <div className={styles.vizInlineDivider} />
        <div className={styles.vizInlineStat}>
          <span className={styles.vizInlineLabel}>State</span>
          <span className={styles.vizInlineValue}>{el.standard_state || "—"}</span>
        </div>
        <div className={styles.vizInlineDivider} />
        <div className={styles.vizInlineStat}>
          <span className={styles.vizInlineLabel}>Config</span>
          <span className={styles.vizInlineValue}>
            {el.electron_configuration ? formatElectronConfig(el.electron_configuration) : "—"}
          </span>
        </div>
      </div>

      {/* Electrons per shell bar */}
      {el.electrons_per_shell && el.electrons_per_shell.length > 0 && (
        <div className={styles.vizShellBar}>
          {el.electrons_per_shell.map((count, i) => (
            <div key={i} className={styles.shellItem}>
              <div className={styles.shellCount}>{count}</div>
              <div
                className={styles.shellBarFill}
                style={{
                  height: `${(count / maxShellElectrons) * 36}px`,
                  background: `linear-gradient(180deg, ${categoryHex}, color-mix(in srgb, ${categoryHex} 40%, transparent))`,
                }}
              />
              <div className={styles.shellLabel}>{SHELL_NAMES[i] || `${i + 1}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
