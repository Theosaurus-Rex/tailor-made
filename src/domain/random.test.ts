import { describe, expect, it } from "vitest";

import { createRng, subSeed, weightedPick } from "./random";

function draw(seed: string, count: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng.next());
}

describe("createRng", () => {
  it("gives the pinned sequence for a generated-style seed", () => {
    expect(draw("abc23456", 5)).toEqual([
      0.08754691435024142, 0.7160968182142824, 0.014535586582496762, 0.19394707446917892,
      0.5051622411701828,
    ]);
  });

  it("gives the pinned sequence for a daily seed", () => {
    expect(draw("2026-10-16", 5)).toEqual([
      0.5267649225424975, 0.9368185517378151, 0.5307445162907243, 0.4416662307921797,
      0.03621750371530652,
    ]);
  });

  it("gives the pinned sequence for the empty seed", () => {
    expect(draw("", 5)).toEqual([
      0.7160958384629339, 0.4519506278447807, 0.2912008506245911, 0.45941809425130486,
      0.005715326406061649,
    ]);
  });

  it("gives the pinned int results", () => {
    const rng = createRng("abc23456");
    expect(Array.from({ length: 6 }, () => rng.int(1, 6))).toEqual([1, 5, 1, 2, 4, 5]);
  });

  it("repeats for the same seed", () => {
    expect(draw("abc23456", 50)).toEqual(draw("abc23456", 50));
  });

  it("differs for different seeds", () => {
    expect(draw("abc23456", 5)).not.toEqual(draw("abc23457", 5));
    expect(draw("abc23456", 5)).not.toEqual(draw("2026-10-16", 5));
  });

  it("keeps next in [0, 1)", () => {
    for (const value of draw("range", 5000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("int", () => {
  it("stays in range and hits both ends", () => {
    const rng = createRng("ends");
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const value = rng.int(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6, 7]);
  });

  it("returns the only value when min equals max", () => {
    expect(createRng("x").int(4, 4)).toBe(4);
  });

  it("handles negative ranges", () => {
    const rng = createRng("neg");
    for (let i = 0; i < 200; i++) {
      const value = rng.int(-3, -1);
      expect(value).toBeGreaterThanOrEqual(-3);
      expect(value).toBeLessThanOrEqual(-1);
    }
  });

  it("throws when min is above max", () => {
    expect(() => createRng("x").int(5, 4)).toThrow();
  });

  it("throws on non-integers", () => {
    expect(() => createRng("x").int(1.5, 4)).toThrow();
    expect(() => createRng("x").int(1, 4.5)).toThrow();
    expect(() => createRng("x").int(Number.NaN, 4)).toThrow();
  });
});

describe("pick", () => {
  it("returns every item eventually and only items", () => {
    const rng = createRng("pick");
    const items = ["a", "b", "c"];
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(rng.pick(items));
    expect([...seen].sort()).toEqual(items);
  });

  it("throws on an empty list", () => {
    expect(() => createRng("x").pick([])).toThrow();
  });
});

describe("weightedPick", () => {
  it("lands near each weight", () => {
    const rng = createRng("weights");
    const entries = [
      { value: "a", weight: 1 },
      { value: "b", weight: 3 },
      { value: "c", weight: 6 },
    ];
    const draws = 20000;
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < draws; i++) counts[weightedPick(rng, entries)]++;
    expect(Math.abs(counts.a / draws - 0.1)).toBeLessThan(0.02);
    expect(Math.abs(counts.b / draws - 0.3)).toBeLessThan(0.02);
    expect(Math.abs(counts.c / draws - 0.6)).toBeLessThan(0.02);
  });

  it("never picks a zero-weight entry", () => {
    const rng = createRng("zero");
    const entries = [
      { value: "never", weight: 0 },
      { value: "yes", weight: 1 },
      { value: "never2", weight: 0 },
    ];
    for (let i = 0; i < 2000; i++) {
      expect(weightedPick(rng, entries)).toBe("yes");
    }
  });

  it("throws on bad weights", () => {
    const rng = createRng("x");
    expect(() => weightedPick(rng, [])).toThrow();
    expect(() => weightedPick(rng, [{ value: 1, weight: 0 }])).toThrow();
    expect(() =>
      weightedPick(rng, [
        { value: 1, weight: -1 },
        { value: 2, weight: 2 },
      ]),
    ).toThrow();
    expect(() => weightedPick(rng, [{ value: 1, weight: Number.NaN }])).toThrow();
    expect(() => weightedPick(rng, [{ value: 1, weight: Infinity }])).toThrow();
  });
});

describe("subSeed", () => {
  it("is stable", () => {
    expect(subSeed("abc23456", 3, 0)).toBe("cjim271tr5y9y1xw2ysvg52ngm");
  });

  it("repeats for the same parts", () => {
    const seed = subSeed("abc23456", 3, 0);
    expect(draw(seed, 5)).toEqual(draw(subSeed("abc23456", 3, 0), 5));
  });

  it("differs by rule index", () => {
    expect(draw(subSeed("a", 0, 0), 5)).not.toEqual(draw(subSeed("a", 1, 0), 5));
  });

  it("differs by reroll count", () => {
    expect(draw(subSeed("a", 2, 0), 5)).not.toEqual(draw(subSeed("a", 2, 1), 5));
  });

  it("differs from the parent seed", () => {
    expect(draw(subSeed("a", 0, 0), 5)).not.toEqual(draw("a", 5));
  });

  it("keeps part boundaries", () => {
    expect(subSeed("a", 1, 2)).not.toBe(subSeed("a", 12));
    expect(draw(subSeed("a", 1, 2), 5)).not.toEqual(draw(subSeed("a", 12), 5));
  });
});
