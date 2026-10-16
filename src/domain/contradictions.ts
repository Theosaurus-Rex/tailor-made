import type { GameData } from "@/game/data/v1";
import type { Direction } from "./direction";

export type ConflictReason =
  | "askedAndAvoided"
  | "onlyColourClash"
  | "tooFewColoursLeft"
  | "moreThanOneOnly"
  | "moreThanOneCount"
  | "opposingPair"
  | "askedTwice";

export interface Conflict {
  index: number;
  conflictsWith: number;
  reason: ConflictReason;
}

export interface ConflictOptions {
  data: GameData;
  allowOpposingPair?: boolean;
}

type Rule = (directions: readonly Direction[], options: ConflictOptions) => Conflict[];

const askedFor = (d: Direction): string | undefined => {
  switch (d.type) {
    case "style":
      return `style:${d.tag}`;
    case "fabric":
      return `fabric:${d.fabric}`;
    case "colour":
    case "colourOnly":
      return `colour:${d.colour}`;
    case "accessory":
    case "accessoryMin":
    case "accessoryExact":
      return `accessory:${d.accessory}`;
    default:
      return undefined;
  }
};

const avoided = (d: Direction): string | undefined => {
  switch (d.type) {
    case "styleAvoid":
      return `style:${d.tag}`;
    case "fabricAvoid":
      return `fabric:${d.fabric}`;
    case "colourAvoid":
      return `colour:${d.colour}`;
    case "accessoryAvoid":
      return `accessory:${d.accessory}`;
    default:
      return undefined;
  }
};

const isCount = (d: Direction) => d.type === "accessoryMin" || d.type === "accessoryExact";

const isOnly = (d: Direction) => d.type === "colourOnly";

function eachPair(
  directions: readonly Direction[],
  reason: ConflictReason,
  clashes: (earlier: Direction, later: Direction) => boolean,
): Conflict[] {
  const found: Conflict[] = [];
  directions.forEach((later, index) => {
    for (let conflictsWith = 0; conflictsWith < index; conflictsWith++) {
      const earlier = directions[conflictsWith];
      if (earlier && clashes(earlier, later)) found.push({ index, conflictsWith, reason });
    }
  });
  return found;
}

const eitherWay = (test: (a: Direction, b: Direction) => boolean) => (a: Direction, b: Direction) =>
  test(a, b) || test(b, a);

const askedAndAvoided: Rule = (directions) =>
  eachPair(
    directions,
    "askedAndAvoided",
    eitherWay((a, b) => {
      const asked = askedFor(a);
      return asked !== undefined && asked === avoided(b);
    }),
  );

const onlyColourClash: Rule = (directions) =>
  eachPair(
    directions,
    "onlyColourClash",
    eitherWay((only, other) => {
      if (only.type !== "colourOnly") return false;
      if (other.type === "coloursMin") return true;
      if (other.type === "colour" || other.type === "colourAvoid") {
        return other.colour !== only.colour;
      }
      return false;
    }),
  );

const tooFewColoursLeft: Rule = (directions, { data }) => {
  const found: Conflict[] = [];
  directions.forEach((direction, minimumIndex) => {
    if (direction.type !== "coloursMin") return;
    const avoidedColours = new Set<string>();
    let lastAvoidIndex: number | undefined;
    for (let index = 0; index < directions.length; index++) {
      const current = directions[index];
      if (current?.type === "colourAvoid") {
        avoidedColours.add(current.colour);
        if (index !== minimumIndex) lastAvoidIndex = index;
      }
      if (index < minimumIndex || lastAvoidIndex === undefined) continue;
      if (direction.count <= data.colours.length - avoidedColours.size) continue;
      const conflictsWith = index === minimumIndex ? lastAvoidIndex : minimumIndex;
      found.push({ index, conflictsWith, reason: "tooFewColoursLeft" });
      return;
    }
  });
  return found;
};

const moreThanOneOnly: Rule = (directions) =>
  eachPair(directions, "moreThanOneOnly", (a, b) => isOnly(a) && a.type === b.type);

const moreThanOneCount: Rule = (directions) =>
  eachPair(
    directions,
    "moreThanOneCount",
    (a, b) => isCount(a) && isCount(b) && askedFor(a) === askedFor(b),
  );

const opposingPair: Rule = (directions, options) => {
  if (options.allowOpposingPair) return [];
  return eachPair(directions, "opposingPair", (a, b) => {
    if (a.type !== "style" || b.type !== "style") return false;
    return options.data.opposingPairs.some(
      ([x, y]) => (a.tag === x && b.tag === y) || (a.tag === y && b.tag === x),
    );
  });
};

const askedTwice: Rule = (directions) =>
  eachPair(directions, "askedTwice", (a, b) => {
    if (isOnly(a) || isOnly(b)) return false;
    if (isCount(a) && isCount(b)) return false;
    if (a.type === "coloursMin") return b.type === "coloursMin";
    const sameAsk = askedFor(a) !== undefined && askedFor(a) === askedFor(b);
    const sameAvoid = avoided(a) !== undefined && avoided(a) === avoided(b);
    return sameAsk || sameAvoid;
  });

const rules: readonly Rule[] = [
  askedAndAvoided,
  onlyColourClash,
  tooFewColoursLeft,
  moreThanOneOnly,
  moreThanOneCount,
  opposingPair,
  askedTwice,
];

export function findConflicts(
  directions: readonly Direction[],
  options: ConflictOptions,
): Conflict[] {
  return rules
    .flatMap((rule) => rule(directions, options))
    .sort((a, b) => a.index - b.index || a.conflictsWith - b.conflictsWith);
}

export function conflictsWithAny(
  candidate: Direction,
  existing: readonly Direction[],
  options: ConflictOptions,
): Conflict | undefined {
  return findConflicts([...existing, candidate], options).find(
    (conflict) => conflict.index === existing.length,
  );
}
