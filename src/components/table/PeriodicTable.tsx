"use client";

import { useCallback, useRef } from "react";
import { elements } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { ElementTile } from "./ElementTile";
import type { Element } from "@/lib/types";

/** Build grid placement map: "row-col" → Element */
function buildGrid(data: Element[]): Map<string, Element> {
  const grid = new Map<string, Element>();
  for (const el of data) {
    let row = el.table_row;
    if (row === 8) row = 9;
    else if (row === 9) row = 10;
    grid.set(`${row}-${el.table_column}`, el);
  }
  return grid;
}

/** Reverse map: atomic_number → [row, col] */
function buildPositionMap(data: Element[]): Map<number, [number, number]> {
  const map = new Map<number, [number, number]>();
  for (const el of data) {
    let row = el.table_row;
    if (row === 8) row = 9;
    else if (row === 9) row = 10;
    map.set(el.atomic_number, [row, el.table_column]);
  }
  return map;
}

const grid = buildGrid(elements);
const positionMap = buildPositionMap(elements);

export function PeriodicTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectElement = useAppStore((s) => s.selectElement);
  const selectedElement = useAppStore((s) => s.selectedElement);

  /** Navigate to adjacent element via arrow keys */
  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();

      const current = selectedElement;
      if (!current) {
        // Select first element if nothing selected
        selectElement(elements[0]);
        return;
      }

      const pos = positionMap.get(current.atomic_number);
      if (!pos) return;

      const [row, col] = pos;
      const dr = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
      const dc = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;

      // Search in the direction for the nearest element (skip empty cells and gap row)
      for (let step = 1; step <= 18; step++) {
        let nr = row + dr * step;
        let nc = col + dc * step;

        // Skip gap row (8)
        if (nr === 8) nr += dr;

        // Wrap columns
        if (nc < 1) nc = 18;
        if (nc > 18) nc = 1;

        // Bounds
        if (nr < 1 || nr > 10) break;

        const el = grid.get(`${nr}-${nc}`);
        if (el) {
          selectElement(el);
          // Focus the tile
          const tile = containerRef.current?.querySelector(
            `[data-atomic-number="${el.atomic_number}"]`
          ) as HTMLElement;
          tile?.focus();
          break;
        }
      }
    },
    [selectedElement, selectElement]
  );

  const tiles: React.ReactNode[] = [];

  for (let r = 1; r <= 10; r++) {
    if (r === 8) {
      tiles.push(
        <div
          key="gap-row"
          style={{ gridColumn: "1 / -1", gridRow: 8, height: 12 }}
        />
      );
      continue;
    }

    for (let c = 1; c <= 18; c++) {
      const el = grid.get(`${r}-${c}`);
      if (!el) {
        tiles.push(
          <div
            key={`empty-${r}-${c}`}
            style={{ gridRow: r, gridColumn: c, visibility: "hidden" }}
          />
        );
        continue;
      }

      tiles.push(
        <ElementTile
          key={el.atomic_number}
          element={el}
          row={r}
          col={c}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="grid outline-none"
      style={{
        gridTemplateColumns: `repeat(18, var(--tile-size))`,
        gridTemplateRows: `repeat(10, var(--tile-size))`,
        gap: "var(--tile-gap)",
      }}
      onKeyDown={handleKeyNav}
      tabIndex={-1}
    >
      {tiles}
    </div>
  );
}
