// Only 32-bit integer maths here, so every engine gives the same numbers.
// Changing anything in this file breaks every share link for data version 1.

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

type Words = readonly [number, number, number, number];

function cyrb128(text: string): Words {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ code, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ code, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ code, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ code, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function sfc32([a0, b0, c0, d0]: Words): () => number {
  let a = a0;
  let b = b0;
  let c = c0;
  let d = d0;
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

const WARM_UP_DRAWS = 15;

export function createRng(seed: string): Rng {
  const nextFloat = sfc32(cyrb128(seed));
  // sfc32's first outputs still track the seed, so similar seeds like dates start alike.
  for (let i = 0; i < WARM_UP_DRAWS; i++) nextFloat();
  const rng: Rng = {
    next: nextFloat,
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new RangeError("int needs integer bounds");
      }
      if (min > max) throw new RangeError("int needs min <= max");
      return min + Math.floor(nextFloat() * (max - min + 1));
    },
    pick(items) {
      if (items.length === 0) throw new RangeError("pick needs a non-empty list");
      return items[rng.int(0, items.length - 1)];
    },
  };
  return rng;
}

export function weightedPick<T>(rng: Rng, entries: readonly { value: T; weight: number }[]): T {
  let total = 0;
  for (const { weight } of entries) {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError("weights must be finite and non-negative");
    }
    total += weight;
  }
  if (!(total > 0)) throw new RangeError("at least one weight must be positive");
  let target = rng.next() * total;
  let last: T | undefined;
  for (const { value, weight } of entries) {
    if (weight === 0) continue;
    last = value;
    if (target < weight) return value;
    target -= weight;
  }
  return last as T;
}

export function subSeed(seed: string, ...parts: (string | number)[]): string {
  const words = cyrb128([seed, ...parts].join("\u001f"));
  return words.map((word) => word.toString(36)).join("");
}
