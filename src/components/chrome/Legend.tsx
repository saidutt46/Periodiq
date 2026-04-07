"use client";

import { categories } from "@/lib/data";

const CATEGORY_ORDER = [
  "alkali-metal",
  "alkaline-earth-metal",
  "transition-metal",
  "post-transition-metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble-gas",
  "lanthanide",
  "actinide",
  "unknown",
] as const;

export function Legend() {
  return (
    <div className="fixed bottom-5 left-6 z-50 flex flex-col gap-1 opacity-70 hover:opacity-100 transition-opacity duration-300">
      {CATEGORY_ORDER.map((key) => {
        const cat = categories[key];
        if (!cat) return null;
        return (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
            <div
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: `var(--cat-${key})` }}
            />
            {cat.label}
          </div>
        );
      })}
    </div>
  );
}
