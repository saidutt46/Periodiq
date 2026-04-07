"use client";

import { useAppStore } from "@/lib/store";
import type { ColoringMode } from "@/lib/types";
import { COLORING_MODE_LABELS } from "@/lib/types";

const MODES = Object.entries(COLORING_MODE_LABELS) as [ColoringMode, string][];

// Group property modes for visual separation
const DIVIDER_AFTER: ColoringMode[] = ["state", "boiling-point"];

export function PropertyBar() {
  const coloringMode = useAppStore((s) => s.coloringMode);
  const setColoringMode = useAppStore((s) => s.setColoringMode);

  return (
    <div className="glass fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0 rounded-[14px] p-1">
      {MODES.map(([mode, label]) => (
        <span key={mode} className="contents">
          <button
            onClick={() => setColoringMode(mode)}
            className={`
              px-3 py-1.5 rounded-[10px] text-[11px] font-medium whitespace-nowrap
              transition-all duration-150
              ${
                coloringMode === mode
                  ? "text-[var(--accent-primary)] bg-[rgba(212,168,67,0.1)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }
            `}
          >
            {label}
          </button>
          {DIVIDER_AFTER.includes(mode) && (
            <div className="w-px h-4 bg-[var(--border-subtle)] mx-0.5" />
          )}
        </span>
      ))}
    </div>
  );
}
