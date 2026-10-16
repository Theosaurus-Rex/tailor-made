# Build 443 check for data v1

Checked on 2026-10-17. Ticket: PER-130.

## Result

Nothing changes in the v1 lists. Build 443 added no new fabric type, no new accessory type, and no new tag or colour. The spec's §4 table stands as written.

## Builds checked

- Build 403 (2026-09-22), Build 410 (2026-09-24), Build 443 (2026-10-14).
- Build 443 is the latest build with any evidence. The Steam news feed for app 4019220 had nothing newer on 2026-10-17.

## What Build 443 added

The official notes list this new content:

- Two skirt variants: a less poofy Chrysanthemum skirt and a longer Pencil skirt.
- Cotton: Autumnal Vine Border Print Cotton, Spring Vine Border Print Cotton and Taupe Cotton. The notes call this a "new cotton design type". That is a new print design of the existing Cotton type, not a new fabric type.
- Lace: Silver Lace and Pastel Pink Lace.
- Shot and gradient silks: Burning Forest, Golden Dawn, Lavender Field and Snowflake Gradient.
- Silver accessories and trims: Silver Clasp, Silver Narcissus Chain, Silver Twin Souls Chain.
- Black Dagger Beaded Trim and Widow's Lace Trim.

### Fabric types

No change. Every new fabric is Cotton, Lace or Silk. The 8 types stay.

### Accessory types

No change. The notes name no new accessory type. The new items fit existing types:

- Silver Clasp: most likely Brooch or Button style. Not stated.
- Silver Narcissus Chain and Silver Twin Souls Chain: most likely Jewel. Not stated.
- Black Dagger Beaded Trim: a trim, so most likely Trim.
- Widow's Lace Trim: Lace Trim.

These are my mapping, not a source's. Individual items need no action.
The Steam notes also say trim items with typed beads (such as tassel trim) now show when you filter for that item. This confirms Tassel as an existing type and adds no new one.

### Style tags and colours

No change found. The notes mention no new or renamed tag or colour. The wiki names Taupe, Pastel Pink and Silver only as part of fabric and item names.

### Tag leaning per fabric type

Not confirmed either way. The wiki says new tag values are "awaiting verification". The wiki still shows Build 410 data for fabrics.
One related change matters for later. Build 443 changed how colour and fabric-type requirements are scored. Before, it was a raw share of panel area. Now panels on small components (collar, sleeves) get a boost. Tags were already scored this way. This affects the scoring model (spec §5), not the type lists.

## Lists to freeze in v1

- Fabric types (8): Burlap, Cotton, Lace, Linen, Sequin, Silk, Velvet, Wool.
- Accessory types (12): Appliqué, Bell, Bow, Brooch, Button, Feather, Flower, Jewel, Lace Trim, Piping, Tassel, Trim.
- Style tags (22) and colours (11): as in spec §4.

## Sources

- Steam announcement, October Patch Notes - Build 443 (primary, read in full via the Steam news API): https://steamcommunity.com/games/4019220/announcements/detail/714541292743295127
- Steam news API feed used to read the full text of builds 403, 410 and 443: https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=4019220&count=30&maxlength=0
- SteamDB copy of the Build 443 notes (page blocked on fetch, seen only in search results): https://steamdb.info/patchnotes/25928714/
- dressmakerwiki.site patch notes (secondary, agrees with the official list): https://dressmakerwiki.site/patch-notes
- PCGamesN summary (only the Steam stub was read): https://www.pcgamesn.com/dressmaker/update-new-skirts-materials

cozygameguides.com, Reddit and Steam discussions were not found or read. The official notes were enough for the type question.

## Unverified

Theo should confirm in game:

- That no new accessory type shows in the accessory filter after Build 443, and which type each new item sits under (Silver Clasp, the two Silver chains, Black Dagger Beaded Trim).
- Whether Black Dagger Beaded Trim counts per centimetre like other trims.
- Whether the tag list and colour list still show 22 tags and 11 colours.
- Whether the new fabrics (Taupe Cotton, the shot and gradient silks) change which tags Cotton and Silk lean towards.
- That the unlock points for the new items are as stated. The notes only say they unlock through the campaign.
