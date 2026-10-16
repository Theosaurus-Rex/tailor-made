import { describe, expect, it } from "vitest";

import { randomFromSeed, deriveSeed, weightedPick } from "./random";

function draw(seed: string, count: number): number[] {
  const random = randomFromSeed(seed);
  return Array.from({ length: count }, () => random.fraction());
}

describe("randomFromSeed", () => {
  it("gives the pinned sequence for a generated-style seed", () => {
    expect(draw("abc23456", 5)).toEqual([
      0.7295095690060407, 0.9651020397432148, 0.7482347623445094, 0.8338864124380052,
      0.41499249497428536,
    ]);
  });

  it("gives the pinned sequence for a daily seed", () => {
    expect(draw("2026-10-16", 5)).toEqual([
      0.9880204573273659, 0.7215682649984956, 0.6125541301444173, 0.6507308951113373,
      0.8994907066226006,
    ]);
  });

  it("gives the pinned sequence for the empty seed", () => {
    expect(draw("", 5)).toEqual([
      0.8911180282011628, 0.15628127637319267, 0.1256390509661287, 0.14473771443590522,
      0.9103766717016697,
    ]);
  });

  it("gives the pinned between results", () => {
    const random = randomFromSeed("abc23456");
    expect(Array.from({ length: 6 }, () => random.between(1, 6))).toEqual([5, 6, 5, 6, 3, 1]);
  });

  it("repeats for the same seed", () => {
    expect(draw("abc23456", 50)).toEqual(draw("abc23456", 50));
  });

  it("differs for different seeds", () => {
    expect(draw("abc23456", 5)).not.toEqual(draw("abc23457", 5));
    expect(draw("abc23456", 5)).not.toEqual(draw("2026-10-16", 5));
  });

  it("keeps fraction in [0, 1)", () => {
    for (const value of draw("range", 5000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("between", () => {
  it("stays in range and hits both ends", () => {
    const random = randomFromSeed("ends");
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const value = random.between(3, 7);
      expect(value).toBeGreaterThanOrEqual(3);
      expect(value).toBeLessThanOrEqual(7);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6, 7]);
  });

  it("returns the only value when min equals max", () => {
    expect(randomFromSeed("x").between(4, 4)).toBe(4);
  });

  it("handles negative ranges", () => {
    const random = randomFromSeed("neg");
    for (let i = 0; i < 200; i++) {
      const value = random.between(-3, -1);
      expect(value).toBeGreaterThanOrEqual(-3);
      expect(value).toBeLessThanOrEqual(-1);
    }
  });

  it("throws when min is above max", () => {
    expect(() => randomFromSeed("x").between(5, 4)).toThrow();
  });

  it("throws on non-integers", () => {
    expect(() => randomFromSeed("x").between(1.5, 4)).toThrow();
    expect(() => randomFromSeed("x").between(1, 4.5)).toThrow();
    expect(() => randomFromSeed("x").between(Number.NaN, 4)).toThrow();
  });
});

describe("pick", () => {
  it("returns every item eventually and only items", () => {
    const random = randomFromSeed("pick");
    const items = ["a", "b", "c"];
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(random.pick(items));
    expect([...seen].sort()).toEqual(items);
  });

  it("throws on an empty list", () => {
    expect(() => randomFromSeed("x").pick([])).toThrow();
  });
});

describe("weightedPick", () => {
  it("lands near each weight", () => {
    const random = randomFromSeed("weights");
    const entries = [
      { value: "a", weight: 1 },
      { value: "b", weight: 3 },
      { value: "c", weight: 6 },
    ];
    const draws = 20000;
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < draws; i++) counts[weightedPick(random, entries)]++;
    expect(Math.abs(counts.a / draws - 0.1)).toBeLessThan(0.02);
    expect(Math.abs(counts.b / draws - 0.3)).toBeLessThan(0.02);
    expect(Math.abs(counts.c / draws - 0.6)).toBeLessThan(0.02);
  });

  it("never picks a zero-weight entry", () => {
    const random = randomFromSeed("zero");
    const entries = [
      { value: "never", weight: 0 },
      { value: "yes", weight: 1 },
      { value: "never2", weight: 0 },
    ];
    for (let i = 0; i < 2000; i++) {
      expect(weightedPick(random, entries)).toBe("yes");
    }
  });

  it("throws on bad weights", () => {
    const random = randomFromSeed("x");
    expect(() => weightedPick(random, [])).toThrow();
    expect(() => weightedPick(random, [{ value: 1, weight: 0 }])).toThrow();
    expect(() =>
      weightedPick(random, [
        { value: 1, weight: -1 },
        { value: 2, weight: 2 },
      ]),
    ).toThrow();
    expect(() => weightedPick(random, [{ value: 1, weight: Number.NaN }])).toThrow();
    expect(() => weightedPick(random, [{ value: 1, weight: Infinity }])).toThrow();
  });
});

describe("deriveSeed", () => {
  it("is stable", () => {
    expect(deriveSeed("abc23456", 3, 0)).toBe("cjim271tr5y9y1xw2ysvg52ngm");
  });

  it("repeats for the same parts", () => {
    const seed = deriveSeed("abc23456", 3, 0);
    expect(draw(seed, 5)).toEqual(draw(deriveSeed("abc23456", 3, 0), 5));
  });

  it("differs by rule index", () => {
    expect(draw(deriveSeed("a", 0, 0), 5)).not.toEqual(draw(deriveSeed("a", 1, 0), 5));
  });

  it("differs by reroll count", () => {
    expect(draw(deriveSeed("a", 2, 0), 5)).not.toEqual(draw(deriveSeed("a", 2, 1), 5));
  });

  it("differs from the parent seed", () => {
    expect(draw(deriveSeed("a", 0, 0), 5)).not.toEqual(draw("a", 5));
  });

  it("keeps part boundaries", () => {
    expect(deriveSeed("a", 1, 2)).not.toBe(deriveSeed("a", 12));
    expect(draw(deriveSeed("a", 1, 2), 5)).not.toEqual(draw(deriveSeed("a", 12), 5));
  });
});
