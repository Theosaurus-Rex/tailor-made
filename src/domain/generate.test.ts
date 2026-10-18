import { describe, expect, it } from "vitest";
import { dataV1 } from "@/game/data/v1";
import { placedDirections } from "./challenge";
import { findConflicts } from "./contradictions";
import { AT_LEAST_TYPES, AVOID_TYPES, type DifficultyShape } from "./difficulty";
import { COUNT_RANGE, FABRICS_MIN_RANGE, ONLY_LIST_SIZE, type Direction } from "./direction";
import { drawDirection, drawPlan, generate, MAX_TRIES } from "./generate";
import { deriveSeed } from "./random";
import { shortLine } from "./short-line";

const input = (seed: string) => ({
  seed,
  difficulty: "medium" as const,
  modifiers: [],
  dataVersion: 1,
});

const withMedium = (medium: DifficultyShape) => ({
  ...dataV1,
  difficulties: { ...dataV1.difficulties, medium },
});

const samples = Array.from({ length: 500 }, (_, i) => deriveSeed("sample", i));

const lines = (seed: string) => generate(input(seed)).directions.map((d) => d && shortLine(d));

describe("generate", () => {
  it("gives an equal challenge for the same input", () => {
    const first = generate(input("k7m2qx9a"));
    expect(generate(input("k7m2qx9a"))).toEqual(first);
  });

  it("gives a different challenge for a different seed", () => {
    const seen = new Set(samples.slice(0, 50).map((seed) => lines(seed).join("|")));
    expect(seen.size).toBeGreaterThan(40);
  });

  it("carries what a share link needs", () => {
    const challenge = generate(input("k7m2qx9a"));
    expect(challenge).toMatchObject({
      seed: "k7m2qx9a",
      difficulty: "medium",
      modifiers: [],
      dataVersion: 1,
    });
    expect(challenge.history).toEqual([]);
  });

  it("pins fixed seeds", () => {
    const base = { difficulty: "medium", modifiers: [], dataVersion: 1 };
    expect(generate(input("k7m2qx9a"))).toEqual({
      ...base,
      seed: "k7m2qx9a",
      plan: ["accessoryAvoid", "style", "accessoryMin", "accessory"],
      history: [],
      pairSlots: null,
      directions: [
        { type: "accessoryAvoid", accessory: "Feather" },
        { type: "style", tag: "Warm" },
        { type: "accessoryMin", accessory: "Bell", count: 4 },
        { type: "accessory", accessory: "Button" },
      ],
    });
    expect(generate(input("2026-10-16"))).toEqual({
      ...base,
      seed: "2026-10-16",
      plan: ["accessoryAvoid", "colour", "coloursMin"],
      history: [],
      pairSlots: null,
      directions: [
        { type: "accessoryAvoid", accessory: "Tassel" },
        { type: "colour", colour: "Yellow" },
        { type: "coloursMin", count: 4 },
      ],
    });
    expect(generate(input("23456789"))).toEqual({
      ...base,
      seed: "23456789",
      plan: ["accessoryAvoid", "colour", "coloursMin"],
      history: [],
      pairSlots: null,
      directions: [
        { type: "accessoryAvoid", accessory: "Bell" },
        { type: "colour", colour: "White" },
        { type: "coloursMin", count: 3 },
      ],
    });
  });

  it("keeps every medium challenge inside its shape", () => {
    for (const seed of samples) {
      const challenge = generate(input(seed));
      const directions = placedDirections(challenge);
      expect(findConflicts(directions, { data: dataV1, pairs: "never" })).toEqual([]);
      expect(challenge.directions).toHaveLength(challenge.plan.length);
      expect(challenge.plan.length).toBeGreaterThanOrEqual(3);
      expect(challenge.plan.length).toBeLessThanOrEqual(4);
      expect(challenge.plan.filter((t) => AVOID_TYPES.includes(t))).toHaveLength(1);
      expect(challenge.plan.filter((t) => AT_LEAST_TYPES.includes(t))).toHaveLength(1);
      for (const d of directions) {
        expect(["burlapOnly", "fabricsOnly", "colourOnly", "accessoryExact"]).not.toContain(d.type);
        if (d.type === "accessoryMin") {
          expect(dataV1.accessories[d.accessory].unit).toBe("piece");
          expect(d.count).toBeGreaterThanOrEqual(COUNT_RANGE.min);
          expect(d.count).toBeLessThanOrEqual(COUNT_RANGE.max);
        }
        if (d.type === "fabricsMin" || d.type === "coloursMin") {
          expect(d.count).toBeGreaterThanOrEqual(FABRICS_MIN_RANGE.min);
          expect(d.count).toBeLessThanOrEqual(FABRICS_MIN_RANGE.max);
        }
        if (d.type === "fabric" || d.type === "fabricAvoid") expect(d.fabric).not.toBe("Burlap");
      }
    }
  });

  it("rerolls one slot without moving the plan or the other slots", () => {
    const seed = "k7m2qx9a";
    const challenge = generate(input(seed));
    const others = (slot: number) =>
      challenge.directions.filter((d, i): d is Direction => i !== slot && d !== null);
    const redraw = (slot: number, rerollCount: number) =>
      drawDirection({
        seed,
        plan: challenge.plan,
        slot,
        rerollCount,
        others: others(slot),
        pairs: "never",
        data: dataV1,
      });
    expect(redraw(0, 0)).toEqual(challenge.directions[0]);
    const rerolled = [1, 2, 3, 4, 5].map((count) => redraw(0, count));
    expect(
      rerolled.some((d) => JSON.stringify(d) !== JSON.stringify(challenge.directions[0])),
    ).toBe(true);
    for (const d of rerolled) expect(d?.type).toBe(challenge.plan[0]);
    expect(drawPlan(seed, dataV1.difficulties.medium, dataV1.kindsNeverTogether)).toEqual(
      challenge.plan,
    );
    expect(redraw(2, 0)).toEqual(challenge.directions[2]);
  });

  it("draws from the lists of the data it is given", () => {
    const data = {
      ...dataV1,
      styleTags: ["Gothic"] as const,
      tagWeights: { ...dataV1.tagWeights },
    };
    let styles = 0;
    for (const seed of samples.slice(0, 50)) {
      for (const d of placedDirections(generate(input(seed), data))) {
        if (d.type !== "style" && d.type !== "styleAvoid") continue;
        expect(d.tag).toBe("Gothic");
        styles++;
      }
    }
    expect(styles).toBeGreaterThan(0);
  });

  it("refuses the burlap modifier and unknown data versions", () => {
    expect(() => generate({ ...input("k7m2qx9a"), modifiers: ["burlap"] })).toThrow(/burlap/i);
    expect(() => generate({ ...input("k7m2qx9a"), dataVersion: 99 })).toThrow(RangeError);
  });

  it("leaves a slot empty when it cannot be filled", () => {
    const stuck: DifficultyShape = {
      directionCount: { min: 3, max: 3 },
      types: [{ type: "colourOnly", weight: 1 }],
      limits: [],
      pairs: "never",
    };
    const challenge = generate(input("k7m2qx9a"), withMedium(stuck));
    expect(challenge.plan).toEqual(["colourOnly", "colourOnly", "colourOnly"]);
    expect(challenge.directions[0]?.type).toBe("colourOnly");
    expect(challenge.directions[1]).toBeNull();
    expect(challenge.directions[2]).toBeNull();
    expect(challenge.history).toEqual([]);
    expect(generate(input("k7m2qx9a"), withMedium(stuck))).toEqual(challenge);
    expect(MAX_TRIES).toBe(25);
  });

  it("draws list sizes within range", () => {
    const only: DifficultyShape = {
      directionCount: { min: 2, max: 2 },
      types: [
        { type: "colourOnly", weight: 1 },
        { type: "fabricsOnly", weight: 1 },
      ],
      limits: [],
      pairs: "never",
    };
    const sizes = new Set<number>();
    for (const seed of samples.slice(0, 100)) {
      for (const d of placedDirections(generate(input(seed), withMedium(only)))) {
        const size =
          d.type === "colourOnly"
            ? d.colours.length
            : d.type === "fabricsOnly"
              ? d.fabrics.length
              : 0;
        expect(size).toBeGreaterThanOrEqual(ONLY_LIST_SIZE.min);
        expect(size).toBeLessThanOrEqual(ONLY_LIST_SIZE.max);
        sizes.add(size);
      }
    }
    expect(sizes.size).toBe(3);
  });
});
