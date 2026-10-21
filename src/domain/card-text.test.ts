import { describe, expect, it } from "vitest";

import { cardFor, type Card } from "./card";
import { challengeAsText } from "./card-text";
import { generate } from "./generate";

const LINK = "https://example.test/c?v=1&s=k7m2qx9a&d=easy";

const challengeOf = (difficulty: "easy" | "chaos", burlap = false) =>
  generate({
    seed: "k7m2qx9a",
    difficulty,
    modifiers: burlap ? ["burlap"] : [],
    dataVersion: 1,
  });

const handMadeCard = {
  client: { name: "Freya Lindqvist", initials: "FL", human: true },
  occasion: "mayor's charity ball",
  brief: "Freya has been counting the days to the mayor's charity ball.",
  rows: ["Burlap only", "No trim", "Eclectic", "At least 7 brooches"].map((shortLine, slot) => ({
    slot,
    shortLine,
    isModifier: slot === 0,
  })),
} as Card;

describe("challengeAsText", () => {
  it("writes the exact text for a card", () => {
    expect(challengeAsText(handMadeCard, LINK)).toBe(
      [
        "Freya Lindqvist · Mayor's charity ball",
        `"Freya has been counting the days to the mayor's charity ball."`,
        "",
        "- Burlap only",
        "- No trim",
        "- Eclectic",
        "- At least 7 brooches",
        "",
        LINK,
      ].join("\n"),
    );
  });

  for (const [label, difficulty, burlap] of [
    ["a short Easy card", "easy", false],
    ["a long Chaos card", "chaos", false],
    ["a Burlap card", "easy", true],
  ] as const) {
    it(`lays out ${label} as name, brief, list and link`, () => {
      const card = cardFor(challengeOf(difficulty, burlap));
      const lines = challengeAsText(card, LINK).split("\n");
      const listLines = lines.slice(3, 3 + card.rows.length);
      expect(lines[0]).toMatch(new RegExp(`^${card.client.name} · [A-Z]`));
      expect(lines[1]).toBe(`"${card.brief}"`);
      expect(lines[2]).toBe("");
      expect(listLines).toEqual(card.rows.map((row) => `- ${row.shortLine}`));
      expect(lines.slice(3 + card.rows.length)).toEqual(["", LINK]);
      if (burlap) expect(listLines[0]).toBe("- Burlap only");
      if (difficulty === "chaos") expect(card.rows.length).toBeGreaterThanOrEqual(5);
    });
  }
});
