# AGENTS.md

## 1. Overview

LGTM is a fully static Astro site that catalogs alternate meanings for the acronym "LGTM". The repo is built around Astro pages and layouts, React islands for client-side interactivity, and a build-time data layer sourced from `data/lgtm.json`. Most implementation code lives in TypeScript, with Astro components handling static page composition and a small amount of JavaScript config at the repo root.

## 2. Repository Structure

```text
lgtm/
  data/
    lgtm.json                 # canonical content source
  public/
    favicon.svg
    og-image.png
  src/
    components/               # Astro components and React islands
      *.astro
      *.tsx
    layouts/
      base-layout.astro       # shared shell, nav, footer, head tags
    lib/                      # data access, config, settings, content helpers
      config.ts
      content.ts
      lgtm.ts
      mascot-lines.ts
      random.ts
      settings.ts
    pages/                    # Astro routes, including dynamic pages
      index.astro
      browse.astro
      random.astro
      settings.astro
      lgtm/[id].astro
      categories/[category].astro
      rarities/[rarity].astro
    styles/
      global.css              # Tailwind entry, tokens, shared utility classes
    test/                     # Vitest files, setup, shared fixtures
      fixtures.ts
      setup.ts
      *.test.ts
      *.test.tsx
  .github/workflows/          # build, test, verify pipelines
  astro.config.mjs
  eslint.config.mjs
  package.json
  tsconfig.json
  vercel.json
  vitest.config.ts
```

- Put new static pages in `src/pages/`.
- Put reusable non-interactive UI in `src/components/*.astro`.
- Put client-side stateful UI in `src/components/*.tsx`.
- Put build-time data access and pure helpers in `src/lib/`.
- Put shared test factories and setup in `src/test/`.
- Keep the repo root limited to project config, lockfiles, and top-level docs.
- Do not add alternate data sources; `data/lgtm.json` remains the canonical content store.

## 5. Commands and Workflows

- Install dependencies with `pnpm install`.
- Start local development with `pnpm dev`.
- Build the static site with `pnpm build`.
- Preview the production build with `pnpm preview`.
- Run the full test suite with `pnpm test`.
- Run tests in watch mode with `pnpm test:watch`.
- Run coverage with `pnpm coverage`.
- Lint source files with `pnpm lint`.
- Autofix lint issues with `pnpm lint:fix`.
- Reformat tracked source files with `pnpm format`.
- Check formatting in CI style with `pnpm format:check`.
- Run a typecheck with `pnpm exec tsc --noEmit`.

## 6. Code Formatting

### TypeScript

- Use 2-space indentation. Never use tabs.

```typescript
export function CountUp({ to, duration = 1400, className }: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
}
```

- Keep most lines within the configured Prettier width of 120 characters. Config lives in `.prettierrc`.
- Separate top-level declarations with one blank line.

```typescript
function hasTags(entry: LGTMEntry): boolean {
  return (entry.tags?.length ?? 0) > 0;
}

function cardStyle(isAnimating: boolean, rarityColor: string): CSSProperties {
  return {
    opacity: isAnimating ? 0 : 1,
  };
}
```

- Separate statements inside functions with blank lines when switching logical blocks.

```typescript
function toggleCategory(category: string) {
  setActiveCategories((prev) => {
    const next = new Set(prev);

    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }

    return next;
  });

  setPage(1);
}
```

- End every file with a trailing newline.
- Strip trailing whitespace.
- Use single quotes for strings.

```typescript
export const SETTINGS_KEY = 'lgtm-settings';
```

- Keep opening braces on the same line as declarations and control flow.
- Put a space around `=` and binary operators.
- Do not put spaces inside parentheses or brackets.
- Put one space after each comma.
- In object literals, place one space after each colon.
- Use one import per line.
- Use trailing commas in multi-line arrays, objects, parameters, and arguments.

```typescript
const THEMES: { value: Theme; icon: () => ReactElement; label: string }[] = [
  { value: 'system', icon: () => <Monitor size={18} aria-hidden="true" />, label: 'System theme' },
  { value: 'light', icon: () => <Sun size={18} aria-hidden="true" />, label: 'Light theme' },
  { value: 'dark', icon: () => <Moon size={18} aria-hidden="true" />, label: 'Dark theme' },
];
```

- Continue long expressions with implicit wrapping, not backslashes.
- Always terminate statements with semicolons.
- Let Prettier format TS and TSX files; the active config is `.prettierrc`.

### Astro

- Use 2-space indentation in frontmatter, markup, and scoped styles.
- Keep frontmatter imports and derived values at the top, then render markup below the closing `---`.

```astro
---
import { getAllEntries } from '@/lib/lgtm';
import BaseLayout from '@/layouts/base-layout.astro';
import { BrowseFilters } from '@/components/browse-filters';

const entries = getAllEntries();
---
```

- Use single quotes in frontmatter strings and in inline event handler strings.
- Use one blank line between major blocks in templates.
- Keep attributes split across lines once an element becomes dense.

```astro
<BaseLayout
  title="LGTM | Browse All Meanings"
  description={`All ${entries.length} alternative meanings of LGTM, filterable by category, rarity, and searchable by keyword.`}
>
```

- Use inline imperative handlers in markup when hover behavior is expressed directly on the element.

```astro
<a
  href="/browse"
  style="color: var(--color-text-muted);"
  onmouseout="this.style.color='var(--color-text-muted)';this.style.background='';"
  onmouseover="this.style.color='var(--color-text)';this.style.background='var(--color-surface-raised)';"
>
```

- Let Prettier with `prettier-plugin-astro` format `.astro` files.

### JavaScript Config

- Use 2-space indentation and single quotes in root config files.
- Keep imports one per line and end statements with semicolons.

```javascript
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
```

## 7. Naming Conventions

### TypeScript

- Use `camelCase` for variables, helper functions, and handlers.

```typescript
function applyTheme(theme: Theme) {
  const root = document.documentElement;
}
```

- Use boolean names that read like predicates.

```typescript
function isValidPageSize(value: unknown): value is PageSize {
  return VALID_PAGE_SIZES.includes(value as PageSize);
}
```

- Use `PascalCase` for exported React components and type aliases.

```typescript
export type RandomGeneratorProps = {
  entries: LGTMEntry[];
};

export function RandomGenerator({ entries, initialEntry }: RandomGeneratorProps) {
```

- Use `SCREAMING_SNAKE_CASE` for exported constants and lookup maps that behave like constants.

```typescript
export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare: 30,
  epic: 15,
  legendary: 5,
};
```

- Use kebab-case for filenames in `src/components/`, `src/lib/`, and `src/pages/`.
- Name React prop types with a `Props` suffix.
- Name test factories as short verbs such as `makeEntry`.
- Name test files as `<module>.test.ts` or `<module>.test.tsx`.

### Astro

- Use `type Props` for component props in frontmatter.

```astro
type Props = {
  href?: string;
  category: string;
  size?: 'sm' | 'md';
};
```

- Name derived template values descriptively, often by UI role.

```astro
const rarityBadgeSizeClasses = {
  sm: 'text-[0.6875rem] py-[0.2em] px-[0.5em] rounded',
  md: 'text-[0.75rem] py-[0.3em] px-[0.65em] rounded-md',
  lg: 'text-[0.875rem] py-[0.4em] px-[0.85em] rounded-lg',
}[badgeSize];
```

## 8. Type Annotations

### TypeScript

- Type exported props and exported domain shapes explicitly with `type`.

```typescript
export type LGTMEntry = {
  id: number;
  rarity: Rarity;
  meaning: string;
  tags?: string[];
  created_at?: string;
  description?: string;
  category: Category | string;
};
```

- Type React props on exported components.
- Use explicit return types on many small helpers, especially predicates and formatters.

```typescript
function matchesSearch(entry: LGTMEntry, query: string): boolean {
  return (
    entry.meaning.toLowerCase().includes(query) ||
    (entry.description?.toLowerCase().includes(query) ?? false) ||
    (entry.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false)
  );
}
```

- Use `unknown` for untrusted data before narrowing.

```typescript
function isValidSettings(value: unknown): value is Partial<Settings> {
  if (typeof value !== 'object' || value === null) return false;
  return true;
}
```

- Use built-in utility types like `Record` and `Partial` instead of interfaces.
- Use union literals for constrained values such as theme modes and page sizes.
- Use `import type` when the import is type-only. ESLint enforces this in `eslint.config.mjs`.
- Treat the repo as strict TypeScript via `astro/tsconfigs/strict` in `tsconfig.json`.

### Astro

- Type component props in frontmatter with `type Props`.
- Use local helper return types when they clarify rendering predicates.

```astro
function showTags(): boolean {
  return variant !== 'compact' && (entry.tags?.length ?? 0) > 0;
}
```

## 9. Imports

### TypeScript

- Keep one import per line.
- Place relative or aliased local imports after package imports.
- Use `@/` aliases for source imports rooted in `src/`.
- Use `import type` for type-only imports.
- Do not use wildcard imports.
- Keep complete import blocks compact; blank lines appear only when the file clearly separates groups.

```typescript
import type { Rarity } from '@/lib/lgtm';
import type { CSSProperties } from 'react';
import type { MascotContext } from '@/lib/mascot-lines';
import { SETTINGS_KEY, loadSettings } from '@/lib/settings';
import { pickLine, contextFromPath } from '@/lib/mascot-lines';
import { useRef, useState, useEffect, useCallback, Fragment } from 'react';
```

### Astro

- Keep aliased component and lib imports in frontmatter.
- Use `import type` for source-only types.

```astro
import { SITE_URL } from '@/lib/config';
import type { LGTMEntry } from '@/lib/lgtm';
import BaseLayout from '@/layouts/base-layout.astro';
import { getAllEntries, RARITY_LABELS } from '@/lib/lgtm';
import BreadcrumbBar from '@/components/breadcrumb-bar.astro';
```

### JavaScript Config

- Keep package imports only; root config files do not use path aliases.

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
```

## 10. Error Handling

### TypeScript

- Use `try`/`catch` only around browser APIs that can fail at runtime, especially `localStorage`, clipboard access, JSON parsing, and DOM APIs.
- Swallow these failures quietly when the UI has a safe fallback.
- Do not log before returning fallback values; the existing code favors silent degradation.
- Do not throw custom exceptions; there is no custom exception layer in this repo.
- Use early returns inside storage event handlers and guards.

```typescript
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSettings(parsed)) return { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
```

```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
  } catch {
    const input = document.createElement('input');
    input.value = shareUrl;
  }
};
```

### Astro

- Keep defensive `try`/`catch` blocks only inside inline scripts that touch browser storage before hydration.

```astro
try {
  const theme = localStorage.getItem(THEME_STORAGE_KEY);

  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  }
} catch {
  // Safeguard against localStorage access issues (e.g. private mode, disabled storage).
}
```

## 11. Comments and Docstrings

### TypeScript

- Do not add docstrings. The repo does not use JSDoc or module docblocks in source files.
- Use inline comments sparingly, mainly for linter suppressions or concise safeguard notes around browser edge cases.
- Place explanatory comments directly above the statement they qualify or as the only line in a `catch` block.
- Do not comment obvious business logic.

```typescript
useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

```typescript
} catch {
  // Safeguard against localStorage access issues.
}
```

### Astro

- Do not add template comments for obvious structure.
- Keep comments limited to defensive inline script notes when the failure mode is not obvious.

```astro
} catch {
  // Safeguard against localStorage access issues or invalid JSON.
}
```

## 12. Testing

> **Repo-wide:** Tests live in `src/test/` and target source modules from `src/components/` and `src/lib/`.

### Vitest

- Use Vitest with jsdom and React Testing Library. Config lives in `vitest.config.ts`.
- Run the full suite with `pnpm test`.
- Name files as `src/test/<module>.test.ts` or `src/test/<module>.test.tsx`.
- Group coverage with `describe(...)` blocks and `test(...)` cases.
- Use lowercase `should ...` descriptions.
- Clear mocks in setup hooks with `vi.clearAllMocks()`.
- Use `src/test/fixtures.ts` for shared entry creation.
- Use `src/test/setup.ts` for shared test runtime setup.

```typescript
import type { Rarity } from '@/lib/lgtm';
import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('get entry by id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return the correct entry', () => {
    const entry = getEntryById(1);
    expect(entry).toBeDefined();
    expect(entry!.id).toBe(1);
  });
});
```

```typescript
export function makeEntry(overrides: Partial<LGTMEntry> = {}): LGTMEntry {
  return {
    id: 1,
    category: 'nerd',
    rarity: 'common',
    ...overrides,
  };
}
```

## 13. Git

> **Repo-wide:** Commit subjects use a prefix, a colon, and a short imperative summary.

- Use `feat:` for new end-user functionality or new content capabilities.
- Use `fix:` for behavior corrections and regressions.
- Use `refactor:` for internal restructures that do not change behavior.
- Use `chore:` for maintenance and repository upkeep.
- Use `ci:` for workflow and automation changes.
- Use `test:` for test-only changes.
- Use `repo:` for foundational repository setup work.
- Do not use scoped commit prefixes like `feat(ui):`; the observed history uses unscoped prefixes.
- Keep branch names prefixed by work type, such as `feat/`, `fix/`, `chore/`, or `test/`.
- Keep commit subjects short and single-line; the existing history does not rely on commit bodies.
- Preserve signed commits when working in the existing history style.
- Expect a rebase-style history; merge commits are absent from the current log.

## 14. Dependencies and Tooling

### TypeScript and Astro

- Use `pnpm` as the package manager. The repo pins `pnpm@10.7.0` in `package.json`.
- Keep `pnpm-lock.yaml` committed.
- Add a runtime or development dependency with `pnpm add <package>` or `pnpm add -D <package>`.
- Use Prettier for formatting. Config lives in `.prettierrc`.
- Use ESLint for linting. Config lives in `eslint.config.mjs`.
- Use Astro strict TypeScript config through `tsconfig.json`.
- Use Vitest for tests through `vitest.config.ts`.
- Use Astro plus `@astrojs/react` for React islands, `@tailwindcss/vite` for Tailwind integration, and `@astrojs/vercel` for static deployment.
- Keep workflow updates in `.github/workflows/build.yml`, `.github/workflows/test.yml`, and `.github/workflows/verify.yml` when commands change.

### JavaScript Config

- Keep root config files in ESM format with `type: "module"` from `package.json`.
- Update `astro.config.mjs`, `eslint.config.mjs`, or `vitest.config.ts` directly when build or tooling behavior changes.

## 15. Red Lines

- Never switch the repo to `npm` or `yarn`; use `pnpm` commands and keep `pnpm-lock.yaml`.
- Never use double quotes in TypeScript, Astro frontmatter, or root config files unless the file already requires a different quoting context.
- Never omit semicolons in TS, TSX, or JS config files.
- Never use tabs for indentation.
- Never import source modules with long relative climbs when an `@/` alias fits.
- Never fetch LGTM data at runtime; read it from `src/lib/lgtm.ts` at build time.
- Never move interactive stateful UI into `.astro` when the current pattern calls for a React island.
- Never add a new data source or backend layer for entries without changing the project architecture intentionally.
- Never introduce `any` when `unknown`, unions, or concrete types can express the shape.
- Never add JSDoc blocks or explanatory comments to ordinary app logic.
- Never use `console.log` as part of normal implementation or tests.
- Never add wildcard imports.
- Never write test descriptions with title case or sentence case; keep them in lowercase `should ...` form.
- Never duplicate inline LGTM entry objects in tests when `makeEntry(...)` can express the fixture.
- Never commit workflow changes without keeping `build`, `test`, and `verify` aligned with the actual package scripts.
- Never use scoped commit prefixes like `feat(ui):`; keep the existing unscoped `feat:`, `fix:`, `refactor:`, `chore:`, `ci:`, `test:`, or `repo:` pattern.
