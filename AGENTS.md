# AGENTS.md

This file defines the coding style, conventions, and architecture rules for this project.
Follow these rules precisely and consistently. Do not deviate unless explicitly asked.

---

## General Philosophy

- Write clean, minimal, readable code.
- No unnecessary comments. Code should be self-explanatory.
- No over-engineering. Solve the problem at hand, nothing more.
- Never add unrequested code, files, refactors, or abstractions.
- When in doubt, do less.
- Use blank lines to separate logical blocks everywhere: between functions, between inner blocks inside a function, between switch cases, between groups of related statements. Breathing room is part of readability.
- In arrays of objects or function calls, add a blank line between each entry only when the entries themselves are multiline. Single-line entries stay together with no blank lines between them.
- In JSX, add a blank line between sibling elements at the same level (e.g. two `<span>` next to each other must have a blank line between them).
- In JSX templates, avoid `if` statements and complex logic inline. Extract that logic into a named function and call it in the template instead.
- Ternary operators are allowed in JSX for simple conditional rendering or conditional class/style values. For anything more complex, extract to a function.
- Nested ternary chains (e.g. `a ? x : b ? y : c ? z : w`) are never allowed. Replace them with a lookup map (`Record<K, V>`) defined in the component's frontmatter or function body.
- When a `style` prop object has two or more properties whose values depend on the same condition, extract the entire style object into a named function (e.g. `filterButtonStyle(active, color)`) that returns a `CSSProperties` object. Never scatter multiple ternaries on the same condition across adjacent style properties.
- When a JSX map callback renders more than one element variant or contains non-trivial conditions, extract named predicate functions (e.g. `isLink`, `isLast`) into the frontmatter or component body. Each branch in the template must then be a simple `{condition && <element>}` — no inline ternaries between structurally different elements.
- Complex conditions — those involving multiple boolean operators (`&&`, `||`), optional-chaining combined with other checks, repeated `?? fallback` patterns, or conditions whose intent is not immediately obvious — must be extracted into a named function with a descriptive name. The function name should make the intent self-evident without needing a comment.

---

## Imports

- Sort all import statements by **string length**, shortest first.
- One import per line. No barrel-style inline grouping.
- Separate third-party imports from internal imports with a blank line only when it significantly aids readability — otherwise keep them together sorted by length.
- Use `@/` path aliases for internal imports.

**Example:**

```ts
import { useState } from 'react';
import { CLIENT } from '@/lib/constants';
import { it, enUS } from 'date-fns/locale';
import { isDate } from '@/lib/helpers/helpers';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
```

---

## Naming

- **Variables and functions**: `camelCase`, always descriptive and concise.
- **Types and interfaces**: `PascalCase`.
- **Files and folders**: `kebab-case`.
- **Test helpers/factories**: short, lowercase, meaningful (e.g. `ctl`).
- Avoid abbreviations unless they are universally understood (e.g. `id`, `qb`, `url`).
- Boolean variables should read as a question: `isDate`, `isOpen`, `hasError`.
- Hook files must be prefixed with `use-`: e.g. `use-links.ts`.

---

## TypeScript

- Always type props explicitly with a named `export type` above the component or function.
- Use `.d.ts` files for pure type definitions inside `domains/` and `types/`.
- Prefer `type` over `interface` unless declaration merging is needed.
- Do not use `any`. Use `unknown` and narrow when needed.
- Do not add types that were not asked for or are not strictly necessary.

---

## React (Frontend)

- Always add `'use client';` at the top of client components, before imports.
- Use **named exports** for components: `export function MyComponent`.
- Export the prop type above the component: `export type MyComponentProps = { ... }`.
- Keep components focused and small. Split into dedicated files when a component grows.
- Internal helper functions (e.g. casters, formatters) should be defined inside the component if small, or extracted to `lib/helpers.ts` if reusable.
- Use early returns inside handlers to avoid nesting.
- Do not leave unused state, props, or imports.
- Sort JSX attributes by **string length**, shortest first, same rule as imports. Multiline attributes (i.e. attributes whose value spans multiple lines, like object literals or multiline arrow functions) always go last, after all single-line attributes, regardless of their length.

**Example structure:**

```tsx
'use client';
import { ... } from '...'; // sorted by length

export type MyComponentProps = {
  value: string;
  onChange: (value: string) => void;
};

export function MyComponent(props: MyComponentProps) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

---

## Fastify (Backend)

- Each module has its own folder under `modules/` with: `routes.ts`, `services.ts`, `validators.ts`, `*.test.ts`.
- Route files export a single `async function` named after the resource (e.g. `measurements`), then use a named export at the bottom: `export { measurements }`.
- Always destructure params and body explicitly inside handlers.
- Always use `preHandler` arrays for auth: `[fastify.authenticate, fastify.authorize('resource')]`.
- Reply format is always consistent: `{ data: { ... }, error: null }` on success.
- Services are pure functions: they receive the supabase client and parameters, nothing else.
- Validators live in `validators.ts` and are imported as a named object (e.g. `measurements.post`, `measurements.patch`).

**Example route handler:**

```ts
fastify.post<{ Body: CreateMeasurement }>(
  '/',
  {
    schema: { body: validator.post },
    preHandler: [fastify.authenticate, fastify.authorize('measurements')],
  },
  async (request, reply) => {
    const body = request.body;
    const data = await createMeasurement(supabase, body);
    return reply.status(201).send({ data: { measurement: data }, error: null });
  },
);
```

---

## Testing

- Use **Vitest**: `describe`, `test`, `expect`, `vi`, `beforeEach`.
- Import order follows the same length-sorting rule.
- Use `beforeEach(() => { vi.clearAllMocks(); })` in every describe block.
- Test descriptions follow the pattern: `'should [do something]'` and `'should throw if [something] fails'`. Always fully lowercase — no uppercase anywhere in the description, including acronyms (e.g. `'should return the user id'`, not `'should return the user ID'`).
- Use a local factory function (e.g. `ctl(data, error, count)`) to create mock clients — do not repeat mock setup inline.
- Fixtures live in `tests/fixtures.ts` and are imported as named exports.
- Group tests with `describe('resource', () => { describe('service', () => { ... }) })`.
- Every happy path test has a corresponding failure test.

**Example:**

```ts
test('should create a measurement', async () => {
  client = ctl(measurement);
  expect(await createMeasurement(client, { profile: measurement.profile })).toEqual(measurement);
});

test('should throw if measurement creation fails', async () => {
  client = ctl(null, { message: messages.failures.create });
  await expect(createMeasurement(client, { profile: measurement.profile })).rejects.toThrow();
});
```

---

## Folder Structure

### Monorepo root (`nexus/`)

```
apps/         # Frontend applications
services/     # Backend services (Fastify)
packages/     # Shared packages
platform/     # Infrastructure / platform config
toolchain/    # Build tooling
scripts/      # Utility scripts
docs/         # Documentation
```

### Frontend app (`apps/<app>/`)

```
app/          # Next.js pages (page.tsx, layout.tsx, loading.tsx)
modules/      # Feature modules: forms/, dialogs/, datatables/ per domain
domains/      # API calls (api.ts) and types (types.d.ts) per domain
components/   # ui/ | overrides/ | common/ | layout/
hooks/        # Custom hooks (use-*.ts)
providers/    # React context providers
stores/       # State stores
lib/          # http.ts, utils.ts, constants.ts, helpers.ts
types/        # Global type declarations (.d.ts)
messages/     # i18n JSON files
tests/        # e2e/, integration/, fixtures.ts, setup.ts
```

### Backend service (`services/<service>/`)

```
modules/      # routes.ts, services.ts, validators.ts, *.test.ts per domain
domains/      # types.d.ts per domain
plugins/      # Fastify plugins (auth.ts, query.ts)
lib/          # errors.ts, auth.ts, constants.ts, helpers.ts, supabase.ts
types/        # global.d.ts
messages/     # errors.json
tests/        # e2e/, integration/, fixtures.ts, setup.ts
app.ts        # Fastify app entry point
```

---

## What NOT to Do

- Do not add comments explaining what the code does.
- Do not add `console.log` statements.
- Do not create extra abstraction layers that were not asked for.
- Do not refactor files that are not part of the current task.
- Do not change import style, formatting, or naming in files you are only partially editing.
- Do not use default exports.
- Do not sort imports alphabetically — sort by string length.
- Do not add `index.ts` barrel files unless explicitly asked.
- Do not drop into plain CSS for a styling problem if it can be solved with Tailwind utility classes. Always try Tailwind first.
