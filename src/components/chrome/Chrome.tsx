"use client";

import { Brand } from "./Brand";
import { CommandBar } from "./CommandBar";
import { UtilityBar } from "./UtilityBar";
import { PropertyBar } from "./PropertyBar";
import { Legend } from "./Legend";
import { SearchPalette } from "@/components/search/SearchPalette";

interface ChromeProps {
  /** Show table-specific controls (property bar, legend) */
  showTableControls?: boolean;
}

export function Chrome({ showTableControls = false }: ChromeProps) {
  return (
    <>
      <Brand />
      <CommandBar />
      <UtilityBar />
      {showTableControls && <PropertyBar />}
      {showTableControls && <Legend />}
      <SearchPalette />
    </>
  );
}
