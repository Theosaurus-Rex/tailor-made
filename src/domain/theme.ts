import type { Theme } from "@/game/briefs/v1/themes";
import type { AccessoryType, Colour, FabricType, GameData, StyleTag } from "@/game/data/v1";
import { deriveSeed, randomFromSeed } from "./random";

export interface Leanings {
  tag(tag: StyleTag, avoid: boolean): number;
  fabric(fabric: FabricType, avoid: boolean): number;
  colour(colour: Colour, avoid: boolean): number;
  accessory(accessory: AccessoryType, avoid: boolean): number;
}

export const themeFor = (seed: string, data: GameData): Theme =>
  randomFromSeed(deriveSeed(seed, "theme")).pick(data.themes);

export function leaningsFor(data: GameData, theme: Theme | undefined): Leanings {
  if (!theme) {
    return {
      tag: (tag) => data.tagWeights[tag],
      fabric: () => 1,
      colour: () => 1,
      accessory: () => 1,
    };
  }
  const { tag: tagBoost, item: itemBoost, avoid: avoidWeight } = data.themeBoosts;
  const favouredFabrics: readonly FabricType[] = theme.favouredFabrics ?? [];
  const favouredAccessories: readonly AccessoryType[] = theme.favouredAccessories ?? [];
  const tagFavoured = (tag: StyleTag) => theme.favouredTags.includes(tag);
  const anyFavoured = (tags: readonly StyleTag[]) => tags.some(tagFavoured);
  const itemWeight = (favoured: boolean, avoid: boolean) =>
    favoured ? (avoid ? avoidWeight : 1 + itemBoost) : 1;
  return {
    tag: (tag, avoid) => {
      if (!tagFavoured(tag)) return data.tagWeights[tag];
      return avoid ? avoidWeight : data.tagWeights[tag] * tagBoost;
    },
    fabric: (fabric, avoid) =>
      itemWeight(
        favouredFabrics.includes(fabric) || anyFavoured(data.fabrics[fabric].leansTowards),
        avoid,
      ),
    colour: (colour, avoid) =>
      itemWeight(
        theme.favouredColours.includes(colour) || anyFavoured(data.colourLeanings[colour] ?? []),
        avoid,
      ),
    accessory: (accessory, avoid) =>
      itemWeight(
        favouredAccessories.includes(accessory) ||
          anyFavoured(data.accessories[accessory].leansTowards),
        avoid,
      ),
  };
}
