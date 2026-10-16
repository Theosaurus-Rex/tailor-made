import { describe, expect, it } from "vitest";
import {
  type Conflict,
  type ConflictOptions,
  conflictsWithAny as conflictsWithAnyIn,
  findConflicts as findConflictsIn,
} from "./contradictions";
import type { Direction } from "./direction";
import { dataV1, type GameData } from "@/game/data/v1";

type Options = Omit<ConflictOptions, "data">;
const findConflicts = (directions: readonly Direction[], options: Options = {}) =>
  findConflictsIn(directions, { data: dataV1, ...options });
const conflictsWithAny = (
  candidate: Direction,
  existing: readonly Direction[],
  options: Options = {},
) => conflictsWithAnyIn(candidate, existing, { data: dataV1, ...options });

type Case = [name: string, directions: Direction[], expected: Conflict];
type NearMiss = [name: string, directions: Direction[]];

const conflict = (index: number, conflictsWith: number, reason: Conflict["reason"]): Conflict => ({
  index,
  conflictsWith,
  reason,
});

function expectConflict(directions: Direction[], expected: Conflict) {
  expect(findConflicts(directions)).toEqual([expected]);
}

function expectAllowed(directions: Direction[]) {
  expect(findConflicts(directions)).toEqual([]);
}

const cute: Direction = { type: "style", tag: "Cute" };
const notCute: Direction = { type: "styleAvoid", tag: "Cute" };
const gothic: Direction = { type: "style", tag: "Gothic" };
const notGothic: Direction = { type: "styleAvoid", tag: "Gothic" };
const silk: Direction = { type: "fabric", fabric: "Silk" };
const burlapOnly: Direction = { type: "fabricOnly", fabric: "Burlap" };
const red: Direction = { type: "colour", colour: "Red" };
const noRed: Direction = { type: "colourAvoid", colour: "Red" };
const noBlue: Direction = { type: "colourAvoid", colour: "Blue" };
const onlyWhite: Direction = { type: "colourOnly", colour: "White" };
const bows: Direction = { type: "accessory", accessory: "Bow" };
const noBows: Direction = { type: "accessoryAvoid", accessory: "Bow" };
const atLeastBows: Direction = { type: "accessoryMin", accessory: "Bow", count: 3 };
const exactlyBrooches: Direction = { type: "accessoryExact", accessory: "Brooch", count: 3 };
const atLeastColours = (count: number): Direction => ({ type: "coloursMin", count });

describe("nothing to compare", () => {
  it("finds no conflicts in an empty list", () => {
    expectAllowed([]);
  });

  it("finds no conflicts in a single direction", () => {
    expectAllowed([cute]);
  });
});

describe("asked for and avoided", () => {
  it.each<Case>([
    ["style then style avoid", [cute, notCute], conflict(1, 0, "askedAndAvoided")],
    ["style avoid then style", [notCute, cute], conflict(1, 0, "askedAndAvoided")],
    ["fabric", [silk, { type: "fabricAvoid", fabric: "Silk" }], conflict(1, 0, "askedAndAvoided")],
    [
      "fabric only and avoid",
      [burlapOnly, { type: "fabricAvoid", fabric: "Burlap" }],
      conflict(1, 0, "askedAndAvoided"),
    ],
    ["colour", [red, noRed], conflict(1, 0, "askedAndAvoided")],
    [
      "colour only and avoid on the same colour",
      [onlyWhite, { type: "colourAvoid", colour: "White" }],
      conflict(1, 0, "askedAndAvoided"),
    ],
    ["accessory", [bows, noBows], conflict(1, 0, "askedAndAvoided")],
    ["accessory minimum", [atLeastBows, noBows], conflict(1, 0, "askedAndAvoided")],
    [
      "accessory exact",
      [exactlyBrooches, { type: "accessoryAvoid", accessory: "Brooch" }],
      conflict(1, 0, "askedAndAvoided"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it.each<NearMiss>([
    ["style and a different style avoid", [cute, notGothic]],
    ["fabric and a different fabric avoid", [silk, { type: "fabricAvoid", fabric: "Wool" }]],
    [
      "fabric only and a different fabric avoid",
      [burlapOnly, { type: "fabricAvoid", fabric: "Silk" }],
    ],
    ["colour and a different colour avoid", [red, noBlue]],
    [
      "accessory and a different accessory avoid",
      [bows, { type: "accessoryAvoid", accessory: "Bell" }],
    ],
    [
      "accessory minimum and a different accessory avoid",
      [atLeastBows, { type: "accessoryAvoid", accessory: "Bell" }],
    ],
    ["accessory exact and a different accessory avoid", [exactlyBrooches, noBows]],
  ])("allows %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("only colour clashes", () => {
  it.each<Case>([
    ["a different colour", [onlyWhite, red], conflict(1, 0, "onlyColourClash")],
    ["a different colour listed first", [red, onlyWhite], conflict(1, 0, "onlyColourClash")],
    ["a different colour avoid", [onlyWhite, noRed], conflict(1, 0, "onlyColourClash")],
    ["a colours minimum", [onlyWhite, atLeastColours(3)], conflict(1, 0, "onlyColourClash")],
  ])("rejects an only colour with %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it.each<NearMiss>([
    ["the same colour", [onlyWhite, { type: "colour", colour: "White" }]],
    ["an accessory", [onlyWhite, bows]],
    ["a colour with no only colour", [red, noBlue, atLeastColours(3)]],
  ])("allows an only colour with %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("only fabric clashes", () => {
  it("rejects a fabric only with a different fabric", () => {
    expectConflict([burlapOnly, silk], conflict(1, 0, "onlyFabricClash"));
    expectConflict([silk, burlapOnly], conflict(1, 0, "onlyFabricClash"));
  });

  it("allows a fabric only with the same fabric", () => {
    expectAllowed([burlapOnly, { type: "fabric", fabric: "Burlap" }]);
  });
});

describe("too few colours left", () => {
  const noGreen: Direction = { type: "colourAvoid", colour: "Green" };

  it.each<Case>([
    [
      "minimum then two avoids",
      [atLeastColours(10), noRed, noBlue],
      conflict(2, 0, "tooFewColoursLeft"),
    ],
    [
      "avoid, minimum, avoid",
      [noRed, atLeastColours(10), noBlue],
      conflict(2, 1, "tooFewColoursLeft"),
    ],
    [
      "two avoids then the minimum",
      [noRed, noBlue, atLeastColours(10)],
      conflict(2, 1, "tooFewColoursLeft"),
    ],
    [
      "avoids spread around other directions",
      [noRed, cute, noBlue, silk, atLeastColours(10)],
      conflict(4, 2, "tooFewColoursLeft"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("allows a minimum that fits the colours left", () => {
    expectAllowed([atLeastColours(10), noRed]);
    expectAllowed([atLeastColours(9), noRed, noBlue]);
  });

  it("rejects when one more avoid takes the colours below the minimum", () => {
    expectConflict(
      [atLeastColours(9), noRed, noBlue, noGreen],
      conflict(3, 0, "tooFewColoursLeft"),
    );
  });

  it("counts a colour avoided twice only once", () => {
    const reasons = findConflicts([atLeastColours(10), noRed, noRed]).map((c) => c.reason);
    expect(reasons).toEqual(["askedTwice"]);
  });
});

describe("more than one only", () => {
  it.each<Case>([
    [
      "colour only twice",
      [onlyWhite, { type: "colourOnly", colour: "Black" }],
      conflict(1, 0, "moreThanOneOnly"),
    ],
    ["the same colour only twice", [onlyWhite, onlyWhite], conflict(1, 0, "moreThanOneOnly")],
    ["fabric only twice", [burlapOnly, burlapOnly], conflict(1, 0, "moreThanOneOnly")],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("allows one colour only and one fabric only", () => {
    expectAllowed([onlyWhite, burlapOnly]);
  });
});

describe("more than one count", () => {
  it.each<Case>([
    [
      "minimum and exact on one accessory",
      [atLeastBows, { type: "accessoryExact", accessory: "Bow", count: 4 }],
      conflict(1, 0, "moreThanOneCount"),
    ],
    [
      "two minimums on one accessory",
      [atLeastBows, { type: "accessoryMin", accessory: "Bow", count: 5 }],
      conflict(1, 0, "moreThanOneCount"),
    ],
    [
      "two exacts on one accessory",
      [exactlyBrooches, { type: "accessoryExact", accessory: "Brooch", count: 5 }],
      conflict(1, 0, "moreThanOneCount"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("allows counts on two different accessories", () => {
    expectAllowed([atLeastBows, exactlyBrooches]);
  });
});

describe("opposing pairs", () => {
  it.each([
    ["Cute", "Gothic"],
    ["Simple", "Elaborate"],
    ["Casual", "Formal"],
    ["Warm", "Cool"],
    ["Daywear", "Eveningwear"],
  ] as const)("rejects %s with %s, in either order", (first, second) => {
    const a: Direction = { type: "style", tag: first };
    const b: Direction = { type: "style", tag: second };
    expectConflict([a, b], conflict(1, 0, "opposingPair"));
    expectConflict([b, a], conflict(1, 0, "opposingPair"));
  });

  it("allows both sides when the caller allows opposing pairs", () => {
    expect(findConflicts([cute, gothic], { allowOpposingPair: true })).toEqual([]);
  });

  it("still rejects other contradictions when opposing pairs are allowed", () => {
    expect(findConflicts([cute, notCute], { allowOpposingPair: true })).toEqual([
      conflict(1, 0, "askedAndAvoided"),
    ]);
  });

  it.each<NearMiss>([
    ["an avoid on one side and a style on the other", [notCute, gothic]],
    ["a style on one side and an avoid on the other", [cute, notGothic]],
    ["avoids on both sides", [notCute, notGothic]],
    ["styles from different pairs", [cute, { type: "style", tag: "Simple" }]],
  ])("allows %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("asked twice", () => {
  it.each<Case>([
    ["a style", [cute, cute], conflict(1, 0, "askedTwice")],
    ["a style avoid", [notCute, notCute], conflict(1, 0, "askedTwice")],
    ["a fabric", [silk, silk], conflict(1, 0, "askedTwice")],
    [
      "a fabric avoid",
      [
        { type: "fabricAvoid", fabric: "Silk" },
        { type: "fabricAvoid", fabric: "Silk" },
      ],
      conflict(1, 0, "askedTwice"),
    ],
    ["a colour", [red, red], conflict(1, 0, "askedTwice")],
    ["a colour avoid", [noRed, noRed], conflict(1, 0, "askedTwice")],
    ["an accessory", [bows, bows], conflict(1, 0, "askedTwice")],
    ["an accessory avoid", [noBows, noBows], conflict(1, 0, "askedTwice")],
    ["a colours minimum", [atLeastColours(3), atLeastColours(4)], conflict(1, 0, "askedTwice")],
    ["an accessory and its minimum", [bows, atLeastBows], conflict(1, 0, "askedTwice")],
    [
      "an exact count and its accessory",
      [exactlyBrooches, { type: "accessory", accessory: "Brooch" }],
      conflict(1, 0, "askedTwice"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("rejects a repeat even when opposing pairs are allowed", () => {
    expect(findConflicts([cute, cute], { allowOpposingPair: true })).toEqual([
      conflict(1, 0, "askedTwice"),
    ]);
  });

  it.each<NearMiss>([
    ["two different styles", [cute, { type: "style", tag: "Simple" }]],
    ["a style and a style avoid on different tags", [cute, notGothic]],
    ["an accessory and a minimum on another accessory", [bows, exactlyBrooches]],
    ["a style and a fabric", [cute, silk]],
  ])("allows %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("which direction is reported", () => {
  it("reports the later direction as the one to redraw", () => {
    expectConflict([cute, silk, red, notCute], conflict(3, 0, "askedAndAvoided"));
  });

  it("reports the earlier direction it clashes with, not the neighbour", () => {
    expectConflict([silk, cute, red, bows, notCute], conflict(4, 1, "askedAndAvoided"));
  });

  it("lists every conflict, later directions last", () => {
    expect(findConflicts([cute, red, notCute, noRed])).toEqual([
      conflict(2, 0, "askedAndAvoided"),
      conflict(3, 1, "askedAndAvoided"),
    ]);
  });
});

describe("conflictsWithAny", () => {
  it("returns the conflict for a candidate that clashes", () => {
    expect(conflictsWithAny(notCute, [silk, cute])).toEqual(conflict(2, 1, "askedAndAvoided"));
  });

  it("returns undefined for a candidate that fits", () => {
    expect(conflictsWithAny(notGothic, [silk, cute])).toBeUndefined();
  });

  it("returns undefined when there is nothing to clash with", () => {
    expect(conflictsWithAny(cute, [])).toBeUndefined();
  });

  it("ignores conflicts that are already among the existing directions", () => {
    expect(conflictsWithAny(bows, [cute, notCute])).toBeUndefined();
  });

  it("passes the options through", () => {
    expect(conflictsWithAny(gothic, [cute])).toEqual(conflict(1, 0, "opposingPair"));
    expect(conflictsWithAny(gothic, [cute], { allowOpposingPair: true })).toBeUndefined();
  });

  it("catches a candidate that tips the colours left too low", () => {
    expect(conflictsWithAny(noBlue, [atLeastColours(10), noRed])).toEqual(
      conflict(2, 0, "tooFewColoursLeft"),
    );
  });
});

describe("game data", () => {
  const data: GameData = { ...dataV1, opposingPairs: [["Cute", "Simple"]] };
  const simple: Direction = { type: "style", tag: "Simple" };

  it("takes the opposing pairs from the data it is given", () => {
    expect(findConflictsIn([cute, simple], { data })).toEqual([conflict(1, 0, "opposingPair")]);
    expect(findConflictsIn([cute, gothic], { data })).toEqual([]);
  });

  it("takes the colour count from the data it is given", () => {
    const twoColours: GameData = { ...dataV1, colours: ["Red", "Blue"] };
    expect(findConflictsIn([atLeastColours(2), noRed], { data: twoColours })).toEqual([
      conflict(1, 0, "tooFewColoursLeft"),
    ]);
  });
});
