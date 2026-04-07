# Periodiq — Task Breakdown

## Phase 0: Data Collection & Preparation
- [x] Research and identify best data sources for each field category
- [x] Write scraper for PubChem REST API (base dataset — 118 elements, ~17 fields + detail pages)
- [x] Write scraper for Wikipedia infoboxes (structured data, discovery info, descriptions)
- [x] Merge and deduplicate data into unified schema (~100 fields per element)
- [x] Curate top 10-20 compounds per element (formula, name, description, uses)
- [x] Validate data integrity — no nulls in critical fields, correct types, sane ranges
- [x] Output final JSON files: `elements.json`, `compounds.json`, `categories.json`
- [ ] Write scraper for WebElements (additional: thermodynamic, mechanical, electromagnetic, crystal, abundance)
- [ ] Build compound index dataset (~5K compounds indexed by element combination)
  - Source from PubChem bulk data, filter to 2-4 element compounds, MW < 500
  - Store: CID, name, formula, canonical SMILES, molecular weight, description
  - Output: `data/final/compound-index.json`
- [ ] Collect isotope data per element (mass, abundance, half-life, decay mode, spin)
- [ ] Source element images (sample photos, emission spectra) — Creative Commons

## Phase 1: Project Scaffolding
- [ ] Initialize Next.js 15 project (App Router, TypeScript)
- [ ] Set up Tailwind v4 + CSS Modules
- [ ] Set up CSS custom properties theming system (dark + light tokens)
- [ ] Configure project structure (`app/`, `components/`, `lib/`, `data/`, `styles/`)
- [ ] Set up Zustand store
- [ ] Set up Framer Motion
- [ ] Install and configure React Three Fiber + drei
- [ ] Install cmdk, smiles-drawer, 3dmol
- [ ] Add static JSON data files to `data/`
- [ ] Build data access layer (`lib/data/`) — abstraction over JSON + future API
- [ ] Build floating chrome components (brand, command bar, utility bar, property chips, legend)

## Phase 2: Core Table View
- [ ] Build periodic table grid layout (18-column standard layout)
- [ ] Build element tile component (atomic number, symbol, name, weight)
- [ ] Implement category-based color coding (10 standard categories)
- [ ] Build property/trend dropdown (15 coloring modes)
- [ ] Implement color gradient mapping for numeric properties
- [ ] Build temperature slider (0K–6000K) with real-time state changes
- [ ] Build element sidebar panel (click to open, key info, "Deep Dive" link)
- [ ] Implement keyboard navigation through table
- [ ] Add sci-fi hover effects on element tiles (glow, shimmer, particles)
- [ ] Responsive layout (desktop, tablet, mobile)

## Phase 3: Element Detail Page
- [ ] Build detail page layout (3D left, tabbed data right)
- [ ] Build 3D atom/orbital visualization (R3F)
  - [ ] Electron shells rendering
  - [ ] Orbital shape visualization
  - [ ] Interactive controls (rotate, zoom, toggle shells)
  - [ ] Accurate electron configuration per element
- [ ] Build Overview tab (name, symbol, mass, state, description, uses)
- [ ] Build Properties tab (physical, chemical, thermodynamic, mechanical, electromagnetic)
- [ ] Build Electrons tab (configuration, shell diagram, ionization energies)
- [ ] Build Compounds tab (top compounds for element + link to Compound Explorer pre-filtered)
- [ ] Build History tab (discovery, discoverer, location, etymology)
- [ ] SSG for all 118 element pages
- [ ] Page transitions (Framer Motion)

## Phase 4: Compound Explorer (`/compounds`)
- [ ] Build compact periodic table variant (smaller tiles for element selection)
- [ ] Build element selection area / drop zone (chosen elements as removable pills)
- [ ] Wire element selection → compound-index.json lookup
- [ ] Build CompoundCard component (formula, name, 2D structure thumbnail via smiles-drawer)
- [ ] Build compound results list (filterable, sortable by name/MW)
- [ ] Build CompoundDetail expanded view:
  - [ ] 3D interactive molecule via 3Dmol.js (feed SDF from PubChem)
  - [ ] Properties panel (formula, MW, IUPAC name, uses)
  - [ ] "View on PubChem" external link
- [ ] Build MoleculeRenderer wrapper component (SmilesDrawer for 2D, 3Dmol.js for 3D)
- [ ] Build PubChem API proxy routes (`api/compounds/search`, `api/compounds/[cid]`)
- [ ] Cache compound results in localStorage/IndexedDB

## Phase 5: List View
- [ ] Build element card component (~600px, rich data display)
- [ ] Build list page layout (grid of cards)
- [ ] Search and filter within list view
- [ ] Match sci-fi theme styling

## Phase 6: Compare Feature
- [ ] Build element selector (pick 2-4 elements)
- [ ] Build side-by-side property cards view
- [ ] Build overlay charts view (property trends)
- [ ] Tab switching between cards and charts modes

## Phase 7: Search (Cmd+K)
- [ ] Build command palette with cmdk
- [ ] Fuzzy search by name, symbol, atomic number
- [ ] Quick category filters
- [ ] Navigate to element detail from search results
- [ ] Keyboard shortcut (Cmd+K / Ctrl+K)

## Phase 8: Theming & Polish
- [ ] Finalize dark theme (sci-fi, amber/gold accents)
- [ ] Build light theme
- [ ] System preference detection + manual toggle
- [ ] Microinteractions and motion polish pass
- [ ] Typography and spacing audit
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Accessibility pass (keyboard nav, screen reader, contrast)

## Phase 9: Deployment
- [ ] Configure Render deployment
- [ ] Set up CI/CD
- [ ] Domain setup (periodiq.dev or periodiq.io)
- [ ] OG images / meta tags for social sharing
- [ ] Final QA across browsers

---

## v2 Backlog
- [ ] Interactive compound builder (draw bonds, valence checking via RDKit.js WASM)
- [ ] Isotopes tab in detail page
- [ ] Game/quiz mode (periodic table trivia)
- [ ] AI-powered chemistry search
- [ ] Property-based search queries ("melting point > 2000")
- [ ] User accounts, favorites, history
- [ ] Classroom mode
- [ ] Additional views (spiral, 3D table, timeline)
- [ ] NMR properties
- [ ] Supply risk / economics data
