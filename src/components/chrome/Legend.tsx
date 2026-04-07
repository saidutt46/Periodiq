"use client";

import { categories } from "@/lib/data";
import styles from "./Legend.module.css";

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
    <div className={styles.container}>
      {CATEGORY_ORDER.map((key) => {
        const cat = categories[key];
        if (!cat) return null;
        return (
          <div key={key} className={styles.item}>
            <div
              className={styles.dot}
              style={{ background: `var(--cat-${key})` }}
            />
            <span>{cat.label}</span>
          </div>
        );
      })}
    </div>
  );
}
