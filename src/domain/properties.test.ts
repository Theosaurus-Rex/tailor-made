// @vitest-environment node
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { dataV1 } from "@/game/data/v1";
import { placedDirections, rerollCountOf, type Challenge } from "./challenge";
import { briefFor } from "./brief";
import { clientFromSeed } from "./client";
import { clientLine, lineRandomFor } from "./client-line";
import { findConflicts } from "./contradictions";
import { burlapShapeFor, shapeFor, type Difficulty } from "./difficulty";
import type { Direction } from "./direction";
import { generate } from "./generate";
import { rebuild, reroll } from "./reroll";
import { isValidSeed, SEED_ALPHABET, SEED_LENGTH } from "./seed";

const FAST_CHECK_SEED = 146;
const NUM_RUNS = 1000;
const REROLL_RUNS = 300;

const DAYS_2026_TO_2030 = 1826;

const generatedSeed = fc
  .array(fc.constantFrom(...SEED_ALPHABET), { minLength: SEED_LENGTH, maxLength: SEED_LENGTH })
  .map((characters) => characters.join(""));

const isLeap = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

function dateAfter2026Start(offset: number): string {
  let year = 2026;
  let left = offset;
  while (left >= (isLeap(year) ? 366 : 365)) {
    left -= isLeap(year) ? 366 : 365;
    year++;
  }
  const lengths = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let month = 0;
  while (left >= lengths[month]) left -= lengths[month++];
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(left + 1).padStart(2, "0")}`;
}

const dailySeed = fc.integer({ min: 0, max: DAYS_2026_TO_2030 - 1 }).map(dateAfter2026Start);

const anySeed = fc.oneof(generatedSeed, dailySeed);
const anyDifficulty = fc.constantFrom<Difficulty>("easy", "medium", "hard", "chaos");
const rerollable = fc.constantFrom<Difficulty>("easy", "medium", "hard");

const caseOf = (difficulty: fc.Arbitrary<Difficulty>) =>
  fc.record({ seed: anySeed, difficulty, burlap: fc.boolean() });

interface Case {
  seed: string;
  difficulty: Difficulty;
  burlap: boolean;
}

const generateCase = ({ seed, difficulty, burlap }: Case) =>
  generate({ seed, difficulty, modifiers: burlap ? ["burlap"] : [], dataVersion: 1 });

const shapeOf = (challenge: Challenge) =>
  (challenge.modifiers.includes("burlap") ? burlapShapeFor : shapeFor)(
    dataV1,
    challenge.difficulty,
  );

const allowedPairOf = (challenge: Challenge) => {
  if (!challenge.pairSlots) return undefined;
  const [first, second] = challenge.pairSlots.map((slot) => challenge.directions[slot]);
  return first?.type === "style" && second?.type === "style"
    ? ([first.tag, second.tag] as const)
    : undefined;
};

const conflictsIn = (challenge: Challenge) =>
  findConflicts(placedDirections(challenge), {
    data: dataV1,
    pairs: shapeOf(challenge).pairs,
    allowedPair: allowedPairOf(challenge),
  });

const check = <T>(arbitrary: fc.Arbitrary<T>, test: (value: T) => void, numRuns = NUM_RUNS) =>
  fc.assert(fc.property(arbitrary, test), { seed: FAST_CHECK_SEED, numRuns });

const isOpposing = (a: string, b: string) =>
  dataV1.opposingPairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));

const opposingStyleTags = (directions: Direction[], types: string[]) => {
  const tags = directions.flatMap((d) => (types.includes(d.type) && "tag" in d ? [d.tag] : []));
  return tags.flatMap((a, i) => tags.slice(i + 1).filter((b) => isOpposing(a, b)));
};

describe("the daily date arbitrary", () => {
  it("walks every real day from 2026-01-01 to 2030-12-31", () => {
    const days = Array.from({ length: DAYS_2026_TO_2030 }, (_, i) => dateAfter2026Start(i));
    expect(days.every(isValidSeed)).toBe(true);
    expect(new Set(days).size).toBe(DAYS_2026_TO_2030);
    expect([days[0], days.at(-1)]).toEqual(["2026-01-01", "2030-12-31"]);
  });
});

describe("generated challenges", () => {
  it("never contradict themselves or repeat a direction", () => {
    check(caseOf(anyDifficulty), (input) => {
      expect(conflictsIn(generateCase(input))).toEqual([]);
    });
  });

  it("deal a direction count, types and limits that fit the difficulty", () => {
    check(caseOf(anyDifficulty), (input) => {
      const challenge = generateCase(input);
      const shape = shapeOf(challenge);
      const dealt = challenge.plan.filter((type) => type !== "burlapOnly");
      expect(dealt.length).toBeGreaterThanOrEqual(shape.directionCount.min);
      expect(dealt.length).toBeLessThanOrEqual(shape.directionCount.max);
      const allowed = shape.types.map(({ type }) => type);
      for (const type of dealt) expect(allowed).toContain(type);
      for (const limit of shape.limits) {
        const used = dealt.filter((type) => limit.types.includes(type)).length;
        expect(used).toBeGreaterThanOrEqual(limit.min);
        expect(used).toBeLessThanOrEqual(limit.max);
      }
      challenge.directions.forEach((direction, slot) => {
        if (direction) expect(direction.type).toBe(challenge.plan[slot]);
      });
    });
  });

  it("keep counts in range and count only per-piece accessories", () => {
    check(caseOf(anyDifficulty), (input) => {
      for (const direction of placedDirections(generateCase(input))) {
        if (direction.type === "accessoryMin" || direction.type === "accessoryExact") {
          expect(direction.count).toBeGreaterThanOrEqual(2);
          expect(direction.count).toBeLessThanOrEqual(8);
          expect(dataV1.accessories[direction.accessory].unit).toBe("piece");
        }
        if (direction.type === "fabricsMin" || direction.type === "coloursMin") {
          expect(direction.count).toBeGreaterThanOrEqual(2);
          expect(direction.count).toBeLessThanOrEqual(4);
        }
        const list =
          direction.type === "fabricsOnly"
            ? direction.fabrics
            : direction.type === "colourOnly"
              ? direction.colours
              : undefined;
        if (list) {
          expect(list.length).toBeGreaterThanOrEqual(1);
          expect(list.length).toBeLessThanOrEqual(3);
          expect(new Set(list).size).toBe(list.length);
        }
      }
    });
  });

  it("show Burlap only with the modifier and nowhere else", () => {
    check(caseOf(anyDifficulty), (input) => {
      const challenge = generateCase(input);
      const text = JSON.stringify(challenge.directions);
      if (!input.burlap) {
        expect(challenge.plan).not.toContain("burlapOnly");
        expect(text).not.toContain("Burlap");
        return;
      }
      expect(challenge.plan[0]).toBe("burlapOnly");
      expect(challenge.directions[0]).toEqual({ type: "burlapOnly" });
      expect(challenge.plan.filter((type) => type === "burlapOnly")).toHaveLength(1);
      for (const type of challenge.plan.slice(1)) expect(type).not.toMatch(/^(fabric|colour)/);
      expect(text).not.toContain("Burlap");
    });
  });

  it("give Chaos exactly one opposing pair", () => {
    check(caseOf(fc.constant<Difficulty>("chaos")), (input) => {
      const challenge = generateCase(input);
      const { pairSlots } = challenge;
      expect(pairSlots).not.toBeNull();
      const placed = placedDirections(challenge);
      for (const slot of pairSlots ?? []) expect(challenge.directions[slot]?.type).toBe("style");
      const [first, second] = (pairSlots ?? []).map((slot) => challenge.directions[slot]);
      expect(first && "tag" in first && second && "tag" in second).toBe(true);
      if (first && "tag" in first && second && "tag" in second) {
        expect(isOpposing(first.tag, second.tag)).toBe(true);
      }
      expect(opposingStyleTags(placed, ["style"])).toHaveLength(1);
    });
  });

  it("never put an opposing pair on Easy or Medium, and no two on Hard", () => {
    check(caseOf(fc.constantFrom<Difficulty>("easy", "medium")), (input) => {
      const challenge = generateCase(input);
      expect(challenge.pairSlots).toBeNull();
      expect(opposingStyleTags(placedDirections(challenge), ["style", "styleAvoid"])).toEqual([]);
    });
    check(caseOf(fc.constant<Difficulty>("hard")), (input) => {
      const challenge = generateCase(input);
      expect(challenge.pairSlots).toBeNull();
      expect(opposingStyleTags(placedDirections(challenge), ["style"])).toEqual([]);
    });
  });

  it("fill every client line and the brief cleanly", () => {
    check(
      fc.tuple(caseOf(anyDifficulty), fc.nat(3)),
      ([input, rerolls]) => {
        const challenge = generateCase(input);
        const client = clientFromSeed(input.seed);
        const { personality } = client;
        const brief = briefFor(challenge, client);
        expect(brief).not.toMatch(/[{}]/);
        expect(brief).toMatch(/^\p{Lu}.*[.!?]$/u);
        challenge.directions.forEach((direction, slot) => {
          if (!direction || direction.type === "burlapOnly") return;
          const line = clientLine(direction, personality, lineRandomFor(input.seed, slot, rerolls));
          expect(line).toBeTypeOf("string");
          expect(line).not.toMatch(/[{}]/);
        });
      },
      NUM_RUNS,
    );
  });
});

describe("rerolls", () => {
  const rerollPlan = fc.record({
    start: caseOf(rerollable),
    picks: fc.array(fc.nat(), { maxLength: 6 }),
  });

  const slotsFor = (challenge: Challenge, picks: number[]) => {
    const slots = picks.map((pick) => pick % challenge.plan.length);
    return slots.filter((slot) => challenge.plan[slot] !== "burlapOnly");
  };

  it("change only their target, keep its kind and stay valid", () => {
    check(
      rerollPlan,
      ({ start, picks }) => {
        let challenge = generateCase(start);
        for (const slot of slotsFor(challenge, picks)) {
          const before = challenge;
          challenge = reroll(before, slot);
          before.directions.forEach((direction, i) => {
            if (i !== slot) expect(challenge.directions[i]).toEqual(direction);
          });
          const redrawn = challenge.directions[slot];
          if (redrawn) expect(redrawn.type).toBe(before.plan[slot]);
          expect(challenge.plan).toEqual(before.plan);
          expect(challenge.history).toEqual([...before.history, slot]);
          expect(rerollCountOf(challenge, slot)).toBe(rerollCountOf(before, slot) + 1);
          expect(conflictsIn(challenge)).toEqual([]);
        }
      },
      REROLL_RUNS,
    );
  });

  it("rebuild from the seed and the history to the same challenge", () => {
    check(
      rerollPlan,
      ({ start, picks }) => {
        const first = generateCase(start);
        const slots = slotsFor(first, picks);
        const live = slots.reduce((challenge, slot) => reroll(challenge, slot), first);
        const rebuilt = rebuild({
          seed: start.seed,
          difficulty: start.difficulty,
          modifiers: start.burlap ? ["burlap"] : [],
          dataVersion: 1,
          history: slots,
        });
        expect(rebuilt).toEqual(live);
      },
      REROLL_RUNS,
    );
  });

  it("are refused on Chaos, live and from a history", () => {
    check(
      caseOf(fc.constant<Difficulty>("chaos")),
      (input) => {
        const challenge = generateCase(input);
        expect(() => reroll(challenge, 0)).toThrow();
        expect(() =>
          rebuild({
            seed: input.seed,
            difficulty: "chaos",
            modifiers: input.burlap ? ["burlap"] : [],
            dataVersion: 1,
            history: [0],
          }),
        ).toThrow();
      },
      REROLL_RUNS,
    );
  });
});
