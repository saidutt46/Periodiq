# Periodiq — Task Breakdown

## Phase 0: Data Collection & Preparation
- [x] Research and identify best data sources for each field category
- [x] Write scraper for PubChem REST API (base dataset — 118 elements, ~17 fields + detail pages)
- [x] Write scraper for Wikipedia infoboxes (structured data, discovery info, descriptions)
- [x] Merge and deduplicate data into unified schema (~100 fields per element)
- [x] Curate top 10-20 compounds per element (formula, name, description, uses)
- [x] Validate data integrity — no nulls in critical fields, correct types, sane ranges
- [x] Output final JSON files: `elements.json`, `compounds.json`, `categories.json`
- [x] Fix Wikipedia scraper case-sensitivity bug (recovered mechanical, ionization data)
- [x] Curate compounds for 99/118 elements (381 compounds total)
- [x] Curate etymology (name origin) for all 118 elements
- [ ] Write scraper for WebElements (additional: abundance, lattice constants, space group)
- [ ] Build compound index dataset (~5K compounds indexed by element combination)
  - Source from PubChem bulk data, filter to 2-4 element compounds, MW < 500
  - Store: CID, name, formula, canonical SMILES, molecular weight, description
  - Output: `data/final/compound-index.json`
- [ ] Collect isotope data per element (mass, abundance, half-life, decay mode, spin)
- [ ] Source element images (sample photos, emission spectra) — Creative Commons
- [ ] Scrape real emission spectra data from NIST for Spectrum viz tab

## Phase 1: Project Scaffolding
- [x] Initialize Next.js 15 project (App Router, TypeScript)
- [x] Set up Tailwind v4 + CSS Modules
- [x] Set up CSS custom properties theming system (dark + light tokens)
- [x] Configure project structure (`app/`, `components/`, `lib/`, `data/`, `styles/`)
- [x] Set up Zustand store
- [x] Install Framer Motion (wiring pending)
- [x] Install React Three Fiber + drei (wiring pending)
- [x] Install cmdk (wiring pending)
- [x] Add static JSON data files to `data/`
- [x] Build data access layer (`lib/data/`) — abstraction over JSON + future API
- [x] Build floating chrome components (brand, command bar, utility bar, property chips, legend)

## Phase 2: Core Table View
- [x] Build periodic table grid layout (18-column standard layout)
- [x] Build element tile component (atomic number, symbol, name, weight)
- [x] Implement category-based color coding (10 standard categories)
- [x] Build property/trend mode selector (9 coloring modes with monochromatic gradients)
- [x] Implement color gradient mapping for numeric properties
- [x] Build temperature slider (0K–6000K) with real-time state changes
- [x] Build element sidebar panel (click to open, key info, "Deep Dive" link)
- [x] Implement keyboard navigation through table (arrow keys)
- [x] Add sci-fi hover effects on element tiles (glow, shimmer, particles)
- [x] Property gradient legend bar (appears per mode with value ranges)
- [x] Category taxonomy legend (vertical, grouped by metals/metalloids/nonmetals)
- [x] Sidebar: slide animation, backdrop overlay, crossfade, prev/next nav
- [x] Sidebar: living symbol effects, electron config with superscripts, info chips
- [ ] Responsive layout (desktop, tablet, mobile)

## Phase 3: Element Detail Page
- [x] Build detail page layout (3D left, tabbed data right)
- [x] Build 3D atom/orbital visualization (R3F)
  - [x] Bohr model — electron shells with orbiting electrons, bloom, sparkles
  - [x] Orbital shapes — real spherical harmonics (s/p/d/f), isometric camera, subshell selector
  - [x] Crystal structure — BCC/FCC/HCP/diamond unit cells with bonds
  - [x] Atomic radii — concentric spheres (covalent/atomic/vdW) with fixed color palette
  - [x] Interactive controls (rotate, zoom, orbit controls)
  - [x] Accurate electron configuration per element
  - [x] Performance optimized (electron cap, multisampling=0, dpr cap)
  - [x] Light/dark theme support across all viz tabs
  - [x] Progressive edge blur on viz content area
- [x] Build viz tab system (glass pill tabs matching PropertyBar style)
- [x] Build Overview tab (expandable summary, appearance, classification, identifiers)
- [x] Build Properties tab (physical, chemical, thermodynamic, mechanical, electromagnetic — empty sections hidden)
- [x] Build Electrons tab (sci-fi capsules, config with noble gas label, shell fill ratios, ionization chart)
- [x] Build Compounds tab (381 compounds across 99 elements, PubChem link)
- [x] Build History tab (etymology for all 118, discovery timeline, quick facts)
- [x] SSG for all 118 element pages
- [x] Theme-aware getCategoryHex() for Three.js colors
- [x] Bottom info strip (inline stats + shell bar)
- [ ] Page transitions (Framer Motion)
- [ ] Responsive layout for detail page

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

## ~~Phase 5: List View~~ — Deferred
> **Decision:** Deferred indefinitely. The periodic table grid is the natural layout for elements; a flat card list loses group/period relationships and duplicates what the detail page already shows. Cmd+K search covers the "find an element quickly" use case. May revisit if property-based sorting/filtering becomes a priority.

## ~~Phase 6: Compare Feature~~ — Deferred
> **Decision:** Deferred indefinitely. Low value without the List View. May revisit as a standalone feature if user research shows demand for side-by-side element comparison.

## Phase 7: Search (Cmd+K)
- [x] Build command palette with cmdk
- [x] Fuzzy search by name, symbol, atomic number
- [x] Quick category filters
- [x] Navigate to element detail from search results
- [x] Keyboard shortcut (Cmd+K / Ctrl+K)
- [x] Backspace to clear category filter
- [x] Actions: Toggle Theme, Back to Table
- [x] 17 unit tests (Vitest)

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
- [ ] Rewrite element summaries in original Periodiq voice (currently verbatim Wikipedia — plagiarism risk, no differentiation). Rephrase into concise, engaging descriptions focusing on what makes each element fascinating. 118 elements.
