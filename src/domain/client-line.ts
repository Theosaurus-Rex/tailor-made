import {
  clientLines,
  type GenericClientLines,
  type SpecificClientLineKey,
} from "@/game/briefs/v1/client-lines";
import type { Personality } from "@/game/briefs/v1/personalities";
import { accessoryNouns, countWords, fabricNouns } from "@/game/briefs/v1/words";
import type { AccessoryType } from "@/game/data/v1";
import type { Direction, DirectionType } from "./direction";
import { deriveSeed, randomFromSeed, type Random } from "./random";
import { joinWithOr } from "./short-line";

type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// Fails typecheck if a direction type has no client lines, or lines exist for one that is not a direction.
export const genericKeysMatchDirections: SameKeys<
  keyof GenericClientLines,
  Exclude<DirectionType, "burlapOnly">
> = true;

type Slots = Record<string, string>;

const countedNoun = (accessory: AccessoryType, count: number) =>
  count === 1 ? accessoryNouns[accessory].singular : accessoryNouns[accessory].plural;

const countSlots = (count: number): Slots => ({
  count: String(count),
  countWord: countWords[count] ?? String(count),
});

function slotsFor(direction: Exclude<Direction, { type: "burlapOnly" }>): {
  specificKey?: SpecificClientLineKey;
  slots: Slots;
} {
  switch (direction.type) {
    case "style":
    case "styleAvoid":
      return {
        specificKey: `${direction.type}:${direction.tag}`,
        slots: { tag: direction.tag.toLowerCase() },
      };
    case "fabric":
    case "fabricAvoid":
      return {
        specificKey: `${direction.type}:${direction.fabric}`,
        slots: { fabric: fabricNouns[direction.fabric] },
      };
    case "fabricsOnly":
      return {
        slots: { list: joinWithOr(direction.fabrics.map((fabric) => fabricNouns[fabric])) },
      };
    case "fabricsMin":
    case "coloursMin":
      return { slots: countSlots(direction.count) };
    case "colour":
    case "colourAvoid":
      return {
        specificKey: `${direction.type}:${direction.colour}`,
        slots: { colour: direction.colour.toLowerCase() },
      };
    case "colourOnly":
      return {
        slots: { list: joinWithOr(direction.colours.map((colour) => colour.toLowerCase())) },
      };
    case "accessory":
    case "accessoryAvoid":
      return {
        specificKey: `${direction.type}:${direction.accessory}`,
        slots: { accessory: accessoryNouns[direction.accessory].plural },
      };
    case "accessoryMin":
    case "accessoryExact":
      return {
        specificKey: `${direction.type}:${direction.accessory}`,
        slots: {
          ...countSlots(direction.count),
          accessory: countedNoun(direction.accessory, direction.count),
        },
      };
  }
}

export function clientLine(
  direction: Direction,
  personality: Personality,
  random: Random,
): string | undefined {
  if (direction.type === "burlapOnly") return undefined;
  const { specificKey, slots } = slotsFor(direction);
  const { generic, specific } = clientLines[personality];
  const lines = (specificKey && specific[specificKey]) ?? generic[direction.type];
  const filled = random
    .pick(lines)
    .replace(/\{(\w+)\}/g, (slot: string, name: string) => slots[name] ?? slot);
  return filled.charAt(0).toUpperCase() + filled.slice(1);
}

export const lineRandomFor = (seed: string, slot: number, rerollCount: number): Random =>
  randomFromSeed(deriveSeed(seed, "line", slot, rerollCount));
