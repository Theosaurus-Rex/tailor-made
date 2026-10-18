import { dataVersions } from "@/game/data";
import type { GameData } from "@/game/data/v1";
import { rerollCountOf, type Challenge } from "./challenge";
import type { Direction } from "./direction";
import { burlapShapeFor, shapeFor } from "./difficulty";
import { drawDirection, generate, type GenerateInput } from "./generate";

export function reroll(
  challenge: Challenge,
  slot: number,
  data: GameData | undefined = dataVersions[challenge.dataVersion],
): Challenge {
  if (!data) throw new RangeError(`unknown data version ${challenge.dataVersion}`);
  if (challenge.difficulty === "chaos") throw new Error("chaos cards cannot be rerolled");
  if (!Number.isInteger(slot) || slot < 0 || slot >= challenge.plan.length) {
    throw new RangeError(`slot ${slot} is not in the plan`);
  }
  if (challenge.directions[slot]?.type === "burlapOnly") {
    throw new Error("burlap only cannot be rerolled");
  }
  const others = challenge.directions.filter(
    (direction, i): direction is Direction => i !== slot && direction !== null,
  );
  const redrawn = drawDirection({
    seed: challenge.seed,
    plan: challenge.plan,
    slot,
    rerollCount: rerollCountOf(challenge, slot) + 1,
    others,
    pairs: (challenge.modifiers.includes("burlap") ? burlapShapeFor : shapeFor)(
      data,
      challenge.difficulty,
    ).pairs,
    pullApartSlot: challenge.pullApartSlot,
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
    if (!Number.isInteger(slot) || slot < 0 || slot >= start.plan.length) {
      throw new RangeError(`reroll ${slot} is not a slot in the plan`);
    }
  }
  return history.reduce((challenge, slot) => reroll(challenge, slot, data), start);
}
