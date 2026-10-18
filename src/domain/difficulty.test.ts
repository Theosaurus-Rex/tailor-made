import { describe, expect, it } from "vitest";
import { dataV1, type GameData } from "@/game/data/v1";
import { placedDirections } from "./challenge";
import { findConflicts } from "./contradictions";
import type { Direction } from "./direction";
import { AT_LEAST_TYPES, AVOID_TYPES, shapeFor, type Difficulty } from "./difficulty";
import { drawDirection, generate } from "./generate";
import { deriveSeed } from "./random";
import { rebuild, reroll } from "./reroll";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "chaos"];
const maxEmptyShare: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0.005, chaos: 0.01 };

const neverTogether = [
  ["colourOnly", "colourAvoid"],
  ["colourOnly", "coloursMin"],
  ["fabricsOnly", "fabricAvoid"],
  ["fabricsOnly", "fabricsMin"],
  ["coloursMin", "coloursMin"],
  ["fabricsMin", "fabricsMin"],
] as const;

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
      expect(findConflicts(placed, { data: dataV1, pairs: shape.pairs })).toEqual([]);
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

  it("never plans both kinds of a pair that can never share a card", () => {
    for (const seed of samples) {
      const { plan } = generate(input(seed, difficulty));
      for (const [a, b] of neverTogether) {
        if (a === b) expect(countIn(plan, [a])).toBeLessThanOrEqual(1);
        else expect(plan.includes(a) && plan.includes(b)).toBe(false);
      }
    }
  });

  it("does not always put the same kind first", () => {
    const firsts = new Set(samples.map((seed) => generate(input(seed, difficulty)).plan[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
});

const examples: Record<string, Direction[]> = {
  colourOnly: [
    { type: "colourOnly", colours: ["Red", "Blue"] },
    { type: "colourOnly", colours: ["Green"] },
  ],
  colourAvoid: [
    { type: "colourAvoid", colour: "Red" },
    { type: "colourAvoid", colour: "Yellow" },
  ],
  coloursMin: [
    { type: "coloursMin", count: 2 },
    { type: "coloursMin", count: 4 },
  ],
  fabricsOnly: [
    { type: "fabricsOnly", fabrics: ["Cotton", "Silk"] },
    { type: "fabricsOnly", fabrics: ["Wool"] },
  ],
  fabricAvoid: [
    { type: "fabricAvoid", fabric: "Cotton" },
    { type: "fabricAvoid", fabric: "Velvet" },
  ],
  fabricsMin: [
    { type: "fabricsMin", count: 2 },
    { type: "fabricsMin", count: 4 },
  ],
};

describe("kinds that never share a card", () => {
  it("are all listed in the game data", () => {
    for (const pair of neverTogether) expect(dataV1.kindsNeverTogether).toContainEqual(pair);
  });

  it.each(neverTogether)("%s and %s always conflict", (a, b) => {
    for (const first of examples[a]) {
      for (const second of examples[b]) {
        expect(findConflicts([first, second], { data: dataV1, pairs: "noBothStyles" })).not.toEqual(
          [],
        );
        expect(findConflicts([second, first], { data: dataV1, pairs: "noBothStyles" })).not.toEqual(
          [],
        );
      }
    }
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

const pairSamples = Array.from({ length: 500 }, (_, i) => deriveSeed("pair-sample", i));

const sides = (placed: readonly Direction[], kind: "style" | "any") => {
  const tags = placed.flatMap((d) =>
    d.type === "style" || (kind === "any" && d.type === "styleAvoid") ? [d.tag] : [],
  );
  const found: [number, number][] = [];
  tags.forEach((a, i) =>
    tags.forEach((b, j) => {
      if (
        i < j &&
        dataV1.opposingPairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x))
      )
        found.push([i, j]);
    }),
  );
  return found;
};

describe("pair rules in the game data", () => {
  it("gives each difficulty its own rule", () => {
    expect(dataV1.difficulties.easy.pairs).toBe("never");
    expect(dataV1.difficulties.medium.pairs).toBe("never");
    expect(dataV1.difficulties.hard.pairs).toBe("noBothStyles");
    expect(dataV1.difficulties.chaos.pairs).toBe("oneStylePair");
    expect(dataV1.difficulties.hard.pullApartChance).toBe(0.5);
  });

  it.each(["easy", "medium"] as const)("%s never touches a pair, in any form", (difficulty) => {
    for (const seed of pairSamples) {
      const placed = placedDirections(generate(input(seed, difficulty)));
      expect(sides(placed, "any")).toEqual([]);
    }
  });

  it("hard never has two style directions on opposite sides of a pair", () => {
    for (const seed of pairSamples) {
      const placed = placedDirections(generate(input(seed, "hard")));
      expect(sides(placed, "style")).toEqual([]);
    }
  });

  it("takes the rule from the shape, not from the difficulty name", () => {
    const loose: GameData = {
      ...dataV1,
      difficulties: {
        ...dataV1.difficulties,
        medium: { ...dataV1.difficulties.medium, pairs: "noBothStyles" },
      },
    };
    let touched = 0;
    for (const seed of pairSamples) {
      const placed = placedDirections(generate(input(seed, "medium"), loose));
      if (sides(placed, "any").length > 0) touched++;
    }
    expect(touched).toBeGreaterThan(0);
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
          pairs: "never",
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

describe("a colour or fabric beside an only list", () => {
  const draw = (plan: "colour" | "fabric", other: Direction, seed: string) =>
    drawDirection({
      seed,
      plan: [plan],
      slot: 0,
      rerollCount: 0,
      others: [other],
      pairs: "never",
      data: dataV1,
    });

  it("always fills from the list", () => {
    for (const seed of samples) {
      expect(draw("colour", { type: "colourOnly", colours: ["Red"] }, seed)).toEqual({
        type: "colour",
        colour: "Red",
      });
      expect(draw("fabric", { type: "fabricsOnly", fabrics: ["Wool"] }, seed)).toEqual({
        type: "fabric",
        fabric: "Wool",
      });
    }
  });
});
