import type { DirectionType } from "./direction";

export type Difficulty = "easy" | "medium" | "hard" | "chaos";

export type PlannedType = Exclude<DirectionType, "burlapOnly">;

export interface DifficultyShape {
  directionCount: { min: number; max: number };
  types: readonly { type: PlannedType; weight: number }[];
  limits: readonly { types: readonly DirectionType[]; max: number }[];
}

export const AVOID_TYPES: readonly DirectionType[] = [
  "styleAvoid",
  "fabricAvoid",
  "colourAvoid",
  "accessoryAvoid",
];

export const AT_LEAST_TYPES: readonly DirectionType[] = [
  "accessoryMin",
  "coloursMin",
  "fabricsMin",
];

export const mediumShape: DifficultyShape = {
  directionCount: { min: 3, max: 4 },
  types: [
    { type: "style", weight: 4 },
    { type: "fabric", weight: 3 },
    { type: "colour", weight: 3 },
    { type: "accessory", weight: 2 },
    { type: "styleAvoid", weight: 1 },
    { type: "fabricAvoid", weight: 1 },
    { type: "colourAvoid", weight: 1 },
    { type: "accessoryAvoid", weight: 1 },
    { type: "accessoryMin", weight: 1 },
    { type: "coloursMin", weight: 1 },
    { type: "fabricsMin", weight: 1 },
  ],
  limits: [
    { types: AVOID_TYPES, max: 1 },
    { types: AT_LEAST_TYPES, max: 1 },
  ],
};

export const shapes = { medium: mediumShape } as const;
