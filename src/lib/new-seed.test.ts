import { afterEach, describe, expect, it, vi } from "vitest";

import { SEED_ALPHABET, SEED_LENGTH, isValidSeed } from "@/domain/seed";

import { newSeed } from "./new-seed";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("newSeed", () => {
  it("always gives a valid, unique seed", () => {
    const seeds = Array.from({ length: 1000 }, () => newSeed());
    for (const seed of seeds) expect(isValidSeed(seed)).toBe(true);
    expect(new Set(seeds).size).toBe(1000);
  });

  it("uses every alphabet character over many seeds", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) for (const char of newSeed()) seen.add(char);
    expect([...seen].sort().join("")).toBe([...SEED_ALPHABET].sort().join(""));
  });

  it("rejects random bytes that would bias the choice", () => {
    const bytes = [255, 250, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let cursor = 0;
    vi.spyOn(crypto, "getRandomValues").mockImplementation(((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) array[i] = bytes[cursor++ % bytes.length];
      return array;
    }) as typeof crypto.getRandomValues);
    const seed = newSeed();
    expect(seed).toHaveLength(SEED_LENGTH);
    expect(seed).toBe([0, 1, 2, 3, 4, 5, 6, 7].map((n) => SEED_ALPHABET[n % 31]).join(""));
  });
});
