// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Theme } from "@/game/briefs/v1/themes";
import { dataV1, type GameData } from "@/game/data/v1";
import { placedDirections } from "./challenge";
import type { Difficulty } from "./difficulty";
import type { Direction } from "./direction";
import { generate } from "./generate";
import { deriveSeed } from "./random";
import { leaningsFor, themeFor } from "./theme";

const gothic: Theme = {
  id: "test-gothic",
  favouredTags: ["Gothic", "Elegant"],
  favouredColours: ["Black"],
  favouredFabrics: ["Velvet"],
  occasions: ["a test"],
  adjectives: ["tested"],
  worries: ["failing"],
  templates: ["{name} tests {occasion}."],
};

const withTheme = (theme: Theme): GameData => ({ ...dataV1, themes: [theme] });
const themed = withTheme(gothic);
const neutral = withTheme({
  ...gothic,
  favouredTags: [],
  favouredColours: [],
  favouredFabrics: [],
});

const SEEDS = 2000;
const seeds = (label: string, count = SEEDS) =>
  Array.from({ length: count }, (_, i) => deriveSeed(label, i));

const dealt = new Map<string, Direction[]>();
const directionsOf = (data: GameData, difficulty: Difficulty) => {
  const key = `${difficulty}:${data === themed}`;
  const cached = dealt.get(key);
  if (cached) return cached;
  const directions = seeds("theme-influence").flatMap((seed) =>
    placedDirections(generate({ seed, difficulty, modifiers: [], dataVersion: 1 }, data)),
  );
  dealt.set(key, directions);
  return directions;
};

function share(directions: Direction[], pick: (direction: Direction) => readonly string[]) {
  const picked = directions.flatMap(pick);
  const favoured = picked.filter((item) => ["Gothic", "Elegant", "Black"].includes(item));
  return favoured.length / picked.length;
}

const styleOf = (type: Direction["type"]) => (direction: Direction) =>
  direction.type !== type
    ? []
    : "tag" in direction
      ? [direction.tag]
      : "tags" in direction
        ? direction.tags
        : [];

const colourOf = (type: Direction["type"]) => (direction: Direction) =>
  direction.type === type && "colours" in direction ? direction.colours : [];

describe("themeFor", () => {
  it("reaches every theme, each close to an even share", () => {
    const picks = seeds("theme-share", 5000).map((seed) => themeFor(seed, dataV1).id);
    for (const { id } of dataV1.themes) {
      const points = (picks.filter((pick) => pick === id).length / picks.length) * 100;
      expect(Math.abs(points - 100 / dataV1.themes.length), id).toBeLessThanOrEqual(3);
    }
  });

  it("is the theme recorded on the challenge", () => {
    for (const seed of seeds("theme-recorded", 50)) {
      const challenge = generate({ seed, difficulty: "easy", modifiers: [], dataVersion: 1 });
      expect(challenge.themeId).toBe(themeFor(seed, dataV1).id);
    }
  });
});

describe("leaningsFor", () => {
  const weights = leaningsFor(themed, gothic);

  it("multiplies a favoured tag and leaves the rest", () => {
    expect(weights.tag("Gothic", false)).toBe(dataV1.tagWeights.Gothic * dataV1.themeBoosts.tag);
    expect(weights.tag("Cute", false)).toBe(dataV1.tagWeights.Cute);
  });

  it("adds to a fabric or colour that is listed or leans towards a favoured tag", () => {
    const plus = 1 + dataV1.themeBoosts.item;
    expect(weights.fabric("Velvet", false)).toBe(plus);
    expect(weights.fabric("Lace", false)).toBe(plus);
    expect(weights.fabric("Cotton", false)).toBe(1);
    expect(weights.colour("Black", false)).toBe(plus);
    expect(weights.colour("Blue", false)).toBe(1);
    expect(weights.accessory("Tassel", false)).toBe(plus);
    expect(weights.accessory("Bell", false)).toBe(1);
  });

  it("makes favoured items rare in avoids but never impossible", () => {
    const low = dataV1.themeBoosts.avoid;
    expect(weights.tag("Gothic", true)).toBe(low);
    expect(weights.fabric("Velvet", true)).toBe(low);
    expect(weights.colour("Black", true)).toBe(low);
    expect(weights.accessory("Tassel", true)).toBe(low);
    expect(low).toBeGreaterThan(0);
    expect(weights.tag("Cute", true)).toBe(dataV1.tagWeights.Cute);
  });

  it("is the plain data weights with no theme", () => {
    const plain = leaningsFor(dataV1, undefined);
    expect(plain.tag("Gothic", false)).toBe(dataV1.tagWeights.Gothic);
    expect(plain.fabric("Velvet", true)).toBe(1);
    expect(plain.colour("Black", false)).toBe(1);
  });
});

describe("what a theme does to the directions", () => {
  it("makes favoured tags far more common in style directions", () => {
    const withLean = share(directionsOf(themed, "easy"), styleOf("style"));
    const without = share(directionsOf(neutral, "easy"), styleOf("style"));
    expect(withLean).toBeGreaterThan(without * 2);
  });

  it("makes a favoured colour far more common in colour directions", () => {
    const withLean = share(directionsOf(themed, "easy"), colourOf("colour"));
    const without = share(directionsOf(neutral, "easy"), colourOf("colour"));
    expect(withLean).toBeGreaterThan(without * 2);
  });

  it("makes favoured tags far rarer in style avoids", () => {
    const withLean = share(directionsOf(themed, "medium"), styleOf("styleAvoid"));
    const without = share(directionsOf(neutral, "medium"), styleOf("styleAvoid"));
    expect(withLean).toBeLessThan(without / 2);
  });

  it("makes a favoured colour far rarer in colour avoids", () => {
    const withLean = share(directionsOf(themed, "medium"), colourOf("colourAvoid"));
    const without = share(directionsOf(neutral, "medium"), colourOf("colourAvoid"));
    expect(withLean).toBeLessThan(without / 2);
  });
});

describe("Chaos", () => {
  const chaosOf = (data: GameData) =>
    seeds("chaos-theme", 300).map(
      (seed) =>
        generate({ seed, difficulty: "chaos", modifiers: [], dataVersion: 1 }, data).directions,
    );

  it("deals the same whatever the theme leans towards", () => {
    expect(chaosOf(themed)).toEqual(chaosOf(neutral));
  });

  it("deals the same with Burlap only", () => {
    const burlapOf = (data: GameData) =>
      seeds("chaos-burlap", 300).map(
        (seed) =>
          generate({ seed, difficulty: "chaos", modifiers: ["burlap"], dataVersion: 1 }, data)
            .directions,
      );
    expect(burlapOf(themed)).toEqual(burlapOf(neutral));
  });

  it("still records the theme, so the brief can use it", () => {
    const challenge = generate(
      { seed: "k7m2qx9a", difficulty: "chaos", modifiers: [], dataVersion: 1 },
      themed,
    );
    expect(challenge.themeId).toBe("test-gothic");
  });
});

describe("tag coverage", () => {
  it("has at least one theme favouring every style tag", () => {
    for (const tag of dataV1.styleTags) {
      expect(
        dataV1.themes.some((theme) => theme.favouredTags.includes(tag)),
        tag,
      ).toBe(true);
    }
  });
});

describe("template variety", () => {
  const uses = new Map<string, number>();
  for (const theme of dataV1.themes) {
    for (const template of theme.templates) uses.set(template, (uses.get(template) ?? 0) + 1);
  }

  it("shares no template between more than 5 themes", () => {
    for (const [template, count] of uses) expect(count, template).toBeLessThanOrEqual(5);
  });

  it("gives every theme at least 2 templates of its own", () => {
    for (const theme of dataV1.themes) {
      const own = theme.templates.filter((template) => uses.get(template) === 1);
      expect(own.length, theme.id).toBeGreaterThanOrEqual(2);
    }
  });
});
