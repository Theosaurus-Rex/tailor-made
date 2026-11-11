import { accessoryNouns } from "@/game/briefs/v1/words";
import type { AccessoryType } from "@/game/data/v1";

export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const joinList = (items: readonly string[], joiner: string) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${joiner} ${items.at(-1)}`;

export const joinWithAnd = (items: readonly string[]) => joinList(items, "and");

export const joinWithOr = (items: readonly string[]) => joinList(items, "or");

export const countedNoun = (accessory: AccessoryType, count: number) =>
  count === 1 ? accessoryNouns[accessory].singular : accessoryNouns[accessory].plural;
