// How many directions each difficulty deals, and of which kinds. Versioned with the game data.

export type ShapeDirectionType =
  | "style"
  | "styleAvoid"
  | "fabric"
  | "fabricAvoid"
  | "fabricsOnly"
  | "fabricsMin"
  | "colour"
  | "colourAvoid"
  | "colourOnly"
  | "coloursMin"
  | "accessory"
  | "accessoryAvoid"
  | "accessoryMin"
  | "accessoryExact";

export type DifficultyName = "easy" | "medium" | "hard" | "chaos";

export type Weekday =
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export const dailyDifficultyByWeekday: Record<Weekday, DifficultyName> = {
  monday: "easy",
  tuesday: "medium",
  wednesday: "medium",
  thursday: "hard",
  friday: "hard",
  saturday: "hard",
  sunday: "chaos",
};

export type PairRule = "never" | "noBothStyles" | "oneStylePair";

export interface DifficultyShape {
  directionCount: { min: number; max: number };
  types: readonly { type: ShapeDirectionType; weight: number }[];
  limits: readonly { types: readonly ShapeDirectionType[]; min: number; max: number }[];
  pairs: PairRule;
  pullApartChance?: number;
}

const avoids = [
  "styleAvoid",
  "fabricAvoid",
  "colourAvoid",
  "accessoryAvoid",
] as const satisfies readonly ShapeDirectionType[];

const atLeastCounts = [
  "accessoryMin",
  "coloursMin",
  "fabricsMin",
] as const satisfies readonly ShapeDirectionType[];

const onlyLists = ["colourOnly", "fabricsOnly"] as const satisfies readonly ShapeDirectionType[];

const easyTypes = [
  { type: "style", weight: 4 },
  { type: "fabric", weight: 3 },
  { type: "colour", weight: 3 },
] as const satisfies DifficultyShape["types"];

const mediumTypes = [
  ...easyTypes,
  { type: "accessory", weight: 2 },
  { type: "styleAvoid", weight: 1 },
  { type: "fabricAvoid", weight: 1 },
  { type: "colourAvoid", weight: 1 },
  { type: "accessoryAvoid", weight: 1 },
  { type: "accessoryMin", weight: 1 },
  { type: "coloursMin", weight: 1 },
  { type: "fabricsMin", weight: 1 },
] as const satisfies DifficultyShape["types"];

const hardTypes = [
  ...mediumTypes,
  { type: "colourOnly", weight: 1 },
  { type: "fabricsOnly", weight: 1 },
] as const satisfies DifficultyShape["types"];

const chaosTypes = [
  ...hardTypes,
  { type: "accessoryExact", weight: 1 },
] as const satisfies DifficultyShape["types"];

export const difficultyShapes: Record<DifficultyName, DifficultyShape> = {
  easy: {
    directionCount: { min: 2, max: 3 },
    types: easyTypes,
    limits: [],
    pairs: "never",
  },
  medium: {
    directionCount: { min: 3, max: 4 },
    types: mediumTypes,
    limits: [
      { types: avoids, min: 1, max: 1 },
      { types: atLeastCounts, min: 1, max: 1 },
    ],
    pairs: "never",
  },
  hard: {
    directionCount: { min: 4, max: 5 },
    types: hardTypes,
    limits: [
      { types: avoids, min: 0, max: 2 },
      { types: atLeastCounts, min: 0, max: 2 },
      { types: onlyLists, min: 0, max: 1 },
    ],
    pairs: "noBothStyles",
    pullApartChance: 0.5,
  },
  chaos: {
    directionCount: { min: 5, max: 6 },
    types: chaosTypes,
    limits: [
      { types: avoids, min: 0, max: 2 },
      { types: [...atLeastCounts, "accessoryExact"], min: 0, max: 3 },
      { types: onlyLists, min: 1, max: 1 },
      { types: ["accessoryExact"], min: 1, max: 3 },
      { types: ["style"], min: 2, max: 4 },
    ],
    pairs: "oneStylePair",
  },
};

const burlapEasyTypes = [
  { type: "style", weight: 4 },
  { type: "accessory", weight: 4 },
] as const satisfies DifficultyShape["types"];

const burlapMediumTypes = [
  { type: "style", weight: 4 },
  { type: "accessory", weight: 6 },
  { type: "styleAvoid", weight: 1 },
  { type: "accessoryAvoid", weight: 2 },
  { type: "accessoryMin", weight: 3 },
] as const satisfies DifficultyShape["types"];

const burlapChaosTypes = [
  ...burlapMediumTypes,
  { type: "accessoryExact", weight: 3 },
] as const satisfies DifficultyShape["types"];

const burlapAvoids = [
  "styleAvoid",
  "accessoryAvoid",
] as const satisfies readonly ShapeDirectionType[];

// The Burlap only shapes: the normal ones without fabric and colour kinds, heavier on accessories.
export const burlapDifficultyShapes: Record<DifficultyName, DifficultyShape> = {
  easy: {
    directionCount: { min: 2, max: 3 },
    types: burlapEasyTypes,
    limits: [],
    pairs: "never",
  },
  medium: {
    directionCount: { min: 3, max: 4 },
    types: burlapMediumTypes,
    limits: [
      { types: burlapAvoids, min: 1, max: 1 },
      { types: ["accessoryMin"], min: 1, max: 1 },
    ],
    pairs: "never",
  },
  hard: {
    directionCount: { min: 4, max: 5 },
    types: burlapMediumTypes,
    limits: [
      { types: burlapAvoids, min: 0, max: 2 },
      { types: ["accessoryMin"], min: 0, max: 2 },
    ],
    pairs: "noBothStyles",
    pullApartChance: 0.5,
  },
  chaos: {
    directionCount: { min: 5, max: 6 },
    types: burlapChaosTypes,
    limits: [
      { types: burlapAvoids, min: 0, max: 2 },
      { types: ["accessoryMin", "accessoryExact"], min: 0, max: 3 },
      { types: ["accessoryExact"], min: 1, max: 3 },
      { types: ["style"], min: 2, max: 4 },
    ],
    pairs: "oneStylePair",
  },
};

export const kindsNeverTogether = [
  ["colourOnly", "colourAvoid"],
  ["colourOnly", "coloursMin"],
  ["fabricsOnly", "fabricAvoid"],
  ["fabricsOnly", "fabricsMin"],
  ["coloursMin", "coloursMin"],
  ["fabricsMin", "fabricsMin"],
] as const satisfies readonly (readonly [ShapeDirectionType, ShapeDirectionType])[];
