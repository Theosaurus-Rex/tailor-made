# Tailor-Made

A challenge generator for off-rack dresses in *Dressmaker*. Story clients hand you a card of
requirements. Off-rack dresses have none, so Tailor-Made makes one up: a client, a short brief and
a few directions to design towards. Share a challenge as a link, or take the daily one that everyone gets.

There is no backend and no account. Nothing is stored.

**Unofficial and unaffiliated.** Tailor-Made is a fan project. It uses no game art, client names
or card text.

**Status:** the generator and every screen are built. Milestone M6 (tune and launch) is underway.
The Netlify deploy waits for two content fixes, then the game gets playtested. The design is in
`docs/superpowers/specs/2026-10-16-tailor-made-design.md`.

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
| `pnpm snapshots:rewrite` | Rewrites the pinned challenges in `src/domain/fixtures/`. Rewriting breaks old share links. Do not run it to make a test pass |
| `pnpm grammar:sample` | Writes `docs/notes/grammar-sample.md`, a read-through of generated briefs and client lines for grammar checks |
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
  game/        versioned data and brief content, six client voices   (no logic)
  domain/      directions, PRNG, generate, reroll, validate, daily   (pure)
  domain/fixtures/  the pinned challenges that guard old share links
  links/       share link encode and decode
  features/    screens, one directory each
  components/  shared UI: the app shell, the client card, shadcn primitives
  lib/         helpers
docs/          the design spec, the wireframes, the visual direction, notes and case study
e2e/           Playwright tests
scripts/       the snapshot writer
```

Dependencies point one way: `features → links → domain → game`. Lint enforces it. It also bans
`Math.random` and `Date` in `domain/` and `game/`.

---

## Design

The look is Rosewood Atelier: a dark rosewood ground, cream type and one dusty rose accent. Fonts
are self-hosted through `@fontsource`, so the app loads nothing from a font CDN. The palette, type
and component shapes are in `docs/design/rosewood-atelier.md`.

Build to the hi-fi frames in `docs/wireframes/hifi/frames/`. `docs/wireframes/README.md` indexes
them. Desktop and mobile switch at 768px.

In development only, `/debug` shows a batch of generated challenges. It is not in the production
build.
