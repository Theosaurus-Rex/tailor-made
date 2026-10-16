# Tailor-Made — product and foundations design

**Date:** 2026-10-16
**Status:** Draft for review. Revised 2026-10-17: directions checked by eye replace scored rules.

## 1. What it is

Tailor-Made generates commission-style challenges for off-rack dresses in *Dressmaker*
(Cozy Lives / Free Lives, Steam, released 2026-09-21). Story clients hand the player a card of
requirements. Off-rack dresses have none. Tailor-Made supplies them: a generated client, a short
brief, and a few directions to design towards.

Directions inspire, they do not measure. Off-rack dresses show no tag scores, no Quality and no
running cost, so the player has no way to check those numbers. Every direction must be something
the player can judge by eye: a style, a fabric, a colour to use or avoid, an accessory to add, or
a small count they can tally.

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
- Generated client briefs: name, occasion, flavour text, directions
- Per-direction reroll
- Modifiers, starting with Burlap only
- Share link and copy-as-text
- Daily challenge
- Tick-off checklist while sewing, not persisted
- About page with credits, data version and disclaimer

**Not v1, in rough priority order**

1. History and daily streaks, local to the browser, with JSON export
2. Daily gallery of player screenshots (needs a backend, storage and moderation)
3. Unlock filter by shop rank or checklist

**Out of scope for good:** any number the game hides on off-rack dresses (tag scores, Quality,
budget, colour or fabric percentages) and any feasibility checker built on them. Trim lengths are
out too, since they are hard to judge by eye. Counts the player can make by looking stay in (§5).

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
| Hosting | Netlify, static (deployed in M6) |
| Package manager | pnpm |

There is no storage and no backend in v1. The only server-side piece is a Netlify function for
link-preview images, added in M6. Check current versions at scaffold time rather than copying the
tracker's.

## 4. Game data

Source: dressmakerwiki.site (fan wiki, data from build 410), cross-checked against
cozygameguides.com. Credited in the data file header and on the About page.

The generator works at the level of **fabric types**, not individual fabrics. The game has
roughly 350 fabrics, but a direction like "use velvet" only needs the 8 types. This keeps the
dataset small, hand-written and stable across game updates.

| Set | Contents |
|---|---|
| Style tags (22) | Casual, Cool, Cute, Daywear, Eclectic, Elaborate, Elegant, Eveningwear, Flowers, Formal, Glamour, Gothic, Patterned, Playful, Professional, Risqué, Romantic, Shimmering, Simple, Uncomfortable, Warm, Workwear |
| Fabric types (8) | Burlap, Cotton, Lace, Linen, Sequin, Silk, Velvet, Wool |
| Colours (11) | Black, Blue, Brown, Green, Grey, Orange, Pink, Purple, Red, White, Yellow |
| Accessory types | Appliqué, Bell, Bow, Brooch, Button, Feather, Flower, Jewel, Lace Trim, Piping, Tassel, Trim |

The data holds names and leanings only, never scores from the game. Each fabric type and
accessory type carries the tags it leans towards, so a theme can pull in things that fit its
style (a Gothic theme reaches for velvet, lace, black and feathers). Each accessory type is also
marked as placed per piece or per centimetre. Only per-piece types can be counted.

"Floral" and "patterned" are not separate properties in the game. They are the Flowers and
Patterned tags, so they are expressed as style directions.

Uncommon tags (Uncomfortable, Casual, Shimmering) are kept in the data but weighted low, matching
how rarely real cards ask for them.

### Versioning

Data lives in `src/game/data/v1.ts` and is **frozen once published**. Any change, including a game
update that adds content, goes into a new `v2.ts`. Every share link names its data version, so
old links keep rebuilding the challenge they were made with. The same applies to brief content
in `src/game/briefs/`.

## 5. Directions

The game's commission cards inspire the directions. The player judges each one by eye, so the
only numbers are small counts they can tally by looking at the dress. It is all in good fun:
nothing is scored, and the player is trusted to call it.

| Type | Short line | Client line |
|---|---|---|
| `style` | Gothic | "Something with a little darkness to it." |
| `styleAvoid` | Not cute | "Nothing sweet, please. I'm not a cupcake." |
| `fabric` | Velvet | "I adore velvet." |
| `fabricAvoid` | No sequins | "Sequins make me itch." |
| `fabricOnly` | Burlap only | Modifier only |
| `colour` | Red | "Red, wherever you can." |
| `colourAvoid` | No black | "No black. I'm not in mourning." |
| `colourOnly` | Only white | "All white, head to toe." |
| `accessory` | Bows | "Bows! I love a bow." |
| `accessoryAvoid` | No feathers | "No feathers, I sneeze." |
| `accessoryMin` | At least 5 bows | "Bows everywhere. Five at the very least." |
| `accessoryExact` | Exactly 3 brooches | "Three brooches. One for each of my ex-husbands." |
| `coloursMin` | At least 3 colours | "I want colour, and lots of it." |

Counts stay small (roughly 2 to 8) so they are quick to check. `accessoryMin` and
`accessoryExact` only use per-piece accessory types.

A `Direction` is a tagged union on `type`. Each direction renders to a short line for the
checklist and a plain-English client line for the brief.

## 6. Generator

```
generate({ seed, difficulty, modifiers, dataVersion }) → Challenge
reroll(challenge, directionIndex) → Challenge
```

Pure functions in `src/domain/`. No I/O, no `Math.random`, no `Date`.

1. Seed a PRNG from the input.
2. Pick an occasion theme. The theme weights which tags, fabric types, colours and accessories
   are likely.
3. Pick the direction count and direction types allowed by the difficulty.
4. Fill each direction from the weighted pools.
5. Validate. Reject and redraw any direction that contradicts or repeats another.
6. Pick a client name and brief template and fill it.

### Contradictions rejected

- The same tag, fabric type, colour or accessory type both asked for and avoided
- A `colourOnly` alongside a `colour` or `colourAvoid` on a different colour, or a `coloursMin`
- A `fabricOnly` alongside a `fabric` on a different fabric type
- A `coloursMin` higher than the colours left after avoids
- More than one `colourOnly` or `fabricOnly`
- More than one count on the same accessory type
- Both sides of an opposing pair, outside Chaos (see §7)
- The same item asked for twice

### Reroll

Rerolling direction *i* draws from a sub-seed of `seed`, `i` and that direction's reroll count.
The rest of the challenge stays the same. Reroll counts are part of the share link, so a rerolled
challenge still shares exactly.

### Share link format

```
/c?v=1&s=<seed>&d=<difficulty>&m=<modifiers>&r=<reroll counts>
```

`v` is required. A link with an unknown `v`, or an unparsable parameter, shows a friendly error
with a "make a new one" button, never a blank page.

### Seed format

A random seed is 8 characters from `23456789abcdefghjkmnpqrstuvwxyz` (lowercase, no `0 1 i l o`,
URL-safe, about 39 bits), made with `crypto.getRandomValues` outside `src/domain/`. A daily seed is
the UTC date as `YYYY-MM-DD`, which must be a real calendar date. The PRNG is cyrb128 (seed hash,
`scrambleSeed`) into sfc32 (`numberStream`), with the first 15 draws thrown away, using only 32-bit
integer maths. It must never change for data version 1, because any change moves every challenge and
breaks every share link. `docs/notes/seeds.md` explains it in plain English.

## 7. Difficulty

Difficulty comes mostly from how many directions there are and how much they pull against each
other, and a little from counts. Starting values. M6 playtesting tunes them.

| | Directions | Shape |
|---|---|---|
| Easy | 2–3 | Styles, fabrics and colours to use. No avoids or counts. |
| Medium | 3–4 | Adds accessories, one avoid, and one "at least" count |
| Hard | 4–5 | Up to two avoids and two counts. `colourOnly` possible. Styles may pull apart (see below) |
| Chaos | 5–6 | One opposing pair. `colourOnly` likely. Exact counts. Picks may ignore the theme's leanings |

**Opposing pairs**, hand-written: Cute/Gothic, Simple/Elaborate, Casual/Formal, Warm/Cool,
Daywear/Eveningwear.

- Chaos includes exactly one pair as two `style` directions ("cute **and** gothic").
- Hard may avoid one side of a pair while asking for something that leans towards it.
- Easy and Medium never touch a pair.

## 8. Modifiers

**Burlap only** (`m=burlap`). Burlap is the free mock-up fabric and is excluded from every other
challenge. With the modifier on:

- Adds `fabricOnly: Burlap`
- Removes other fabric and colour directions
- Favours accessory directions, since they carry most of the look

Never used for the daily challenge. Modifiers are a list, so others (Monochrome, No accessories)
can be added later without changing the link format.

## 9. Briefs

Hand-written content in `src/game/briefs/`, versioned with the data.

- **About 25 occasion themes.** Each has tag, fabric, colour and accessory weights and 3–4
  templates with slots. Example: *"{name} is attending {occasion} and wants to look {adjective}
  without {worry}."*
- **Names** from first-name and surname lists, with a small share of non-human clients.
- **Direction phrasing**: several client lines per direction type, filled with the item named.
  Specific lines for common items ("I adore velvet") beat generic ones ("Use {fabric}").
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
| `/` | Generator: difficulty, modifiers, Generate, client card, per-direction reroll, copy link, copy text |
| `/daily` | Today's client card, difficulty badge, countdown |
| `/c` | Shared challenge: client card from the link, "make your own" |
| `/about` | How directions map to the game, credits, data version and build, disclaimer |

The client card is shared by all three challenge screens. Each direction on it can be ticked off.
Ticks are component state and reset on reload.

Desktop and mobile are designed and tested as equals.

Clients get a monogram or simple mark, never game art. The visual direction in M0 decides its
form.

**Copy as text** produces plain text that reads well pasted into Discord or Reddit: client name,
brief, directions as a list, and the link.

## 12. Layering

```
src/
  game/        data and brief content, versioned        (no logic)
  domain/      directions, PRNG, generate, reroll, validate (pure)
  links/       share link encode and decode
  features/    screens, one directory each
  components/  shared UI, including the client card
  lib/         helpers
```

Dependencies point one way: `features` → `links` → `domain` → `game`.

## 13. Testing

- **Determinism:** fixed seeds produce snapshot-pinned challenges. A change that moves them fails,
  which is what protects old share links.
- **Property tests over thousands of seeds per difficulty:** no contradictions or repeats,
  direction counts and types within the difficulty, counts within range and only on per-piece
  accessories, Burlap never appears without the modifier, Chaos always has a pair.
- **Round trip:** every generated challenge encodes to a link and decodes to an equal challenge.
- **Reroll:** changes only the target direction and survives a share round trip.
- **Bad links:** unknown version and junk parameters show the error state.
- **Playwright** on desktop and mobile for generate, reroll, share and daily. axe on every screen.
- **Mutation probes** in the tracker's style for each guarantee above: break it, see the suite go
  red, restore.

## 14. Milestones

| | Milestone | Done when |
|---|---|---|
| M0 | Design | Lo-fi flows, moodboard, 3–4 directions, a pick, hi-fi frames in `docs/wireframes/` |
| M1 | Scaffold | Repo, toolchain, commit gate, CI, CLAUDE.md, README |
| M2 | Generator core | Data v1, direction types, PRNG, generate, validation, property tests, a debug page |
| M3 | Briefs and difficulty | Themes, names, templates, difficulty table, opposing pairs, Burlap only |
| M4 | Screens | Generator, shared link, reroll, copy link and text, tick-off, About |
| M5 | Daily | UTC date seed, weekday difficulty, countdown |
| M6 | Tune and launch | Netlify deploy, playtest about 5 per difficulty in game, retune, axe and Playwright, link previews, community post |

M2 can start alongside M0, since it has no UI.

Backlog lives in Theo's personal Linear workspace, with dependency order and milestones as in the
tracker. Each issue names the wireframe frames it is drawn from.

## 15. Case study

A new `src/content/projects/tailor-made.mdx` in `dev-portfolio-2025`, using the existing
case-study components.

**ProcessStrip:** Research → Flows → Moodboard → Directions → Hi-fi → Generator → Tuning → Launch.

Angles the tracker case study did not have:

- **Research:** turning a month-old game's commission cards into a grammar of directions
- **Dropping the numbers:** the first spec copied the cards' scores and budgets, then met the
  fact that off-rack dresses show none of them
- **Generator:** seeded challenges, versioned data, tests over thousands of seeds
- **Tuning:** Chaos before and after playtesting
- **Launch:** how the community responded

**Capture as you go.** Issues that produce a showable artefact carry a `case-study` label and a
checklist item to save screenshots to `docs/case-study/`.

## 16. Open questions

- **Game updates.** Resolved. Build 443 added no new fabric type, accessory type, tag or
  colour. See `docs/notes/build-443-check.md`.
- **Domain.** Netlify subdomain to start. Decide on a custom domain at launch.
