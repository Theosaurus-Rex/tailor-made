import { dataFor } from "@/game/data";
import type { GameData } from "@/game/data/v1";
import { isSlotIn, rerollCountOf, type Challenge } from "./challenge";
import type { Direction } from "./direction";
import { burlapShapeFor, shapeFor } from "./difficulty";
import { drawDirection, generate, type GenerateInput } from "./generate";

export function reroll(
  challenge: Challenge,
  slot: number,
  data: GameData = dataFor(challenge.dataVersion),
): Challenge {
  if (challenge.difficulty === "chaos") throw new Error("chaos cards cannot be rerolled");
  if (!isSlotIn(challenge.plan, slot)) {
    throw new RangeError(`slot ${slot} is not in the plan`);
  }
  if (challenge.directions[slot]?.type === "burlapOnly") {
    throw new Error("burlap only cannot be rerolled");
  }
  const others = challenge.directions.filter(
    (direction, i): direction is Direction => i !== slot && direction !== null,
  );
  const shape = (challenge.modifiers.includes("burlap") ? burlapShapeFor : shapeFor)(
    data,
    challenge.difficulty,
  );
  const redrawn = drawDirection({
    seed: challenge.seed,
    plan: challenge.plan,
    slot,
    rerollCount: rerollCountOf(challenge, slot) + 1,
    others,
    pairs: shape.pairs,
    pairedItemChance: shape.pairedItemChance,
    pullApartSlot: challenge.pullApartSlot,
    ignoreTheme: shape.ignoreTheme,
    replacing: challenge.directions[slot],
    data,
  });
  return {
    ...challenge,
    history: [...challenge.history, slot],
    directions: challenge.directions.map((direction, i) => (i === slot ? redrawn : direction)),
  };
}

export function rebuild(
  input: GenerateInput & { history: readonly number[] },
  data?: GameData,
): Challenge {
  const { history, ...generateInput } = input;
  if (generateInput.difficulty === "chaos" && history.length > 0) {
    throw new RangeError("chaos cards cannot be rerolled, so their history must be empty");
  }
  const start = generate(generateInput, data);
  for (const slot of history) {
    if (!isSlotIn(start.plan, slot)) {
      throw new RangeError(`reroll ${slot} is not a slot in the plan`);
    }
  }
  return history.reduce((challenge, slot) => reroll(challenge, slot, data), start);
}
