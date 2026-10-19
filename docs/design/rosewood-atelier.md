# Rosewood Atelier

The visual direction for Tailor-Made. A dark rosewood ground, cream type and one dusty rose
accent. Serif for names and headings, sans for everything you press or read quickly.

Every number below was read from the hi-fi canvas in a browser (`getComputedStyle`, plus the
canvas markup), not taken from a PNG. Where the markup and the computed value differ, the markup
is quoted and the difference is said. The canvas is `docs/wireframes/hifi/tailor-made-hifi.html`.
The frames are in `docs/wireframes/hifi/frames/`, and `docs/wireframes/README.md` maps each one
to its screen.

The canvas calls the direction "Rosewood Label". The name is Rosewood Atelier.

## Why it won

The name and the look come from the rosewood palette and the feel of a dressmaker's atelier. Theo
already had a strong idea of the colours and the fonts, so no moodboard was made.

TODO (Theo): add a few lines on why this direction beat the other directions you drew.

## The shape of it

- **Dark only.** There is no light mode in the canvas. Do not build one. Set `color-scheme: dark`
  so form controls and scrollbars match.
- **No shadows.** Nothing in the canvas has a `box-shadow`. Depth comes from four close surface
  tones and thin borders.
- **Soft corners.** Radii run from 5px to 10px. Pills and marks are fully round.
- **One accent.** Dusty rose carries every primary action, every selected state, every tick and
  every link. There is no second accent and no red.
- **No motion.** The canvas specifies no transition, animation or hover change. The only hover
  rule is on links, see Motion.

## Palette

### What the app uses

| Role | Hex | Used for |
|---|---|---|
| ground | `#33161E` | Page background. Header strip. The reroll button fill. Text on the accent |
| surface | `#42202A` | The controls panel, the outer client card, the daily countdown panel, the shared "Make your own" panel, the compact summary row, the loading card |
| raised | `#4C2631` | An unticked direction row. The "copied" fill on a copy button. The loading skeleton shapes |
| raised, new | `#5A2C38` | The row just rerolled, with a dashed accent outline. Used once, in `1f` |
| inset | `#220D13` | The selectable box shown when copying fails |
| inset, quiet | `#2A1218` | The preview box under "Text copied" |
| mark | `#5E1024` | The client mark fill |
| line | `#4F2A33` | Hairlines. The header bottom rule. Panel borders. Rules above the Burlap only control and the About footer |
| line, strong | `#6A3A45` | Card borders. Outlined button borders. The difficulty dial border. The empty state dashed border |
| ink | `#EBD7BF` | Headings, names, row titles, button labels. The main text |
| ink, soft | `#E2CCB8` | The brief on a card. The About body |
| muted | `#D2B9A6` | Body copy, client lines, labels, inactive nav, hints, status lines |
| done | `#A88D89` | The title of a ticked direction, with a line through it. Lightened from the canvas's `#A58A86` to pass contrast (Theo, 2026-10-20) |
| accent | `#D9A796` | Primary button and selected fills. Tick fill and tick box border. Links. Small caps labels. Tags. The reroll icon. The active nav underline. The client mark border |
| on accent | `#33161E` | Text on an accent fill. Same value as ground |
| disabled | `#8A6A6C` | The Generate button while generating |

### What is only on the canvas

These are the presentation board, not the app. Do not build them.

| Hex | Where |
|---|---|
| `#160A0E` | The canvas page behind the frames |
| `#1A0A0F` | The fake browser address bar at the top of each frame |
| `#B89A8E` | The text in that address bar and the "1a desktop" captions |

The canvas page `#160A0E` is not the app ground. The app ground is `#33161E`.

### States

| State | How it looks |
|---|---|
| Selected (dial, Burlap only, tick) | Accent fill `#D9A796`, with `#33161E` text or check mark |
| Ticked direction | Tick box filled accent with a check. Row fill removed. Title `#A88D89` with a line through it. The client line stays `#D2B9A6` |
| Just rerolled | Row `#5A2C38`, `1.5px dashed #D9A796` outline pulled in 1px, and a "New direction" tag |
| Modifier (Burlap only) | An outlined "Modifier" pill in accent, plus a quiet "Fixed" label where the reroll button would be. Kept so players can see it cannot be rerolled (Theo, 2026-10-20) |
| Copied | The button fill becomes raised `#4C2631`. The label reads "Link copied ✓" or "Text copied ✓" |
| Copy failed | The button label reads "Couldn't copy". A box with a `1.5px solid #D9A796` border and `#220D13` fill shows the text to select. There is no red |
| Generating | Button fill `#8A6A6C`. A loading card with raised-tone skeleton shapes |
| Disabled | `#8A6A6C` fill, `#33161E` text |
| Error (bad link, 404) | No colour change. A calm page in the same palette with a way back |
| Focus | Not drawn. See Gaps |
| Hover | Only links change, see Motion |

## Contrast

Ratios are WCAG 2.x, from the hex values above. The app runs axe in CI, and axe checks text
colour contrast against the real background, so the text rows matter most.

### Text

| Text on background | Ratio | Result |
|---|---|---|
| ink on ground | 11.78 | Pass |
| ink on surface | 10.20 | Pass |
| ink on raised | 9.21 | Pass |
| ink on mark | 9.52 | Pass |
| ink on inset | 13.22 | Pass |
| ink, soft on surface | 9.22 | Pass |
| ink, soft on ground | 10.64 | Pass |
| muted on ground | 8.81 | Pass |
| muted on surface | 7.63 | Pass |
| muted on raised | 6.89 | Pass |
| muted on inset, quiet | 9.37 | Pass |
| accent on ground | 7.78 | Pass |
| accent on surface | 6.74 | Pass |
| accent on raised | 6.09 | Pass |
| accent on raised, new | 5.36 | Pass |
| on accent on accent | 7.78 | Pass |
| **done on surface** (ticked title) | **4.47** | **Fails body text by 0.03** |
| **on accent on disabled** | **3.42** | **Fails, but a disabled control is exempt** |

### Parts of the interface

The 3:1 rule applies to boundaries a person needs to see to find a control, and to the parts of a
control that show its state.

| Part | Ratio | Result |
|---|---|---|
| accent border on ground, surface or raised (tick box, Burlap only box, Modifier tag) | 6.09 to 7.78 | Pass |
| accent fill on surface (selected dial stop) | 6.74 | Pass |
| accent tick fill on raised | 6.09 | Pass |
| accent reroll icon on its button | 7.78 | Pass |
| **line, strong on ground** (outlined buttons) | **1.81** | **Fails** |
| **line, strong on surface** (dial border) | **1.57** | **Fails** |
| **line on ground or surface** (panel edges) | **1.16 to 1.34** | **Fails, but decorative** |
| **reroll button fill on raised** | **1.28** | **Fails, but the icon passes** |
| raised on surface (row against card) | 1.11 | Decorative |

### What to do about it

- **Ticked title, 4.47.** One shade lighter fixes it. **Accepted by Theo, 2026-10-20.** `#A88D89` is 4.65 on surface. The ticked row
  has no fill, so surface is the background it sits on. If a ticked row ever gets a raised fill,
  it needs about `#B09590` (4.63 on raised).
- **Outlined buttons and the dial.** "Copy link", "Copy as text", "Keep current client" and "Go
  to the generator" are told apart by their label, so axe will not flag them. A person who needs
  the edge will not see it at 1.8:1. `#966670` is 3.48 on ground and 3.01 on surface. Try it for
  these borders only and leave `line, strong` for cards. **Accepted by Theo, 2026-10-20.**
- **Disabled.** Exempt. Keep the label legible anyway.
- **Decorative edges.** The panel and card edges and the row fills are decoration. The content
  inside carries the structure. Leave them.
- **Colour alone.** A ticked direction is never shown by colour alone. It also has a filled box
  with a check and a line through the title. Keep both.

## Type

Two families. Google Fonts, as the canvas loads them:

`https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap`

- **Instrument Serif**, weight 400 only, in roman and italic.
- **Instrument Sans**, weights 400, 500 and 600.
- **Monospace**, `ui-monospace, Menlo, monospace`, for the address bar and the copy fallback boxes
  only. No webfont.

Fallbacks in the canvas are `Georgia, serif` for Instrument Serif and `system-ui, sans-serif`
for Instrument Sans.

The app today bundles Geist with `@fontsource-variable/geist`. Issue 25 can swap to
`@fontsource/instrument-sans` and `@fontsource/instrument-serif` and skip the Google request. That
choice is open. Either gives the same weights.

### Where each face is used

| Use | Face | Style | Size and line height | Colour |
|---|---|---|---|---|
| Wordmark in the header | Serif | roman | 28px / 1 | ink |
| Mark initials, header | Serif | italic | 17px / 1 | ink |
| Mark initials, big mark on error and empty pages | Serif | italic | 24px / 1 | ink |
| Client mark initials | Serif | italic | 26px | ink |
| Page title, generator panel and empty state | Serif | roman | 34px / 1.1 | ink |
| Page title, shared and daily | Serif | roman | 40px / 1.1 | ink |
| Page title, bad link and not found | Serif | roman | 44px / 1.1 | ink |
| Page title, About | Serif | roman | 52px / 1.05 | ink |
| Section title, About | Serif | roman | 30px / 1.15 | ink |
| Client name | Serif | roman | 34px / 1.1 | ink |
| Brief | Serif | italic | 20px / 1.45 | ink, soft |
| Client line on a direction | Serif | italic | 18px / 1.35 | muted |
| Difficulty hint number ("3-4 directions") | Serif | italic | 17px | ink |
| "Ready to hand over." | Serif | italic | 24px | ink |
| "Finding a client..." | Serif | italic | 22px | muted |
| "Fancy a client of your own?" | Serif | italic | 20px | ink |
| 404 numeral | Serif | italic | 96px / 1 | accent |
| Daily countdown | Serif | roman | 40px / 1.1, tabular numbers | ink |
| Direction title ("No black") | Sans | 500 | 16px | ink, or done when ticked |
| Primary button | Sans | 600 | 16px | on accent |
| Secondary button | Sans | 600 | 15px | ink |
| Dial stop | Sans | 600 | 14px | muted, or on accent when selected |
| Burlap only label | Sans | 500 | 16px | ink |
| Body and help text | Sans | 400 | 14px / 1.5 | muted |
| Empty state and bad link text | Sans | 400 | base size (16px desktop, 15px mobile) / 1.5 | muted |
| About body | Sans | 400 | 17px / 1.65 | ink, soft |
| About footer | Sans | 400 | 14px / 1.6 | muted |
| Status lines (copy, reroll) | Sans | 400 | 14px / 1.45 | muted |
| Tick count ("2 of 4 ticked") | Sans | 500 | 12px, 0.04em | muted |
| Compact summary row, top line | Sans | 500 | 15px / 1.3 | ink |
| "Tap to change" | Sans | 400 | 13px / 1.3, underlined, offset 3px | accent |
| Link in About | Sans | 400 | 17px, underlined, offset 3px | accent |
| Tick mark inside a box | Sans | 600 | 13px | on accent |

### Small caps labels

All are Instrument Sans, uppercase. Weight is 600 unless said.

| Label | Size | Letter spacing | Colour |
|---|---|---|---|
| Nav item, active | 12px, 600 | 0.24em (2.88px) | ink |
| Nav item, inactive | 12px, 500 | 0.24em | muted |
| Eyebrow above a page title ("The atelier", "Shared challenge", "Link problem", date) | 12px | 0.24em | accent |
| Occasion on a card | 12px, 500 | 0.26em (3.12px) | accent |
| Field label ("Difficulty", "Directions", "Next client in") | 11px | 0.24em (2.64px) | muted |
| Tag ("Modifier", "New direction") | 10px | 0.18em (1.8px) | accent |
| "Fixed" | 10px | 0.24em (2.4px) | muted |
| Difficulty badge ("Hard") | 11px | 0.24em | on accent |
| "All directions ticked" | 11px | 0.24em | accent |
| "Data", "App build" | 10px | 0.24em | muted |

### Desktop and mobile

The type sizes are the same on both. The only difference is the base size that unstyled text
inherits: **16px on desktop, 15px on mobile**, with a line height of 1.5 on both. Do not scale
anything else. The mobile frames are drawn at 390px with the same sizes, so a phone already reads
right. The mobile compact summary row is the one place with its own sizes (15px top line, 13px
link).

## Spacing and layout

### Frames and breakpoint

The canvas draws two widths: **1440px** desktop and **390px** mobile. It does not name a
breakpoint. Inside the canvas the switch between them is a flag, not a media query.

What the markup does change between the two:

| Thing | Desktop (1440) | Mobile (390) |
|---|---|---|
| Page gutter | 56px | 18px |
| Content max width | 1328px box, 1216px inside the gutter | 390px |
| Base font size | 16px | 15px |
| Header side padding | 56px | 18px |
| Header nav gap | 36px | 18px |
| Wordmark text next to the mark | shown | hidden. The mark stands alone |
| Generator layout | controls panel 380px wide beside the card | one column. The panel collapses to a summary row once a client exists |
| Card inner padding | 32px | 16px |

Each of those has to switch at the same width. **Breakpoint: 768px (`md`)**, so a
portrait tablet gets the desktop layout and everything below gets mobile. **Confirmed by Theo,
2026-10-20.** The canvas gives no value, and the generator wraps on its own at about 852px (380
controls, 40 gap, 320 card minimum, 112 of gutter).

### Measurements

| Thing | Value |
|---|---|
| Header | min height 76px, bottom hairline `1px #4F2A33`, items centred, space between |
| Header mark | 42 by 30px ellipse, `1px` accent border, plus a `1px` accent outline offset 3px |
| Nav item | padding 12px 0 10px, bottom border `1.5px`, accent when active, clear when not |
| Page body | padding is the gutter. Sections stack with a 28px gap |
| Generator row | flex, wraps, gap 40px. Controls `0 0 380px` on desktop. The card side is `2 1 320px` |
| Card column | 18px gap between the card and the copy buttons |
| Single-card pages (shared, daily) | max width 660px, centred, 24px gap |
| Bad link and not found | max width 560px, centred, 80px above, 16px gap |
| About | max width 680px, centred, 44px between sections, 12px above |
| Controls panel | padding 28px, 26px gap |
| Client card | outer padding 6px, inner padding 32px desktop and 16px mobile, 22px gap |
| Card header | centred, 10px gap, brief max width 520px |
| Direction list | 6px between rows |
| Direction row | padding 12px 10px 12px 14px, gap 14px, min height 44px |
| Row text stack | title and client line 1px apart. Title and tag 10px apart |
| Copy buttons | two equal columns, 12px gap, min height 48px |
| Status line and fallback box | stacked under the buttons, 12px gap |

## Component shapes

Every component has a `1px` border or none unless said. `1.5px` is how it is written in the
markup for the tick box, the nav underline, the empty-state dashes, the fallback box and the
rerolled outline. A browser draws `1.5px` as `1px` on a standard screen and as `1.5px` on a 2x
screen.

### Client card

- Outer: fill `#42202A`, border `1px #6A3A45`, radius 10px, padding 6px.
- Inner: border `1px #6A3A45`, radius 6px, no fill. A double frame, like a pattern label.
- No shadow.

### Client mark

- A 64px circle. Fill `#5E1024`, border `1px #D9A796`.
- The client's two initials in Instrument Serif italic, 26px, ink.
- Header mark for the app: a 42 by 30px ellipse with the letters "TM", no fill, with a second
  accent ring drawn as a `1px` outline offset 3px. The large version (on the empty, bad link
  and generating pages) is 61.6 by 44px with 24px letters. The empty state draws it at 55% opacity.

### Direction row

- Fill raised `#4C2631`, radius 6px. A ticked row has no fill.
- Tick box: 22px square, radius 5px, border `1.5px #D9A796`. Ticked, the fill is accent and a
  13px check in `#33161E` shows. The box is 22px, so the row around it supplies the 44px target.
- Short line (title): Sans 500, 16px, ink. Ticked: `#A88D89` with a line through.
- Client line: Serif italic 18px, muted, in curly quotes. Burlap only has none.
- Reroll button: 44 by 44px, radius 8px, fill `#33161E`, an accent "↻" at 17px. Tooltip and
  accessible name: "Reroll direction".
- "Modifier" tag, Burlap only only: a pill, border `1px #D9A796`, radius 999px, padding 2px 8px,
  10px small caps in accent, next to the title.
- "Fixed" label, Burlap only only: 10px small caps in muted, right-aligned where the reroll
  button would be.
- "New direction" tag: the same pill as "Modifier". Shows on a rerolled row until the next action.

### Difficulty dial

- A four-column grid, gap 4px, padding 4px, border `1px #6A3A45`, radius 8px.
- Each stop: min height 40px, radius 6px, padding 8px 2px, centred, Sans 600 14px.
- Selected: fill accent, text `#33161E`. Others: no fill, text muted.
- The line under it reads "3-4 directions per client", with the numbers in Serif italic 17px.

### Burlap only control

- A tick box, not a switch. 22px, radius 5px, border `1.5px #D9A796`, accent fill and check when on.
- Label "Burlap only" in Sans 500, 16px, ink, with 14px help text in muted beneath.
- Sits under a `1px #4F2A33` rule with 22px above it. Box and text are 14px apart.

### Buttons

| | Primary | Secondary |
|---|---|---|
| Fill | accent `#D9A796` | none |
| Border | none | `1px #6A3A45` |
| Text | `#33161E`, Sans 600 16px | ink, Sans 600 15px |
| Radius | 8px | 8px |
| Padding | 14px 20px | 13px 18px |
| Min height | 48px | 48px |
| Used for | Generate client, Generate new client, Make your own, Make a new one | Copy link, Copy as text, Keep current client, Go to the generator |

- **Compact primary**, "New client" on the mobile summary row: padding 10px 16px, min height
  44px, 15px.
- **Disabled primary**: fill `#8A6A6C`, same text. The label reads "Generating...".
- **Copied**: the secondary button fill becomes `#4C2631`. The label gets a check mark.
- Full width in the controls panel. Two equal columns for the copy pair.

### Copy confirmation and failure

- A status line under the buttons (`role="status"`): Sans 14px, muted. "Link copied. Anyone who
  opens it gets this client with these directions."
- On failure the button says "Couldn't copy" and the status line says what happened. A box under
  it holds the text to select: fill `#220D13`, border `1.5px #D9A796`, radius 8px, padding
  12px 14px, monospace 13px at 1.55. The message stays until the next action.
- "Text copied" shows a quieter preview box: fill `#2A1218`, border `1px #4F2A33`, radius 8px,
  monospace 13px in muted.

### Daily badge and countdown

- Badge: a pill filled accent, radius 999px, padding 5px 12px, 11px small caps in `#33161E`. It
  sits beside the line "The same client for everyone today." in Sans 15px, muted.
- Countdown panel: fill `#42202A`, border `1px #4F2A33`, radius 10px, padding 18px, centred. A
  small caps "Next client in" above the time in Serif 40px with tabular numbers.

### Bad link and not found

- No panel. A centred column on the page ground, max width 560px, 80px below the header.
- Bad link: the large mark, the eyebrow "Link problem", a 44px serif title, two lines of muted
  text and one primary button.
- Not found: a 96px italic "404" in accent, a 44px title, a line of text, a secondary button.

### Navigation

- Three items: Generate, Daily, About. Small caps, 12px, 0.24em.
- Active: weight 600, ink, a `1.5px` accent underline. Inactive: weight 500, muted, no underline.
- Desktop: mark and wordmark left, items right, 36px apart. Mobile: mark alone left, items right,
  18px apart. The bar does not collapse into a menu.
- The shared challenge page has no active item.

### Empty and loading cards

- Empty: `1.5px dashed #6A3A45`, radius 10px, min height 520px, a faint mark, a 34px serif
  title and a line of muted text.
- Loading: fill `#42202A`, border `1px #6A3A45`, radius 10px, min height 520px, skeleton shapes
  in `#4C2631` (a 64px circle and four bars, radius 4px), and "Finding a client..." at the
  bottom. The skeleton does not animate.

## Motion

None is specified. The canvas has no transition, animation or press state. The one interaction
rule is on links: `a { color: #D9A796 }` and `a:hover { color: #EBD7BF }`.

Keep motion off unless it is added to the design. If something is added later, respect
`prefers-reduced-motion`.

## Gaps

Not drawn, so not specified. Each needs a decision before issue 25 finishes.

- **Focus.** No focus ring is drawn. Proposal: a `2px` accent outline with a `2px` offset on
  every control. Accent on ground is 7.78:1, so it clears 3:1 everywhere.
- **Hover and press** on buttons, rows and the dial.
- **A ticked row inside a raised fill**, if the design ever gives ticked rows a fill again.
- **Very long client names.** The name uses balanced wrapping at 34px, which handles two lines.
- **The daily card at zero, and a daily card with ticks.**
- **A light colour scheme.** None, on purpose.

## Building it

Issue 25 applies this in `src/index.css`. This write-up changes no app code.

The app uses Tailwind 4 with CSS-first theme tokens. Declare the palette in `@theme`, named by
role, so utilities such as `bg-ground`, `text-ink` and `border-line` exist.

```css
@theme {
  --color-ground: #33161e;
  --color-surface: #42202a;
  --color-raised: #4c2631;
  --color-raised-new: #5a2c38;
  --color-inset: #220d13;
  --color-inset-quiet: #2a1218;
  --color-mark: #5e1024;
  --color-line: #4f2a33;
  --color-line-strong: #6a3a45;
  --color-ink: #ebd7bf;
  --color-ink-soft: #e2ccb8;
  --color-muted: #d2b9a6;
  --color-done: #a88d89;
  --color-control-edge: #966670;
  --color-accent: #d9a796;
  --color-on-accent: #33161e;
  --color-disabled: #8a6a6c;

  --font-sans: "Instrument Sans", system-ui, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-mono: ui-monospace, Menlo, monospace;

  --radius-box: 5px;
  --radius-row: 6px;
  --radius-control: 8px;
  --radius-panel: 10px;

  --tracking-label: 0.24em;
  --tracking-occasion: 0.26em;
  --tracking-tag: 0.18em;
}
```

Notes for the build:

- **Roles, not hex.** Components say `bg-surface`, never `bg-[#42202A]`. A palette change is then
  one edit.
- **Match the shadcn tokens.** `src/index.css` already declares shadcn's variables and maps them
  with `@theme inline`. Point the shadcn variables at the role tokens instead of adding a second
  set:

  | shadcn variable | Rosewood role |
  |---|---|
  | `--background` | ground |
  | `--foreground` | ink |
  | `--card`, `--popover` | surface |
  | `--card-foreground`, `--popover-foreground` | ink |
  | `--primary` | accent |
  | `--primary-foreground` | on-accent |
  | `--secondary` | surface |
  | `--secondary-foreground` | ink |
  | `--muted` | raised |
  | `--muted-foreground` | muted |
  | `--accent` | raised |
  | `--accent-foreground` | ink |
  | `--border`, `--sidebar-border` | line |
  | `--input` | line-strong |
  | `--ring` | accent |
  | `--destructive` | not drawn. Keep the shadcn value until an error state is designed |

  The name `--color-accent` is taken by shadcn, where it means a quiet hover fill. The rose accent
  is `--color-primary` in shadcn terms. If the role token is also called `accent`, rename one
  of them in the same commit so a class like `bg-accent` is not read two ways.
- **Dark only.** Put the dark values on `:root`. Delete the `.dark` block and the `dark` custom
  variant, because the app will never set that class.
- **Fonts.** Replace the Geist import. Load Instrument Sans at 400, 500 and 600 and Instrument
  Serif at 400, roman and italic. Set `--font-heading` to the serif.
- **Type scale.** Sizes are fixed per role, not fluid. Keep them as named utilities or small
  components, as the table under Type lists, so a screen does not hand-write a size.
- **Small caps labels.** One shared class for uppercase, `600`, `--tracking-label`. Size and
  colour vary by use.
- **Breakpoint.** Use `md` (768px) for the desktop and mobile switch.
  Playwright already runs both projects.
- **Contrast fixes** (accepted 2026-10-20) are two token values: `--color-done: #a88d89` and a
  new `--color-control-edge: #966670` for outlined buttons and the dial.
- **Tick and reroll targets** stay 44px on mobile. The tick box is 22px inside a 44px row.
