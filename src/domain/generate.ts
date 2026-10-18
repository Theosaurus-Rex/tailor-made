import { dataVersions } from "@/game/data";
import type { GameData } from "@/game/data/v1";
import type { Challenge, Modifier } from "./challenge";
import { conflictsWithAny } from "./contradictions";
import { shapeFor, type Difficulty, type DifficultyShape, type PlannedType } from "./difficulty";
import {
  COUNT_RANGE,
  FABRICS_MIN_RANGE,
  ONLY_LIST_SIZE,
  type Direction,
  type GeneralFabric,
  type PerPieceAccessory,
} from "./direction";
import { deriveSeed, randomFromSeed, weightedPick, type Random } from "./random";

export const MAX_TRIES = 25;

export interface GenerateInput {
  seed: string;
  difficulty: Difficulty;
  modifiers: readonly Modifier[];
  dataVersion: number;
}

export interface DrawInput {
  seed: string;
  plan: readonly PlannedType[];
  slot: number;
  rerollCount: number;
  others: readonly Direction[];
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

function drawCandidate(
  type: PlannedType,
  random: Random,
  data: GameData,
  others: readonly Direction[],
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
    case "style":
    case "styleAvoid":
      return { type, tag: tag() };
    case "fabric":
      return { type, fabric: random.pick(onlyFabrics ?? generalFabrics) };
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

export function drawPlan(
  seed: string,
  shape: DifficultyShape,
  neverTogether: GameData["kindsNeverTogether"],
): PlannedType[] {
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
  return plan;
}

export function drawDirection({
  seed,
  plan,
  slot,
  rerollCount,
  others,
  data,
}: DrawInput): Direction | null {
  const type = plan[slot];
  if (type === undefined) throw new RangeError(`slot ${slot} is not in the plan`);
  const random = randomFromSeed(deriveSeed(seed, "direction", slot, rerollCount));
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const candidate = drawCandidate(type, random, data, others);
    if (!conflictsWithAny(candidate, others, { data })) return candidate;
  }
  return null;
}

export function generate(
  { seed, difficulty, modifiers, dataVersion }: GenerateInput,
  data: GameData | undefined = dataVersions[dataVersion],
): Challenge {
  if (!data) throw new RangeError(`unknown data version ${dataVersion}`);
  if (modifiers.includes("burlap"))
    throw new RangeError("the burlap modifier is not supported yet");
  const plan = drawPlan(seed, shapeFor(data, difficulty), data.kindsNeverTogether);
  const directions: (Direction | null)[] = [];
  plan.forEach((_, slot) => {
    const placed = directions.filter((direction) => direction !== null);
    directions.push(drawDirection({ seed, plan, slot, rerollCount: 0, others: placed, data }));
  });
  return {
    seed,
    difficulty,
    modifiers: [...modifiers],
    dataVersion,
    plan,
    history: [],
    directions,
  };
}
