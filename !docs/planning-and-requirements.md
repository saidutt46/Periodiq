# Periodiq — Planning & Requirements

## Context

Building "the most beautiful and useful periodic table on the web" — a portfolio-grade, Awwwards-level interactive periodic table app with a chemistry sci-fi aesthetic. The gap in the market is clear: existing tools (Ptable, PubChem, RSC) are data-rich but design-poor. Periodiq combines authoritative, comprehensive element data with a premium, immersive interface.

**Product thesis**: The best-designed periodic table webapp ever built.

**Audience priority**: Enthusiasts/developers > Students > Teachers > General public

**Scope**: Feature-rich v1 (not a tight MVP, not a full platform)

**Domain**: periodiq.dev or periodiq.io (both available)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, TypeScript) |
| 3D | React Three Fiber + drei |
| Animation | Framer Motion |
| Styling | Tailwind v4 + CSS Modules + CSS custom properties |
| Search | cmdk (Cmd+K command palette) |
| State | Zustand |
| 2D Molecules | smiles-drawer (~80KB) — SMILES → 2D structure rendering |
| 3D Molecules | 3Dmol.js (~500KB) — WebGL molecular viewer for compound detail |
| Data | Static JSON (~100 fields/element) + PubChem API (compounds) |
| Deployment | Render (free tier) |

---

## Design Direction

- **Aesthetic**: Dark, immersive, cinematic — "chemistry sci-fi"
- **Reference**: Spectra Stadium dashboard (HUD-style, amber/gold accents, data-dense but organized)
- **Not**: Institutional, ad-heavy, textbook, or generic
- **Themes**: Dark (default) + Light, designed in parallel with a CSS custom properties theming system
- **Motion**: Central to the experience — smooth transitions, hover effects, page transitions, particle effects
- **Quality bar**: Awwwards top 10 level design studios

### Element Tile Design (3 layers)
1. **Base**: Category color-coding (consistent with scientific community standards)
2. **Identity**: Abstract visual glow/texture per element based on properties (sci-fi, not photorealistic)
3. **Interaction**: On hover/select, element "comes alive" — shimmer, particle effect, or micro-animation

---

## Navigation & Routes

### Top-level tabs (floating glassmorphism command bar, center-top)
- **Table** (grid view, default) — `/`
- **List** (card view) — `/list`
- **Compounds** (compound explorer) — `/compounds`
- **Compare** — `/compare`
- **Game** — `/game` (v2)

### Element detail
- `/element/[symbol]` — Full detail page
  - Left ~50%: 3D atom/orbital visualization (hero, interactive, rotatable) with floating glass data labels + shell bar chart
  - Right ~50%: Element header + quick stat cards + tabbed data panels (Overview, Properties, Electrons, Compounds, History)
  - Layout inspired by Healtho dashboard reference (3D model left, data panels right)
  - Top bar: back to table, element name centered, prev/next nav arrows, theme toggle

### Compound Explorer
- `/compounds` — Dedicated compound exploration view
  - Top area: Periodic table grid (compact) for element selection
  - Drop zone / selection area where chosen elements appear
  - Results area: compound cards with 2D molecular structure thumbnails (SmilesDrawer)
  - Click a compound → expanded view with 3D molecule (3Dmol.js), properties, uses
  - "Explore more via PubChem" link for deep-dive

### Interaction model
- **Table view**: Click element → sidebar panel with quick info + "Deep Dive" button
- **Deep dive**: Navigates to `/element/[symbol]` full detail page
- **Cmd+K**: Global search palette (name, symbol, number, category)

### Chrome / UI Shell (Awwwards-level, no traditional navbar)
- **Top-left**: Brand mark (golden Pq square) + wordmark
- **Top-center**: Floating glassmorphism command bar (tabs + search with Cmd+K hint)
- **Top-right**: Utility icons (theme toggle, settings) in glass pill
- **Bottom-center**: Property/trend coloring mode chips (Group, State, Mass, Radius, EN, Density, M.P., B.P., Year)
- **Bottom-left**: Legend (faded, hover to reveal)
- All floating elements use `backdrop-filter: blur(20px)` glass effect

---

## Feature Set (v1)

### Table View
- [ ] 18-column periodic table grid with standard layout
- [ ] Category-based color coding (alkali metals, noble gases, transition metals, etc.)
- [ ] Property/Trend dropdown to change coloring mode:
  - Chemical Group / Family
  - Metal / Metalloid / Nonmetal
  - Atomic Mass
  - Standard State
  - Electron Configuration
  - Oxidation States
  - Electronegativity (Pauling)
  - Atomic Radius (van der Waals)
  - Ionization Energy
  - Electron Affinity
  - Melting Point
  - Boiling Point
  - Density
  - Year Discovered
- [ ] Temperature slider (0K to 6000K) showing real-time state changes
- [ ] Click element → sidebar panel with quick info
- [ ] Sci-fi element tile hover effects (glow, shimmer, particles)
- [ ] Keyboard navigation

### List View
- [ ] Element cards (~600px height) with rich data display
- [ ] Beautiful card design matching sci-fi theme
- [ ] Searchable/filterable

### Element Detail Page
- [ ] 3D atom/orbital visualization (React Three Fiber)
  - Electron shells, orbital shapes
  - Interactive: rotate, zoom, toggle shells
  - Accurate electron configuration visualization
- [ ] **Overview tab**: Name, symbol, atomic number, mass, state, appearance, description, uses
- [ ] **Properties tab**: Physical, chemical, thermodynamic, mechanical, electromagnetic properties
- [ ] **Electrons tab**: Configuration, shell structure, orbital diagram, ionization energies
- [ ] **Compounds tab**: Top compounds for this element as cards + link to Compound Explorer pre-filtered
- [ ] **History tab**: Discovery story, discoverer, location, etymology, uses through history

### Compound Explorer (`/compounds`) — NEW
- [ ] Compact periodic table grid at top for element selection (click or drag)
- [ ] Element selection area / drop zone showing chosen elements as pills
- [ ] Pre-curated compound dataset (~5K compounds) indexed by element combination
  - Source: PubChem bulk data, filtered to 2-4 element compounds, MW < 500
  - Fields per compound: CID, name, formula, canonical SMILES, molecular weight, description/uses
- [ ] Compound results list with 2D structure thumbnails (smiles-drawer from SMILES)
- [ ] Click compound → expanded detail panel:
  - 3D interactive molecule (3Dmol.js, fed SDF from PubChem API)
  - Properties: formula, molecular weight, IUPAC name, uses
  - Link to PubChem page for deep-dive
- [ ] PubChem API proxy route for on-demand 3D structure + property fetching
- [ ] Cache compound results (localStorage or IndexedDB) to respect PubChem rate limits (5 req/sec)

### Compare Feature
- [ ] Select 2-4 elements
- [ ] Side-by-side property cards (like phone spec comparison)
- [ ] Overlay charts for visual trend analysis
- [ ] Two modes: Cards tab + Charts tab

### Search (Cmd+K)
- [ ] Fuzzy search by name, symbol, atomic number
- [ ] Quick filters by category
- [ ] v2: Property-based queries
- [ ] v3: AI-powered chemistry assistant

### Theming
- [ ] CSS custom properties theming system
- [ ] Dark theme (default) — sci-fi, amber/gold accents
- [ ] Light theme — clean, scientific
- [ ] System preference detection + manual toggle

---

## Data Model (~100 fields per element)

### Core fields
- atomic_number, symbol, name, name_origin, standard_atomic_weight, cas_number, cpk_hex_color

### Classification
- group, group_name, period, block, category, metal_metalloid_nonmetal, is_radioactive, natural_occurrence

### Physical Properties
- standard_state, appearance, color, density, density_liquid, molar_volume, melting_point, boiling_point, triple_point_temp, triple_point_pressure, critical_temp, critical_pressure, speed_of_sound

### Chemical Properties
- electronegativity_pauling, electronegativity_allen, electron_affinity, oxidation_states, common_oxidation_states, valence

### Atomic Properties
- electron_configuration, electron_configuration_semantic, electrons_per_shell, atomic_radius_empirical, atomic_radius_calculated, covalent_radius, van_der_waals_radius, metallic_radius

### Thermodynamic Properties
- heat_of_fusion, heat_of_vaporization, specific_heat_capacity, molar_heat_capacity, thermal_conductivity, thermal_expansion

### Electromagnetic Properties
- electrical_conductivity, electrical_resistivity, electrical_type, magnetic_ordering, magnetic_susceptibility, superconducting_point

### Mechanical Properties
- youngs_modulus, shear_modulus, bulk_modulus, poisson_ratio, mohs_hardness, brinell_hardness, vickers_hardness

### Ionization Energies
- ionization_energies[] (array, 1st through 8th+)

### Crystal Structure
- crystal_structure, space_group_name, space_group_number, lattice_constants, lattice_angles

### Abundance
- abundance_crust, abundance_ocean, abundance_universe, abundance_sun, abundance_human_body, cost_pure, cost_bulk

### History
- discovery_year, discoverer, discovery_location, named_by, etymology, description, uses

### Biological / Safety
- biological_role, toxicity_description, nfpa_health, nfpa_flammability, nfpa_reactivity

### Visual
- image_url, emission_spectrum_url

### Isotopes (nested array)
- isotopes[]: { mass_number, atomic_mass, abundance, half_life, decay_mode, nuclear_spin }

### Compounds (nested array — curated)
- compounds[]: { formula, name, description, uses }

---

## Data Sourcing Strategy

**Approach**: Scrape and aggregate from multiple authoritative sources

**Primary sources**:
1. PubChem REST API — structured base dataset
2. WebElements — most comprehensive (~100+ fields)
3. RSC Periodic Table — emission spectra, artwork
4. Theodore Gray's periodictable.com — ~80 named properties
5. Wikipedia infoboxes — good structured data

**Process**:
1. Pull base dataset from PubChem API
2. Augment with WebElements data
3. Add abundance data from multiple sources
4. Curate compound lists per element
5. Source element images
6. Store as: `data/elements.json` + `data/isotopes.json` + `data/compounds.json`

**Data access layer**: Abstract behind a service layer for future extensibility (JSON → API → DB).

---

## Project Structure

```
periodiq/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (theme, fonts, floating chrome)
│   ├── page.tsx                  # Table view (grid)
│   ├── list/page.tsx             # List view (cards)
│   ├── element/[symbol]/page.tsx # Element detail (SSG × 118)
│   ├── compounds/page.tsx        # Compound Explorer
│   ├── compare/page.tsx          # Compare view
│   └── api/
│       ├── compounds/search/route.ts    # Compound search proxy
│       └── compounds/[cid]/route.ts     # PubChem compound detail proxy
├── components/
│   ├── table/                    # Periodic table grid (full + compact variants)
│   ├── element/                  # Element tiles, cards
│   ├── detail/                   # Detail page components
│   ├── compounds/                # Compound explorer components
│   │   ├── CompoundExplorer.tsx  # Main compound explorer view
│   │   ├── ElementSelector.tsx   # Compact table + drop zone
│   │   ├── CompoundCard.tsx      # Result card with 2D structure
│   │   ├── CompoundDetail.tsx    # Expanded view with 3D molecule
│   │   └── MoleculeRenderer.tsx  # SmilesDrawer (2D) + 3Dmol.js (3D) wrapper
│   ├── three/                    # 3D atom/orbital visualizations (R3F)
│   ├── search/                   # Cmd+K palette
│   ├── chrome/                   # Floating UI shell (brand, command bar, utility, property chips, legend)
│   ├── compare/                  # Comparison views
│   └── ui/                       # Shared UI primitives
├── data/
│   ├── elements.json             # Core element data (~100 fields × 118)
│   ├── isotopes.json             # Isotope data
│   ├── compounds.json            # Per-element curated compounds (quick reference)
│   └── compound-index.json       # Element-combo → compounds lookup (~5K entries)
├── lib/
│   ├── data/                     # Data access layer
│   ├── chemistry/                # Chemistry utilities
│   └── theme/                    # Theme system
├── styles/
│   ├── tokens/                   # CSS custom properties
│   └── modules/                  # CSS Modules
└── public/
    └── elements/                 # Element images, spectra
```

---

## v2 Features (noted, not in v1 scope)

- [ ] Interactive compound builder (draw bonds, valence checking via RDKit.js WASM)
- [ ] Isotopes tab in detail page
- [ ] Game/quiz mode (periodic table trivia)
- [ ] AI-powered chemistry search
- [ ] Property-based search queries
- [ ] User accounts, favorites, history
- [ ] Classroom mode
- [ ] Additional view modes (spiral, 3D table, timeline)
- [ ] NMR properties
- [ ] Supply risk / economics data

---

## Reference Materials

- `!docs/web-research-perplexity.md` — Initial research from Perplexity
- `!docs/b80f64735a04a868f5bc91e0defe29f7.webp` — Spectra Stadium (design direction reference)
- `!docs/detail-page-idea.webp` — Healtho dashboard (detail page layout reference)
- `!docs/Screenshot 2026-04-06 at 9.02.19 PM.png` — Ptable screenshot (color coding reference)
- `!docs/pubchem-table-style.png` — PubChem property/trend dropdown reference
