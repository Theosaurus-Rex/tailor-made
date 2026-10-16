import { describe, expect, it } from "vitest";

import { SEED_ALPHABET, SEED_LENGTH, isValidSeed } from "./seed";

describe("isValidSeed", () => {
  it("accepts the generated format", () => {
    expect(isValidSeed("abc23456")).toBe(true);
    expect(isValidSeed("zzzzzzzz")).toBe(true);
    expect(isValidSeed("22222222")).toBe(true);
  });

  it("accepts every alphabet character", () => {
    for (const char of SEED_ALPHABET) {
      expect(isValidSeed(char.repeat(SEED_LENGTH))).toBe(true);
    }
  });

  it("keeps the alphabet to 31 unique lowercase characters without lookalikes", () => {
    expect(new Set(SEED_ALPHABET).size).toBe(31);
    expect(SEED_ALPHABET).toMatch(/^[a-z2-9]+$/);
    expect(SEED_ALPHABET).not.toMatch(/[ilo]/);
  });

  it("accepts real dates", () => {
    expect(isValidSeed("2026-10-16")).toBe(true);
    expect(isValidSeed("2026-12-31")).toBe(true);
    expect(isValidSeed("2024-02-29")).toBe(true);
  });

  it("rejects the wrong length", () => {
    expect(isValidSeed("")).toBe(false);
    expect(isValidSeed("abc2345")).toBe(false);
    expect(isValidSeed("abc234567")).toBe(false);
  });

  it("rejects banned characters", () => {
    for (const char of "01ilo") {
      expect(isValidSeed(`abc2345${char}`)).toBe(false);
    }
    expect(isValidSeed("abc-2345")).toBe(false);
    expect(isValidSeed("abc 2345")).toBe(false);
  });

  it("rejects uppercase", () => {
    expect(isValidSeed("ABC23456")).toBe(false);
    expect(isValidSeed("abc2345A")).toBe(false);
  });

  it("rejects dates that are not on the calendar", () => {
    expect(isValidSeed("2026-13-01")).toBe(false);
    expect(isValidSeed("2026-00-10")).toBe(false);
    expect(isValidSeed("2026-10-00")).toBe(false);
    expect(isValidSeed("2026-10-32")).toBe(false);
    expect(isValidSeed("2026-04-31")).toBe(false);
    expect(isValidSeed("2026-02-29")).toBe(false);
    expect(isValidSeed("1900-02-29")).toBe(false);
    expect(isValidSeed("2000-02-29")).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(isValidSeed("2026-1-16")).toBe(false);
    expect(isValidSeed("2026/10/16")).toBe(false);
    expect(isValidSeed("2026-10-16x")).toBe(false);
    expect(isValidSeed("x2026-10-16")).toBe(false);
  });
});
