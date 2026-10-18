import type { Difficulty, PlannedType } from "./difficulty";
import type { Direction } from "./direction";

export type Modifier = "burlap";

// plan and directions have one entry per slot. A null direction is a slot that
// could not be filled.
export interface Challenge {
  seed: string;
  difficulty: Difficulty;
  modifiers: readonly Modifier[];
  dataVersion: number;
  plan: PlannedType[];
  history: number[];
  directions: (Direction | null)[];
  pairSlots: [number, number] | null;
  pullApartSlot: number | null;
}

export const placedDirections = (challenge: Challenge): Direction[] =>
  challenge.directions.filter((direction) => direction !== null);

export const rerollCountOf = (challenge: Challenge, slot: number): number =>
  challenge.history.filter((rerolled) => rerolled === slot).length;
