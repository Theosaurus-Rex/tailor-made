// @vitest-environment node
import { describe, expect, it } from "vitest";
import { dataV1 } from "@/game/data/v1";
import { briefFor, fillBrief } from "./brief";
import { generate } from "./generate";
import { clientFromSeed, type Client } from "./client";
import { deriveSeed } from "./random";

const human: Client = { name: "Freya Lindqvist", human: true, personality: "brisk" };
const hedgehog: Client = {
  name: "Lady Regina Crumpet",
  human: false,
  kind: "very proper hedgehog",
  personality: "grand",
};

const challengeFor = (seed: string, difficulty: "easy" | "chaos" = "easy") =>
  generate({ seed, difficulty, modifiers: [], dataVersion: 1 });

describe("every template, filled with every phrase", () => {
  it("leaves no slot, no double space, and reads as a sentence", () => {
    let filled = 0;
    for (const theme of dataV1.themes) {
      for (const template of theme.templates) {
        for (const occasion of theme.occasions) {
          for (const adjective of theme.adjectives) {
            for (const worry of theme.worries) {
              for (const name of ["Freya", "Lady Regina Crumpet"]) {
                const brief = fillBrief(template, { name, occasion, adjective, worry });
                const where = `${theme.id}: ${brief}`;
                expect(brief, where).not.toMatch(/[{}]/);
                expect(brief, where).not.toMatch(/ {2}/);
                expect(brief, where).toMatch(/^\p{Lu}/u);
                expect(brief, where).toMatch(/[.!?]$/);
                filled++;
              }
            }
          }
        }
      }
    }
    expect(filled).toBeGreaterThan(1000);
  });

  it("uses each slot a template names", () => {
    const brief = fillBrief("{name} wants {adjective} for {occasion}, not {worry}.", {
      name: "Hazel",
      occasion: "the fair",
      adjective: "warm",
      worry: "rain",
    });
    expect(brief).toBe("Hazel wants warm for the fair, not rain.");
  });

  it("capitalises the first letter after filling", () => {
    const brief = fillBrief("For {occasion}, {name} wants {adjective}.", {
      name: "Hazel",
      occasion: "the fair",
      adjective: "warm",
      worry: "rain",
    });
    expect(brief).toBe("For the fair, Hazel wants warm.");
    expect(
      fillBrief("{occasion} is soon.", {
        name: "Hazel",
        occasion: "the fair",
        adjective: "",
        worry: "",
      }),
    ).toBe("The fair is soon.");
  });
});

describe("briefFor", () => {
  it("gives the same brief for the same challenge and client", () => {
    const challenge = challengeFor("k7m2qx9a");
    expect(briefFor(challenge, human)).toBe(briefFor(challenge, human));
  });

  it("uses a human client's first name and a non-human client's full name", () => {
    const challenge = challengeFor("k7m2qx9a");
    const first = briefFor(challenge, human);
    expect(first).toContain("Freya");
    expect(first).not.toContain("Lindqvist");
    expect(briefFor(challenge, hedgehog)).toContain("Lady Regina Crumpet");
  });

  it("draws its phrases from the theme the challenge was dealt", () => {
    for (let i = 0; i < 100; i++) {
      const challenge = challengeFor(deriveSeed("brief-theme", i));
      const theme = dataV1.themes.find(({ id }) => id === challenge.themeId);
      const brief = briefFor(challenge, human);
      expect(theme?.occasions.some((occasion) => brief.toLowerCase().includes(occasion))).toBe(
        true,
      );
    }
  });

  it("varies from seed to seed", () => {
    const briefs = new Set(
      Array.from({ length: 100 }, (_, i) => {
        const seed = deriveSeed("brief-vary", i);
        return briefFor(challengeFor(seed), clientFromSeed(seed));
      }),
    );
    expect(briefs.size).toBeGreaterThan(60);
  });

  it("fills cleanly across thousands of seeds, Chaos included", () => {
    for (let i = 0; i < 3000; i++) {
      const seed = deriveSeed("brief-clean", i);
      const brief = briefFor(
        challengeFor(seed, i % 4 === 0 ? "chaos" : "easy"),
        clientFromSeed(seed),
      );
      expect(brief).not.toMatch(/[{}]/);
      expect(brief).toMatch(/^\p{Lu}.*[.!?]$/u);
    }
  });

  it("refuses a theme the data does not have", () => {
    const challenge = { ...challengeFor("k7m2qx9a"), themeId: "no-such-theme" };
    expect(() => briefFor(challenge, human)).toThrow(/no-such-theme/);
  });
});
