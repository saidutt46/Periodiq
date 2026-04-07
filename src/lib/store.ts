import { create } from "zustand";
import type { Element, ColoringMode } from "@/lib/types";

interface AppState {
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Table coloring mode
  coloringMode: ColoringMode;
  setColoringMode: (mode: ColoringMode) => void;

  // Selected element (sidebar)
  selectedElement: Element | null;
  selectElement: (el: Element | null) => void;

  // Temperature slider
  temperature: number;
  setTemperature: (temp: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),

  coloringMode: "category",
  setColoringMode: (mode) => set({ coloringMode: mode }),

  selectedElement: null,
  selectElement: (el) => set({ selectedElement: el }),

  temperature: 293, // Room temperature (20°C)
  setTemperature: (temp) => set({ temperature: temp }),
}));
