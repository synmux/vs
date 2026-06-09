# AGENTS.md — `vs`, a Vampire Survivors companion TUI/CLI

Context for AI agents working on this repo. `CLAUDE.md` is a symlink to this file.

## What this is

A Bun + TypeScript terminal app for the game *Vampire Survivors*. It fetches data
from the official wiki, caches it locally, and lets you navigate it — centred on
**weapon evolutions**. Two faces over one data core:

- **TUI** (`vs`, or `vs <section>`): a sidebar of sections, each a list+detail
  view, with cross-linking between related entities and a `/` fuzzy command
  palette. Built with the imperative `@opentui/core` API.
- **CLI** (`vs evolve`, `vs build`, `vs search`, …): pipeable stdout lookups,
  all with `--json`.

## Run / test / build

```bash
bun install
bun test                       # all tests (no network — uses test/fixtures)
bunx tsc --noEmit              # typecheck
bun run index.ts               # launch the TUI
bun run index.ts evolve "Bloody Tear"   # a CLI lookup
bun run index.ts refresh       # re-fetch data from the wiki into the cache
bun run build:bin              # standalone binary → dist/vs (bundles the native dylib)
bun test/fixtures/capture.ts   # MANUAL: re-capture test fixtures from the live wiki
```

Runtime is **Bun only** (OpenTUI loads a Zig renderer over FFI; `node` won't work).

## Architecture (strict layering)

`data/` (HTTP+JSON) → `domain/` (pure logic) ← `tui/` and `cli/` (via `repository.ts`). `util/` depends on nothing.

- `src/data/bucket/` — the wiki uses the **Bucket** extension (`action=bucket`),
  not Cargo/SMW. `query.ts` builds the Lua query string, `client.ts` fetches,
  `normalize.ts` is the linchpin (see gotchas).
- `src/data/{schema,fetcher,cache,repository}.ts` — table specs, parallel
  fetch, atomic XDG-dir cache, and the cache-or-fetch façade with memoized
  `evolutionGraph()`/`searchIndex()`.
- `src/domain/` — `entities.ts` (row→camelCase), `evolution-graph.ts`,
  `solver.ts`, `planner.ts`, `search-index.ts`, `resolve.ts`. All pure.
- `src/tui/` — `app.ts` (wires everything), `shell.ts`, `router.ts`, `focus.ts`,
  `nav.ts`, `palette.ts`, `view.ts` (View + ListDetailView base), `views/*`.
- `src/cli/` — `main.ts` (commander), `commands/*`, `context.ts`, `output.ts`.

## Non-obvious gotchas (verified against real data)

- **Bucket omits empty fields** and serialises boolean-true as `""`. Parse by
  **key presence**, never truthiness — that's what `normalizeRow` does, once, at
  cache-write time. Everything downstream sees clean, defaulted, typed rows.
- **Multi-base recipes are AND.** Phieraggi needs *both* Phiera Der Tuphello and
  Eight The Sparrow (plus Tirajisú). The planner requires all bases.
- **`page_name` is not unique** for characters/stages/bestiary (skins, legacy,
  mode variants) — views/CLI de-dupe with `uniqueBy`. Weapons cross-reference by
  page name in `passive_evolutions`.
- **Weapons carry no description/order/is_default** in the Bucket; values can
  contain wiki/HTML markup → `cleanWikiText` for display.
- **OpenTUI is pre-1.0** (`@opentui/core@0.3.4`, pinned). It routes keys to the
  focused widget but does NOT move focus between widgets — `FocusRing` does. A
  focused `Input` receives printable keys, so the global handler suppresses
  globals while the palette is open. Tests run headlessly via
  `@opentui/core/testing` `createTestRenderer` + `captureCharFrame`.

## Conventions

- **TDD**: write the failing test first; logic/side-effecting code is tested,
  trivial getters/config/pure-UI are not. Tests use real captured fixtures
  (`test/fixtures/*.json`) and never hit the network.
- Descriptive names everywhere; British English in prose.
- Commit per feature using Conventional Commits + a GitMoji emoji.

## Bun usage (project default — never Node/npm/pnpm/vite)

- `bun <file>`, `bun test`, `bun install`, `bun run <script>`, `bunx <pkg>`.
- Prefer `Bun.file`/`Bun.write` over `node:fs` read/write; `fetch` is built-in;
  Bun auto-loads `.env`. We do not use React.


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
