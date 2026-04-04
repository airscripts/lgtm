# LGTM

A fully static web application that catalogs alternative meanings for the acronym LGTM. Generate a random interpretation, browse the full collection, filter by category and rarity, and share individual entries via permanent URLs.

Live at: https://lgtm.airscript.it

---

## Overview

LGTM collects hundreds alternative meanings for "LGTM" (Looks Good To Me), organized by:

- **Rarity** — common, regular, rare, legendary (weighted random generation)
- **Category** — funny, sarcastic, wholesome, dev, existential, corporate, chaotic

The site is fully static (no server-side rendering, no database). All data lives in `data/lgtm.json`.

---

## Installation

Requires Node.js >= 24 and pnpm >= 10.

```sh
pnpm install
```

---

## Development

```sh
pnpm dev        # Start local dev server at http://localhost:4321
pnpm build      # Build static output to ./dist
pnpm preview    # Serve the built output locally
```

---

## Routes

| Route                     | Description                                          |
| :------------------------ | :--------------------------------------------------- |
| `/`                       | Homepage with weighted-random generator island       |
| `/random`                 | Static redirect page — picks a random entry client-side and immediately navigates |
| `/browse`                 | Full catalog with keyword search, category/rarity filter, and sort |
| `/lgtm/[id]`              | Detail page for a single entry, shareable URL        |
| `/categories`             | Grid of all categories with sample entries           |
| `/categories/[category]`  | All entries within a single category                 |

---

## Theme Switcher

The navbar includes a 3-state theme toggle: **system** (default) → **light** → **dark** → system.

- Default follows the OS `prefers-color-scheme` media query
- The selected mode is persisted to `localStorage` under the key `lgtm-theme`
- A no-flash inline script in `<head>` reads the stored value and sets `data-theme` on `<html>` before CSS paints, preventing a flash of the wrong theme on reload

---

## Testing

Uses Vitest with React Testing Library and jsdom.

```sh
pnpm test          # Run tests once
pnpm test:watch    # Run tests in watch mode
```

Test files live in `src/test/` and cover:

- `lgtm.test.ts` — data loader functions and constants
- `random.test.ts` — weighted random selection logic
- `ThemeSwitcher.test.tsx` — 3-state cycle, localStorage persistence, aria labels
- `RandomGenerator.test.tsx` — rendering, navigation calls, generate interaction
- `LegendaryEffect.test.tsx` — particle component rendering and accessibility attributes

---

## CI

GitHub Actions runs on every push and pull request to `main`:

1. Checkout
2. Set up pnpm
3. Set up Node.js 24
4. `pnpm install --frozen-lockfile`
5. `pnpm build`
6. `pnpm test`

See `.github/workflows/ci.yml`.

---

## Deployment

Deployed as a static site on Vercel via the `@astrojs/vercel` adapter (static output mode). No server functions are used.

To deploy your own fork, connect the repository to a Vercel project. No environment variables are required.

---

## Contributing

1. Fork the repository
2. Add new entries to `data/lgtm.json` following the existing schema (numeric `id`, `acronym: "LGTM"`, `meaning`, `category`, `rarity`, optional `description` and `tags`)
3. Keep IDs contiguous — the next ID is `max(existing ids) + 1`
4. Run `pnpm build` and `pnpm test` before opening a pull request
