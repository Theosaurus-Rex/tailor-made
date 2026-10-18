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
  type Direction,
  type DirectionType,
  type GeneralFabric,
  type PerPieceAccessory,
} from "./direction";
import { deriveSeed, randomFromSeed, weightedPick, type Random } from "./random";

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
  allowedPair?: readonly [StyleTag, StyleTag];
  pullApartSlot?: number | null;
  data: GameData;
}

// The order of draws below is frozen for data version 1. Changing it moves every challenge.
function someOf<T>(random: Random, items: readonly T[], count: number): T[] {
  const left = [...items];
  const chosen: T[] = [];
  for (let i = 0; i < count; i++) {
    const [item] = left.splice(random.between(0, left.length - 1), 1);
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
  others: readonly Direction[],
  towards: StyleTag | undefined,
): Direction {
  const onlyColours = others.find((d) => d.type === "colourOnly")?.colours;
  const onlyFabrics = others.find((d) => d.type === "fabricsOnly")?.fabrics;
  const generalFabrics = data.fabricTypes.filter(
    (fabric) => !data.fabrics[fabric].modifierOnly,
  ) as GeneralFabric[];
  const perPiece = data.accessoryTypes.filter(
    (accessory) => data.accessories[accessory].unit === "piece",
  ) as PerPieceAccessory[];
  const tag = () =>
    weightedPick(
      random,
      data.styleTags.map((value) => ({ value, weight: data.tagWeights[value] })),
    );
  const onlyCount = () => random.between(ONLY_LIST_SIZE.min, ONLY_LIST_SIZE.max);
  switch (type) {
    case "burlapOnly":
      return { type };
    case "style":
    case "styleAvoid":
      return { type, tag: tag() };
    case "fabric":
      return {
        type,
        fabric: random.pick(
          leaning(onlyFabrics ?? generalFabrics, towards, (f) => data.fabrics[f].leansTowards),
        ),
      };
    case "fabricAvoid":
      return { type, fabric: random.pick(generalFabrics) };
    case "fabricsOnly":
      return { type, fabrics: someOf(random, generalFabrics, onlyCount()) };
    case "fabricsMin":
    case "coloursMin":
      return { type, count: random.between(FABRICS_MIN_RANGE.min, FABRICS_MIN_RANGE.max) };
    case "colour":
      return { type, colour: random.pick(onlyColours ?? data.colours) };
    case "colourAvoid":
      return { type, colour: random.pick(data.colours) };
    case "colourOnly":
      return { type, colours: someOf(random, data.colours, onlyCount()) };
    case "accessory":
      return {
        type,
        accessory: random.pick(
          leaning(data.accessoryTypes, towards, (a) => data.accessories[a].leansTowards),
        ),
      };
    case "accessoryAvoid":
      return { type, accessory: random.pick(data.accessoryTypes) };
    case "accessoryMin":
    case "accessoryExact":
      return {
        type,
        accessory: random.pick(perPiece),
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

export function drawDirection({
  seed,
  plan,
  slot,
  rerollCount,
  others,
  pairs,
  allowedPair,
  pullApartSlot,
  data,
}: DrawInput): Direction | null {
  const type = plan[slot];
  if (type === undefined) throw new RangeError(`slot ${slot} is not in the plan`);
  const random = randomFromSeed(deriveSeed(seed, "direction", slot, rerollCount));
  const towards =
    slot === pullApartSlot
      ? others.find((d): d is Extract<Direction, { type: "styleAvoid" }> => d.type === "styleAvoid")
          ?.tag
      : undefined;
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const candidate = drawCandidate(type, random, data, others, towards);
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
      allowedPair,
      pullApartSlot,
      data,
    });
  }
  return {
    seed,
    difficulty,
    modifiers: [...modifiers],
    dataVersion,
    plan,
    history: [],
    directions: directions.map((direction) => direction ?? null),
    pairSlots,
    pullApartSlot,
  };
}
