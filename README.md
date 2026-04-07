<div align="center">

# Periodiq

### The most beautiful periodic table on the web.

An interactive, immersive periodic table built with modern web technologies.
Explore 118 elements through stunning visualizations, real-time property coloring,
temperature-based phase simulations, and deep element data.

**[periodiq.dev](https://periodiq.dev)**

---

`Next.js 15` `TypeScript` `Tailwind v4` `React Three Fiber` `Zustand` `Framer Motion`

</div>

<br />

## Overview

Periodiq reimagines the periodic table as a premium, design-forward web experience. Every element tile is alive — metals shimmer, gases float, radioactive elements pulse. Switch between 9 property coloring modes to see the table transform with monochromatic gradients. Drag the temperature slider and watch elements change phase in real-time from 0K to 6000K.

This is not a textbook. This is a chemistry exploration tool that happens to be beautiful.

<br />

## Features

### Interactive Periodic Table
- **118 elements** with full data (~100 properties each)
- **3-layer tile design** — category accent stripe, ambient glow, hover animation
- **Living effects** — gas particles float, metals sweep with light, radioactive elements pulse
- **Keyboard navigation** — arrow keys to traverse the table

### Property Coloring Modes
Switch how the entire table is visualized:

| Mode | Color Family | What it shows |
|------|-------------|---------------|
| **Group** | Multi-color | Chemical families (alkali, transition, noble gas...) |
| **State** | Slate / Pink / Cyan | Solid, liquid, gas at current temperature |
| **Mass** | Blue | Atomic mass gradient (light → heavy) |
| **Radius** | Purple | Atomic radius (small → large) |
| **EN** | Emerald | Electronegativity (low → high) |
| **Density** | Cyan | Density gradient (light → dense) |
| **M.P.** | Amber | Melting point (low → high) |
| **B.P.** | Red | Boiling point (low → high) |
| **Year** | Orange | Discovery year (ancient → recent) |

Each mode colors entire tiles with its property gradient, displays the property value inside the tile, and shows a legend bar with the value range.

### Temperature Simulation
- Drag from **0K to 6000K** and watch elements change phase in real-time
- Accurate melting/boiling point data for all elements
- Helium correctly stays liquid near absolute zero (never solidifies at 1 atm)
- Phase legend: Solid (slate) / Liquid (pink) / Gas (cyan)

### Element Quick View
Click any element to open a detail sidebar with:
- **Living symbol** — animated background matching the element's state of matter
- **Key properties** — mass, density, melting/boiling points, electronegativity, state
- **Electron configuration** — formatted with superscripts and shell badges
- **Discovery info** — year, oxidation states, crystal structure
- **Summary** — from Wikipedia, truncated at sentence boundaries
- **Prev/Next navigation** — arrow through elements without closing
- **Deep Dive** link to the full element detail page

### Design
- **Dark sci-fi aesthetic** — deep blacks, amber/gold accents, glass morphism
- **Floating HUD chrome** — glassmorphism command bar, utility controls, property chips
- **Noise texture overlay** for depth
- **Taxonomy legend** — categories grouped by metals/metalloids/nonmetals
- **Smooth transitions** everywhere — slide, fade, crossfade, scale

<br />

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | SSG, routing, API routes |
| **Language** | TypeScript (strict) | Type safety across ~100 element fields |
| **Styling** | Tailwind v4 + CSS Modules | Layout utilities + deep custom animations |
| **Theming** | CSS Custom Properties | Dark/light with seamless switching |
| **State** | Zustand | Global state (theme, coloring mode, selection, temperature) |
| **3D** | React Three Fiber + drei | Orbital visualizations (coming soon) |
| **Animation** | Framer Motion | Page transitions (coming soon) |
| **Search** | cmdk | Command palette (coming soon) |
| **2D Molecules** | smiles-drawer | SMILES → 2D structure rendering (coming soon) |
| **3D Molecules** | 3Dmol.js | WebGL molecular viewer (coming soon) |

<br />

## Data

Element data is scraped and aggregated from authoritative sources:

- **PubChem REST API** — base dataset (17 fields) + element detail pages
- **Wikipedia** — infobox templates (30-86 fields per element) + article summaries

The merge pipeline normalizes ~100 fields per element including physical, chemical, thermodynamic, mechanical, electromagnetic, crystal structure, and history data. All 118 elements pass validation with required fields at 100% coverage.

```
npm run scrape:all    # Run full scraping pipeline
npm run validate      # Validate data integrity
```

<br />

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to explore.

<br />

## Project Structure

```
periodiq/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── chrome/             # Floating UI shell (brand, nav, controls, legend, sidebar)
│   │   └── table/              # Periodic table grid, tiles, temperature slider
│   └── lib/
│       ├── chemistry/          # Color scales, temperature logic
│       ├── data/               # Data access layer
│       ├── store.ts            # Zustand global state
│       └── types.ts            # TypeScript definitions
├── data/
│   ├── final/                  # Production-ready element data (JSON)
│   └── raw/                    # Raw scraped data
├── scripts/                    # Data scraping pipeline
└── mockups/                    # HTML design prototypes
```

<br />

## Roadmap

- [x] **Phase 0** — Data scraping pipeline (PubChem + Wikipedia)
- [x] **Phase 1** — Project scaffolding (Next.js, Tailwind, Zustand, theming)
- [x] **Phase 2** — Core table view (tiles, coloring, temperature, sidebar)
- [ ] **Phase 3** — Element detail page (3D atom visualization, tabbed data)
- [ ] **Phase 4** — Compound Explorer (drag elements to find compounds)
- [ ] **Phase 5** — List view (element cards)
- [ ] **Phase 6** — Compare (side-by-side element comparison)
- [ ] **Phase 7** — Search (Cmd+K command palette)
- [ ] **Phase 8** — Theming & polish
- [ ] **Phase 9** — Deployment

<br />

## License

ISC

<br />

<div align="center">

Built with obsessive attention to detail.

</div>
