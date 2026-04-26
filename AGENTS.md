# AGENTS.md — Codex Guide for Periodiq

## Project Overview

Periodiq is an interactive periodic table built with Next.js 16, TypeScript, Tailwind v4, Zustand, and React Three Fiber. The app currently centers on:

- a table view at `/`
- statically generated element detail pages at `/element/[symbol]`
- 118 elements with roughly 100 fields each
- 381 curated compounds across the dataset
- four 3D visualization modes on the detail page

The visual direction is deliberate: dark sci-fi by default, glass UI, amber/gold accents, animated tiles, and theme-aware 3D scenes.

## Working Rules

- Do not commit or push without explicit user permission.
- Do not push directly to `main`.
- If substantive work is starting from `main`, create or suggest a feature branch first.
- Do not add AI attribution, co-author lines, or tool/vendor references to commits, PRs, or repo content unless the user asks for that explicitly.
- Do not remove or significantly change existing behavior without being asked.
- Preserve user changes and untracked research/docs files. The worktree may contain local material under `!docs/` and `.claude/`.

## Repo Reality

Use the codebase as the source of truth when docs disagree.

- Implemented app routes are currently `/` and `/element/[symbol]`.
- Deferred routes mentioned in older docs, such as `/list`, `/compare`, or a standalone `/compounds` page, are not present in `src/app/`.
- The project is on Next.js 16, not Next.js 15.
- Theme toggle support exists for both dark and light themes.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- CSS Modules
- Zustand
- React Three Fiber + drei + postprocessing
- Vitest
- Static JSON datasets in `data/final/`

## Commands

Primary commands:

```bash
npm run dev
npm run build
npm run test
npm run test:watch
npm run validate
```

Data pipeline commands:

```bash
npm run scrape:pubchem
npm run scrape:wikipedia
npm run scrape:merge
npm run scrape:compounds
npm run scrape:all
```

Status notes:

- `npm run test` and `npm run build` were confirmed working in this repo on April 26, 2026.
- `npm run lint` currently fails because `package.json` still points to `next lint`, which is stale in this Next.js 16 setup.

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    element/[symbol]/page.tsx
  components/
    chrome/
    detail/
    search/
    table/
  lib/
    chemistry/
    data/
    search.ts
    store.ts
    types.ts
data/
  final/
    elements.json
    compounds.json
    categories.json
  raw/
scripts/
!docs/
```

## Data Notes

- `data/final/elements.json` contains 118 elements.
- `data/final/compounds.json` contains 381 curated compounds keyed by element symbol.
- `data/final/categories.json` drives category metadata.
- Scraping and merge scripts live in `scripts/`.

## UI And Design Constraints

- Preserve the established sci-fi visual language.
- Keep dark and light theme behavior aligned when touching shared UI.
- For Three.js colors, use the theme-aware helpers in `src/lib/chemistry/colors.ts` instead of CSS variables directly.
- Avoid flattening the interface into generic dashboard styling. Existing components intentionally use glass surfaces, depth, glow, and motion.

## Working Style

- Prefer iterative changes with verification.
- For substantial app changes, run relevant checks before handing work back.
- Treat `README.md` and `!docs/tasks.md` as useful context, but verify against the code before relying on them.
- When reviewing, prioritize regressions, stale assumptions, and missing validation over stylistic feedback.
