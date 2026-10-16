# Tailor-Made — product and foundations design

**Date:** 2026-10-16
**Status:** Draft for review

## 1. What it is

Tailor-Made generates commission-style challenges for off-rack dresses in *Dressmaker*
(Cozy Lives / Free Lives, Steam, released 2026-09-21). Story clients hand the player a card of
requirements. Off-rack dresses have none. Tailor-Made supplies them: a generated client, a short
brief, and a list of rules in the same shape as the game's own cards.

**Audience: the Dressmaker community first.** It is a public tool. The portfolio case study in
`dev-portfolio-2025` is the other main payoff, so the process is documented as it happens.

Unofficial and unaffiliated. No game art, client names or card text are reused.

### Success looks like

- A player opens the site, gets a challenge that reads like a real commission, and can make it
  in the game.
- A challenge can be shared as a link, and the link rebuilds the exact same challenge.
- There is one daily challenge that is the same for everyone.
- The case study can tell the story from research to launch with artefacts captured on the way.

## 2. Scope

**v1**

- Challenge generator with a difficulty dial (Easy, Medium, Hard, Chaos)
- Generated client briefs: name, occasion, flavour text, rules
- Per-rule reroll
- Modifiers, starting with Burlap only
- Share link and copy-as-text
- Daily challenge
- Tick-off checklist while sewing, not persisted
- About page with credits, data version and disclaimer

**Not v1, in rough priority order**

1. History and daily streaks, local to the browser, with JSON export
2. Daily gallery of player screenshots (needs a backend, storage and moderation)
3. Unlock filter by shop rank or checklist
4. Feasibility checker using per-fabric tag scores

**Cut line.** If briefs and difficulty together are too much, keep the briefs and drop the dial.
The app then ships one fixed setting equal to Medium.

## 3. Stack

Same as nuzlocke-tracker, minus the storage layer.

| Concern | Choice |
|---|---|
| Build / UI / language | Vite, React, TypeScript `strict` |
| Styling / components | Tailwind 4, shadcn/ui |
| Routing | React Router, declarative mode |
| Tests | Vitest, React Testing Library, Playwright, axe |
| Hosting | Netlify, static |
| Package manager | pnpm |

There is no storage and no backend in v1. The only server-side piece is a Netlify function for
link-preview images, added in M6. Check current versions at scaffold time rather than copying the
tracker's.

## 4. Game data

Source: dressmakerwiki.site (fan wiki, data from build 410), cross-checked against
cozygameguides.com. Credited in the data file header and on the About page.

The generator works at the level of **fabric types**, not individual fabrics. The game has
roughly 350 fabrics, but a rule like "must use velvet" only needs the 8 types. This keeps the
dataset small, hand-written and stable across game updates.

| Set | Contents |
|---|---|
| Style tags (22) | Casual, Cool, Cute, Daywear, Eclectic, Elaborate, Elegant, Eveningwear, Flowers, Formal, Glamour, Gothic, Patterned, Playful, Professional, Risqué, Romantic, Shimmering, Simple, Uncomfortable, Warm, Workwear |
| Fabric types (8) | Burlap, Cotton, Lace, Linen, Sequin, Silk, Velvet, Wool |
| Colours (11) | Black, Blue, Brown, Green, Grey, Orange, Pink, Purple, Red, White, Yellow |
| Accessory types | Appliqué, Bell, Bow, Brooch, Button, Feather, Flower, Jewel, Lace Trim, Piping, Tassel, Trim |

Each tag carries a typical requested range taken from real cards. Each fabric type carries the
tags it leans towards. Each accessory type is marked as counted per piece or per centimetre.

"Floral" and "patterned" are not separate properties in the game. They are the Flowers and
Patterned tags, so they are expressed as tag rules.

Tag scores in the game add up across pieces, fabrics and accessories, and are not capped at 100.
Real cards mostly ask for 20 to 80 per tag and 70 to 80 Quality.

Uncommon tags (Uncomfortable, Casual, Shimmering) are kept in the data but weighted low, matching
how rarely real cards ask for them.

### Versioning

Data lives in `src/game/data/v1.ts` and is **frozen once published**. Any change, including a game
update that adds content, goes into a new `v2.ts`. Every share link names its data version, so
old links keep rebuilding the challenge they were made with. The same applies to brief content
in `src/game/briefs/`.

## 5. Rules

The rule types copy the game's commission cards.

| Type | Example |
|---|---|
| `tagMin` | Cute at least 60 |
| `tagMax` | Romantic at most 20 |
| `qualityMin` | Quality at least 75 |
| `budget` | Budget 800 |
| `colourAvoid` | Avoid black |
| `colourOnly` | Use only white |
| `colourMinPct` | At least 40% red |
| `distinctColoursMin` | At least 3 different colours |
| `fabricMinPct` | At least 50% velvet |
| `fabricOnly` | Burlap only (modifier only) |
| `accessoryMin` | At least 5 bows |
| `accessoryExact` | Exactly 4 feathers |
| `trimCm` | 100cm of lace trim |

A `Rule` is a tagged union on `type`. Each rule renders to a number line ("Cute ≥ 60") and a
plain-English client line ("Make it sweet, darling.").

## 6. Generator

```
generate({ seed, difficulty, modifiers, dataVersion }) → Challenge
reroll(challenge, ruleIndex) → Challenge
```

Pure functions in `src/domain/`. No I/O, no `Math.random`, no `Date`.

1. Seed a PRNG from the input.
2. Pick an occasion theme. The theme weights which tags, fabric types, colours and accessories
   are likely.
3. Pick the rule count and rule types allowed by the difficulty.
4. Fill each rule from the weighted pools, within the difficulty's ranges.
5. Validate. Reject and redraw any rule that contradicts another.
6. Pick a client name and brief template and fill it.

### Contradictions rejected

- `tagMin` and `tagMax` on the same tag where min > max
- `colourOnly` with a `colourMinPct` or `distinctColoursMin` it cannot satisfy
- `colourAvoid` on a colour that a `colourOnly` or `colourMinPct` requires
- Two `fabricMinPct` rules summing over 100%
- `accessoryMin` and `accessoryExact` on the same accessory that disagree
- A `budget` below a floor estimated from the other rules' minimum material cost

### Reroll

Rerolling rule *i* draws from a sub-seed of `seed`, `i` and that rule's reroll count. The rest of
the challenge stays the same. Reroll counts are part of the share link, so a rerolled challenge
still shares exactly.

### Share link format

```
/c?v=1&s=<seed>&d=<difficulty>&m=<modifiers>&r=<reroll counts>
```

`v` is required. A link with an unknown `v`, or an unparsable parameter, shows a friendly error
with a "make a new one" button, never a blank page.

### Seed format

A random seed is 8 characters from `23456789abcdefghjkmnpqrstuvwxyz` (lowercase, no `0 1 i l o`,
URL-safe, about 39 bits), made with `crypto.getRandomValues` outside `src/domain/`. A daily seed is
the UTC date as `YYYY-MM-DD`, which must be a real calendar date. The PRNG is cyrb128 (seed hash)
into sfc32, using only 32-bit integer maths. It must never change for data version 1, because any
change moves every challenge and breaks every share link.

## 7. Difficulty

Starting values. M6 playtesting tunes them.

| | Rules | Tag mins | Quality | Extras |
|---|---|---|---|---|
| Easy | 2–3 | 20–40 | 60 | No ceilings, colour or accessory rules |
| Medium | 3–4 | 30–55 | 70 | One colour **or** accessory rule |
| Hard | 4–6 | 45–70 | 75–80 | One ceiling, budget possible |
| Chaos | 5–7 | 55–80 | 80 | One opposing pair, `colourOnly`, exact counts |

**Opposing pairs**, hand-written: Cute/Gothic, Simple/Elaborate, Casual/Formal, Warm/Cool,
Daywear/Eveningwear.

- Chaos includes exactly one pair as two `tagMin` rules.
- Hard may put a `tagMax` on one side of a pair.
- Easy and Medium never touch a pair.

## 8. Modifiers

**Burlap only** (`m=burlap`). Burlap is the free mock-up fabric and is excluded from every other
challenge. With the modifier on:

- Adds `fabricOnly: Burlap`
- Removes fabric and colour rules
- Favours accessory and trim rules, since they carry the tag scores
- Lowers tag thresholds one difficulty step, because burlap scores negative on many tags

Never used for the daily challenge. Modifiers are a list, so others (Monochrome, No accessories)
can be added later without changing the link format.

## 9. Briefs

Hand-written content in `src/game/briefs/`, versioned with the data.

- **About 25 occasion themes.** Each has tag, fabric, colour and accessory weights and 3–4
  templates with slots. Example: *"{name} is attending {occasion} and wants to look {adjective}
  without {worry}."*
- **Names** from first-name and surname lists, with a small share of non-human clients.
- **Rule phrasing**: one or more client lines per rule type, filled with the rule's values.
- All original. No game characters, names or card text.

This is most of the writing effort. If it runs long, cut themes before cutting anything else.

## 10. Daily challenge

- Seed is the UTC date (`2026-10-16`), so everyone gets the same challenge at the same moment.
- Difficulty by weekday: Mon Easy, Tue Medium, Wed Medium, Thu Hard, Fri Hard, Sat Hard,
  Sun Chaos.
- No modifiers. Always the latest data version on the day, recorded in its share link.
- Countdown to the next UTC midnight.

## 11. Screens

| Route | Screen |
|---|---|
| `/` | Generator: difficulty, modifiers, Generate, client card, per-rule reroll, copy link, copy text |
| `/daily` | Today's client card, difficulty badge, countdown |
| `/c` | Shared challenge: client card from the link, "make your own" |
| `/about` | How rules map to the game, credits, data version and build, disclaimer |

The client card is shared by all three challenge screens. Each rule on it can be ticked off.
Ticks are component state and reset on reload.

Desktop and mobile are designed and tested as equals.

Clients get a monogram or simple mark, never game art. The visual direction in M0 decides its
form.

**Copy as text** produces plain text that reads well pasted into Discord or Reddit: client name,
brief, rules as a list, and the link.

## 12. Layering

```
src/
  game/        data and brief content, versioned        (no logic)
  domain/      rules, PRNG, generate, reroll, validate   (pure)
  links/       share link encode and decode
  features/    screens, one directory each
  components/  shared UI, including the client card
  lib/         helpers
```

Dependencies point one way: `features` → `links` → `domain` → `game`.

## 13. Testing

- **Determinism:** fixed seeds produce snapshot-pinned challenges. A change that moves them fails,
  which is what protects old share links.
- **Property tests over thousands of seeds per difficulty:** no contradictions, rule counts within
  range, values within range, Burlap never appears without the modifier, Chaos always has a pair.
- **Round trip:** every generated challenge encodes to a link and decodes to an equal challenge.
- **Reroll:** changes only the target rule and survives a share round trip.
- **Bad links:** unknown version and junk parameters show the error state.
- **Playwright** on desktop and mobile for generate, reroll, share and daily. axe on every screen.
- **Mutation probes** in the tracker's style for each guarantee above: break it, see the suite go
  red, restore.

## 14. Milestones

| | Milestone | Done when |
|---|---|---|
| M0 | Design | Lo-fi flows, moodboard, 3–4 directions, a pick, hi-fi frames in `docs/wireframes/` |
| M1 | Scaffold | Repo, toolchain, commit gate, CI, Netlify deploy, CLAUDE.md, README |
| M2 | Generator core | Data v1, rule types, PRNG, generate, validation, property tests, a debug page |
| M3 | Briefs and difficulty | Themes, names, templates, difficulty table, opposing pairs, Burlap only |
| M4 | Screens | Generator, shared link, reroll, copy link and text, tick-off, About |
| M5 | Daily | UTC date seed, weekday difficulty, countdown |
| M6 | Tune and launch | Playtest about 5 per difficulty in game, retune, axe and Playwright, link previews, community post |

M2 can start alongside M0, since it has no UI.

Backlog lives in Theo's personal Linear workspace, with dependency order and milestones as in the
tracker. Each issue names the wireframe frames it is drawn from.

## 15. Case study

A new `src/content/projects/tailor-made.mdx` in `dev-portfolio-2025`, using the existing
case-study components.

**ProcessStrip:** Research → Flows → Moodboard → Directions → Hi-fi → Generator → Tuning → Launch.

Angles the tracker case study did not have:

- **Research:** turning a month-old game's commission cards into a rule grammar
- **Generator:** seeded challenges, versioned data, tests over thousands of seeds
- **Tuning:** Chaos before and after playtesting
- **Launch:** how the community responded

**Capture as you go.** Issues that produce a showable artefact carry a `case-study` label and a
checklist item to save screenshots to `docs/case-study/`.

## 16. Open questions

- **Game updates.** Build 443 added fabrics, accessories and skirts after the wiki's build 410
  data. Check whether any new accessory type or fabric type appeared before freezing v1.
- **Accessory caps.** The game caps accessory tag contributions, but the formula is undocumented.
  Only matters for the stretch feasibility checker.
- **Domain.** Netlify subdomain to start. Decide on a custom domain at launch.
