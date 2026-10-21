import { describe, expect, it } from "vitest";
import { clientLines } from "@/game/briefs/v1/client-lines";
import { personalities } from "@/game/briefs/v1/personalities";
import {
  accessories,
  accessoryTypes,
  colours,
  fabricTypes,
  fabrics,
  styleTags,
} from "@/game/data/v1";
import { clientLine, lineRandomFor } from "./client-line";
import type { Direction, GeneralFabric, PerPieceAccessory } from "./direction";
import { deriveSeed, randomFromSeed } from "./random";

const generalFabrics = fabricTypes.filter(
  (fabric): fabric is GeneralFabric => !("modifierOnly" in fabrics[fabric]),
);
const perPiece = accessoryTypes.filter(
  (accessory): accessory is PerPieceAccessory => accessories[accessory].unit === "piece",
);
const counts = [1, 2, 3, 4, 5, 6, 7, 8];

function onlyLists<T>(items: readonly T[]): T[][] {
  const lists: T[][] = items.map((item) => [item]);
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      lists.push([items[i], items[j]]);
      for (let k = j + 1; k < items.length; k++) lists.push([items[i], items[j], items[k]]);
    }
  }
  return lists;
}

function pairsAndSingles<T>(items: readonly T[]): T[][] {
  return onlyLists(items).filter((list) => list.length < 3);
}

const everyDirection: Direction[] = [
  ...styleTags.map((tag): Direction => ({ type: "style", tag })),
  ...pairsAndSingles(styleTags).map((tags): Direction => ({ type: "styleAvoid", tags })),
  ...pairsAndSingles(generalFabrics).flatMap((fabrics): Direction[] => [
    { type: "fabric", fabrics },
    { type: "fabricAvoid", fabrics },
  ]),
  ...onlyLists(generalFabrics).map((list): Direction => ({ type: "fabricsOnly", fabrics: list })),
  ...pairsAndSingles(colours).flatMap((list): Direction[] => [
    { type: "colour", colours: list },
    { type: "colourAvoid", colours: list },
  ]),
  ...onlyLists(colours).map((list): Direction => ({ type: "colourOnly", colours: list })),
  ...pairsAndSingles(accessoryTypes).flatMap((list): Direction[] => [
    { type: "accessory", accessories: list },
    { type: "accessoryAvoid", accessories: list },
  ]),
  ...perPiece.flatMap((accessory) =>
    counts.flatMap((count): Direction[] => [
      { type: "accessoryMin", accessory, count },
      { type: "accessoryExact", accessory, count },
    ]),
  ),
  ...counts.flatMap((count): Direction[] => [
    { type: "fabricsMin", count },
    { type: "coloursMin", count },
  ]),
];

const isClean = (line: string) =>
  line !== "" &&
  !/[{}]/.test(line) &&
  !/ {2}|^ | $/.test(line) &&
  !/[.!?] [a-z]/.test(line) &&
  /^\p{Lu}/u.test(line);

const lineFor = (direction: Direction, personality: (typeof personalities)[number], n = 0) =>
  clientLine(direction, personality, randomFromSeed(deriveSeed("pick", n)));

describe("client lines content", () => {
  it("gives every personality at least two generic lines for every direction type", () => {
    for (const personality of personalities) {
      const { generic } = clientLines[personality];
      for (const [type, lines] of Object.entries(generic) as [string, readonly string[]][]) {
        expect(lines.length, `${personality} ${type}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("gives every personality at least one line for each of the common specific keys", () => {
    const keys = [
      "fabric:Velvet",
      "fabricAvoid:Sequin",
      "style:Gothic",
      "styleAvoid:Cute",
      "colourAvoid:Black",
      "accessory:Bow",
      "accessoryAvoid:Feather",
      "accessoryMin:Bow",
      "accessoryExact:Brooch",
    ] as const;
    for (const personality of personalities) {
      for (const key of keys) {
        expect(
          clientLines[personality].specific[key]?.length,
          `${personality} ${key}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("clientLine", () => {
  it("calls the Flowers style floral in a sentence", () => {
    for (const personality of personalities) {
      for (let i = 0; i < 40; i++) {
        const line = clientLine(
          { type: "style", tag: "Flowers" },
          personality,
          randomFromSeed(deriveSeed("floral", i)),
        );
        expect(line).toMatch(/floral/i);
        expect(line).not.toMatch(/flowers/i);
      }
    }
  });

  it("has no line for burlapOnly", () => {
    for (const personality of personalities) {
      expect(lineFor({ type: "burlapOnly" }, personality)).toBeUndefined();
    }
  });

  it("leaves no slot, double space or lowercase start over, across all the data", () => {
    for (const personality of personalities) {
      for (const direction of everyDirection) {
        for (let n = 0; n < 6; n++) {
          const line = lineFor(direction, personality, n);
          expect(
            line !== undefined && isClean(line),
            `${personality} ${JSON.stringify(direction)} ${line}`,
          ).toBe(true);
        }
      }
    }
  });

  it("stays clean over 5,000 seeded random picks", () => {
    for (let n = 0; n < 5_000; n++) {
      const random = randomFromSeed(deriveSeed("fuzz", n));
      const direction = random.pick(everyDirection);
      const personality = random.pick(personalities);
      const line = clientLine(direction, personality, random);
      expect(
        line !== undefined && isClean(line),
        `${personality} ${JSON.stringify(direction)} ${line}`,
      ).toBe(true);
    }
  });

  it("prefers a specific line over a generic one", () => {
    for (const personality of personalities) {
      const specific = clientLines[personality].specific["fabric:Velvet"] ?? [];
      const seen = new Set<string>();
      for (let n = 0; n < 200; n++) {
        const line = lineFor({ type: "fabric", fabrics: ["Velvet"] }, personality, n);
        expect(specific.map((s) => s.charAt(0).toUpperCase() + s.slice(1))).toContain(line);
        seen.add(line ?? "");
      }
      expect(seen.size).toBe(specific.length);
    }
  });

  it("gives grand, anxious and theatrical their own Velvet lines", () => {
    const velvet = (personality: (typeof personalities)[number]) =>
      clientLines[personality].specific["fabric:Velvet"] ?? [];
    for (const personality of ["grand", "anxious", "theatrical"] as const) {
      expect(velvet(personality).length, personality).toBeGreaterThan(0);
      for (const other of personalities.filter((p) => p !== personality)) {
        for (const line of velvet(personality)) expect(velvet(other)).not.toContain(line);
      }
    }
  });

  it("falls back to generic lines when there is no specific line", () => {
    for (const personality of personalities) {
      const line = lineFor({ type: "fabricAvoid", fabrics: ["Wool"] }, personality);
      expect(line).toMatch(/wool/i);
    }
  });

  it("joins an only list with or, never and", () => {
    const direction: Direction = { type: "colourOnly", colours: ["Orange", "Yellow", "Green"] };
    for (const personality of personalities) {
      for (let n = 0; n < 20; n++) {
        const line = lineFor(direction, personality, n);
        expect(line?.toLowerCase()).toContain("orange, yellow or green");
        expect(line).not.toContain(" and ");
      }
    }
  });

  it("writes counts in words and digits, and singular nouns for one", () => {
    const five: Direction = { type: "accessoryMin", accessory: "Button", count: 5 };
    const one: Direction = { type: "accessoryExact", accessory: "Button", count: 1 };
    for (const personality of personalities) {
      const fiveLines = new Set(
        Array.from({ length: 20 }, (_, n) => lineFor(five, personality, n)),
      );
      expect([...fiveLines].some((line) => line?.includes("five buttons"))).toBe(true);
      for (const n of [0, 1, 2, 3, 4, 5]) {
        const line = lineFor(one, personality, n);
        expect(line).toMatch(/one button/i);
        expect(line).not.toContain("buttons");
      }
    }
  });

  it("is the same for the same stream and differs across streams", () => {
    const direction: Direction = { type: "style", tag: "Gothic" };
    const a = clientLine(direction, "brisk", lineRandomFor("seed", 0, 0));
    expect(clientLine(direction, "brisk", lineRandomFor("seed", 0, 0))).toBe(a);
    const lines = new Set(
      Array.from({ length: 30 }, (_, reroll) =>
        clientLine({ type: "style", tag: "Cool" }, "deadpan", lineRandomFor("seed", 1, reroll)),
      ),
    );
    expect(lines.size).toBeGreaterThan(1);
  });
});
