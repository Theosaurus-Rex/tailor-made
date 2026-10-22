import { dataVersions } from "@/game/data";
import type { PairRule } from "@/game/data/difficulty-shapes";
import type { GameData, StyleTag } from "@/game/data/v1";
import type { Challenge, Modifier } from "./challenge";
import { conflictsWithAny } from "./contradictions";
import {
  burlapShapeFor,
  shapeFor,
  type Difficulty,
  type DifficultyShape,
  type PlannedType,
} from "./difficulty";
import {
  COUNT_RANGE,
  FABRICS_MIN_RANGE,
  ONLY_LIST_SIZE,
  SAME_KIND_LIST_SIZE,
  type Direction,
  type DirectionType,
  type GeneralFabric,
  type PerPieceAccessory,
} from "./direction";
import { deriveSeed, randomFromSeed, weightedPick, type Random } from "./random";
import { leaningsFor, themeFor, type Leanings } from "./theme";

export const MAX_TRIES = 25;

const MODIFIERS: readonly Modifier[] = ["burlap"];

export interface GenerateInput {
  seed: string;
  difficulty: Difficulty;
  modifiers: readonly Modifier[];
  dataVersion: number;
}

export interface DrawInput {
  seed: string;
  plan: readonly DirectionType[];
  slot: number;
  rerollCount: number;
  others: readonly Direction[];
  pairs: PairRule;
  pairedItemChance: number;
  allowedPair?: readonly [StyleTag, StyleTag];
  pullApartSlot?: number | null;
  ignoreTheme?: boolean;
  replacing?: Direction | null;
  data: GameData;
}

// The order of draws below is frozen for data version 1. Changing it moves every challenge.
function weighted<T>(random: Random, items: readonly T[], weight: (item: T) => number): T {
  return weightedPick(
    random,
    items.map((value) => ({ value, weight: weight(value) })),
  );
}

function someOf<T>(
  random: Random,
  items: readonly T[],
  count: number,
  weight: (item: T) => number,
): T[] {
  const left = [...items];
  const chosen: T[] = [];
  for (let i = 0; i < count; i++) {
    const item = weighted(random, left, weight);
    left.splice(left.indexOf(item), 1);
    chosen.push(item);
  }
  return chosen;
}

function leaning<T>(
  items: readonly T[],
  towards: StyleTag | undefined,
  leansOf: (item: T) => readonly StyleTag[],
) {
  if (towards === undefined) return items;
  const matching = items.filter((item) => leansOf(item).includes(towards));
  return matching.length > 0 ? matching : items;
}

function drawCandidate(
  type: DirectionType,
  random: Random,
  data: GameData,
  towards: StyleTag | undefined,
  leanings: Leanings,
  pairedItemChance: number,
): Direction {
  const generalFabrics = data.fabricTypes.filter(
    (fabric) => !data.fabrics[fabric].modifierOnly,
  ) as GeneralFabric[];
  const perPiece = data.accessoryTypes.filter(
    (accessory) => data.accessories[accessory].unit === "piece",
  ) as PerPieceAccessory[];
  const tag = (avoid: boolean) =>
    weighted(random, data.styleTags, (value) => leanings.tag(value, avoid));
  const onlyCount = () => random.between(ONLY_LIST_SIZE.min, ONLY_LIST_SIZE.max);
  const onlyList = <T>(pool: readonly T[], weight: (item: T) => number) =>
    someOf(random, pool, onlyCount(), weight);
  const pick = <T>(items: readonly T[], weight: (item: T) => number): T[] => {
    const size =
      random.fraction() < pairedItemChance ? SAME_KIND_LIST_SIZE.max : SAME_KIND_LIST_SIZE.min;
    return someOf(random, items, Math.min(size, items.length), weight);
  };
  switch (type) {
    case "burlapOnly":
      return { type };
    case "style":
      return { type, tag: tag(false) };
    case "styleAvoid":
      return { type, tags: pick(data.styleTags, (value) => leanings.tag(value, true)) };
    case "fabric":
      return {
        type,
        fabrics: pick(
          leaning(generalFabrics, towards, (f) => data.fabrics[f].leansTowards),
          (f) => leanings.fabric(f, false),
        ),
      };
    case "fabricAvoid":
      return { type, fabrics: pick(generalFabrics, (f) => leanings.fabric(f, true)) };
    case "fabricsOnly":
      return {
        type,
        fabrics: onlyList(generalFabrics, (f) => leanings.fabric(f, false)),
      };
    case "fabricsMin":
    case "coloursMin":
      return { type, count: random.between(FABRICS_MIN_RANGE.min, FABRICS_MIN_RANGE.max) };
    case "colour":
      return {
        type,
        colours: pick(data.colours, (c) => leanings.colour(c, false)),
      };
    case "colourAvoid":
      return { type, colours: pick(data.colours, (c) => leanings.colour(c, true)) };
    case "colourOnly":
      return {
        type,
        colours: onlyList(data.colours, (c) => leanings.colour(c, false)),
      };
    case "accessory":
      return {
        type,
        accessories: pick(
          leaning(data.accessoryTypes, towards, (a) => data.accessories[a].leansTowards),
          (a) => leanings.accessory(a, false),
        ),
      };
    case "accessoryAvoid":
      return {
        type,
        accessories: pick(data.accessoryTypes, (a) => leanings.accessory(a, true)),
      };
    case "accessoryMin":
    case "accessoryExact":
      return {
        type,
        accessory: weighted(random, perPiece, (a) => leanings.accessory(a, false)),
        count: random.between(COUNT_RANGE.min, COUNT_RANGE.max),
      };
  }
}

export function planFor(
  seed: string,
  shape: DifficultyShape,
  neverTogether: GameData["kindsNeverTogether"],
): { plan: PlannedType[]; pullApartSlot: number | null } {
  const random = randomFromSeed(deriveSeed(seed, "plan"));
  const total = random.between(shape.directionCount.min, shape.directionCount.max);
  const plan: PlannedType[] = [];
  const pickFrom = (allowed: (type: PlannedType) => boolean) => {
    const open = shape.types.filter(
      ({ type }) =>
        allowed(type) &&
        !neverTogether.some(
          ([a, b]) => (type === a && plan.includes(b)) || (type === b && plan.includes(a)),
        ) &&
        shape.limits.every(
          (limit) =>
            !limit.types.includes(type) ||
            plan.filter((used) => limit.types.includes(used)).length < limit.max,
        ),
    );
    plan.push(
      weightedPick(
        random,
        open.map(({ type, weight }) => ({ value: type, weight })),
      ),
    );
  };
  for (const limit of shape.limits) {
    for (let i = 0; i < limit.min; i++) pickFrom((type) => limit.types.includes(type));
  }
  while (plan.length < total) pickFrom(() => true);
  for (let i = plan.length - 1; i > 0; i--) {
    const j = random.between(0, i);
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  const target = plan.findIndex((type) => type === "fabric" || type === "accessory");
  const canPullApart =
    shape.pullApartChance !== undefined && target >= 0 && plan.includes("styleAvoid");
  const pullApart = canPullApart && random.fraction() < (shape.pullApartChance ?? 0);
  return { plan, pullApartSlot: pullApart ? target : null };
}

export const drawPlan = (
  seed: string,
  shape: DifficultyShape,
  neverTogether: GameData["kindsNeverTogether"],
): PlannedType[] => planFor(seed, shape, neverTogether).plan;

function fillOrder(
  plan: readonly DirectionType[],
  pairSlots: readonly number[],
  pullApartSlot: number | null,
): number[] {
  const order = plan.map((_, slot) => slot).filter((slot) => !pairSlots.includes(slot));
  const avoid = plan.indexOf("styleAvoid");
  if (pullApartSlot !== null && pullApartSlot < avoid) {
    order.splice(order.indexOf(pullApartSlot), 1);
    order.splice(order.indexOf(avoid) + 1, 0, pullApartSlot);
  }
  return [...pairSlots, ...order];
}

const withSortedLists = (direction: Direction) =>
  JSON.stringify(direction, (_key, value: unknown) =>
    Array.isArray(value) ? [...(value as string[])].sort() : value,
  );

const sameDirection = (a: Direction, b: Direction) => withSortedLists(a) === withSortedLists(b);

export function drawDirection({
  seed,
  plan,
  slot,
  rerollCount,
  others,
  pairs,
  pairedItemChance,
  allowedPair,
  pullApartSlot,
  ignoreTheme,
  replacing,
  data,
}: DrawInput): Direction | null {
  const type = plan[slot];
  if (type === undefined) throw new RangeError(`slot ${slot} is not in the plan`);
  const random = randomFromSeed(deriveSeed(seed, "direction", slot, rerollCount));
  const towards =
    slot === pullApartSlot
      ? others.find((d): d is Extract<Direction, { type: "styleAvoid" }> => d.type === "styleAvoid")
          ?.tags[0]
      : undefined;
  const leanings = leaningsFor(data, ignoreTheme ? undefined : themeFor(seed, data));
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const candidate = drawCandidate(type, random, data, towards, leanings, pairedItemChance);
    if (replacing && sameDirection(candidate, replacing)) continue;
    if (!conflictsWithAny(candidate, others, { data, pairs, allowedPair })) return candidate;
  }
  return null;
}

function drawChaosPair(seed: string, data: GameData): [StyleTag, StyleTag] | null {
  if (data.opposingPairs.length === 0) return null;
  const random = randomFromSeed(deriveSeed(seed, "pair"));
  const [first, second] = data.opposingPairs[random.between(0, data.opposingPairs.length - 1)];
  return random.between(0, 1) === 0 ? [first, second] : [second, first];
}

function pairSlotsIn(plan: readonly DirectionType[]): [number, number] | null {
  const styleSlots = plan.flatMap((type, slot) => (type === "style" ? [slot] : []));
  return styleSlots.length >= 2 ? [styleSlots[0], styleSlots[1]] : null;
}

export function generate(
  { seed, difficulty, modifiers, dataVersion }: GenerateInput,
  data: GameData | undefined = dataVersions[dataVersion],
): Challenge {
  if (!data) throw new RangeError(`unknown data version ${dataVersion}`);
  for (const modifier of modifiers) {
    if (!MODIFIERS.includes(modifier)) throw new RangeError(`unknown modifier ${modifier}`);
  }
  if (new Set(modifiers).size !== modifiers.length) {
    throw new RangeError("a modifier can only be used once");
  }
  const burlap = modifiers.includes("burlap");
  const shape = burlap ? burlapShapeFor(data, difficulty) : shapeFor(data, difficulty);
  const planned = planFor(seed, shape, data.kindsNeverTogether);
  const plan: DirectionType[] = burlap ? ["burlapOnly", ...planned.plan] : planned.plan;
  const pullApartSlot =
    burlap && planned.pullApartSlot !== null ? planned.pullApartSlot + 1 : planned.pullApartSlot;
  const directions: (Direction | null | undefined)[] = plan.map(() => undefined);
  const chosenPair = shape.pairs === "oneStylePair" ? drawChaosPair(seed, data) : null;
  const pairSlots = chosenPair ? pairSlotsIn(plan) : null;
  const allowedPair = pairSlots && chosenPair ? chosenPair : undefined;
  if (pairSlots && chosenPair) {
    directions[pairSlots[0]] = { type: "style", tag: chosenPair[0] };
    directions[pairSlots[1]] = { type: "style", tag: chosenPair[1] };
  }
  if (burlap) directions[0] = { type: "burlapOnly" };
  for (const slot of fillOrder(plan, pairSlots ?? [], pullApartSlot)) {
    if (directions[slot] !== undefined) continue;
    const placed = directions.filter((direction) => direction != null);
    directions[slot] = drawDirection({
      seed,
      plan,
      slot,
      rerollCount: 0,
      others: placed,
      pairs: shape.pairs,
      pairedItemChance: shape.pairedItemChance,
      allowedPair,
      pullApartSlot,
      ignoreTheme: shape.ignoreTheme,
      data,
    });
  }
  return {
    seed,
    difficulty,
    modifiers: [...modifiers],
    dataVersion,
    themeId: themeFor(seed, data).id,
    plan,
    history: [],
    directions: directions.map((direction) => direction ?? null),
    pairSlots,
    pullApartSlot,
  };
}
