"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Element } from "@/lib/types";
import VizTabBar, { type VizTab } from "./VizTabBar";
import VizDataCards from "./VizDataCards";
import styles from "../DetailPage.module.css";

/* Lazy-load all viz components to avoid SSR issues with Three.js */
const BohrModelViz = dynamic(() => import("./BohrModelViz"), { ssr: false });
const OrbitalCloudViz = dynamic(() => import("./OrbitalCloudViz"), { ssr: false });
const CrystalStructureViz = dynamic(() => import("./CrystalStructureViz"), { ssr: false });
const RadiiViz = dynamic(() => import("./RadiiViz"), { ssr: false });

interface VizPanelProps {
  element: Element;
  categoryHex: string;
  theme: "dark" | "light";
}

export default function VizPanel({ element, categoryHex, theme }: VizPanelProps) {
  const [activeVizTab, setActiveVizTab] = useState<VizTab>("bohr");

  // Determine which tabs are disabled (no data for this element)
  const disabledTabs = useMemo(() => {
    const disabled: VizTab[] = [];
    if (!element.crystal_structure) disabled.push("crystal");
    return disabled;
  }, [element]);

  return (
    <div className={styles.vizPanel}>
      {/* Viz tab navigation */}
      <VizTabBar
        activeTab={activeVizTab}
        onTabChange={setActiveVizTab}
        disabledTabs={disabledTabs}
      />

      {/* Visualization content */}
      <div className={styles.vizContent}>
        {activeVizTab === "bohr" && (
          <BohrModelViz
            electronsPerShell={element.electrons_per_shell || []}
            categoryColor={categoryHex}
            atomicNumber={element.atomic_number}
            theme={theme}
          />
        )}

        {activeVizTab === "orbitals" && (
          <OrbitalCloudViz
            electronConfiguration={element.electron_configuration || ""}
            electronsPerShell={element.electrons_per_shell || []}
            atomicNumber={element.atomic_number}
            categoryColor={categoryHex}
            theme={theme}
          />
        )}

        {activeVizTab === "crystal" && element.crystal_structure && (
          <CrystalStructureViz
            crystalStructure={element.crystal_structure}
            categoryColor={categoryHex}
            atomicRadius={element.atomic_radius}
            theme={theme}
          />
        )}

        {activeVizTab === "radii" && (
          <RadiiViz
            atomicRadius={element.atomic_radius}
            covalentRadius={element.covalent_radius ? Number(element.covalent_radius) : null}
            vanDerWaalsRadius={element.van_der_waals_radius ? Number(element.van_der_waals_radius) : null}
            categoryColor={categoryHex}
            symbol={element.symbol}
            theme={theme}
          />
        )}

      </div>

      {/* Data cards row at bottom */}
      <VizDataCards element={element} categoryHex={categoryHex} />
    </div>
  );
}
