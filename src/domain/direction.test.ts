import { describe, expect, expectTypeOf, it } from "vitest";
import {
  COUNT_RANGE,
  type Direction,
  type DirectionType,
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
  it("has all thirteen types", () => {
    expectTypeOf<DirectionType>().toEqualTypeOf<
      | "style"
      | "styleAvoid"
      | "fabric"
      | "fabricAvoid"
      | "fabricOnly"
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

  it("only allows Burlap for fabricOnly", () => {
    // @ts-expect-error only Burlap is allowed
    const velvet: Direction = { type: "fabricOnly", fabric: "Velvet" };
    expect(velvet.type).toBe("fabricOnly");
  });
});

describe("COUNT_RANGE", () => {
  it("runs from 2 to 8", () => {
    expect(COUNT_RANGE).toEqual({ min: 2, max: 8 });
  });
});
