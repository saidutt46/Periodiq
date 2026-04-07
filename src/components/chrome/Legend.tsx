"use client";

import styles from "./Legend.module.css";

export function Legend() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        {/* Category taxonomy */}
        <div className={styles.section}>
          <div className={styles.groupHeader}>Metals</div>
          <Cat color="var(--cat-alkali-metal)" label="Alkali" />
          <Cat color="var(--cat-alkaline-earth-metal)" label="Alkaline Earth" />
          <Cat color="var(--cat-transition-metal)" label="Transition" />
          <Cat color="var(--cat-post-transition-metal)" label="Post-transition" />
          <Cat color="var(--cat-lanthanide)" label="Lanthanide" />
          <Cat color="var(--cat-actinide)" label="Actinide" />
        </div>

        <div className={styles.section}>
          <Cat color="var(--cat-metalloid)" label="Metalloid" />
        </div>

        <div className={styles.section}>
          <div className={styles.groupHeader}>Nonmetals</div>
          <Cat color="var(--cat-nonmetal)" label="Reactive" />
          <Cat color="var(--cat-halogen)" label="Halogen" />
          <Cat color="var(--cat-noble-gas)" label="Noble Gas" />
        </div>

        {/* State dot indicators */}
        <div className={styles.divider} />
        <div className={styles.section}>
          <div className={styles.groupHeader}>State (dot)</div>
          <StateDot color="var(--text-muted)" label="Solid" />
          <StateDot color="#f472b6" label="Liquid" />
          <StateDot color="#22d3ee" label="Gas" />
        </div>
      </div>
    </div>
  );
}

function Cat({ color, label }: { color: string; label: string }) {
  return (
    <div className={styles.item}>
      <div className={styles.dot} style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function StateDot({ color, label }: { color: string; label: string }) {
  return (
    <div className={styles.item}>
      <div className={styles.circle} style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
