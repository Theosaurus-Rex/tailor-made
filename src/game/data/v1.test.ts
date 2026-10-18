import { describe, expect, it } from "vitest";
import { dataVersions, LATEST_DATA_VERSION } from "./index";
import { accessoryTypes, colours, DATA_VERSION, dataV1, fabricTypes, styleTags } from "./v1";

const unique = (list: readonly string[]) => new Set(list).size === list.length;

describe("lists", () => {
  it.each([
    ["style tags", styleTags, 22],
    ["fabric types", fabricTypes, 8],
    ["colours", colours, 11],
    ["accessory types", accessoryTypes, 12],
  ])("%s has the right count and no duplicates", (_name, list, count) => {
    expect(list).toHaveLength(count);
    expect(unique(list)).toBe(true);
  });
});

describe("leanings", () => {
  it("every fabric leans towards something, Burlap only Uncomfortable", () => {
    for (const type of fabricTypes) {
      const { leansTowards } = dataV1.fabrics[type];
      expect(leansTowards.length).toBeGreaterThan(0);
      expect(unique(leansTowards)).toBe(true);
    }
    expect(dataV1.fabrics.Burlap.leansTowards).toEqual(["Uncomfortable"]);
  });

  it("every accessory leans towards something, with no duplicates", () => {
    for (const type of accessoryTypes) {
      const { leansTowards } = dataV1.accessories[type];
      expect(leansTowards.length).toBeGreaterThan(0);
      expect(unique(leansTowards)).toBe(true);
    }
  });

  it("colour leanings have no duplicates", () => {
    for (const leans of Object.values(dataV1.colourLeanings)) {
      expect(unique(leans)).toBe(true);
    }
  });

  it("only Burlap is modifier only", () => {
    const modifierOnly = fabricTypes.filter((type) => "modifierOnly" in dataV1.fabrics[type]);
    expect(modifierOnly).toEqual(["Burlap"]);
  });
});

describe("tag weights", () => {
  const weights = styleTags.map((tag) => dataV1.tagWeights[tag]);

  it("are whole numbers from 1 to 5", () => {
    for (const weight of weights) {
      expect(Number.isInteger(weight)).toBe(true);
      expect(weight).toBeGreaterThanOrEqual(1);
      expect(weight).toBeLessThanOrEqual(5);
    }
  });

  it("give Uncomfortable, Casual and Shimmering the lowest weight, and no other tag", () => {
    const lowest = Math.min(...weights);
    const atLowest = styleTags.filter((tag) => dataV1.tagWeights[tag] === lowest);
    expect([...atLowest].sort()).toEqual(["Casual", "Shimmering", "Uncomfortable"].sort());
  });
});

describe("accessory units", () => {
  it("counts Lace Trim, Piping and Trim by centimetre", () => {
    for (const type of ["Lace Trim", "Piping", "Trim"] as const) {
      expect(dataV1.accessories[type].unit).toBe("cm");
    }
  });

  it("has per-piece types for counts", () => {
    const pieces = accessoryTypes.filter((type) => dataV1.accessories[type].unit === "piece");
    expect(pieces.length).toBeGreaterThan(0);
  });
});

describe("versions", () => {
  it("looks up the latest version as dataV1", () => {
    expect(dataVersions[LATEST_DATA_VERSION]).toBe(dataV1);
  });

  it("DATA_VERSION matches its key", () => {
    expect(dataVersions[DATA_VERSION]).toBe(dataV1);
    expect(dataV1.version).toBe(DATA_VERSION);
  });
});

describe("themes", () => {
  const { themes } = dataV1;
  const within = (list: readonly unknown[], min: number, max: number) => {
    expect(list.length).toBeGreaterThanOrEqual(min);
    expect(list.length).toBeLessThanOrEqual(max);
  };

  it("have unique ids", () => {
    expect(unique(themes.map((theme) => theme.id))).toBe(true);
  });

  it("keep each list to its size", () => {
    for (const theme of themes) {
      within(theme.favouredTags, 2, 4);
      within(theme.favouredColours, 1, 3);
      within(theme.occasions, 2, 3);
      within(theme.adjectives, 2, 4);
      within(theme.worries, 2, 3);
      within(theme.templates, 3, 4);
    }
  });

  it("cover most style tags, including a rarely asked one", () => {
    const covered = new Set<string>(themes.flatMap((theme) => theme.favouredTags));
    expect(covered.size).toBeGreaterThanOrEqual(16);
    expect(["Uncomfortable", "Casual", "Shimmering"].some((tag) => covered.has(tag))).toBe(true);
  });
});

describe("opposing pairs", () => {
  it("lists the five hand-written pairs", () => {
    expect(dataV1.opposingPairs).toEqual([
      ["Cute", "Gothic"],
      ["Simple", "Elaborate"],
      ["Casual", "Formal"],
      ["Warm", "Cool"],
      ["Daywear", "Eveningwear"],
    ]);
  });

  it("uses no tag twice", () => {
    expect(unique(dataV1.opposingPairs.flat())).toBe(true);
  });
});
