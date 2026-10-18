# How seeds work

A plain-English guide to `src/domain/random.ts`, `src/domain/seed.ts` and `src/lib/new-seed.ts`.

## The idea

Every challenge comes from a **seed**: a short piece of text like `k7m2qx9a`. The generator never
uses real randomness. It feeds the seed into a fixed recipe that turns it into a long run of
numbers that look random. The same seed always gives the same run of numbers. The generator then
makes the same choices and builds the same challenge.

That is how a share link works. The link does not carry the challenge itself, only the seed and a
few settings. Whoever opens it rebuilds the challenge from the seed and gets exactly what the
sender saw. It works on any device and in any browser, for as long as the recipe stays the same.

## What a seed looks like

There are two kinds.

- **A random seed** is made when someone presses Generate. It is 8 characters from
  `23456789abcdefghjkmnpqrstuvwxyz`, all lowercase. Characters that are easy to misread (`0`, `1`,
  `i`, `l`, `o`) are left out, so a seed can be read aloud or typed from a screenshot. There are
  about 850 billion possible seeds, so two players will not land on the same one by accident.
- **A daily seed** is today's date in UTC, such as `2026-10-16`. Everyone uses the same date at the
  same moment, so everyone gets the same daily challenge without a server.

`isValidSeed` accepts either form and rejects anything else, including dates that do not exist
such as `2026-02-30`. A link with a bad seed shows an error rather than a broken challenge.

## Making a random seed

Only `newSeed()` in `src/lib/new-seed.ts` uses real randomness. It asks the browser's secure random
source (`crypto.getRandomValues`) for random bytes and turns each one into a character.

There is one subtlety. A byte has 256 possible values, and the alphabet has 31 characters.
256 does not divide evenly by 31, so mapping every byte straight onto a character would make the
first few characters slightly more common. Instead, bytes of 248 or above are thrown away and
another is drawn. 248 is the largest multiple of 31 that fits, so every character is equally likely.

This lives outside `src/domain/` on purpose. The domain code must give the same answer every time,
and lint stops it using real randomness or the clock.

## From seed to numbers

`randomFromSeed(seed)` turns a seed into a source of numbers in three steps.

1. **Scramble the seed.** `scrambleSeed` turns the text into four 32-bit numbers.
   A small change to the text, even one character, gives completely different numbers.
2. **Start the stream.** Those four numbers start `numberStream`, a small, fast and well-tested
   random number generator. Each time it is asked for a number, it mixes its state
   and hands back the result.
3. **Warm up.** The first 15 numbers are thrown away. The stream's first few outputs still carry traces
   of its starting state. Without the warm-up, seeds that differ by one character would start out
   with similar numbers. Consecutive daily dates are exactly that kind of seed.

Everything uses whole-number maths on 32-bit values only. Floating-point maths can differ in tiny
ways between browsers and devices. Whole-number maths cannot, so the numbers are identical
everywhere.

The two steps are standard, public algorithms. In the code they have plain names, and a comment
gives the real name for anyone who wants to look them up: `scrambleSeed` is the cyrb128 hash and
`numberStream` is the sfc32 generator.

## Using the numbers

The generator gives the rest of the code four ways to make a choice.

- `fraction()` gives a number from 0 up to, but not including, 1. The other three are built on it.
- `between(min, max)` gives a whole number between `min` and `max`, including both ends. For example,
  how many directions a challenge gets.
- `pick(list)` chooses one item from a list, each equally likely.
- `weightedPick(rng, entries)` chooses one item where some are more likely than others. A tag with
  weight 3 comes up three times as often as one with weight 1. A weight of 0 means never.

## Rerolls and sub-seeds

Rerolling one direction must change that direction only and leave the rest of the challenge alone.
It must also survive a share link.

`deriveSeed(seed, ...parts)` makes a new seed from the original plus some extra details, such as which
direction is being rerolled and how many times. For example, the first reroll of direction 2
could use a sub-seed built from the seed, `2` and `1`. Each reroll gets its own run of numbers. Nothing else in
the challenge changes, because the main seed and its numbers stay the same.

A share link records the rerolls in order, such as `1.3.1` for direction 1, then 3, then 1 again.
Counts alone are not enough, because a rerolled direction is checked against the others, so the
order can change the result. Whoever opens the link generates the card and replays each reroll in
order, and gets the same directions.

The parts are joined with an invisible separator character before hashing. Without it,
`("a", 1, 2)` and `("a", 12)` would both become `a12` and collide.

## The one rule

**Nothing in `random.ts` may change for a published data version.** Changing a constant, the
warm-up count or the order of steps changes the numbers every seed produces. That changes every
challenge, and every share link ever made would rebuild something different.

The pinned tests in `src/domain/random.test.ts` exist to catch this. They hard-code the exact
numbers a few seeds produce, so any change to the recipe turns them red. If the recipe ever has to
change, that is a new data version, and old links keep using the old recipe.
