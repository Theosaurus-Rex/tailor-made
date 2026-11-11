import {
  atLeastCounts,
  avoids,
  difficultyNames,
  type DifficultyName,
  type DifficultyShape,
  type ShapeDirectionType,
} from "@/game/data/difficulty-shapes";
import type { GameData } from "@/game/data/v1";
import type { DirectionType } from "./direction";

export type Difficulty = DifficultyName;
export type { DifficultyShape };

export const isDifficulty = (value: string): value is Difficulty =>
  (difficultyNames as readonly string[]).includes(value);

export type PlannedType = Exclude<DirectionType, "burlapOnly">;

type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// Fails typecheck if a shape can name a type that is not a direction, or cannot name one that is.
export const shapeTypesMatchDirections: SameKeys<ShapeDirectionType, PlannedType> = true;

export const AVOID_TYPES: readonly DirectionType[] = avoids;

export const AT_LEAST_TYPES: readonly DirectionType[] = atLeastCounts;

export function shapeFor(data: GameData, difficulty: string): DifficultyShape {
  if (!Object.hasOwn(data.difficulties, difficulty)) {
    throw new RangeError(`unknown difficulty ${difficulty}`);
  }
  return data.difficulties[difficulty as Difficulty];
}

export function burlapShapeFor(data: GameData, difficulty: string): DifficultyShape {
  shapeFor(data, difficulty);
  return data.burlapDifficulties[difficulty as Difficulty];
}
