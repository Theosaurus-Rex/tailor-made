# Tailor-Made

A challenge generator for off-rack dresses in *Dressmaker*. Story clients hand you a card of
requirements. Off-rack dresses have none, so Tailor-Made makes one up: a client, a short brief and
a few directions to design towards. Share a challenge as a link, or take the daily one that everyone gets.

There is no backend and no account. Nothing is stored.

**Unofficial and unaffiliated.** Tailor-Made is a fan project. It uses no game art, client names
or card text.

**Status:** milestone M1 in progress. Scaffold, gate and CI are in. The generator core is next.
The design is in `docs/superpowers/specs/2026-10-16-tailor-made-design.md`.

## Credits

- [dressmakerwiki.site](https://dressmakerwiki.site) and
  [cozygameguides.com](https://cozygameguides.com) for the game data
- *Dressmaker* by Cozy Lives / Free Lives

---

## Requirements

| | |
|---|---|
| Node | 24 |
| pnpm | 9.15.9, pinned in `packageManager` |

pnpm is pinned, so let corepack pick the right version.

---

## Setup

```bash
corepack enable
pnpm install
pnpm exec playwright install chromium   # once, for test:e2e
pnpm dev
```

`pnpm dev` serves the app at the URL Vite prints.

---

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `tsc -b` then `vite build`. Typecheck is part of the build |
| `pnpm preview` | Serve the production build |
| `pnpm typecheck` | Types only, no emit |
| `pnpm lint` / `pnpm lint:fix` | ESLint, including the layering and determinism rules |
| `pnpm format` / `pnpm format:check` | Prettier (Markdown is excluded) |
| `pnpm test` | Vitest, once |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Vitest with v8 coverage |
| `pnpm test:e2e` | Playwright on a production build, desktop and mobile |
| `pnpm test:e2e:ui` | Playwright in its interactive UI mode |

**The gate before any commit:**

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build && pnpm test:e2e
```

CI runs the same gate on every pull request and on main.

---

## Project structure

```
src/
  game/        data and brief content, versioned        (no logic)
  domain/      directions, PRNG, generate, reroll, validate (pure)
  links/       share link encode and decode
  features/    screens, one directory each
  components/  shared UI, including the client card
  lib/         helpers
docs/          the design spec and the wireframes
e2e/           Playwright tests
```

Dependencies point one way: `features → links → domain → game`. Lint enforces it. It also bans
`Math.random` and `Date` in `domain/` and `game/`.
