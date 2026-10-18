import type { PairRule } from "@/game/data/difficulty-shapes";
import type { GameData, StyleTag } from "@/game/data/v1";
import type { Direction } from "./direction";

export type ConflictReason =
  | "askedAndAvoided"
  | "onlyColourClash"
  | "onlyFabricClash"
  | "tooFewColoursLeft"
  | "tooFewFabricsLeft"
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
  pairs: PairRule;
  allowedPair?: readonly [StyleTag, StyleTag];
}

type Rule = (directions: readonly Direction[], options: ConflictOptions) => Conflict[];

const askedFor = (d: Direction): string | undefined => {
  switch (d.type) {
    case "style":
      return `style:${d.tag}`;
    case "fabric":
      return `fabric:${d.fabric}`;
    case "colour":
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

const listed = (d: Direction): readonly string[] => {
  switch (d.type) {
    case "colourOnly":
      return d.colours.map((colour) => `colour:${colour}`);
    case "fabricsOnly":
      return d.fabrics.map((fabric) => `fabric:${fabric}`);
    default:
      return [];
  }
};

const isCount = (d: Direction) => d.type === "accessoryMin" || d.type === "accessoryExact";

const isOnly = (d: Direction) => d.type === "colourOnly" || d.type === "fabricsOnly";

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
      const avoid = avoided(b);
      if (avoid === undefined) return false;
      return askedFor(a) === avoid || listed(a).includes(avoid);
    }),
  );

const onlyListClash = (reason: ConflictReason, onlyType: "colourOnly" | "fabricsOnly"): Rule => {
  const minType = onlyType === "colourOnly" ? "coloursMin" : "fabricsMin";
  const prefix = onlyType === "colourOnly" ? "colour:" : "fabric:";
  return (directions) =>
    eachPair(
      directions,
      reason,
      eitherWay((only, other) => {
        if (only.type !== onlyType) return false;
        if (other.type === minType) return true;
        const key = askedFor(other) ?? avoided(other);
        return key !== undefined && key.startsWith(prefix) && !listed(only).includes(key);
      }),
    );
};

const onlyColourClash = onlyListClash("onlyColourClash", "colourOnly");

const onlyFabricClash = onlyListClash("onlyFabricClash", "fabricsOnly");

const tooFewLeft = (
  reason: ConflictReason,
  minType: "coloursMin" | "fabricsMin",
  avoidKey: (d: Direction) => string | undefined,
  available: (data: GameData) => number,
): Rule => {
  return (directions, { data }) => {
    const found: Conflict[] = [];
    directions.forEach((direction, minimumIndex) => {
      if (direction.type !== minType) return;
      const avoidedItems = new Set<string>();
      let lastAvoidIndex: number | undefined;
      for (let index = 0; index < directions.length; index++) {
        const current = directions[index];
        const key = current && avoidKey(current);
        if (key !== undefined) {
          avoidedItems.add(key);
          if (index !== minimumIndex) lastAvoidIndex = index;
        }
        if (index < minimumIndex || lastAvoidIndex === undefined) continue;
        if (direction.count <= available(data) - avoidedItems.size) continue;
        const conflictsWith = index === minimumIndex ? lastAvoidIndex : minimumIndex;
        found.push({ index, conflictsWith, reason });
        return;
      }
    });
    return found;
  };
};

const tooFewColoursLeft = tooFewLeft(
  "tooFewColoursLeft",
  "coloursMin",
  (d) => (d.type === "colourAvoid" ? d.colour : undefined),
  (data) => data.colours.length,
);

const tooFewFabricsLeft = tooFewLeft(
  "tooFewFabricsLeft",
  "fabricsMin",
  (d) => (d.type === "fabricAvoid" ? d.fabric : undefined),
  (data) => Object.values(data.fabrics).filter((fabric) => !fabric.modifierOnly).length,
);

const moreThanOneOnly: Rule = (directions) =>
  eachPair(directions, "moreThanOneOnly", (a, b) => isOnly(a) && a.type === b.type);

const moreThanOneCount: Rule = (directions) =>
  eachPair(
    directions,
    "moreThanOneCount",
    (a, b) => isCount(a) && isCount(b) && askedFor(a) === askedFor(b),
  );

const styleTag = (d: Direction): StyleTag | undefined =>
  d.type === "style" || d.type === "styleAvoid" ? d.tag : undefined;

const isPair = (a: StyleTag, b: StyleTag, [x, y]: readonly [StyleTag, StyleTag]) =>
  (a === x && b === y) || (a === y && b === x);

const opposingPair: Rule = (directions, { data, pairs, allowedPair }) =>
  eachPair(directions, "opposingPair", (a, b) => {
    if (pairs !== "never" && (a.type !== "style" || b.type !== "style")) return false;
    const x = styleTag(a);
    const y = styleTag(b);
    if (x === undefined || y === undefined) return false;
    if (pairs === "oneStylePair" && allowedPair && isPair(x, y, allowedPair)) return false;
    return data.opposingPairs.some((pair) => isPair(x, y, pair));
  });

const askedTwice: Rule = (directions) =>
  eachPair(directions, "askedTwice", (a, b) => {
    if (isOnly(a) || isOnly(b)) return false;
    if (isCount(a) && isCount(b)) return false;
    if (a.type === "coloursMin" || a.type === "fabricsMin") return a.type === b.type;
    const sameAsk = askedFor(a) !== undefined && askedFor(a) === askedFor(b);
    const sameAvoid = avoided(a) !== undefined && avoided(a) === avoided(b);
    return sameAsk || sameAvoid;
  });

const rules: readonly Rule[] = [
  askedAndAvoided,
  onlyColourClash,
  onlyFabricClash,
  tooFewColoursLeft,
  tooFewFabricsLeft,
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
