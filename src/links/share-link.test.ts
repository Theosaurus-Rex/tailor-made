// @vitest-environment node
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Challenge } from "@/domain/challenge";
import type { Difficulty } from "@/domain/difficulty";
import { generate } from "@/domain/generate";
import { reroll } from "@/domain/reroll";
import { SEED_ALPHABET, SEED_LENGTH } from "@/domain/seed";
import { readShareLink, shareLinkFor } from "./share-link";

const FAST_CHECK_SEED = 158;

const generatedSeed = fc
  .array(fc.constantFrom(...SEED_ALPHABET), { minLength: SEED_LENGTH, maxLength: SEED_LENGTH })
  .map((characters) => characters.join(""));

const dailySeed = fc
  .record({
    year: fc.integer({ min: 2026, max: 2030 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
  })
  .map(
    ({ year, month, day }) =>
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );

const anySeed = fc.oneof(generatedSeed, dailySeed);
const anyDifficulty = fc.constantFrom<Difficulty>("easy", "medium", "hard", "chaos");

const challengeFor = (seed: string, difficulty: Difficulty, burlap: boolean) =>
  generate({ seed, difficulty, modifiers: burlap ? ["burlap"] : [], dataVersion: 1 });

function rerolledBy(challenge: Challenge, picks: number[]): Challenge {
  if (challenge.difficulty === "chaos") return challenge;
  const slots = challenge.plan
    .map((_, slot) => slot)
    .filter((slot) => challenge.directions[slot]?.type !== "burlapOnly");
  return picks.reduce((current, pick) => reroll(current, slots[pick % slots.length]), challenge);
}

const SEED = "k7m2qx9a";

const searchOf = (link: string) => link.slice(link.indexOf("?"));

const seedNumbered = (n: number) =>
  Array.from(
    { length: SEED_LENGTH },
    (_, place) => SEED_ALPHABET[Math.floor(n / 31 ** place) % 31],
  ).join("");

const problemFor = (query: string) => {
  const result = readShareLink(query);
  return result.ok ? "ok" : result.problem;
};

const firstSlotThatCanBeRerolled = (challenge: Challenge) =>
  challenge.directions.findIndex((direction) => direction?.type !== "burlapOnly");

describe("a share link for a challenge", () => {
  it("rebuilds the same challenge, rerolled or not", () => {
    fc.assert(
      fc.property(
        anySeed,
        anyDifficulty,
        fc.boolean(),
        fc.array(fc.nat(), { maxLength: 6 }),
        (seed, difficulty, burlap, picks) => {
          const challenge = rerolledBy(challengeFor(seed, difficulty, burlap), picks);
          const result = readShareLink(searchOf(shareLinkFor(challenge)));
          expect(result).toEqual({ ok: true, challenge });
        },
      ),
      { seed: FAST_CHECK_SEED, numRuns: 1000 },
    );
  });

  it("writes parameters in a fixed order with dots between list items", () => {
    const fresh = challengeFor(SEED, "medium", false);
    expect(shareLinkFor(fresh)).toBe("/c?v=1&s=k7m2qx9a&d=medium");

    const burlap = challengeFor("2026-10-19", "hard", true);
    expect(shareLinkFor(burlap)).toBe("/c?v=1&s=2026-10-19&d=hard&m=burlap");

    const slot = firstSlotThatCanBeRerolled(burlap);
    const rerolled = reroll(reroll(reroll(burlap, slot + 2), slot), slot + 2);
    expect(shareLinkFor(rerolled)).toBe(
      `/c?v=1&s=2026-10-19&d=hard&m=burlap&r=${slot + 2}.${slot}.${slot + 2}`,
    );
  });

  it("reads an order-sensitive history in the order it was written", () => {
    let found: { seed: string; first: Challenge; second: Challenge } | undefined;
    for (let i = 0; i < 5000 && !found; i++) {
      const seed = seedNumbered(i);
      const start = challengeFor(seed, "medium", false);
      const first = reroll(reroll(start, 0), 1);
      const second = reroll(reroll(start, 1), 0);
      if (JSON.stringify(first.directions) !== JSON.stringify(second.directions))
        found = { seed, first, second };
    }
    expect(found).toBeDefined();
    if (!found) return;
    expect(shareLinkFor(found.first)).not.toBe(shareLinkFor(found.second));
    expect(readShareLink(searchOf(shareLinkFor(found.first)))).toEqual({
      ok: true,
      challenge: found.first,
    });
    expect(readShareLink(searchOf(shareLinkFor(found.second)))).toEqual({
      ok: true,
      challenge: found.second,
    });
  });
});

describe("reading a share link", () => {
  it("accepts the query with or without the leading question mark, or as URLSearchParams", () => {
    const expected = challengeFor(SEED, "easy", false);
    const query = "v=1&s=k7m2qx9a&d=easy";
    expect(readShareLink(query)).toEqual({ ok: true, challenge: expected });
    expect(readShareLink(`?${query}`)).toEqual({ ok: true, challenge: expected });
    expect(readShareLink(new URLSearchParams(query))).toEqual({ ok: true, challenge: expected });
  });

  it("ignores keys it does not know", () => {
    const expected = challengeFor(SEED, "easy", false);
    expect(readShareLink("v=1&s=k7m2qx9a&d=easy&utm_source=x&future=1.2")).toEqual({
      ok: true,
      challenge: expected,
    });
  });

  it("refuses a link with no version", () => {
    expect(problemFor("s=k7m2qx9a&d=easy")).toBe("missingVersion");
  });

  it("refuses a version it does not know", () => {
    expect(problemFor("v=2&s=k7m2qx9a&d=easy")).toBe("unknownVersion");
  });

  it("refuses a version that is not a number", () => {
    expect(problemFor("v=abc&s=k7m2qx9a&d=easy")).toBe("unknownVersion");
  });

  it("refuses a junk seed", () => {
    expect(problemFor("v=1&s=hello!&d=easy")).toBe("badSeed");
    expect(problemFor("v=1&s=2026-02-30&d=easy")).toBe("badSeed");
    expect(problemFor("v=1&d=easy")).toBe("badSeed");
  });

  it("refuses an unknown difficulty", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=extreme")).toBe("unknownDifficulty");
    expect(problemFor("v=1&s=k7m2qx9a")).toBe("unknownDifficulty");
  });

  it("refuses an unknown modifier", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&m=glitter")).toBe("unknownModifier");
  });

  it("refuses a modifier used twice", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&m=burlap.burlap")).toBe("repeatedModifier");
  });

  it("refuses a history with an empty item", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&r=1..3")).toBe("badRerolls");
  });

  it("refuses a negative history item", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&r=-1")).toBe("badRerolls");
  });

  it("refuses a history item that is not a number", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&r=1.x")).toBe("badRerolls");
  });

  it("refuses a history item outside the challenge", () => {
    const { plan } = challengeFor(SEED, "easy", false);
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&r=99")).toBe("badRerolls");
    expect(problemFor(`v=1&s=k7m2qx9a&d=easy&r=${plan.length}`)).toBe("badRerolls");
    expect(problemFor(`v=1&s=k7m2qx9a&d=easy&r=${plan.length - 1}`)).toBe("ok");
  });

  it("refuses a history that rerolls the Burlap only slot", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&m=burlap&r=0")).toBe("badRerolls");
    expect(problemFor("v=1&s=k7m2qx9a&d=easy&m=burlap&r=1")).toBe("ok");
  });

  it("refuses a Chaos link with any history", () => {
    expect(problemFor("v=1&s=k7m2qx9a&d=chaos&r=0")).toBe("chaosRerolled");
    expect(problemFor("v=1&s=k7m2qx9a&d=chaos")).toBe("ok");
  });

  it("refuses a parameter given twice", () => {
    expect(problemFor("v=1&s=k7m2qx9a&s=m2k7qx9a&d=easy")).toBe("repeatedParameter");
  });

  it("never throws, whatever the query", () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        const result = readShareLink(query);
        expect(typeof result.ok).toBe("boolean");
      }),
      { seed: FAST_CHECK_SEED, numRuns: 1000 },
    );
  });

  it("never throws for a mix of real keys and odd values", () => {
    const value = fc.oneof(
      fc.string({ maxLength: 12 }),
      fc.constantFrom("1", "2", "easy", "chaos", "burlap", "k7m2qx9a", "0.1", "99", "1..2"),
    );
    fc.assert(
      fc.property(fc.array(fc.tuple(fc.constantFrom("v", "s", "d", "m", "r"), value)), (pairs) => {
        const result = readShareLink(new URLSearchParams(pairs));
        expect(typeof result.ok).toBe("boolean");
      }),
      { seed: FAST_CHECK_SEED, numRuns: 1000 },
    );
  });
});
