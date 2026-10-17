import type { Difficulty, PlannedType } from "./difficulty";
import type { Direction } from "./direction";

export type Modifier = "burlap";

// plan, rerolls and directions all have one entry per slot. A null direction is a slot that
// could not be filled.
export interface Challenge {
  seed: string;
  difficulty: Difficulty;
  modifiers: readonly Modifier[];
  dataVersion: number;
  plan: PlannedType[];
  rerolls: number[];
  directions: (Direction | null)[];
}

export const placedDirections = (challenge: Challenge): Direction[] =>
  challenge.directions.filter((direction) => direction !== null);
