# Wireframes

The lo-fi set for Tailor-Made, drawn in Claude Design and exported on 2026-10-17. Every screen and
state is drawn at 1440px (desktop) and 390px (mobile). The canvas is
`tailor-made-wireframes.html`. It is an exact copy of the export, so do not edit it. It needs
JavaScript to render. Open it in a browser.

Hi-fi frames come later (issue 06). Where a hi-fi frame disagrees with a lo-fi frame, the hi-fi
frame wins.

The grey boxes, borders and type in these frames are not a design decision. They only show layout
and flow. The visual direction comes from issue 05.

## Reading a frame

Each Linear issue names its frames in a `**Wireframe:**` line, for example
`**Wireframe:** 1e, 2b-some`. Those are the ids in the tables below. a lone long dash means nothing was drawn
for that issue. `all` means the whole set.

Each id has two PNGs in `frames/`: `<id>-desktop.png` and `<id>-mobile.png`. They are cut from the
canvas at 2x. Some frames hold several steps of one screen, such as `3a` (shared card and the
Make your own button) and `5a` (card, difficulty badge and countdown). The sub-steps are named in
the notes.

## Frames

### Generator

| Id | State | Notes |
|---|---|---|
| `1a` | Empty | Default difficulty is Medium (assumed). Burlap only is off. |
| `1b` | Difficulty dial at Chaos | Easy 2-3, Medium 3-4, Hard 4-5, Chaos 5-6 directions. The line under the dial says how many. The dial is a four-stop selector. Its final shape is a visual decision. |
| `1c` | Burlap only on | A modifier, independent of difficulty. See `2c` for the card it makes. |
| `1d` | Generate pressed | The button disables and reads "Generating...". Keep this state for a slow first data load. |
| `1e` | Card with reroll on each direction | Each direction has a tick box, a short line, a client line and a reroll. Tick and reroll targets are 44px minimum on mobile. Reroll tooltip is "Reroll direction". |
| `1f` | Just after rerolling direction 2 | Only direction 2 changed. Its tick is cleared and the others stay. The new direction is outlined and tagged until the next action. |
| `1g-link` | Copy link used | The button reads "Link copied" for a few seconds, with a status line under it. |
| `1g-text` | Copy as text used | The pasted text lists the short lines, for example "Romantic · No black · Bows · At least 3 colours". |

On mobile, once a client is generated, the controls collapse to one summary row ("Medium · Burlap
off, tap to change") so the card sits near the top.

### Client card

| Id | State | Notes |
|---|---|---|
| `2a-short` | 2 directions (Easy) | Easy is a fabric and a colour. No avoids, no counts. |
| `2a-long` | 6 directions (Chaos) | The longest card is 6. Has the opposing pair Cute and Gothic, and an exact count. |
| `2b-none` | No ticks | Same as `1e`. |
| `2b-some` | Some ticked | Ticked directions grey out and strike through. |
| `2b-all` | All ticked | A done line appears under the directions. Nothing is scored. |
| `2c` | Burlap only | Burlap only is pinned at the top, tagged "Modifier", with no client line and no reroll. No other fabric or colour directions. The rest lean to accessories. |

### Shared challenge

| Id | State | Notes |
|---|---|---|
| `3a` | Card from a link (`/c?d=...`) | The card is rebuilt from the link. Tick boxes work. No reroll. `3b`, the Make your own button, goes to the generator (`1a`). |

### Bad link

| Id | State | Notes |
|---|---|---|
| `4a` | Error | Covers broken and out-of-date links. Full nav, a heading, an explanation and a Make a new one button that goes to `1a`. |

### Daily

| Id | State | Notes |
|---|---|---|
| `5a` | Daily challenge (`/daily`) | `5a` is today's card, the same for everyone, with tick boxes and no reroll. `5b` is the difficulty badge (Hard here). `5c` is the countdown to the next client. |

### About

| Id | State | Notes |
|---|---|---|
| `6` | About (`/about`) | `6a` how to play, written for players, with no scoring. `6b` credits for the fan wiki and the guide site. `6c` data version and app build. `6d` the unofficial fan project disclaimer. Bracketed values are placeholders. |

### Not found

| Id | State | Notes |
|---|---|---|
| `7` | 404 | A short message with a way back to the generator. |

The navigation (Generate, Daily, About, each active in turn) is also drawn, as `nav`.

## Open questions from the canvas

Two are already settled, on 2026-10-17:

- Burlap only is a pinned modifier direction with no client line and no reroll. It is now
  `burlapOnly`. This settles the Burlap only gap below.
- In Chaos, only opposing styles are allowed together, such as Cute and Gothic. Direct
  contradictions such as "Red" and "No red" are never allowed. This settles the first question.

Gaps the canvas lists:

- **Tick count.** "2 of 4 ticked" is kept above the list. It counts ticks only, not scores. Remove
  it if it reads as a meter.
- **Burlap only.** It cannot be rerolled while the modifier is on, or a reroll would undo the
  toggle. Confirm. (Settled, see above.)
- **Shared link.** The path is `/c`. The card data is assumed to travel in the query string
  (`/c?d=...`).
- **Not found.** The brief has no detail. It is drawn as a short message with a way back.
- **Example lines.** "Romantic" is not in the direction list. It is used as a style with
  Marguerite's original line. "Cute" uses "Make it sweet, darling." from the first brief.
- **Extra clients.** Agnes Pell, Odette Blackwood, Ida Thorne and Hester Vane are invented filler.

Questions the canvas lists:

1. Chaos allows an opposing pair (Cute and Gothic). Does that extend to direct contradictions like
   "Red" and "No red", or only opposing styles? (Settled: only opposing styles.)
2. Burlap only on Easy leaves only style directions, since Easy has no avoids or counts and Burlap
   drops fabric and colour. Is a 2-3 style-only card fine, or should Burlap unlock accessories on
   Easy?
3. "Only white" rules out every other colour direction on the card. The generator needs that check,
   as well as Burlap against fabric and colour.
4. Copy as text now lists short lines only, with no client lines or ticks. Confirm that is the whole
   paste.
5. Should a reroll change the shared link? Assumed yes: the link encodes the current directions.
6. Can the daily card be shared or copied? Not in the brief, so it is left off.
7. On mobile, after generating, the controls collapse to one summary row so the card sits near the
   top. This was the designer's call.

## Not drawn

Everything on the issue's coverage list has a frame, at desktop and mobile. These states have none:

- The mobile controls when expanded after a client exists (the "tap to change" panel). Mobile
  shows the full controls only in the empty and generating states.
- A copy that fails, for example when the clipboard is blocked.
- Burlap only together with Easy, or with Chaos, and a shared link that holds a Burlap only card.
- The daily card at the moment the countdown reaches zero, and a daily card with some ticks.
- Keyboard focus and hover states.
