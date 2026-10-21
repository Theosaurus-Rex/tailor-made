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
| `styleAvoid` | Not cute / Not cute or playful | "Nothing sweet, please. I'm not a cupcake." |
| `fabric` | Velvet / Cotton and linen | "I adore velvet." |
| `fabricAvoid` | No sequins / No cotton or velvet | "Sequins make me itch." |
| `burlapOnly` | Burlap only | Modifier only |
| `fabricsOnly` | Only linen, cotton and wool | "Nothing but honest fabrics. Linen, cotton and wool." |
| `fabricsMin` | At least 3 fabrics | "Mix it up. Three fabrics at least." |
| `colour` | Red / Red and blue | "Red, wherever you can." |
| `colourAvoid` | No black / No red or blue | "No black. I'm not in mourning." |
| `colourOnly` | Only white / Only orange, yellow and green | "All white, head to toe." |
| `accessory` | Bows / Bows and feathers | "Bows! I love a bow." |
| `accessoryAvoid` | No feathers / No bows or feathers | "No feathers, I sneeze." |
| `accessoryMin` | At least 5 bows | "Bows everywhere. Five at the very least." |
| `accessoryExact` | Exactly 3 brooches | "Three brooches. One for each of my ex-husbands." |
| `coloursMin` | At least 3 colours | "I want colour, and lots of it." |

Counts stay small (roughly 2 to 8) so they are quick to check. `accessoryMin` and
`accessoryExact` only use per-piece accessory types.

The "only" lists (`colourOnly`, `fabricsOnly`) hold one to three items. "Only" means every fabric
on the dress must be one of the listed colours or fabric types. The player need not use them all,
so "Only orange, yellow and green" is met by an all-orange dress. Fabric counts run 2 to 4
and never count Burlap. `burlapOnly` is a modifier, not a direction to pick or reroll. It is
pinned on the card and has no client line.

Seven types hold a list of one or two items, so a card says "No cotton or velvet" once instead
of in two rows: `fabric`, `fabricAvoid`, `colour`, `colourAvoid`, `accessory`, `accessoryAvoid`
and `styleAvoid`. Avoids join with "or", asks with "and". One list is one row, one tick and one
reroll, and a reroll redraws the whole list. A card never has two directions of the same list
type. Asked-for `style` directions stay one tag per row. `accessoryMin` and `accessoryExact`
stay single-item.

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

- Any item in a list asked for or avoided in one direction and avoided or asked for in another.
  Every item is checked, and an only list counts as asking for each item in it
- A `colourOnly` alongside a `colour` or `colourAvoid` with any item outside its list
- A `fabricsOnly` alongside a `fabric` or `fabricAvoid` with any item outside its list
- A `coloursMin` beside a `colourOnly`, or a `fabricsMin` beside a `fabricsOnly`. The list already
  sets which colours or fabrics to use, so a count beside it only repeats or fights it
- A `coloursMin` higher than the colours left after avoids. Each distinct avoided colour counts once
- A `fabricsMin` higher than the general fabrics left after avoids, counted the same way
- More than one `colourOnly`, or more than one `fabricsOnly`. One of each is fine
- More than one count on the same accessory type
- Opposing pairs (see §7), by the difficulty's pair rule from the data:
  - `never` (Easy, Medium): any two directions on opposite sides of a pair, whether asked for or
    avoided, in any mix. Every tag of a `styleAvoid` list counts, and one list may not hold both
    sides of a pair
  - `noBothStyles` (Hard): two `style` directions on opposite sides of a pair
  - `oneStylePair` (Chaos): the same, except the one pair the card was built around
- The same item asked for twice, including two `coloursMin` or two `fabricsMin`. Any shared item
  between two lists counts

Burlap only is a modifier, not a competing direction, so it is never checked here. §8 keeps the
card free of other fabric and colour directions.

### Reroll

Rerolling direction *i* draws from a sub-seed of `seed`, `i` and that direction's reroll count,
and keeps its kind. The new draw is checked against every other direction on the card. The rest
of the challenge stays the same. A challenge keeps its reroll history, the slots in the order they
were rerolled. A slot's count is how many times it appears. Burlap only cannot be rerolled, and neither can anything on a Chaos card.

### Share link format

```
/c?v=1&s=<seed>&d=<difficulty>&m=<modifiers>&r=<reroll history>
```

`r` is the reroll history in order, for example `r=1.3.1` for direction 1, then 3, then 1 again.
Counts alone cannot rebuild a card when two rerolled directions affect each other. Replaying the
history in order always matches, so a link rebuilds by generating the card and then rerolling.

Lists are dot-separated, as in `m=burlap` and `r=1.3.1`. `m` is left out when there are no
modifiers and `r` is left out when nothing was rerolled. Unknown keys are ignored, so the format
can grow. A key given twice is a bad link. Parameters are always written in the order shown.

A worked example, a Hard card with Burlap only, rerolled at slots 2, 3 and 2 again:

```
/c?v=1&s=2026-10-19&d=hard&m=burlap&r=2.3.2
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
| Medium | 3–4 | Adds accessories, exactly one avoid, exactly one "at least" count |
| Hard | 4–5 | Up to two avoids and two "at least" counts. One `colourOnly` or `fabricsOnly` possible. |
| Chaos | 5–6 | Always one "only" list and an exact count. Up to two avoids, three counts. |

**Two-item lists.** Each list direction holds two items with a chance set per difficulty in the
data (`pairedItemChance`): 0.2 on Easy and 0.35 on Medium, Hard and Chaos. Burlap only shapes use
the same value as their normal shape. The chance is drawn from the slot's own stream, so a reroll
redraws it. Items are drawn without repeats from the theme-weighted pools. A `colour` or `fabric`
beside an "only" list draws from that list, and an "only" list drawn later keeps every item
already asked for. The plan never holds two of the same list type (`kindsNeverTogether`).

Chaos ignores the theme's leanings (see section 9). Its "only" list is always there for now, and M6
tuning may make it "likely" again.
The table lives in the game data (`difficulties`) and is versioned with it.

**Opposing pairs**, hand-written: Cute/Gothic, Simple/Elaborate, Casual/Formal, Warm/Cool,
Daywear/Eveningwear.

- Each difficulty has a pair rule in the data (`pairs`), versioned with the shapes. Easy and
  Medium use `never`, Hard `noBothStyles`, Chaos `oneStylePair`.
- Chaos includes exactly one pair as two `style` directions ("cute **and** gothic"). The pair is
  drawn from its own seed stream and fills the first two `style` slots. No second pair can form.
- Hard may "pull apart": avoid one side of a pair while asking for a fabric or accessory that
  leans towards it, such as "Not cute" with "Bows". It happens about half the time a plan has a
  style avoid and a fabric or accessory (`pullApartChance`). The tension is the point.
- Easy and Medium never touch a pair, in any form. "Cute" with "Gothic", "Not cute" with
  "Gothic" and "Not cute" with "Not gothic" are all out.
- Chaos cards cannot be rerolled, to keep the difficulty. A share link for a Chaos card with
  a reroll history is invalid.

## 8. Modifiers

**Burlap only** (`m=burlap`). Burlap is the free mock-up fabric and is excluded from every other
challenge. With the modifier on:

- Adds `burlapOnly`
- Removes other fabric and colour directions, including `fabricsOnly` and `fabricsMin`
- Favours accessory directions, since they carry most of the look

The card pins `burlapOnly` first, in the plan and in the directions. It is tagged "Modifier", has
no client line and cannot be rerolled. Every other slot is dealt from a hand-written Burlap shape
(`burlapDifficulties` in the game data, beside `difficulties`), versioned with them. Each is its
difficulty's shape without fabric and colour kinds, and with higher accessory weights:

- Easy deals 2–3 styles and accessories. Burlap only may add accessories, so an Easy Burlap card
  is not styles alone.
- Medium meets its avoid with `styleAvoid` or `accessoryAvoid`, and its "at least" with
  `accessoryMin`.
- Hard has no "only" lists. Chaos drops its "only" list too and keeps the exact count and the
  pair rule.

Burlap only does not count towards the direction count. Easy is Burlap only plus 2–3 directions.
An unknown or repeated modifier is a `RangeError`.

Never used for the daily challenge. Modifiers are a list, so others (Monochrome, No accessories)
can be added later without changing the link format.

## 9. Briefs

Hand-written content in `src/game/briefs/`, versioned with the data.

- **About 25 occasion themes.** Each has tag, fabric, colour and accessory weights and 3–4
  templates with slots. Example: *"{name} is attending {occasion} and wants to look {adjective}
  without {worry}."*
  **Theme format** (`src/game/briefs/v1/themes.ts`, typed with the game's unions, so a misspelt tag,
  colour, fabric or accessory fails typecheck):
  - `favouredTags` (2 to 4), `favouredColours` (1 to 3), and optional `favouredFabrics` and
    `favouredAccessories`.
  - `occasions` (2 to 3), `adjectives` (2 to 4) and `worries` (2 to 3) are short phrases.
  - `templates` (3 to 4) use the slots `{name}`, `{occasion}`, `{adjective}` and `{worry}`. A template
    need not use every slot. Brief wording is a gerund after "without", such as "outshining the bride".
  - The theme is picked first, uniformly, from its own seed stream, and its id is kept on the challenge.
- **The boost rule.** The numbers sit in the data (`themeBoosts`), beside the themes.
  - A favoured tag's weight is multiplied by 4.
  - A fabric, accessory or colour gets 3 added to its weight of 1 if it is listed as favoured, or if
    it leans towards a favoured tag (colours through `colourLeanings`).
  - Item draws keep the data's order, so a share link rebuilds the same card.
- **Avoids lean the other way.** In `styleAvoid`, `fabricAvoid`, `colourAvoid` and `accessoryAvoid`, a
  favoured item gets a low weight (0.25), so a Gothic client rarely says "Not gothic". It is never
  zero, so nothing becomes impossible.
- **Chaos ignores the leanings.** Its shape sets `ignoreTheme`, and Chaos draws use the plain data
  weights. The brief still uses the theme, so Chaos cards still read as an occasion.
- **The brief** is filled from the client and the theme on its own seed stream. A human client gives
  her first name, a non-human client her full name.
- **Names** from first-name and surname lists, with a small share of non-human clients, about 10%.
  First names are women's names or names anyone can have, never only men's, since every client
  commissions a dress. Non-human clients follow the same rule.
  The name draws from its own sub-seed, so changes to how directions are drawn never change who
  the client is.
- **Direction phrasing**: several client lines per direction type, filled with the item named.
  Specific lines for common items ("I adore velvet") beat generic ones ("Use {fabric}").
  Each client has a personality, picked from the seed on its own sub-seed, and each personality
  has its own lines per direction. Deadpan, Gushing and Brisk come first. Issue 44 adds Grand,
  Anxious and Theatrical. "Only" lines say only those colours or fabrics, never "use all of them".
- All original. No game characters, names or card text.

This is most of the writing effort. If it runs long, cut themes before cutting anything else.

## 10. Daily challenge

- Seed is the UTC date (`2026-10-16`), so everyone gets the same challenge at the same moment.
- Difficulty by weekday: Mon Easy, Tue Medium, Wed Medium, Thu Hard, Fri Hard, Sat Hard,
  Sun Chaos.
- No modifiers. Always the latest data version on the day, recorded in its share link.
- Countdown to the next UTC midnight.
- The weekday table lives in the game data (`dailyDifficulties`), beside the difficulty shapes, so a
  retune is versioned like the rest. The date comes into `src/domain/` as text, so domain never reads
  the clock. The UTC date is worked out in `src/lib/`.

## 11. Screens

The visual direction is Rosewood Atelier, written up in `docs/design/rosewood-atelier.md`.

| Route | Screen |
|---|---|
| `/` | Generator: difficulty, modifiers, Generate, client card, per-direction reroll, copy link, copy text |
| `/daily` | Today's client card, difficulty badge, countdown |
| `/c` | Shared challenge: client card from the link, "make your own" |
| `/about` | How directions map to the game, credits, data version and build, disclaimer |

The client card is shared by all three challenge screens. Each direction on it can be ticked off.
Ticks are component state and reset on reload.

Desktop and mobile are designed and tested as equals.

Clients get a monogram, never game art. The mark is a 64px circle with the client's two initials
in Instrument Serif italic, on a deep rosewood fill with a thin rose border.

**Copy as text** produces plain text that reads well pasted into Discord or Reddit: client name,
occasion, brief, the short lines as a list (one per line), and the link. Decided 2026-10-20: a
list, not the short lines joined with dots as the hi-fi frame shows.

Burlap only shows a quiet "Fixed" label where other directions have a reroll button, so players
can see it cannot be rerolled.

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
