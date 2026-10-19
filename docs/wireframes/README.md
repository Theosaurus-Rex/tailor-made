# Wireframes

Two sets of the same 26 frames, both drawn in Claude Design. Every screen and state is drawn at
1440px (desktop) and 390px (mobile), under the same ids.

| Set | Canvas | PNGs |
|---|---|---|
| **Hi-fi** | `hifi/tailor-made-hifi.html` | `hifi/frames/` |
| Lo-fi | `tailor-made-wireframes.html` | `frames/` |

**Build to the hi-fi frames.** They are the finished design, in the Rosewood Atelier direction,
and where they disagree with the lo-fi set they win. The lo-fi set stays for history and for the
flow detail in its notes. `../design/rosewood-atelier.md` holds the palette, type and component
shapes measured from the hi-fi canvas.

Both canvases are exact copies of their exports, so do not edit them. They need JavaScript to
render. Open them in a browser. The lo-fi grey boxes and sketch type were never a design
decision. They only show layout and flow.

The hi-fi export shows a red "must define `class Component extends DCLogic`" banner on every card.
It comes from the design tool, not from the design. The PNGs were cut with the banner hidden.

## Reading a frame

Each Linear issue names its frames in a `**Wireframe:**` line, for example
`**Wireframe:** 1e, 2b-some`. Those are the ids in the tables below. A lone long dash means
nothing was drawn for that issue. `all` means the whole set.

Each id has two PNGs per set: `<id>-desktop.png` and `<id>-mobile.png`. Hi-fi are in
`hifi/frames/` and lo-fi in `frames/`. Both are cut from their canvas, at 2x. Some frames hold
several steps of one screen, such as `3a` (shared card and the Make your own button) and `5a`
(card, difficulty badge and countdown). The sub-steps are named in the notes.

## What the hi-fi set changes

Same ids, same states, same notes in nearly every case. The differences:

- **Copy as text is longer.** `1g-text` pastes the name, the occasion, the brief, the short lines
  joined with dots, then the link. Lo-fi pasted the short lines only. Spec section 11 asks for a
  list, one direction per line, so the paste format is open again (question 4 below).
- **Burlap only row shows "Fixed".** `2c`, `2d` and `2e` put a quiet "Fixed" label where the
  reroll button would be. Lo-fi `3c` said no label was needed. The shared card `3c` has none.
- **Status lines are written out.** `1f` says "Direction 2 swapped for a new one. Its tick was
  cleared; the other directions are unchanged." `1g-link` says "Link copied. Anyone who opens it
  gets this client with these directions." `2b-all` says "Ready to hand over."
- **Mobile summary row.** `1e` mobile shows "Medium · Burlap off", a "Tap to change" link and a
  "New client" button. Lo-fi gave the idea but not the wording.
- **Daily page.** `5a` carries a full date line ("Friday 16 October 2026"), "Today's client" and
  the countdown as `hh:mm:ss`.
- **A fifth invented client.** `2d` uses Clementine Wren. Lo-fi named four fillers.
- **About copy is drawn in full** (`6`). The notes now say the player is the judge and nobody
  keeps score.
- **Controls are fixed in form.** The difficulty dial is a four-stop selector with the chosen stop
  filled. Burlap only is a tick box with a line of help text, not a switch.
- **The canvas has no gaps or questions list.** Lo-fi had one. The hi-fi script carries frame
  notes only, and `7` and `nav` say "Unchanged". The questions below still stand.

## Where the hi-fi frames are wrong

Decisions already made win over a frame. Do not build these as drawn.

- **Chaos cards cannot be rerolled.** `2a-long` and `2e` draw a reroll on every direction.
- **Share link format.** The frames show `/c?d=mh-7KQ2xP` and `/c?d=mh-7K` in the URL bar. The
  real format is `/c?v=1&s=…&d=…&m=…&r=…`.
- **Burlap only on Easy** (`2d`) is still an open question from the lo-fi set.
- **The canvas names the direction "Rosewood Label".** The direction is Rosewood Atelier.

## Hi-fi frames

Index by id. Notes for each state are in the lo-fi tables below, which still apply unless the
section above says otherwise.

| Id | Screen and state | Hi-fi |
|---|---|---|
| `1a` | Generator, empty | `hifi/frames/1a-desktop.png`, `1a-mobile.png` |
| `1b` | Dial at Chaos | `1b-` |
| `1c` | Burlap only on | `1c-` |
| `1d` | Generate pressed | `1d-` |
| `1e` | Card with reroll on each direction | `1e-` |
| `1f` | Just after a reroll | `1f-` |
| `1g-link`, `1g-text` | Copy link and copy as text used | `1g-link-`, `1g-text-` |
| `1h` | Mobile controls expanded | `1h-` |
| `1i-link`, `1i-text` | Copy link and copy as text fail | `1i-link-`, `1i-text-` |
| `2a-short`, `2a-long` | Easy and Chaos card lengths | `2a-short-`, `2a-long-` |
| `2b-none`, `2b-some`, `2b-all` | Tick states | `2b-none-`, `2b-some-`, `2b-all-` |
| `2c`, `2d`, `2e` | Burlap only at Medium, Easy and Chaos | `2c-`, `2d-`, `2e-` |
| `3a`, `3c` | Shared challenge and shared Burlap only | `3a-`, `3c-` |
| `4a` | Bad link | `4a-` |
| `5a` | Daily, with badge and countdown | `5a-` |
| `6` | About | `6-` |
| `7` | Not found | `7-` |
| `nav` | Navigation, each tab active | `nav-` |

Each prefix ends in `desktop.png` or `mobile.png`, in `hifi/frames/`.

## Lo-fi frames

### Generator

| Id | State | Notes |
|---|---|---|
| `1a` | Empty | Default difficulty is Medium (assumed). Burlap only is off. |
| `1b` | Difficulty dial at Chaos | Easy 2-3, Medium 3-4, Hard 4-5, Chaos 5-6 directions. The line under the dial says how many. The dial is a four-stop selector. Its final shape is a visual decision. |
| `1c` | Burlap only on | A modifier, independent of difficulty. See `2c` for the card it makes. |
| `1d` | Generate pressed | The button disables and reads "Generating...". Keep this state for a slow first data load. |
| `1e` | Card with reroll on each direction | Each direction has a tick box, a short line, a client line and a reroll. Tick and reroll targets are 44px minimum on mobile. Reroll tooltip is "Reroll direction". On mobile the controls collapse to a summary row once a client exists. `1h` shows the expanded panel. |
| `1f` | Just after rerolling direction 2 | Only direction 2 changed (No black to No sequins). Name and brief stay. Its tick is cleared and the others stay. The new direction is outlined and tagged until the next action. |
| `1g-link` | Copy link used | The button reads "Link copied" for a few seconds, with a status line under it. |
| `1g-text` | Copy as text used | The pasted text lists the short lines, for example "Romantic · No black · Bows · At least 3 colours". |
| `1h` | Mobile controls expanded after a client exists | Mobile only. Tapping Change on the summary row opens the full panel above the card. "Generate new client" replaces the card. "Keep current client" closes the panel and changes nothing. Changing difficulty or Burlap here does nothing until Generate is pressed. Desktop always shows the panel, so the desktop frame matches `1e` with ticks. |
| `1i-link` | Copy link fails | The clipboard is blocked or unavailable. The button reads "Couldn't copy". The link shows in a box below, pre-selected so a long-press or Ctrl/Cmd+C works. The message stays until the next action. It is not a timed toast. |
| `1i-text` | Copy as text fails | Same pattern. The plain text shows in a selectable box. |

On mobile, once a client is generated, the controls collapse to one summary row ("Medium · Burlap
off, tap to change") so the card sits near the top. `1h` shows the panel when it is open.

### Client card

| Id | State | Notes |
|---|---|---|
| `2a-short` | 2 directions (Easy) | Easy is a fabric and a colour. No avoids, no counts. |
| `2a-long` | 6 directions (Chaos) | The longest card is 6. Has the opposing pair Cute and Gothic, and an exact count. |
| `2b-none` | No ticks | Same as `1e`. |
| `2b-some` | Some ticked | Ticked directions grey out and strike through. |
| `2b-all` | All ticked | A done line appears under the directions. Nothing is scored. |
| `2c` | Burlap only | Burlap only is pinned at the top, tagged "Modifier", with no client line and no reroll. No other fabric or colour directions. The rest lean to accessories. |
| `2d` | Burlap only with Easy | Easy allows no avoids or counts, and Burlap drops fabric and colour. Only styles are left: Burlap only, Romantic and Elegant. Open question: should Burlap unlock accessories on Easy? |
| `2e` | Burlap only with Chaos | 6 directions: Burlap only, the opposing pair Cute and Gothic, an exact count, an avoid and an at-least count. No fabric or colour directions. Accessories fill the rest. |

### Shared challenge

| Id | State | Notes |
|---|---|---|
| `3a` | Card from a link (`/c?d=...`) | The card is rebuilt from the link. Tick boxes work. No reroll. `3b`, the Make your own button, goes to the generator (`1a`). |
| `3c` | Shared Burlap only card | The link carries the modifier. Burlap only shows pinned at the top with its Modifier tag. There is no reroll here, so no "Fixed" label. |

### Bad link

| Id | State | Notes |
|---|---|---|
| `4a` | Error | Covers broken and out-of-date links. Full nav, a heading, an explanation and a Make a new one button that goes to `1a`. |

### Daily

| Id | State | Notes |
|---|---|---|
| `5a` | Daily challenge (`/daily`) | `5a` is today's card, the same for everyone, with tick boxes and no reroll. `5b` is the difficulty badge (Hard here: two avoids, two counts, Only white). `5c` is the countdown to the next client. |

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

Three are already settled, on 2026-10-17:

- Burlap only is a pinned modifier direction with no client line and no reroll. It is now
  `burlapOnly`. This settles the Burlap only gap below.
- In Chaos, only opposing styles are allowed together, such as Cute and Gothic. Direct
  contradictions such as "Red" and "No red" are never allowed. This settles the first question.
- "Only" means every fabric must be one of the listed colours or fabric types. The player need not
  use them all. This settles the "Only white" wording in question 3.

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
   Easy? (Drawn as `2d`, still open.)
3. "Only white" rules out every other colour direction on the card. The generator needs that check,
   as well as Burlap against fabric and colour. (The meaning of "only" is settled, see above.)
4. Copy as text now lists short lines only, with no client lines or ticks. Confirm that is the whole
   paste.
5. Should a reroll change the shared link? Assumed yes: the link encodes the current directions.
6. Can the daily card be shared or copied? Not in the brief, so it is left off.
7. On mobile, after generating, the controls collapse to one summary row so the card sits near the
   top. This was the designer's call. (Now drawn open in `1h`.)

## Not drawn

Everything on the issue's coverage list has a frame, at desktop and mobile, in both sets. The
hi-fi set draws none of the states lo-fi left out. These still have no frame:

- The daily card at the moment the countdown reaches zero, and a daily card with some ticks
  (`5a` shows none ticked).
- Keyboard focus and hover states, including the reroll tooltip.
- Any motion. The canvas specifies none.
