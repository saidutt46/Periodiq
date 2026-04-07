"use client";

import { Brand } from "./Brand";
import { CommandBar } from "./CommandBar";
import { UtilityBar } from "./UtilityBar";
import { PropertyBar } from "./PropertyBar";
import { Legend } from "./Legend";

export function Chrome() {
  return (
    <>
      <Brand />
      <CommandBar />
      <UtilityBar />
      <PropertyBar />
      <Legend />
    </>
  );
}
