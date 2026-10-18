import { describe, expect, it } from "vitest";
import { dataV1 } from "@/game/data/v1";
import { placedDirections, rerollCountOf, type Challenge } from "./challenge";
import { findConflicts } from "./contradictions";
import { drawDirection, generate, type GenerateInput } from "./generate";
import { deriveSeed, randomFromSeed } from "./random";
import { reroll } from "./reroll";

const samples = Array.from({ length: 300 }, (_, i) => deriveSeed("reroll-sample", i));

const inputFor = (seed: string): GenerateInput => ({
  seed,
  difficulty: "medium",
  modifiers: [],
  dataVersion: 1,
});

const randomSlots = (seed: string, plan: Challenge["plan"], length: number) => {
  const random = randomFromSeed(deriveSeed(seed, "slots"));
  return Array.from({ length }, () => random.between(0, plan.length - 1));
};

const playLive = (start: Challenge, slots: readonly number[]) =>
  slots.reduce((challenge, slot) => reroll(challenge, slot), start);

describe("reroll", () => {
  it("changes only the chosen slot", () => {
    let changed = 0;
    for (const seed of samples) {
      const before = generate(inputFor(seed));
      const [slot] = randomSlots(seed, before.plan, 1);
      const after = reroll(before, slot);
      before.directions.forEach((direction, i) => {
        if (i !== slot) expect(after.directions[i]).toEqual(direction);
      });
      const redrawn = after.directions[slot];
      if (redrawn) expect(redrawn.type).toBe(before.plan[slot]);
      expect(after.plan).toEqual(before.plan);
      expect(after.history).toEqual([...before.history, slot]);
      if (JSON.stringify(redrawn) !== JSON.stringify(before.directions[slot])) changed++;
    }
    expect(changed).toBeGreaterThan(100);
  });

  it("does not change the challenge it was given", () => {
    const before = generate(inputFor("k7m2qx9a"));
    const copy = structuredClone(before);
    reroll(before, 0);
    expect(before).toEqual(copy);
  });

  it("leaves no conflicts on the card after any run of rerolls", () => {
    samples.forEach((seed, i) => {
      const start = generate(inputFor(seed));
      const end = playLive(start, randomSlots(seed, start.plan, 1 + (i % 6)));
      expect(findConflicts(placedDirections(end), { data: dataV1 })).toEqual([]);
    });
  });

  it("draws a slot rerolled twice from reroll count 2", () => {
    const start = generate(inputFor("k7m2qx9a"));
    const end = playLive(start, [1, 1]);
    expect(rerollCountOf(end, 1)).toBe(2);
    expect(rerollCountOf(end, 0)).toBe(0);
    const others = end.directions.filter((d, i) => i !== 1 && d !== null);
    expect(end.directions[1]).toEqual(
      drawDirection({
        seed: end.seed,
        plan: end.plan,
        slot: 1,
        rerollCount: 2,
        others,
        data: dataV1,
      }),
    );
  });

  it("tries again on an empty slot", () => {
    const start = generate(inputFor("k7m2qx9a"));
    const empty: Challenge = {
      ...start,
      directions: start.directions.map((d, i) => (i === 2 ? null : d)),
    };
    const after = reroll(empty, 2);
    expect(after.directions[2]).not.toBeNull();
    expect(after.history).toEqual([2]);
  });

  it("empties the slot and records the reroll when nothing fits", () => {
    const blocked: Challenge = {
      ...generate(inputFor("k7m2qx9a")),
      plan: ["colourOnly", "colourOnly"],
      directions: [
        { type: "colourOnly", colours: ["Red"] },
        { type: "colourOnly", colours: ["Blue"] },
      ],
    };
    const after = reroll(blocked, 1);
    expect(after.directions[1]).toBeNull();
    expect(after.directions[0]).toEqual(blocked.directions[0]);
    expect(after.history).toEqual([1]);
  });

  it("throws for a slot outside the plan", () => {
    const start = generate(inputFor("k7m2qx9a"));
    for (const slot of [-1, start.plan.length, 1.5]) {
      expect(() => reroll(start, slot)).toThrow(RangeError);
    }
  });

  it("throws for an unknown data version", () => {
    const start = generate(inputFor("k7m2qx9a"));
    expect(() => reroll({ ...start, dataVersion: 99 }, 0)).toThrow(/data version 99/);
  });

  it("will not reroll burlap only", () => {
    const burlap: Challenge = {
      ...generate(inputFor("k7m2qx9a")),
      plan: ["style"],
      directions: [{ type: "burlapOnly" }],
    };
    expect(() => reroll(burlap, 0)).toThrow(/burlap/i);
  });
});
