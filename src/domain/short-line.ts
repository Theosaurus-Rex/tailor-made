import {
  accessoryNouns,
  fabricNouns,
  shortTagWords,
  styleAvoidLines,
} from "@/game/briefs/v1/words";
import type { Direction, DirectionType } from "./direction";
import { capitalise, countedNoun, joinWithAnd, joinWithOr } from "./text";

type DirectionOf<T extends DirectionType> = Extract<Direction, { type: T }>;

type Writers = { [T in DirectionType]: (direction: DirectionOf<T>) => string };

const lowerAll = (items: readonly string[]) => items.map((item) => item.toLowerCase());

const writers: Writers = {
  style: (d) => d.tag,
  styleAvoid: (d) => {
    const [only] = d.tags;
    if (d.tags.length === 1 && only !== undefined) {
      return styleAvoidLines[only] ?? `Not ${only.toLowerCase()}`;
    }
    return `Not ${joinWithOr(d.tags.map((tag) => shortTagWords[tag] ?? tag.toLowerCase()))}`;
  },
  fabric: (d) => capitalise(joinWithAnd(lowerAll(d.fabrics))),
  fabricAvoid: (d) => `No ${joinWithOr(d.fabrics.map((fabric) => fabricNouns[fabric]))}`,
  burlapOnly: () => "Burlap only",
  fabricsOnly: (d) => `Only ${joinWithAnd(d.fabrics.map((fabric) => fabricNouns[fabric]))}`,
  fabricsMin: (d) => `At least ${d.count} fabrics`,
  colour: (d) => capitalise(joinWithAnd(lowerAll(d.colours))),
  colourAvoid: (d) => `No ${joinWithOr(lowerAll(d.colours))}`,
  colourOnly: (d) => `Only ${joinWithAnd(lowerAll(d.colours))}`,
  accessory: (d) =>
    capitalise(joinWithAnd(d.accessories.map((accessory) => accessoryNouns[accessory].plural))),
  accessoryAvoid: (d) =>
    `No ${joinWithOr(d.accessories.map((accessory) => accessoryNouns[accessory].plural))}`,
  accessoryMin: (d) => `At least ${d.count} ${countedNoun(d.accessory, d.count)}`,
  accessoryExact: (d) => `Exactly ${d.count} ${countedNoun(d.accessory, d.count)}`,
  coloursMin: (d) => `At least ${d.count} colours`,
};

export function shortLine(direction: Direction): string {
  const write = writers[direction.type] as (direction: Direction) => string;
  return write(direction);
}
