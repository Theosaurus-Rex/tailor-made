import { describe, expect, expectTypeOf, it } from "vitest";
import {
  COUNT_RANGE,
  FABRICS_MIN_RANGE,
  ONLY_LIST_SIZE,
  type Direction,
  type DirectionType,
  type GeneralFabric,
  type PerPieceAccessory,
} from "./direction";

describe("PerPieceAccessory", () => {
  it("leaves out the per-centimetre accessories", () => {
    expectTypeOf<"Bow">().toMatchTypeOf<PerPieceAccessory>();
    expectTypeOf<"Lace Trim">().not.toMatchTypeOf<PerPieceAccessory>();
    expectTypeOf<"Piping">().not.toMatchTypeOf<PerPieceAccessory>();
    expectTypeOf<"Trim">().not.toMatchTypeOf<PerPieceAccessory>();
  });

  it("rejects count directions on a per-centimetre accessory", () => {
    // @ts-expect-error Piping is measured in centimetres
    const piping: Direction = { type: "accessoryMin", accessory: "Piping", count: 3 };
    expect(piping.type).toBe("accessoryMin");
  });
});

describe("direction types", () => {
  it("has all fifteen types", () => {
    expectTypeOf<DirectionType>().toEqualTypeOf<
      | "style"
      | "styleAvoid"
      | "fabric"
      | "fabricAvoid"
      | "burlapOnly"
      | "fabricsOnly"
      | "fabricsMin"
      | "colour"
      | "colourAvoid"
      | "colourOnly"
      | "accessory"
      | "accessoryAvoid"
      | "accessoryMin"
      | "accessoryExact"
      | "coloursMin"
    >();
  });

  it("rejects Burlap in a fabricsOnly list", () => {
    // @ts-expect-error Burlap is a modifier, not a general fabric
    const burlap: Direction = { type: "fabricsOnly", fabrics: ["Burlap"] };
    expect(burlap.type).toBe("fabricsOnly");
  });

  it("rejects Burlap in a fabric direction", () => {
    // @ts-expect-error Burlap is a modifier, not a general fabric
    const burlap: Direction = { type: "fabric", fabrics: ["Burlap"] };
    expect(burlap.type).toBe("fabric");
  });

  it("rejects Burlap in a fabricAvoid direction", () => {
    // @ts-expect-error Burlap is a modifier, not a general fabric
    const burlap: Direction = { type: "fabricAvoid", fabrics: ["Burlap"] };
    expect(burlap.type).toBe("fabricAvoid");
  });

  it("accepts general fabrics in a fabricsOnly list", () => {
    const only: Direction = { type: "fabricsOnly", fabrics: ["Linen", "Cotton"] };
    expect(only.type).toBe("fabricsOnly");
  });

  it("takes a list of colours for colourOnly", () => {
    const only: Direction = { type: "colourOnly", colours: ["White", "Grey"] };
    expect(only.type).toBe("colourOnly");
  });

  it("gives burlapOnly no fields", () => {
    expectTypeOf<Extract<Direction, { type: "burlapOnly" }>>().toEqualTypeOf<{
      type: "burlapOnly";
    }>();
  });
});

describe("GeneralFabric", () => {
  it("leaves out Burlap", () => {
    expectTypeOf<"Burlap">().not.toMatchTypeOf<GeneralFabric>();
    expectTypeOf<"Silk">().toMatchTypeOf<GeneralFabric>();
  });
});

describe("COUNT_RANGE", () => {
  it("runs from 2 to 8", () => {
    expect(COUNT_RANGE).toEqual({ min: 2, max: 8 });
  });
});

describe("FABRICS_MIN_RANGE", () => {
  it("runs from 2 to 4", () => {
    expect(FABRICS_MIN_RANGE).toEqual({ min: 2, max: 4 });
  });
});

describe("ONLY_LIST_SIZE", () => {
  it("runs from 1 to 3", () => {
    expect(ONLY_LIST_SIZE).toEqual({ min: 1, max: 3 });
  });
});
