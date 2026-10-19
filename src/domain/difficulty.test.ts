import { describe, expect, it } from "vitest";
import type { PairRule } from "@/game/data/difficulty-shapes";
import { dataV1, type GameData } from "@/game/data/v1";
import { placedDirections, type Challenge } from "./challenge";
import { findConflicts, type ConflictOptions } from "./contradictions";
import type { Direction } from "./direction";
import {
  AT_LEAST_TYPES,
  AVOID_TYPES,
  shapeFor,
  type Difficulty,
  type DifficultyShape,
} from "./difficulty";
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

const samples = Array.from({ length: 100 }, (_, i) => deriveSeed("difficulty-sample", i));

const input = (seed: string, difficulty: Difficulty) => ({
  seed,
  difficulty,
  modifiers: [],
  dataVersion: 1,
});

const optionsFor = (challenge: Challenge, pairs: PairRule): ConflictOptions => {
  const [a, b] = (challenge.pairSlots ?? []).map((slot) => challenge.directions[slot]);
  const allowedPair =
    a?.type === "style" && b?.type === "style" ? ([a.tag, b.tag] as const) : undefined;
  return { data: dataV1, pairs, allowedPair };
};

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
      expect(findConflicts(placed, optionsFor(challenge, shape.pairs))).toEqual([]);
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

describe.each(difficulties)("%s burlap shape", (difficulty) => {
  const shape = dataV1.burlapDifficulties[difficulty];
  const normal = dataV1.difficulties[difficulty];
  const allowed = shape.types.map(({ type }) => type);
  const accessoryWeight = (types: DifficultyShape["types"]) =>
    types.filter(({ type }) => type.startsWith("accessory")).reduce((sum, t) => sum + t.weight, 0);
  const share = (types: DifficultyShape["types"]) =>
    accessoryWeight(types) / types.reduce((sum, t) => sum + t.weight, 0);

  it("satisfies its own shape", () => {
    const requiredTotal = shape.limits.reduce((sum, limit) => sum + limit.min, 0);
    expect(requiredTotal).toBeLessThanOrEqual(shape.directionCount.min);
    for (const limit of shape.limits) {
      expect(limit.min).toBeLessThanOrEqual(limit.max);
      for (const type of limit.types) expect(allowed).toContain(type);
    }
  });

  it("names no fabric or colour kinds", () => {
    const banned = /^(fabric|colour)/;
    for (const type of allowed) expect(type).not.toMatch(banned);
    for (const limit of shape.limits)
      for (const type of limit.types) expect(type).not.toMatch(banned);
  });

  it("keeps the count, pair rule and pull apart chance of the normal shape", () => {
    expect(shape.directionCount).toEqual(normal.directionCount);
    expect(shape.pairs).toBe(normal.pairs);
    expect(shape.pullApartChance).toBe(normal.pullApartChance);
  });

  it("weights accessories more than the normal shape does without fabrics and colours", () => {
    const withoutThem = normal.types.filter(({ type }) => !/^(fabric|colour)/.test(type));
    expect(share(shape.types)).toBeGreaterThan(share(withoutThem) + 0.1);
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

const looseSamples = Array.from({ length: 3000 }, (_, i) => deriveSeed("pair-sample", i));

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
    for (const seed of looseSamples) {
      const placed = placedDirections(generate(input(seed, "medium"), loose));
      if (sides(placed, "any").length > 0) touched++;
    }
    expect(touched).toBeGreaterThan(0);
  });
});

describe("chaos pair", () => {
  const chaos = (seed: string, data?: GameData) => generate(input(seed, "chaos"), data);

  it("has exactly one opposing pair, as the first two style slots", () => {
    for (const seed of pairSamples) {
      const challenge = chaos(seed);
      const styleSlots = challenge.plan.flatMap((type, slot) => (type === "style" ? [slot] : []));
      expect(challenge.pairSlots).toEqual([styleSlots[0], styleSlots[1]]);
      const placed = placedDirections(challenge);
      const found = sides(placed, "style");
      expect(found).toHaveLength(1);
      const [a, b] = (challenge.pairSlots ?? []).map((slot) => challenge.directions[slot]);
      expect(a?.type).toBe("style");
      expect(b?.type).toBe("style");
      const tags = placed.flatMap((d) => (d.type === "style" ? [d.tag] : []));
      const pairTags = [a, b].flatMap((d) => (d?.type === "style" ? [d.tag] : []));
      expect(found[0].map((i) => tags[i]).sort()).toEqual(pairTags.sort());
    }
  });

  it("has no conflicts beside the pair", () => {
    for (const seed of pairSamples) {
      const challenge = chaos(seed);
      const options = optionsFor(challenge, "oneStylePair");
      expect(findConflicts(placedDirections(challenge), options)).toEqual([]);
    }
  });

  it("uses every pair and both orders", () => {
    const seen = new Set<string>();
    for (const seed of pairSamples) {
      const { pairSlots, directions } = chaos(seed);
      const [a, b] = (pairSlots ?? []).map((slot) => directions[slot]);
      if (a?.type === "style" && b?.type === "style") seen.add(`${a.tag}/${b.tag}`);
    }
    expect(seen.size).toBe(dataV1.opposingPairs.length * 2);
  });

  it("is the same for the same seed", () => {
    expect(chaos("k7m2qx9a")).toEqual(chaos("k7m2qx9a"));
  });

  it("comes from the pairs in the game data", () => {
    const data: GameData = { ...dataV1, opposingPairs: [["Cute", "Simple"]] };
    for (const seed of pairSamples.slice(0, 100)) {
      const { pairSlots, directions } = chaos(seed, data);
      const tags = (pairSlots ?? []).map((slot) => {
        const d = directions[slot];
        return d?.type === "style" ? d.tag : undefined;
      });
      expect(tags.sort()).toEqual(["Cute", "Simple"]);
    }
  });

  it("never forms a second pair, even when every slot is a style", () => {
    const allStyles: GameData = {
      ...dataV1,
      difficulties: {
        ...dataV1.difficulties,
        chaos: {
          ...dataV1.difficulties.chaos,
          directionCount: { min: 4, max: 4 },
          types: [{ type: "style", weight: 1 }],
          limits: [{ types: ["style"], min: 2, max: 4 }],
        },
      },
    };
    let fourStyles = 0;
    for (const seed of pairSamples) {
      const placed = placedDirections(chaos(seed, allStyles));
      expect(sides(placed, "style")).toHaveLength(1);
      if (placed.length === 4) fourStyles++;
    }
    expect(fourStyles).toBeGreaterThan(100);
  });
});

describe("hard pull apart", () => {
  const hardSamples = Array.from({ length: 2500 }, (_, i) => deriveSeed("pull-apart-sample", i));
  const hard = (seed: string) => generate(input(seed, "hard"));
  const canPullApart = (plan: readonly string[]) =>
    plan.includes("styleAvoid") && plan.some((type) => type === "fabric" || type === "accessory");

  const leans = (direction: Direction | null | undefined, tag: string) => {
    if (direction?.type === "fabric")
      return (dataV1.fabrics[direction.fabric].leansTowards as readonly string[]).includes(tag);
    if (direction?.type === "accessory")
      return (dataV1.accessories[direction.accessory].leansTowards as readonly string[]).includes(
        tag,
      );
    return false;
  };

  const avoidedTag = (challenge: Challenge) => {
    const avoid = challenge.directions.find((d) => d?.type === "styleAvoid");
    return avoid?.type === "styleAvoid" ? avoid.tag : undefined;
  };

  const hasLeaningItem = (challenge: Challenge, slot: number, tag: string) => {
    if (challenge.plan[slot] === "fabric") {
      const only = challenge.directions.find((d) => d?.type === "fabricsOnly");
      const pool = only?.type === "fabricsOnly" ? only.fabrics : dataV1.fabricTypes;
      return pool.some(
        (f) =>
          !dataV1.fabrics[f].modifierOnly &&
          (dataV1.fabrics[f].leansTowards as readonly string[]).includes(tag),
      );
    }
    return dataV1.accessoryTypes.some((a) =>
      (dataV1.accessories[a].leansTowards as readonly string[]).includes(tag),
    );
  };

  it("marks about the chosen share of the plans that can pull apart", () => {
    const chance = dataV1.difficulties.hard.pullApartChance ?? 0;
    let eligible = 0;
    let marked = 0;
    for (const seed of hardSamples) {
      const { plan, pullApartSlot } = hard(seed);
      if (!canPullApart(plan)) {
        expect(pullApartSlot).toBeNull();
        continue;
      }
      eligible++;
      if (pullApartSlot === null) continue;
      marked++;
      expect(pullApartSlot).toBe(plan.findIndex((t) => t === "fabric" || t === "accessory"));
    }
    expect(eligible).toBeGreaterThan(100);
    expect(Math.abs(marked / eligible - chance)).toBeLessThanOrEqual(0.08);
  });

  it("never marks a slot on easy, medium or chaos", () => {
    for (const difficulty of ["easy", "medium", "chaos"] as const) {
      for (const seed of pairSamples.slice(0, 100)) {
        expect(generate(input(seed, difficulty)).pullApartSlot).toBeNull();
      }
    }
  });

  it("picks an item that leans towards the avoided style", () => {
    let checked = 0;
    for (const seed of hardSamples) {
      const challenge = hard(seed);
      const slot = challenge.pullApartSlot;
      const tag = avoidedTag(challenge);
      if (slot === null || tag === undefined || !challenge.directions[slot]) continue;
      if (!hasLeaningItem(challenge, slot, tag)) continue;
      checked++;
      expect(leans(challenge.directions[slot], tag)).toBe(true);
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("keeps the item leaning when the marked slot is rerolled", () => {
    let checked = 0;
    for (const seed of hardSamples) {
      const challenge = hard(seed);
      const slot = challenge.pullApartSlot;
      const tag = avoidedTag(challenge);
      if (slot === null || tag === undefined || !hasLeaningItem(challenge, slot, tag)) continue;
      const again = reroll(reroll(challenge, slot), slot);
      for (const result of [again, reroll(challenge, slot)]) {
        if (!result.directions[slot]) continue;
        checked++;
        expect(leans(result.directions[slot], tag)).toBe(true);
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("leaves the marked slot alone when its avoid is rerolled", () => {
    let checked = 0;
    for (const seed of hardSamples) {
      const challenge = hard(seed);
      const avoidSlot = challenge.plan.indexOf("styleAvoid");
      if (challenge.pullApartSlot === null || avoidSlot < 0) continue;
      const after = reroll(challenge, avoidSlot);
      expect(after.directions[challenge.pullApartSlot]).toEqual(
        challenge.directions[challenge.pullApartSlot],
      );
      expect(after.pullApartSlot).toBe(challenge.pullApartSlot);
      checked++;
    }
    expect(checked).toBeGreaterThan(50);
  });

  it("is the same for the same seed", () => {
    for (const seed of pairSamples.slice(0, 50)) expect(hard(seed)).toEqual(hard(seed));
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

describe.each(["hard"] as const)("reroll and rebuild on %s", (difficulty) => {
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
