"use client";

import { memo, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import {
  getElementTileColors,
  formatPropertyValue,
  CATEGORY_CSS_VAR,
} from "@/lib/chemistry/colors";
import {
  getStateAtTemperature,
  getPhaseColor,
} from "@/lib/chemistry/temperature";
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

export const ElementTile = memo(function ElementTile({
  element,
  row,
  col,
}: Props) {
  const coloringMode = useAppStore((s) => s.coloringMode);
  const selectedElement = useAppStore((s) => s.selectedElement);
  const selectElement = useAppStore((s) => s.selectElement);
  const temperature = useAppStore((s) => s.temperature);

  const handleClick = useCallback(() => {
    selectElement(element);
  }, [element, selectElement]);

  // Determine display state
  const isStateMode = coloringMode === "state";
  const tempState = isStateMode
    ? getStateAtTemperature(element, temperature)
    : null;

  const roomState = (element.standard_state || "").toLowerCase();
  const stateClass = isStateMode
    ? tempState === "unknown"
      ? "solid"
      : tempState!
    : roomState.includes("gas")
      ? "gas"
      : roomState.includes("liquid")
        ? "liquid"
        : "solid";

  const metal = METALLICITY_MAP[element.category] ?? "unknown";
  const isSelected =
    selectedElement?.atomic_number === element.atomic_number;
  const isPropertyMode =
    coloringMode !== "category" && coloringMode !== "state";

  // Get tile colors based on mode
  let tileColors: { bg: string | null; accent: string; hasData: boolean };

  if (isStateMode) {
    const phaseColor = getPhaseColor(tempState ?? "unknown");
    tileColors = { bg: phaseColor, accent: phaseColor, hasData: true };
  } else {
    tileColors = getElementTileColors(element, coloringMode);
  }

  // What value to show in the bottom line of the tile
  const isDefaultMode = coloringMode === "category";
  const propertyDisplayValue = isDefaultMode
    ? null
    : isStateMode
      ? stateClass.charAt(0).toUpperCase() + stateClass.slice(1)
      : formatPropertyValue(element, coloringMode);

  // Build inline styles for the tile background
  const tileStyle: React.CSSProperties = {
    gridRow: row,
    gridColumn: col,
    "--cat-color": tileColors.accent,
  } as React.CSSProperties;

  // For non-category modes, the bg IS the color (HSL from our monochromatic scales)
  if (!isDefaultMode && tileColors.bg && tileColors.hasData) {
    tileStyle.background = tileColors.bg;
    tileStyle.borderColor = "rgba(255, 255, 255, 0.08)";
  }

  return (
    <div
      className={`
        ${styles.tile}
        ${element.is_radioactive ? styles.radioactive : ""}
        ${isSelected ? styles.selected : ""}
        ${!tileColors.hasData && isPropertyMode ? styles.noData : ""}
        ${!isDefaultMode && tileColors.hasData ? styles.colored : ""}
      `}
      style={tileStyle}
      data-category={element.category}
      data-state={stateClass}
      data-metal={metal}
      data-atomic-number={element.atomic_number}
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
      {/* Living effects — only in category mode for clarity */}
      {isDefaultMode && stateClass === "gas" && (
        <div className={styles.gasParticles}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      {isDefaultMode && stateClass === "liquid" && (
        <div className={styles.liquidEffect} />
      )}
      {isDefaultMode && metal === "metal" && (
        <div className={styles.metalSheen} />
      )}

      {/* Content */}
      <span className={styles.atomicNumber}>{element.atomic_number}</span>
      <span className={`${styles.stateDot} ${styles[stateClass]}`} />
      <span className={styles.symbol}>{element.symbol}</span>
      <span className={styles.name}>{element.name}</span>
      <span className={styles.mass}>
        {propertyDisplayValue ??
          (element.atomic_mass < 10
            ? element.atomic_mass.toFixed(3)
            : element.atomic_mass.toFixed(2))}
      </span>
    </div>
  );
});
