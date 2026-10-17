import { accessoryNouns, fabricNouns, styleAvoidLines } from "@/game/briefs/v1/words";
import type { Direction, DirectionType } from "./direction";

type DirectionOf<T extends DirectionType> = Extract<Direction, { type: T }>;

type Writers = { [T in DirectionType]: (direction: DirectionOf<T>) => string };

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const joinList = (items: readonly string[], joiner: string) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${joiner} ${items.at(-1)}`;

export const joinWithAnd = (items: readonly string[]) => joinList(items, "and");

export const joinWithOr = (items: readonly string[]) => joinList(items, "or");

const countedNoun = (accessory: keyof typeof accessoryNouns, count: number) => {
  const noun = accessoryNouns[accessory];
  return count === 1 ? noun.singular : noun.plural;
};

const writers: Writers = {
  style: (d) => d.tag,
  styleAvoid: (d) => styleAvoidLines[d.tag] ?? `Not ${d.tag.toLowerCase()}`,
  fabric: (d) => d.fabric,
  fabricAvoid: (d) => `No ${fabricNouns[d.fabric]}`,
  burlapOnly: () => "Burlap only",
  fabricsOnly: (d) => `Only ${joinWithAnd(d.fabrics.map((fabric) => fabricNouns[fabric]))}`,
  fabricsMin: (d) => `At least ${d.count} fabrics`,
  colour: (d) => d.colour,
  colourAvoid: (d) => `No ${d.colour.toLowerCase()}`,
  colourOnly: (d) => `Only ${joinWithAnd(d.colours.map((colour) => colour.toLowerCase()))}`,
  accessory: (d) => capitalise(accessoryNouns[d.accessory].plural),
  accessoryAvoid: (d) => `No ${accessoryNouns[d.accessory].plural}`,
  accessoryMin: (d) => `At least ${d.count} ${countedNoun(d.accessory, d.count)}`,
  accessoryExact: (d) => `Exactly ${d.count} ${countedNoun(d.accessory, d.count)}`,
  coloursMin: (d) => `At least ${d.count} colours`,
};

export function shortLine(direction: Direction): string {
  const write = writers[direction.type] as (direction: Direction) => string;
  return write(direction);
}
