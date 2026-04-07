"use client";

import { elements } from "@/lib/data";
import { ElementTile } from "./ElementTile";
import type { Element } from "@/lib/types";

/** Build grid placement map: "row-col" → Element */
function buildGrid(data: Element[]): Map<string, Element> {
  const grid = new Map<string, Element>();
  for (const el of data) {
    let row = el.table_row;
    // Remap lanthanide/actinide rows for display
    if (row === 8) row = 9;
    else if (row === 9) row = 10;
    grid.set(`${row}-${el.table_column}`, el);
  }
  return grid;
}

const grid = buildGrid(elements);

export function PeriodicTable() {
  const tiles: React.ReactNode[] = [];

  for (let r = 1; r <= 10; r++) {
    // Row 8 = gap between main table and lanthanide/actinide rows
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
      className="grid"
      style={{
        gridTemplateColumns: `repeat(18, var(--tile-size))`,
        gridTemplateRows: `repeat(10, var(--tile-size))`,
        gap: "var(--tile-gap)",
      }}
    >
      {tiles}
    </div>
  );
}
