import { describe, expect, it } from "vitest";
import { accessoryTypes, fabricTypes } from "@/game/data/v1";
import { shortLine } from "./short-line";

const cleanLine = (line: string) => line !== "" && !/ {2}|^ | $/.test(line);

describe("shortLine", () => {
  it("style is the tag as is", () => {
    expect(shortLine({ type: "style", tag: "Gothic" })).toBe("Gothic");
    expect(shortLine({ type: "style", tag: "Risqué" })).toBe("Risqué");
  });

  it("styleAvoid is Not plus the lowercase tag", () => {
    expect(shortLine({ type: "styleAvoid", tag: "Cute" })).toBe("Not cute");
    expect(shortLine({ type: "styleAvoid", tag: "Risqué" })).toBe("Not risqué");
  });

  it("fabric is the type as is", () => {
    expect(shortLine({ type: "fabric", fabric: "Velvet" })).toBe("Velvet");
    expect(shortLine({ type: "fabric", fabric: "Sequin" })).toBe("Sequin");
  });

  it("fabricAvoid is No plus the noun", () => {
    expect(shortLine({ type: "fabricAvoid", fabric: "Sequin" })).toBe("No sequins");
    expect(shortLine({ type: "fabricAvoid", fabric: "Velvet" })).toBe("No velvet");
  });

  it("fabricOnly is Burlap only", () => {
    expect(shortLine({ type: "fabricOnly", fabric: "Burlap" })).toBe("Burlap only");
  });

  it("colour is the colour", () => {
    expect(shortLine({ type: "colour", colour: "Red" })).toBe("Red");
  });

  it("colourAvoid is No plus the lowercase colour", () => {
    expect(shortLine({ type: "colourAvoid", colour: "Black" })).toBe("No black");
  });

  it("colourOnly is Only plus the lowercase colour", () => {
    expect(shortLine({ type: "colourOnly", colour: "White" })).toBe("Only white");
  });

  it("accessory is the capitalised plural", () => {
    expect(shortLine({ type: "accessory", accessory: "Bow" })).toBe("Bows");
    expect(shortLine({ type: "accessory", accessory: "Brooch" })).toBe("Brooches");
    expect(shortLine({ type: "accessory", accessory: "Lace Trim" })).toBe("Lace trim");
    expect(shortLine({ type: "accessory", accessory: "Appliqué" })).toBe("Appliqués");
  });

  it("accessoryAvoid is No plus the plural", () => {
    expect(shortLine({ type: "accessoryAvoid", accessory: "Feather" })).toBe("No feathers");
    expect(shortLine({ type: "accessoryAvoid", accessory: "Piping" })).toBe("No piping");
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
    for (const fabric of fabricTypes) {
      expect(cleanLine(shortLine({ type: "fabric", fabric }))).toBe(true);
      expect(cleanLine(shortLine({ type: "fabricAvoid", fabric }))).toBe(true);
    }
  });

  it("renders every accessory cleanly", () => {
    for (const accessory of accessoryTypes) {
      expect(cleanLine(shortLine({ type: "accessory", accessory }))).toBe(true);
      expect(cleanLine(shortLine({ type: "accessoryAvoid", accessory }))).toBe(true);
    }
  });
});
