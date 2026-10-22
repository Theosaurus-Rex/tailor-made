import { describe, expect, it } from "vitest";
import { accessoryTypes, fabricTypes, fabrics } from "@/game/data/v1";
import type { GeneralFabric } from "./direction";
import { joinWithAnd, joinWithOr, shortLine } from "./short-line";

const generalFabrics = fabricTypes.filter(
  (fabric): fabric is GeneralFabric => !("modifierOnly" in fabrics[fabric]),
);

const cleanLine = (line: string) => line !== "" && !/ {2}|^ | $/.test(line);

describe("shortLine", () => {
  it("style is the tag as is", () => {
    expect(shortLine({ type: "style", tag: "Gothic" })).toBe("Gothic");
    expect(shortLine({ type: "style", tag: "Risqué" })).toBe("Risqué");
  });

  it("styleAvoid is Not plus the lowercase tag", () => {
    expect(shortLine({ type: "styleAvoid", tags: ["Cute"] })).toBe("Not cute");
    expect(shortLine({ type: "styleAvoid", tags: ["Risqué"] })).toBe("Not risqué");
  });

  it("styleAvoid on Flowers reads No florals", () => {
    expect(shortLine({ type: "styleAvoid", tags: ["Flowers"] })).toBe("No florals");
    expect(shortLine({ type: "styleAvoid", tags: ["Patterned"] })).toBe("Not patterned");
  });

  it("fabric is the type as is", () => {
    expect(shortLine({ type: "fabric", fabrics: ["Velvet"] })).toBe("Velvet");
    expect(shortLine({ type: "fabric", fabrics: ["Sequin"] })).toBe("Sequin");
  });

  it("fabricAvoid is No plus the noun", () => {
    expect(shortLine({ type: "fabricAvoid", fabrics: ["Sequin"] })).toBe("No sequins");
    expect(shortLine({ type: "fabricAvoid", fabrics: ["Velvet"] })).toBe("No velvet");
  });

  it("burlapOnly is Burlap only", () => {
    expect(shortLine({ type: "burlapOnly" })).toBe("Burlap only");
  });

  it("fabricsOnly lists the fabric nouns", () => {
    expect(shortLine({ type: "fabricsOnly", fabrics: ["Silk"] })).toBe("Only silk");
    expect(shortLine({ type: "fabricsOnly", fabrics: ["Sequin", "Silk"] })).toBe(
      "Only sequins and silk",
    );
    expect(shortLine({ type: "fabricsOnly", fabrics: ["Linen", "Cotton", "Wool"] })).toBe(
      "Only linen, cotton and wool",
    );
  });

  it("fabricsMin is At least a count of fabrics", () => {
    expect(shortLine({ type: "fabricsMin", count: 3 })).toBe("At least 3 fabrics");
  });

  it("colour is the colour", () => {
    expect(shortLine({ type: "colour", colours: ["Red"] })).toBe("Red");
  });

  it("colourAvoid is No plus the lowercase colour", () => {
    expect(shortLine({ type: "colourAvoid", colours: ["Black"] })).toBe("No black");
  });

  it("colourOnly is Only plus the lowercase colours", () => {
    expect(shortLine({ type: "colourOnly", colours: ["White"] })).toBe("Only white");
    expect(shortLine({ type: "colourOnly", colours: ["White", "Grey"] })).toBe(
      "Only white and grey",
    );
    expect(shortLine({ type: "colourOnly", colours: ["Orange", "Yellow", "Green"] })).toBe(
      "Only orange, yellow and green",
    );
  });

  it("accessory is the capitalised plural", () => {
    expect(shortLine({ type: "accessory", accessories: ["Bow"] })).toBe("Bows");
    expect(shortLine({ type: "accessory", accessories: ["Brooch"] })).toBe("Brooches");
    expect(shortLine({ type: "accessory", accessories: ["Lace Trim"] })).toBe("Lace trim");
    expect(shortLine({ type: "accessory", accessories: ["Appliqué"] })).toBe("Appliqués");
  });

  it("accessoryAvoid is No plus the plural", () => {
    expect(shortLine({ type: "accessoryAvoid", accessories: ["Feather"] })).toBe("No feathers");
    expect(shortLine({ type: "accessoryAvoid", accessories: ["Piping"] })).toBe("No piping");
  });

  it("accessoryMin is At least a count and the noun", () => {
    expect(shortLine({ type: "accessoryMin", accessory: "Bow", count: 5 })).toBe("At least 5 bows");
    expect(shortLine({ type: "accessoryMin", accessory: "Brooch", count: 2 })).toBe(
      "At least 2 brooches",
    );
  });

  it("accessoryExact is Exactly a count and the noun", () => {
    expect(shortLine({ type: "accessoryExact", accessory: "Brooch", count: 3 })).toBe(
      "Exactly 3 brooches",
    );
  });

  it("uses the singular when the count is 1", () => {
    expect(shortLine({ type: "accessoryMin", accessory: "Bow", count: 1 })).toBe("At least 1 bow");
    expect(shortLine({ type: "accessoryExact", accessory: "Brooch", count: 1 })).toBe(
      "Exactly 1 brooch",
    );
  });

  it("coloursMin is At least a count of colours", () => {
    expect(shortLine({ type: "coloursMin", count: 3 })).toBe("At least 3 colours");
  });

  it("renders every fabric cleanly", () => {
    for (const fabric of generalFabrics) {
      expect(cleanLine(shortLine({ type: "fabric", fabrics: [fabric] }))).toBe(true);
      expect(cleanLine(shortLine({ type: "fabricAvoid", fabrics: [fabric] }))).toBe(true);
    }
  });

  it("renders every accessory cleanly", () => {
    for (const accessory of accessoryTypes) {
      expect(cleanLine(shortLine({ type: "accessory", accessories: [accessory] }))).toBe(true);
      expect(cleanLine(shortLine({ type: "accessoryAvoid", accessories: [accessory] }))).toBe(true);
    }
  });
});

describe("shortLine for directions that hold two items", () => {
  it("joins avoided items with or", () => {
    expect(shortLine({ type: "fabricAvoid", fabrics: ["Cotton", "Velvet"] })).toBe(
      "No cotton or velvet",
    );
    expect(shortLine({ type: "colourAvoid", colours: ["Red", "Blue"] })).toBe("No red or blue");
    expect(shortLine({ type: "accessoryAvoid", accessories: ["Bow", "Feather"] })).toBe(
      "No bows or feathers",
    );
    expect(shortLine({ type: "styleAvoid", tags: ["Cute", "Playful"] })).toBe(
      "Not cute or playful",
    );
    expect(shortLine({ type: "styleAvoid", tags: ["Cute", "Flowers"] })).toBe("Not cute or floral");
    expect(shortLine({ type: "styleAvoid", tags: ["Daywear", "Playful"] })).toBe(
      "Not daywear or playful",
    );
  });

  it("joins asked items with and", () => {
    expect(shortLine({ type: "fabric", fabrics: ["Cotton", "Linen"] })).toBe("Cotton and linen");
    expect(shortLine({ type: "colour", colours: ["Red", "Blue"] })).toBe("Red and blue");
    expect(shortLine({ type: "accessory", accessories: ["Bow", "Feather"] })).toBe(
      "Bows and feathers",
    );
    expect(shortLine({ type: "accessory", accessories: ["Lace Trim", "Bow"] })).toBe(
      "Lace trim and bows",
    );
  });
});

describe("joinWithAnd", () => {
  it("returns one item as is", () => {
    expect(joinWithAnd(["a"])).toBe("a");
  });

  it("joins two items with and", () => {
    expect(joinWithAnd(["a", "b"])).toBe("a and b");
  });

  it("joins three or more with commas and a final and", () => {
    expect(joinWithAnd(["a", "b", "c"])).toBe("a, b and c");
    expect(joinWithAnd(["a", "b", "c", "d"])).toBe("a, b, c and d");
  });
});

describe("joinWithOr", () => {
  it("joins like joinWithAnd, with or and no Oxford comma", () => {
    expect(joinWithOr(["a"])).toBe("a");
    expect(joinWithOr(["a", "b"])).toBe("a or b");
    expect(joinWithOr(["a", "b", "c"])).toBe("a, b or c");
  });
});
