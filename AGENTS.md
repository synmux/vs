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
