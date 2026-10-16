# Data v1 leanings (proposed)

Researched 2026-10-17. Ticket: PER-140. Ready to transcribe into `src/game/data/v1.ts`.
Names are exact, from spec section 4. Evidence numbers are for this doc only. The app holds names,
leanings and weights, never game scores.

Sources:

- Cards: https://dressmakerwiki.site/commissions and https://dressmakerwiki.site/style-tags
  (counts in `commission-cards.md`).
- Fabric tags: https://dressmakerwiki.site/fabrics (348 fabrics, build 410). Parsed from the page's
  "All recorded tags" lists. Averages are over every fabric of the type, a missing tag counting as 0.
- Accessory tags: https://dressmakerwiki.site/accessory-finder (330 items, build 410), parsed the same way.
- Accessory units: https://dressmakerwiki.site/accessories.
- Build 443 item types: `docs/notes/build-443-check.md`.
- cozygameguides.com was not found, so nothing here is cross-checked against it.

## Style tags (22) and weights

Weight is a 1 to 5 band from how many of the 77 cards ask for the tag.

| Tag | Cards | Weight |
|---|---|---|
| Gothic | 18 | 5 |
| Glamour | 17 | 5 |
| Romantic | 17 | 5 |
| Cute | 16 | 5 |
| Playful | 16 | 5 |
| Elaborate | 16 | 5 |
| Elegant | 13 | 4 |
| Risqué | 13 | 4 |
| Daywear | 10 | 3 |
| Formal | 10 | 3 |
| Eclectic | 9 | 3 |
| Eveningwear | 9 | 3 |
| Patterned | 9 | 3 |
| Simple | 7 | 2 |
| Warm | 7 | 2 |
| Professional | 6 | 2 |
| Cool | 5 | 2 |
| Flowers | 5 | 2 |
| Workwear | 4 | 2 |
| Uncomfortable | 1 | 1 |
| Casual | 0 | 1 |
| Shimmering | 0 | 1 |

Bands: 16 or more cards is 5, 13 is 4, 9 to 10 is 3, 4 to 7 is 2, under 2 is 1.

## Fabric types (8)

Leanings are the tags the type scores highest on, on average. Evidence is "average score over all
fabrics of the type" and "share of fabrics scoring 50 or more". The wiki's Patterned score is inflated
for every type by printed fabrics, so Patterned is left out of the leanings.

| Fabric type | Leans towards | Evidence (average, share at 50 or more) |
|---|---|---|
| Burlap | Uncomfortable | One fabric. Uncomfortable 50. Every other tag is 0 or negative (Eveningwear and Flowers -20). Modifier only. |
| Cotton | Daywear, Cool, Casual, Workwear | 80 fabrics. Cool 49 (97%), Daywear 48 (96%), Casual 47 (90%), Workwear 39 (74%). Cute 30 and Flowers 33 are printed designs only. |
| Lace | Gothic, Elegant, Eveningwear, Romantic, Risqué | 8 fabrics. Gothic 76 (100%), Elegant 51, Eveningwear 51, Romantic 47 (88%), Risqué 50 (100%). Formal 51 too. Small sample. |
| Linen | Daywear, Cool, Workwear, Simple | 28 fabrics. Cool 50 (100%), Daywear 49 (96%), Workwear 46 (93%), Simple 41 (79%). Casual 46 too. |
| Sequin | Glamour, Eveningwear, Elaborate, Shimmering | 25 fabrics. Eveningwear 50, Shimmering 50, Elaborate 49, Glamour 49 (all 96% or more). Gothic 32 and Risqué 26 are weaker. Casual, Professional and Workwear are negative (about -23). |
| Silk | Elegant, Formal, Eveningwear, Simple | 112 fabrics. Elegant 50 (99%), Formal 50 (99%), Eveningwear 49 (98%), Simple 35 (70%). |
| Velvet | Glamour, Eveningwear, Elegant, Warm, Gothic | 55 fabrics. Eveningwear 48, Formal 48, Glamour 48 (all 96%), Elegant 47 (95%), Warm 45 (89%). Gothic is only 14 (20%). See judgement calls. |
| Wool | Professional, Warm, Simple | 39 fabrics. Professional 50 (100%), Warm 50 (100%), Simple 41 (64%). Gothic 26 (36%). |

## Colours (11)

Names only for the data file: Black, Blue, Brown, Green, Grey, Orange, Pink, Purple, Red, White, Yellow.

Optional leanings. Colour is a weak signal in the wiki (average tag scores over fabrics of that colour,
Patterned left out). Only two are clear:

| Colour | Optional leaning | Evidence |
|---|---|---|
| Black | Gothic | Gothic 56 over 21 black fabrics, far above any other colour (white and red are about 30). |
| Pink | Cute, Romantic | Cute 35 and Romantic 34 over 38 pink fabrics. |

Weak, probably leave out: Brown (Professional 25, Warm 21), White (Romantic 34, Eveningwear 35),
Grey (Simple 40, Cool 30), Yellow (Cool 34). Blue, Green, Orange, Purple and Red show nothing past the
generic Eveningwear, Elegant and Simple that all silks and velvets carry.

## Accessory types (12)

Unit is `piece` or `cm`. Leanings come from the average tag score across items of the type.

| Accessory type | Unit | Leans towards | Evidence (items, average tag score) |
|---|---|---|---|
| Appliqué | piece | Flowers, Eclectic, Gothic | 12 items. Flowers is the top tag on 9 of 12. Eclectic and Gothic 0.9 average. Low scores (3 at most). |
| Bell | piece | Cute, Playful | 4 items. Cute 5, Playful 5 on all. |
| Bow | piece | Cute, Playful, Romantic | 57 items. Cute 3.8, Playful 3.1, Romantic 1.8. Professional is the top tag on 21 black ribbons and bows. |
| Brooch | piece | Elegant, Glamour, Eveningwear, Elaborate | 11 items. Elegant 3.9, Eveningwear 3.6, Glamour 3.6, Elaborate 3.6. Shimmering 3.9 too. |
| Button | piece | Daywear, Professional, Eclectic | 25 items. Daywear 2.5, Professional 2.4, Eclectic 1.7. |
| Feather | piece | Elaborate, Glamour, Eveningwear, Risqué | 9 items. Elaborate 4.8, Glamour 3.0, Eveningwear 2.0, Eclectic 2.0. Risqué is from cards, not the wiki. |
| Flower | piece | Flowers, Cute, Playful, Romantic | 31 items. Flowers 4.2, Cute 4.0, Playful 2.8, Romantic 1.8. |
| Jewel | piece | Elaborate, Eveningwear, Glamour, Elegant | 7 items. Elaborate 5.0, Eveningwear 5.0, Glamour 4.7, Elegant 3.0. Shimmering 4.3 too. |
| Lace Trim | cm | Romantic, Cute, Playful, Gothic | 49 items, all sold per metre. Romantic 3.7, Cute 3.6, Playful 3.3. Gothic 1.0 average, top on 10 items. |
| Piping | cm | Simple, Elegant | No evidence. 32 items, all listed as Trim, none with tag scores. Inferred. |
| Tassel | piece | Eclectic, Gothic, Elaborate | 6 items, sold each. Eclectic 4.2, Gothic 2.5, Elaborate 1.7. Tassel trims such as Gold Tassel Trim are Trim items. |
| Trim | cm | Eclectic, Cute, Gothic, Elaborate | 119 items, all per metre. Flat spread: Eclectic 1.5, Cute 1.3, Gothic 1.1, Elaborate 1.1, Playful 1.1, Glamour 1.1. 32 have no tags. |

Units are checked at https://dressmakerwiki.site/accessories: cards count Trim and Lace Trim by length
(cm), and count Bow, Feather, Flower, Tassel, Bell, Brooch and Jewel as pieces. The page says tassels
hang like a trim but are counted per piece on cards. Appliqué and Button are not on any card. They are
sold each on the accessory finder, so I mark them as pieces.

Only per-piece types can carry counts: Appliqué, Bell, Bow, Brooch, Button, Feather, Flower, Jewel,
Tassel.

### Build 443 items

From `docs/notes/build-443-check.md`, all confirmed in game by Theo:

- Silver Clasp: Brooch (piece).
- Silver Narcissus Chain, Silver Twin Souls Chain: Jewel (piece).
- Black Dagger Beaded Trim: Trim (cm).
- Widow's Lace Trim: Lace Trim (cm).
- Tassel trim items now show under the item filter. Tassel stays an existing type.

None of these change a leaning above. The wiki's tag data is build 410 and does not include them.

## Judgement calls

Things I inferred, or chose between options. Please check these in the game.

1. **Piping.** The wiki has no Piping type. It lists 32 "Piping" items under Trim, with no tag
   scores. The spec has Piping as its own type, so I kept it, per centimetre. Its leanings (Simple,
   Elegant) are a guess. Check whether the game's accessory filter shows Piping as a type, and whether
   piping has any tag effect.
2. **Velvet and Gothic.** Velvet's average Gothic score is only 14. I added Gothic as a fifth leaning
   because the spec example says a Gothic theme reaches for velvet, and 3 of the 4 cards that ask for
   Velvet are Gothic cards (9, 25, 41). Drop it if you want leanings to be wiki-only.
3. **Feather and Gothic.** The spec example says Gothic reaches for feathers. The wiki gives feathers no
   Gothic score. I left Gothic off and added Risqué instead, since 2 of 3 feather cards pair Feather
   with Glamour and Risqué (15, 59). Add Gothic back if the game feels that way.
4. **Shimmering.** Sequin leans towards Shimmering by the wiki, and the tag has weight 1. It is kept as
   a leaning because it is true. It will mostly matter for Sequin and Jewel themes, which is fine.
5. **Casual.** Cotton and Linen both lean towards Casual (weight 1). I left it on Cotton and dropped it
   from Linen to keep Linen to four.
6. **Patterned left out of fabric leanings.** Every printed fabric scores Patterned 100, so the average
   is inflated. Patterned stays a style direction only, as the spec says.
7. **Colour leanings.** Only Black and Pink are clear. The others are left out. Everything under
   "Optional" can be dropped without harm.
8. **Tag weights are bands, not a formula.** The bands in the weights table are my call. Flowers is
   weight 2 even though Flower, Appliqué and printed Cotton all lean towards it, so themes can still
   reach it through those.
9. **Unit for Appliqué and Button.** Inferred as per piece. The wiki sells both each and no card asks
   for them.
10. **Brooch, Jewel, Feather leanings are over small samples** (11, 7 and 9 items). Appliqué and Bell
    are tiny too (12 and 4).
11. **Cards with unit-less counts.** Sequin "at least 50" and "at least 10" on the wiki are not clearly
    percentages. They do not affect the data file.
