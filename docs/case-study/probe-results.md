# Probe results: do the tests catch real breaks?

A green suite only proves the tests agree with the code. So each guarantee was broken on purpose,
one at a time, and the suite was run. A test that stays green is a fake. Every break below turned
the suite red, in the test named. Each break was undone from a saved copy afterwards.

| Guarantee | The break | Test that caught it |
|---|---|---|
| No contradictions or repeats | The conflict check is skipped when a direction is drawn | Property: never contradict themselves or repeat a direction |
| Direction count and limits fit the difficulty | A kind's minimum is ignored when the plan is drawn | Property: deal a direction count, types and limits that fit the difficulty |
| Counts stay in range | The largest count is widened from 8 to 12 | Property: keep counts in range and count only per-piece accessories |
| Burlap never appears without the modifier | Burlap is let into the general fabrics | Property: show Burlap only with the modifier and nowhere else |
| Chaos has exactly one opposing pair | The Chaos pair is never placed | Property: give Chaos exactly one opposing pair |
| A reroll checks against every other direction | The reroll only checks directions before it | Property: change only their target, keep its kind and stay valid |
| A link rebuilds the same rerolls in order | The reroll history is sorted before it is replayed | Property: rebuild from the seed and the history to the same challenge |
| Old share links keep their text | One character changed in a client line | Pinned challenges: still rebuilds every pinned challenge exactly |
| Old share links keep their numbers | The random number warm-up count changed | Pinned challenges: still rebuilds every pinned challenge exactly |
| Old share links keep their odds | One style tag weight changed | Pinned challenges: still rebuilds every pinned challenge exactly |

One probe first stayed green. The count property checked counts against the code's own range
constant, so widening the constant widened the check with it. The property now uses the literal
numbers from the design, and the probe turns it red.

## Five sample challenges

All five are for the seed `k7m2qx9a`, with client Freya Lindqvist.

- **Easy:** Orange, Warm, Blue
- **Medium:** No feathers, Warm, At least 4 bells, Buttons
- **Hard:** Feathers, At least 3 tassels, Daywear, At least 3 fabrics, Cool
- **Chaos:** Casual, Exactly 3 tassels, Bells, Only velvet and cotton, Velvet, Formal
- **Medium with Burlap only:** Burlap only, No trim, Daywear, At least 7 brooches, Appliqués

Chaos always has one opposing pair. Here it is Casual and Formal.
