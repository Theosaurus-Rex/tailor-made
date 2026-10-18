import { describe, expect, it } from "vitest";
import { dataV1, type GameData } from "@/game/data/v1";
import { placedDirections } from "./challenge";
import { findConflicts } from "./contradictions";
import { AT_LEAST_TYPES, AVOID_TYPES, shapeFor, type Difficulty } from "./difficulty";
import { generate } from "./generate";
import { deriveSeed } from "./random";
import { rebuild, reroll } from "./reroll";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "chaos"];
const maxEmptyShare: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0.06, chaos: 0.1 };

const samples = Array.from({ length: 400 }, (_, i) => deriveSeed("difficulty-sample", i));

const input = (seed: string, difficulty: Difficulty) => ({
  seed,
  difficulty,
  modifiers: [],
  dataVersion: 1,
});

const countIn = (plan: readonly string[], types: readonly string[]) =>
  plan.filter((type) => types.includes(type)).length;

describe.each(difficulties)("%s", (difficulty) => {
  const shape = dataV1.difficulties[difficulty];
  const allowed = shape.types.map(({ type }) => type);

  it("deals its direction count, its types and its limits", () => {
    let emptySlots = 0;
    let slots = 0;
    for (const seed of samples) {
      const challenge = generate(input(seed, difficulty));
      expect(challenge.difficulty).toBe(difficulty);
      expect(challenge.plan.length).toBeGreaterThanOrEqual(shape.directionCount.min);
      expect(challenge.plan.length).toBeLessThanOrEqual(shape.directionCount.max);
      for (const type of challenge.plan) expect(allowed).toContain(type);
      for (const limit of shape.limits) {
        const used = countIn(challenge.plan, limit.types);
        expect(used).toBeGreaterThanOrEqual(limit.min);
        expect(used).toBeLessThanOrEqual(limit.max);
      }
      const placed = placedDirections(challenge);
      expect(findConflicts(placed, { data: dataV1 })).toEqual([]);
      expect(placed.map((d) => d.type)).not.toContain("burlapOnly");
      challenge.directions.forEach((d, i) => {
        if (d) expect(d.type).toBe(challenge.plan[i]);
      });
      slots += challenge.plan.length;
      emptySlots += challenge.directions.length - placed.length;
    }
    expect(emptySlots / slots).toBeLessThanOrEqual(maxEmptyShare[difficulty]);
  });

  it("satisfies its own shape", () => {
    const requiredTotal = shape.limits.reduce((sum, limit) => sum + limit.min, 0);
    expect(requiredTotal).toBeLessThanOrEqual(shape.directionCount.min);
    for (const limit of shape.limits) {
      expect(limit.min).toBeLessThanOrEqual(limit.max);
      for (const type of limit.types) expect(allowed).toContain(type);
    }
  });

  it("does not always put the same kind first", () => {
    const firsts = new Set(samples.map((seed) => generate(input(seed, difficulty)).plan[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
});

describe("easy", () => {
  it("never has an avoid or a count", () => {
    for (const seed of samples) {
      const types = generate(input(seed, "easy")).plan;
      expect(countIn(types, [...AVOID_TYPES, ...AT_LEAST_TYPES, "accessoryExact"])).toBe(0);
    }
  });
});

describe("medium", () => {
  it("has exactly one avoid and exactly one at-least count", () => {
    for (const seed of samples) {
      const { plan } = generate(input(seed, "medium"));
      expect(countIn(plan, AVOID_TYPES)).toBe(1);
      expect(countIn(plan, AT_LEAST_TYPES)).toBe(1);
    }
  });

  it("never has an only list or an exact count", () => {
    for (const seed of samples) {
      const { plan } = generate(input(seed, "medium"));
      expect(countIn(plan, ["colourOnly", "fabricsOnly", "accessoryExact"])).toBe(0);
    }
  });
});

describe("hard", () => {
  it("can ask for an only list", () => {
    const withOnly = samples.filter((seed) =>
      generate(input(seed, "hard")).plan.some(
        (type) => type === "colourOnly" || type === "fabricsOnly",
      ),
    );
    expect(withOnly.length).toBeGreaterThan(0);
  });
});

describe("chaos", () => {
  it("always has one only list and an exact count", () => {
    for (const seed of samples) {
      const { plan } = generate(input(seed, "chaos"));
      expect(countIn(plan, ["colourOnly", "fabricsOnly"])).toBe(1);
      expect(countIn(plan, ["accessoryExact"])).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("shapes come from the game data", () => {
  it("deals what a changed easy shape says", () => {
    const data: GameData = {
      ...dataV1,
      difficulties: {
        ...dataV1.difficulties,
        easy: {
          directionCount: { min: 2, max: 2 },
          types: [{ type: "colour", weight: 1 }],
          limits: [],
        },
      },
    };
    for (const seed of samples.slice(0, 50)) {
      const { plan } = generate(input(seed, "easy"), data);
      expect(plan).toEqual(["colour", "colour"]);
    }
    expect(generate(input("k7m2qx9a", "easy")).plan).not.toEqual(["colour", "colour"]);
  });

  it("refuses a difficulty the data does not have", () => {
    expect(() => shapeFor(dataV1, "brutal")).toThrow(RangeError);
    expect(() => shapeFor(dataV1, "toString")).toThrow(RangeError);
    expect(() =>
      generate({ ...input("k7m2qx9a", "easy"), difficulty: "brutal" as Difficulty }),
    ).toThrow(RangeError);
  });
});

describe.each(["hard", "chaos"] as const)("reroll and rebuild on %s", (difficulty) => {
  it("rebuild equals the live challenge", () => {
    for (const seed of samples.slice(0, 60)) {
      const start = generate(input(seed, difficulty));
      let live = start;
      const history: number[] = [];
      for (let i = 0; i < 5; i++) {
        const slot = (i * 3 + seed.length) % start.plan.length;
        live = reroll(live, slot);
        history.push(slot);
      }
      expect(rebuild({ ...input(seed, difficulty), history })).toEqual(live);
      expect(live.plan).toEqual(start.plan);
    }
  });
});
