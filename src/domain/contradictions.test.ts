import { describe, expect, it } from "vitest";
import {
  type Conflict,
  type ConflictOptions,
  conflictsWithAny as conflictsWithAnyIn,
  findConflicts as findConflictsIn,
} from "./contradictions";
import type { Direction, GeneralFabric } from "./direction";
import { dataV1, type Colour, type GameData } from "@/game/data/v1";

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
const burlapOnly: Direction = { type: "burlapOnly" };
const noSilk: Direction = { type: "fabricAvoid", fabric: "Silk" };
const onlyFabrics = (...fabrics: GeneralFabric[]): Direction => ({ type: "fabricsOnly", fabrics });
const onlyLinenCotton = onlyFabrics("Linen", "Cotton");
const atLeastFabrics = (count: number): Direction => ({ type: "fabricsMin", count });
const avoidFabric = (fabric: GeneralFabric): Direction => ({ type: "fabricAvoid", fabric });
const red: Direction = { type: "colour", colour: "Red" };
const noRed: Direction = { type: "colourAvoid", colour: "Red" };
const noBlue: Direction = { type: "colourAvoid", colour: "Blue" };
const onlyColours = (...colours: Colour[]): Direction => ({ type: "colourOnly", colours });
const onlyWhite = onlyColours("White");
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
    ["colour", [red, noRed], conflict(1, 0, "askedAndAvoided")],
    [
      "colour only and avoid on the same colour",
      [onlyWhite, { type: "colourAvoid", colour: "White" }],
      conflict(1, 0, "askedAndAvoided"),
    ],
    [
      "a colour in an only list",
      [onlyColours("Orange", "Yellow", "Green"), { type: "colourAvoid", colour: "Yellow" }],
      conflict(1, 0, "askedAndAvoided"),
    ],
    [
      "a colour avoid then an only list that holds it",
      [{ type: "colourAvoid", colour: "Yellow" }, onlyColours("Orange", "Yellow")],
      conflict(1, 0, "askedAndAvoided"),
    ],
    [
      "a fabric in an only list",
      [onlyLinenCotton, avoidFabric("Cotton")],
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
  const orangeYellowGreen = onlyColours("Orange", "Yellow", "Green");

  it.each<Case>([
    ["a different colour", [onlyWhite, red], conflict(1, 0, "onlyColourClash")],
    ["a different colour listed first", [red, onlyWhite], conflict(1, 0, "onlyColourClash")],
    ["a colour outside the list", [orangeYellowGreen, red], conflict(1, 0, "onlyColourClash")],
    ["a different colour avoid", [onlyWhite, noRed], conflict(1, 0, "onlyColourClash")],
    [
      "a colour avoid outside the list",
      [orangeYellowGreen, noRed],
      conflict(1, 0, "onlyColourClash"),
    ],
    ["a colours minimum", [onlyWhite, atLeastColours(3)], conflict(1, 0, "onlyColourClash")],
    [
      "a colours minimum above the list length",
      [onlyColours("White", "Grey"), atLeastColours(3)],
      conflict(1, 0, "onlyColourClash"),
    ],
    [
      "a colours minimum listed first",
      [atLeastColours(3), onlyColours("White", "Grey")],
      conflict(1, 0, "onlyColourClash"),
    ],
    [
      "a colours minimum equal to the list length",
      [orangeYellowGreen, atLeastColours(3)],
      conflict(1, 0, "onlyColourClash"),
    ],
    [
      "a colours minimum below the list length",
      [orangeYellowGreen, atLeastColours(2)],
      conflict(1, 0, "onlyColourClash"),
    ],
  ])("rejects an only colour with %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it.each<NearMiss>([
    ["the same colour", [onlyWhite, { type: "colour", colour: "White" }]],
    ["a colour in the list", [orangeYellowGreen, { type: "colour", colour: "Green" }]],
    ["an accessory", [onlyWhite, bows]],
    ["a colour with no only colour", [red, noBlue, atLeastColours(3)]],
  ])("allows an only colour with %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("only fabric clashes", () => {
  it.each<Case>([
    [
      "a fabric outside the list",
      [onlyFabrics("Linen", "Cotton", "Wool"), silk],
      conflict(1, 0, "onlyFabricClash"),
    ],
    ["a fabric listed first", [silk, onlyLinenCotton], conflict(1, 0, "onlyFabricClash")],
    [
      "a fabric avoid outside the list",
      [onlyLinenCotton, avoidFabric("Velvet")],
      conflict(1, 0, "onlyFabricClash"),
    ],
    [
      "a fabrics minimum above the list length",
      [onlyLinenCotton, atLeastFabrics(3)],
      conflict(1, 0, "onlyFabricClash"),
    ],
    [
      "a fabrics minimum listed first",
      [atLeastFabrics(3), onlyLinenCotton],
      conflict(1, 0, "onlyFabricClash"),
    ],
    [
      "a fabrics minimum equal to the list length",
      [onlyLinenCotton, atLeastFabrics(2)],
      conflict(1, 0, "onlyFabricClash"),
    ],
    [
      "a fabrics minimum below the list length",
      [onlyFabrics("Linen", "Cotton", "Wool"), atLeastFabrics(2)],
      conflict(1, 0, "onlyFabricClash"),
    ],
  ])("rejects an only fabric with %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it.each<NearMiss>([
    [
      "a fabric in the list",
      [onlyFabrics("Linen", "Cotton", "Wool"), { type: "fabric", fabric: "Cotton" }],
    ],
    ["a colour", [onlyLinenCotton, red]],
    ["a colours minimum", [onlyLinenCotton, atLeastColours(3)]],
  ])("allows an only fabric with %s", (_name, directions) => {
    expectAllowed(directions);
  });
});

describe("burlap only", () => {
  it("never conflicts with anything", () => {
    expectAllowed([burlapOnly, silk]);
    expectAllowed([silk, burlapOnly]);
    expectAllowed([burlapOnly, noSilk]);
    expectAllowed([burlapOnly, burlapOnly]);
    expectAllowed([burlapOnly, onlyWhite]);
    expectAllowed([burlapOnly, onlyLinenCotton]);
    expectAllowed([burlapOnly, atLeastFabrics(4)]);
    expectAllowed([onlyLinenCotton, burlapOnly, red]);
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

describe("too few fabrics left", () => {
  const avoids = (...fabrics: GeneralFabric[]) => fabrics.map(avoidFabric);

  it.each<Case>([
    [
      "minimum then four avoids",
      [atLeastFabrics(4), ...avoids("Silk", "Wool", "Lace", "Velvet")],
      conflict(4, 0, "tooFewFabricsLeft"),
    ],
    [
      "avoids then the minimum",
      [...avoids("Silk", "Wool", "Lace", "Velvet"), atLeastFabrics(4)],
      conflict(4, 3, "tooFewFabricsLeft"),
    ],
    [
      "avoid, minimum, avoids",
      [avoidFabric("Silk"), atLeastFabrics(4), ...avoids("Wool", "Lace", "Velvet")],
      conflict(4, 1, "tooFewFabricsLeft"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("allows a minimum that fits the fabrics left", () => {
    expectAllowed([atLeastFabrics(4), ...avoids("Silk", "Wool", "Lace")]);
  });

  it("counts a fabric avoided twice only once", () => {
    const reasons = findConflicts([
      atLeastFabrics(4),
      ...avoids("Silk", "Silk", "Wool", "Lace"),
    ]).map((c) => c.reason);
    expect(reasons).toEqual(["askedTwice"]);
  });
});

describe("more than one only", () => {
  it.each<Case>([
    ["colour only twice", [onlyWhite, onlyColours("Black")], conflict(1, 0, "moreThanOneOnly")],
    ["the same colour only twice", [onlyWhite, onlyWhite], conflict(1, 0, "moreThanOneOnly")],
    [
      "fabrics only twice",
      [onlyLinenCotton, onlyFabrics("Silk", "Wool")],
      conflict(1, 0, "moreThanOneOnly"),
    ],
    [
      "the same fabrics only twice",
      [onlyLinenCotton, onlyLinenCotton],
      conflict(1, 0, "moreThanOneOnly"),
    ],
  ])("rejects %s", (_name, directions, expected) => {
    expectConflict(directions, expected);
  });

  it("allows one colour only", () => {
    expectAllowed([onlyWhite, bows]);
  });

  it("allows one fabrics only", () => {
    expectAllowed([onlyLinenCotton, bows]);
  });

  it("allows a colour only with a fabrics only", () => {
    expectAllowed([onlyWhite, onlyLinenCotton]);
    expectAllowed([onlyLinenCotton, onlyWhite]);
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
    ["a fabrics minimum", [atLeastFabrics(3), atLeastFabrics(4)], conflict(1, 0, "askedTwice")],
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
    ["a colours minimum and a fabrics minimum", [atLeastColours(3), atLeastFabrics(3)]],
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

  it("takes the general fabric count from the data it is given", () => {
    const modifierOnly = (fabric: GeneralFabric) => ({
      ...dataV1.fabrics[fabric],
      modifierOnly: true as const,
    });
    const fewFabrics: GameData = {
      ...dataV1,
      fabrics: {
        ...dataV1.fabrics,
        Silk: modifierOnly("Silk"),
        Wool: modifierOnly("Wool"),
        Lace: modifierOnly("Lace"),
        Velvet: modifierOnly("Velvet"),
      },
    };
    const directions = [atLeastFabrics(3), avoidFabric("Cotton")];
    expect(findConflictsIn(directions, { data: fewFabrics })).toEqual([
      conflict(1, 0, "tooFewFabricsLeft"),
    ]);
    expect(findConflictsIn(directions, { data: dataV1 })).toEqual([]);
  });
});
