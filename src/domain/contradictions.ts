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

const askedFor = (d: Direction): readonly string[] => {
  switch (d.type) {
    case "style":
      return [`style:${d.tag}`];
    case "fabric":
      return d.fabrics.map((fabric) => `fabric:${fabric}`);
    case "colour":
      return d.colours.map((colour) => `colour:${colour}`);
    case "accessory":
      return d.accessories.map((accessory) => `accessory:${accessory}`);
    case "accessoryMin":
    case "accessoryExact":
      return [`accessory:${d.accessory}`];
    default:
      return [];
  }
};

const avoided = (d: Direction): readonly string[] => {
  switch (d.type) {
    case "styleAvoid":
      return d.tags.map((tag) => `style:${tag}`);
    case "fabricAvoid":
      return d.fabrics.map((fabric) => `fabric:${fabric}`);
    case "colourAvoid":
      return d.colours.map((colour) => `colour:${colour}`);
    case "accessoryAvoid":
      return d.accessories.map((accessory) => `accessory:${accessory}`);
    default:
      return [];
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

const shareAny = (a: readonly string[], b: readonly string[]) => a.some((key) => b.includes(key));

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
      return shareAny(avoided(b), askedFor(a)) || shareAny(avoided(b), listed(a));
    }),
  );

const onlyListClash = (reason: ConflictReason, onlyType: "colourOnly" | "fabricsOnly"): Rule => {
  const minType = onlyType === "colourOnly" ? "coloursMin" : "fabricsMin";
  const askType = onlyType === "colourOnly" ? "colour" : "fabric";
  const prefix = `${askType}:`;
  return (directions) =>
    eachPair(
      directions,
      reason,
      eitherWay((only, other) => {
        if (only.type !== onlyType) return false;
        if (other.type === minType || other.type === askType) return true;
        const outside = [...askedFor(other), ...avoided(other)].filter((key) =>
          key.startsWith(prefix),
        );
        return outside.some((key) => !listed(only).includes(key));
      }),
    );
};

const onlyColourClash = onlyListClash("onlyColourClash", "colourOnly");

const onlyFabricClash = onlyListClash("onlyFabricClash", "fabricsOnly");

const tooFewLeft = (
  reason: ConflictReason,
  minType: "coloursMin" | "fabricsMin",
  avoidKeys: (d: Direction) => readonly string[],
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
        const keys = current ? avoidKeys(current) : [];
        if (keys.length > 0) {
          keys.forEach((key) => avoidedItems.add(key));
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
  (d) => (d.type === "colourAvoid" ? avoided(d) : []),
  (data) => data.colours.length,
);

const tooFewFabricsLeft = tooFewLeft(
  "tooFewFabricsLeft",
  "fabricsMin",
  (d) => (d.type === "fabricAvoid" ? avoided(d) : []),
  (data) => Object.values(data.fabrics).filter((fabric) => !fabric.modifierOnly).length,
);

const moreThanOneOnly: Rule = (directions) =>
  eachPair(directions, "moreThanOneOnly", (a, b) => isOnly(a) && a.type === b.type);

const moreThanOneCount: Rule = (directions) =>
  eachPair(
    directions,
    "moreThanOneCount",
    (a, b) => isCount(a) && isCount(b) && shareAny(askedFor(a), askedFor(b)),
  );

const styleTags = (d: Direction): readonly StyleTag[] =>
  d.type === "style" ? [d.tag] : d.type === "styleAvoid" ? d.tags : [];

const isPair = (a: StyleTag, b: StyleTag, [x, y]: readonly [StyleTag, StyleTag]) =>
  (a === x && b === y) || (a === y && b === x);

const opposingPair: Rule = (directions, { data, pairs, allowedPair }) => {
  const opposes = (x: StyleTag, y: StyleTag) => {
    if (pairs === "oneStylePair" && allowedPair && isPair(x, y, allowedPair)) return false;
    return data.opposingPairs.some((pair) => isPair(x, y, pair));
  };
  const between = eachPair(directions, "opposingPair", (a, b) => {
    if (pairs !== "never" && (a.type !== "style" || b.type !== "style")) return false;
    return styleTags(a).some((x) => styleTags(b).some((y) => opposes(x, y)));
  });
  if (pairs !== "never") return between;
  const within = directions.flatMap((d, index): Conflict[] => {
    const tags = styleTags(d);
    const held = tags.some((x, i) => tags.slice(i + 1).some((y) => opposes(x, y)));
    return held ? [{ index, conflictsWith: index, reason: "opposingPair" }] : [];
  });
  return [...between, ...within];
};

const askedTwice: Rule = (directions) =>
  eachPair(directions, "askedTwice", (a, b) => {
    if (isOnly(a) || isOnly(b)) return false;
    if (isCount(a) && isCount(b)) return false;
    if (a.type === "coloursMin" || a.type === "fabricsMin") return a.type === b.type;
    return shareAny(askedFor(a), askedFor(b)) || shareAny(avoided(a), avoided(b));
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
