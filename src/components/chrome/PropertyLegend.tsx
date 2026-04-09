"use client";

import { getPropertyColorConfig, getPropertyGradientCSS } from "@/lib/chemistry/colors";
import { COLORING_MODE_LABELS } from "@/lib/types";
import type { ColoringMode } from "@/lib/types";

interface Props {
  mode: ColoringMode;
}

export function PropertyLegend({ mode }: Props) {
  const config = getPropertyColorConfig(mode);
  const gradient = getPropertyGradientCSS(mode);
  if (!config || !gradient) return null;

  const label = COLORING_MODE_LABELS[mode];

  return (
    <div className="glass flex items-center gap-3 rounded-xl px-4 py-2 animate-in">
      {/* Property name */}
      <span className="text-[10px] font-semibold text-[var(--accent-primary)] uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>

      {/* Low label */}
      <span className="text-[9px] text-[var(--text-secondary)] font-mono whitespace-nowrap">
        {config.lowLabel}
        {config.unit && (
          <span className="ml-0.5 text-[var(--text-muted)]">
            ({config.range[0]}{config.unit})
          </span>
        )}
      </span>

      {/* Gradient bar */}
      <div
        className="w-[160px] h-[8px] rounded-full shrink-0"
        style={{ background: gradient }}
      />

      {/* High label */}
      <span className="text-[9px] text-[var(--text-secondary)] font-mono whitespace-nowrap">
        {config.highLabel}
        {config.unit && (
          <span className="ml-0.5 text-[var(--text-muted)]">
            ({config.range[1]}{config.unit})
          </span>
        )}
      </span>

      {/* No data indicator */}
      <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-[var(--border-subtle)]">
        <div className="w-2 h-2 rounded-sm bg-[var(--bg-tile)] border border-[var(--border-subtle)] opacity-50" />
        <span className="text-[9px] text-[var(--text-muted)]">No data</span>
      </div>
    </div>
  );
}
