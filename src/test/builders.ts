import type { Challenge, Modifier } from "@/domain/challenge";
import type { Difficulty } from "@/domain/difficulty";
import { generate } from "@/domain/generate";
import { LATEST_DATA_VERSION } from "@/game/data";

export function challengeFor({
  seed = "k7m2qx9a",
  difficulty = "medium",
  modifiers = [],
}: {
  seed?: string;
  difficulty?: Difficulty;
  modifiers?: readonly Modifier[];
} = {}): Challenge {
  return generate({ seed, difficulty, modifiers, dataVersion: LATEST_DATA_VERSION });
}
