"use client";

import { memo, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { getElementColor, CATEGORY_CSS_VAR } from "@/lib/chemistry/colors";
import type { Element } from "@/lib/types";
import styles from "./ElementTile.module.css";

interface Props {
  element: Element;
  row: number;
  col: number;
}

const METALLICITY_MAP: Record<string, string> = {
  "alkali-metal": "metal",
  "alkaline-earth-metal": "metal",
  "transition-metal": "metal",
  "post-transition-metal": "metal",
  lanthanide: "metal",
  actinide: "metal",
  metalloid: "metalloid",
  nonmetal: "nonmetal",
  halogen: "nonmetal",
  "noble-gas": "nonmetal",
  unknown: "unknown",
};

export const ElementTile = memo(function ElementTile({ element, row, col }: Props) {
  const coloringMode = useAppStore((s) => s.coloringMode);
  const selectedElement = useAppStore((s) => s.selectedElement);
  const selectElement = useAppStore((s) => s.selectElement);

  const handleClick = useCallback(() => {
    selectElement(element);
  }, [element, selectElement]);

  const state = (element.standard_state || "").toLowerCase();
  const stateClass = state.includes("gas")
    ? "gas"
    : state.includes("liquid")
      ? "liquid"
      : "solid";
  const metal = METALLICITY_MAP[element.category] ?? "unknown";
  const isSelected = selectedElement?.atomic_number === element.atomic_number;

  // Determine tile accent color based on coloring mode
  const catVar = CATEGORY_CSS_VAR[element.category];
  const accentColor =
    coloringMode === "category"
      ? catVar
      : getElementColor(element, coloringMode) ?? catVar;

  return (
    <div
      className={`
        ${styles.tile}
        ${element.is_radioactive ? styles.radioactive : ""}
        ${isSelected ? styles.selected : ""}
      `}
      style={{
        gridRow: row,
        gridColumn: col,
        "--cat-color": accentColor,
      } as React.CSSProperties}
      data-category={element.category}
      data-state={stateClass}
      data-metal={metal}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${element.name}, atomic number ${element.atomic_number}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Living effects */}
      {stateClass === "gas" && (
        <div className={styles.gasParticles}>
          <span /><span /><span /><span /><span />
        </div>
      )}
      {stateClass === "liquid" && <div className={styles.liquidEffect} />}
      {metal === "metal" && <div className={styles.metalSheen} />}

      {/* Content */}
      <span className={styles.atomicNumber}>{element.atomic_number}</span>
      <span className={`${styles.stateDot} ${styles[stateClass]}`} />
      <span className={styles.symbol}>{element.symbol}</span>
      <span className={styles.name}>{element.name}</span>
      <span className={styles.mass}>
        {element.atomic_mass < 10
          ? element.atomic_mass.toFixed(3)
          : element.atomic_mass.toFixed(2)}
      </span>
    </div>
  );
});
