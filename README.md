# vs — Vampire Survivors companion

A fast terminal helper for [*Vampire Survivors*](https://vampire.survivors.wiki/).
Browse weapon **evolutions**, weapons, passives, characters, stages, arcanas and
the bestiary — in an interactive TUI or as quick, pipeable commands. Data comes
from the official wiki and is cached locally, so it's instant and works offline
after the first fetch.

Built with [Bun](https://bun.com), [OpenTUI](https://github.com/anomalyco/opentui)
and [commander](https://github.com/tj/commander.js).

## Install

```bash
bun install
```

Optionally make `vs` available everywhere:

```bash
bun link                       # registers vs (needs Bun's global bin dir on PATH)
# …or build a standalone binary:
bun run build:bin              # → dist/vs
```

Otherwise just run it with `bun run index.ts <args>`.

## First run

The first command fetches all data from the wiki and caches it under your data
dir (`~/.local/share/vs-tui/`, or `$XDG_DATA_HOME`, or `$VS_DATA_DIR`). After
that everything is served from the cache:

```bash
vs refresh                     # fetch / update the local cache
```

## TUI

```bash
vs                             # launch the app
vs evolutions                  # …open straight to a section
```

| Key | Action |
| --- | --- |
| `↑ ↓` | move within the focused list / sidebar |
| `Tab` / `Shift-Tab` | move focus (sidebar → list → detail) |
| `1`–`9` | jump to a cross-linked entity shown in the detail panel |
| `/` | open the fuzzy command palette |
| `Esc` | go back (cross-link history), then focus the sidebar |
| `q` / `Ctrl-C` | quit |

The **Evolutions** section is the centrepiece: pick a result weapon to see its
full recipe (base weapon(s) + required passive(s), with max-level / glimmer /
gift conditions), then press a number to jump to any base, passive, or the
weapon itself. Weapons, passives and characters cross-link the same way.

## CLI

Every lookup supports `--json` for scripting and works when piped.

```bash
vs evolve "Bloody Tear"        # how it's made → Whip + Hollow Heart
vs evolve "Whip"               # what it evolves into → Bloody Tear
vs build --have "Whip, Hollow Heart, Spinach"   # achievable now / one item away
vs search vandal               # fuzzy search across everything
vs weapon "Holy Wand"          # weapon details + evolution links
vs character "Imelda"          # character details + base stats
vs evolve "Bloody Tear" --json # machine-readable output
vs evolutions | grep Whip      # piped section listing (no TUI)
```

A command that would open the TUI (`vs`, `vs <section>`) prints a plain listing
instead when its output is piped, so it stays scriptable.

## Development

```bash
bun test                       # run the test suite (offline; uses test/fixtures)
bunx tsc --noEmit              # typecheck
bun test/fixtures/capture.ts   # re-capture fixtures from the live wiki (manual)
```

Data flows `data/` → `domain/` → `tui/` and `cli/`. See `AGENTS.md` for the
architecture and the wiki-data gotchas the code is designed around.
