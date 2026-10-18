import { describe, expect, it } from "vitest";
import { dataV1, type GameData } from "@/game/data/v1";
import { placedDirections, type Challenge } from "./challenge";
import { findConflicts } from "./contradictions";
import { burlapShapeFor, type Difficulty } from "./difficulty";
import type { Direction } from "./direction";
import { generate } from "./generate";
import { deriveSeed } from "./random";
import { rebuild, reroll } from "./reroll";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "chaos"];
const samples = Array.from({ length: 500 }, (_, i) => deriveSeed("burlap-sample", i));
const manySamples = Array.from({ length: 1000 }, (_, i) => deriveSeed("burlap-share", i));

const input = (seed: string, difficulty: Difficulty, burlap: boolean) => ({
  seed,
  difficulty,
  modifiers: burlap ? (["burlap"] as const) : [],
  dataVersion: 1,
});

const fabricOrColour = /^(fabric|colour)/;
const accessoryTypes = ["accessory", "accessoryAvoid", "accessoryMin", "accessoryExact"];
const mentionsBurlap = (direction: Direction) => JSON.stringify(direction).includes("Burlap");

const accessoryShare = (difficulty: Difficulty, burlap: boolean) => {
  let accessories = 0;
  let total = 0;
  for (const seed of manySamples) {
    const placed = placedDirections(generate(input(seed, difficulty, burlap)));
    total += placed.length;
    accessories += placed.filter((d) => accessoryTypes.includes(d.type)).length;
  }
  return accessories / total;
};

describe.each(difficulties)("burlap only on %s", (difficulty) => {
  const shape = dataV1.burlapDifficulties[difficulty];

  it("pins Burlap only first and keeps fabrics and colours out", () => {
    for (const seed of samples) {
      const challenge = generate(input(seed, difficulty, true));
      expect(challenge.modifiers).toEqual(["burlap"]);
      expect(challenge.directions[0]).toEqual({ type: "burlapOnly" });
      expect(challenge.plan[0]).toBe("burlapOnly");
      const rest = challenge.directions.slice(1);
      expect(rest.some((d) => d?.type === "burlapOnly")).toBe(false);
      for (const d of placedDirections(challenge)) {
        expect(d.type).not.toMatch(fabricOrColour);
        expect(mentionsBurlap(d)).toBe(false);
      }
    }
  });

  it("keeps the direction count, limits and conflicts of its shape", () => {
    for (const seed of samples) {
      const challenge = generate(input(seed, difficulty, true));
      const inner = challenge.plan.slice(1);
      expect(inner.length).toBeGreaterThanOrEqual(shape.directionCount.min);
      expect(inner.length).toBeLessThanOrEqual(shape.directionCount.max);
      expect(challenge.directions).toHaveLength(challenge.plan.length);
      for (const limit of shape.limits) {
        const used = inner.filter((type) => (limit.types as readonly string[]).includes(type));
        expect(used.length).toBeGreaterThanOrEqual(limit.min);
        expect(used.length).toBeLessThanOrEqual(limit.max);
      }
      const [a, b] = (challenge.pairSlots ?? []).map((slot) => challenge.directions[slot]);
      const allowedPair =
        a?.type === "style" && b?.type === "style" ? ([a.tag, b.tag] as const) : undefined;
      expect(
        findConflicts(placedDirections(challenge), {
          data: dataV1,
          pairs: shape.pairs,
          allowedPair,
        }),
      ).toEqual([]);
      challenge.directions.forEach((d, i) => {
        if (d) expect(d.type).toBe(challenge.plan[i]);
      });
    }
  });

  it("never deals Burlap without the modifier", () => {
    for (const seed of samples) {
      const challenge = generate(input(seed, difficulty, false));
      expect(challenge.plan).not.toContain("burlapOnly");
      for (const d of placedDirections(challenge)) {
        expect(d.type).not.toBe("burlapOnly");
        expect(mentionsBurlap(d)).toBe(false);
      }
    }
  });

  it("deals more accessory directions with the modifier", () => {
    expect(accessoryShare(difficulty, true)).toBeGreaterThan(accessoryShare(difficulty, false));
  });

  it("leaves no empty slots on a sample", () => {
    for (const seed of samples.slice(0, 100)) {
      const { directions } = generate(input(seed, difficulty, true));
      if (difficulty === "easy" || difficulty === "medium") expect(directions).not.toContain(null);
    }
  });
});

describe("burlap only on easy", () => {
  it("sometimes adds an accessory", () => {
    const withAccessory = samples.filter((seed) =>
      placedDirections(generate(input(seed, "easy", true))).some((d) => d.type === "accessory"),
    );
    expect(withAccessory.length / samples.length).toBeGreaterThanOrEqual(0.2);
  });
});

describe("burlap shapes come from the game data", () => {
  it("deals what a changed burlap easy shape says", () => {
    const data: GameData = {
      ...dataV1,
      burlapDifficulties: {
        ...dataV1.burlapDifficulties,
        easy: {
          directionCount: { min: 2, max: 2 },
          types: [{ type: "accessoryAvoid", weight: 1 }],
          limits: [],
          pairs: "never",
        },
      },
    };
    const challenge = generate(input("k7m2qx9a", "easy", true), data);
    expect(challenge.plan).toEqual(["burlapOnly", "accessoryAvoid", "accessoryAvoid"]);
    expect(generate(input("k7m2qx9a", "easy", false), data).plan).not.toContain("accessoryAvoid");
    expect(burlapShapeFor(data, "easy").directionCount.max).toBe(2);
  });
});

describe("modifiers", () => {
  it("refuses unknown and repeated modifiers", () => {
    const base = input("k7m2qx9a", "easy", false);
    expect(() => generate({ ...base, modifiers: ["monochrome" as "burlap"] })).toThrow(RangeError);
    expect(() => generate({ ...base, modifiers: ["burlap", "burlap"] })).toThrow(RangeError);
  });
});

describe("reroll and rebuild with burlap only", () => {
  const rerollable: Difficulty[] = ["easy", "medium", "hard"];

  it("refuses to reroll the Burlap only slot", () => {
    for (const difficulty of rerollable) {
      const challenge = generate(input("k7m2qx9a", difficulty, true));
      expect(() => reroll(challenge, 0)).toThrow(/burlap/i);
    }
  });

  it("rerolls every other slot inside the burlap shape", () => {
    for (const difficulty of rerollable) {
      for (const seed of samples.slice(0, 100)) {
        const start = generate(input(seed, difficulty, true));
        const slot = 1 + (seed.length % (start.plan.length - 1));
        const after = reroll(start, slot);
        expect(after.directions[0]).toEqual({ type: "burlapOnly" });
        expect(after.plan).toEqual(start.plan);
        const redrawn = after.directions[slot];
        if (redrawn) {
          expect(redrawn.type).toBe(start.plan[slot]);
          expect(redrawn.type).not.toMatch(fabricOrColour);
        }
      }
    }
  });

  it("rebuilds a history to the same challenge as live rerolls", () => {
    for (const difficulty of rerollable) {
      for (const seed of samples.slice(0, 60)) {
        const start = generate(input(seed, difficulty, true));
        let live: Challenge = start;
        const history: number[] = [];
        for (let i = 0; i < 4; i++) {
          const slot = 1 + ((i * 3 + seed.length) % (start.plan.length - 1));
          live = reroll(live, slot);
          history.push(slot);
        }
        expect(rebuild({ ...input(seed, difficulty, true), history })).toEqual(live);
      }
    }
  });

  it("refuses to rebuild a history that rerolls the Burlap only slot", () => {
    expect(() => rebuild({ ...input("k7m2qx9a", "easy", true), history: [0] })).toThrow(/burlap/i);
  });
});

describe("pinned burlap challenges", () => {
  const pinned = (
    difficulty: Difficulty,
    rest: Pick<Challenge, "plan" | "directions"> & Partial<Pick<Challenge, "pairSlots">>,
  ): Challenge => ({
    ...input("k7m2qx9a", difficulty, true),
    modifiers: ["burlap"],
    history: [],
    pairSlots: null,
    pullApartSlot: null,
    ...rest,
  });
  const dealt = (difficulty: Difficulty) => generate(input("k7m2qx9a", difficulty, true));

  it("deals the same easy card for a fixed seed", () => {
    expect(dealt("easy")).toEqual(
      pinned("easy", {
        plan: ["burlapOnly", "accessory", "style", "accessory"],
        directions: [
          { type: "burlapOnly" },
          { type: "accessory", accessory: "Trim" },
          { type: "style", tag: "Daywear" },
          { type: "accessory", accessory: "Button" },
        ],
      }),
    );
  });

  it("deals the same medium card for a fixed seed", () => {
    expect(dealt("medium")).toEqual(
      pinned("medium", {
        plan: ["burlapOnly", "accessoryAvoid", "style", "accessoryMin", "accessory"],
        directions: [
          { type: "burlapOnly" },
          { type: "accessoryAvoid", accessory: "Trim" },
          { type: "style", tag: "Daywear" },
          { type: "accessoryMin", accessory: "Brooch", count: 7 },
          { type: "accessory", accessory: "Appliqué" },
        ],
      }),
    );
  });

  it("deals the same hard card for a fixed seed", () => {
    expect(dealt("hard")).toEqual(
      pinned("hard", {
        plan: ["burlapOnly", "styleAvoid", "accessoryAvoid", "style", "accessoryMin", "style"],
        directions: [
          { type: "burlapOnly" },
          { type: "styleAvoid", tag: "Warm" },
          { type: "accessoryAvoid", accessory: "Bell" },
          { type: "style", tag: "Eveningwear" },
          { type: "accessoryMin", accessory: "Appliqué", count: 6 },
          { type: "style", tag: "Cute" },
        ],
      }),
    );
  });

  it("deals the same chaos card for a fixed seed", () => {
    expect(dealt("chaos")).toEqual(
      pinned("chaos", {
        plan: [
          "burlapOnly",
          "style",
          "style",
          "accessoryAvoid",
          "accessoryExact",
          "accessory",
          "style",
        ],
        pairSlots: [1, 2],
        directions: [
          { type: "burlapOnly" },
          { type: "style", tag: "Casual" },
          { type: "style", tag: "Formal" },
          { type: "accessoryAvoid", accessory: "Button" },
          { type: "accessoryExact", accessory: "Appliqué", count: 6 },
          { type: "accessory", accessory: "Flower" },
          { type: "style", tag: "Elegant" },
        ],
      }),
    );
  });
});
