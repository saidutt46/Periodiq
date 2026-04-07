"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { CATEGORY_CSS_VAR } from "@/lib/chemistry/colors";

export function Sidebar() {
  const element = useAppStore((s) => s.selectedElement);
  const selectElement = useAppStore((s) => s.selectElement);
  const isOpen = element !== null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") selectElement(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectElement]);

  if (!element) return null;

  const catVar = CATEGORY_CSS_VAR[element.category];
  const state = (element.standard_state || "solid").toLowerCase();
  const bgClass =
    state.includes("gas") ? "gas-bg" : state.includes("liquid") ? "liquid-bg" : "solid-bg";

  return (
    <aside
      className={`
        fixed right-0 top-0 bottom-0 w-[380px] z-[100] overflow-y-auto
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(30px) saturate(1.5)",
        WebkitBackdropFilter: "blur(30px) saturate(1.5)",
        borderLeft: "1px solid var(--bg-glass-border)",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => selectElement(null)}
        className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center
                   bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]
                   hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]
                   transition-all duration-150"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="p-6 pt-7">
        {/* Hero: symbol + name */}
        <div className="flex items-end gap-4 pb-5 mb-5 border-b border-[var(--border-subtle)]">
          <div
            className="relative w-[72px] h-[72px] rounded-[14px] flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]"
            style={{ background: "var(--bg-surface)" }}
          >
            <span className="text-4xl font-black relative z-10" style={{ color: catVar }}>
              {element.symbol}
            </span>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-mono mb-0.5">
              #{element.atomic_number}
            </div>
            <h2 className="text-lg font-bold tracking-tight">{element.name}</h2>
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded mt-1.5"
              style={{
                background: `color-mix(in srgb, ${catVar} 10%, transparent)`,
                color: catVar,
                border: `1px solid color-mix(in srgb, ${catVar} 20%, transparent)`,
              }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: catVar }} />
              {element.category_label}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Atomic Mass" value={element.atomic_mass?.toFixed(4)} unit="u" />
          <StatCard label="Density" value={element.density?.toString()} unit="g/cm³" />
          <StatCard label="Melting Point" value={element.melting_point?.toString()} unit="K" />
          <StatCard label="Boiling Point" value={element.boiling_point?.toString()} unit="K" />
          <StatCard label="Electronegativity" value={element.electronegativity_pauling?.toString()} />
          <StatCard
            label="State"
            value={element.standard_state || "—"}
            style={{ textTransform: "capitalize" }}
          />
          <div className="col-span-2">
            <StatCard
              label="Electron Configuration"
              value={element.electron_configuration || "—"}
              small
            />
          </div>
        </div>

        {/* Summary */}
        {element.summary && (
          <p className="mt-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
            {element.summary.substring(0, 280)}...
          </p>
        )}

        {/* Deep Dive button */}
        <Link
          href={`/element/${element.symbol}`}
          className="flex items-center justify-center gap-2 w-full mt-5 py-2.5 rounded-[10px] text-sm font-semibold text-black no-underline
                     transition-all duration-150 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-warm))",
            boxShadow: "0 4px 16px rgba(212, 168, 67, 0.2)",
          }}
          onClick={() => selectElement(null)}
        >
          Deep Dive
          <span className="transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      </div>
    </aside>
  );
}

function StatCard({
  label,
  value,
  unit,
  small,
  style,
}: {
  label: string;
  value?: string | null;
  unit?: string;
  small?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-[10px] px-3 py-2.5 border border-[var(--border-subtle)]"
      style={{ background: "color-mix(in srgb, var(--bg-surface) 60%, transparent)" }}
    >
      <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={`font-semibold font-mono ${small ? "text-xs" : "text-[15px]"}`}
        style={style}
      >
        {value || "—"}
        {unit && value && (
          <span className="text-[10px] text-[var(--text-muted)] font-normal ml-0.5">{unit}</span>
        )}
      </div>
    </div>
  );
}
