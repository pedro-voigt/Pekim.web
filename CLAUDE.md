# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server with HMR at http://localhost:5173
npm run build    # Production build to /dist
npm run preview  # Preview production build locally
npm run lint     # ESLint on all .js/.jsx files
```

## Architecture

**PekimWeb** is a couple's personal hub (Pedro & Kim) — a React + Vite SPA for shared memories, date planning, movie tracking, and relationship features. No backend; all data is static.

### Navigation & Routing

There is no routing library. `src/casal-hub.jsx` is the root controller: it holds a single `page` state string, renders a collapsible sidebar, and maps page keys to components via a `pages` object. Page transitions are triggered by an `onNavigate` prop passed down to all pages. Current pages: `home`, `dates`, `filmes`, `memorias`, `diario`, `abrir-quando`, `bucket`, `sorteador`.

To add a page: create `src/pages/NewPage.jsx`, add an entry to `NAV_ITEMS` and the `pages` object in `casal-hub.jsx`, and add an icon to `NAV_ICONS`.

### Data Layer

All content lives as static JS arrays in `src/content/`:
- `dates.js` — date ideas with `id, name, desc, cost, vibe, category, status, planning`
- `movies.js` — films with `id, title, year, category, watched, rating (1–5), note, fav`
- `memories.js` — moments with `id, date, title, desc, emoji, color`
- `openWhen.js` — letter prompts with `id, trigger, icon, preview`
- `bucketList.js` — goals with `id, item, done, emoji`

Pages import from these files directly; no API calls or global state involved.

### Styling Conventions

- **All styles are inline** (no CSS files beyond `index.css` for fonts/reset). Style objects are defined inline or as local consts.
- **Color palette**: background `#EEEBd8` (cream), dark green `#0A3323` (nav/active), accents `#839958`/`#a8bc80`, rose `#D3968C`, card bg `#F7F4D5`.
- **Fonts**: Playfair Display (headings), Cormorant Garamond (body/italic).
- Responsive sizing via `clamp()`. Hover states use `onMouseEnter`/`onMouseLeave` with local state.
- Expandable sections animate via `maxHeight` transitions on a wrapper div.

### Reusable UI Components

Located in `src/components/ui/`: `PageHeader`, `FilterChip`, `StatusBadge`, `StarRating`. All pages use `PageHeader` for consistent section titles. Prefer extending these before creating new ones.

### Notable Hooks

- `src/hooks/useCounter.js` — calculates relationship duration from hardcoded start date `2023-12-14`, updates every 60 seconds. Used on the home page.

### Tech Notes

- Pure JSX, no TypeScript.
- React 19, Vite 8.
- No state management library; all state is local `useState`.
- All UI copy is in Portuguese.
