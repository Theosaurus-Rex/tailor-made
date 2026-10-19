import { dataVersions } from "@/game/data";
import type { GameData } from "@/game/data/v1";
import type { Challenge } from "./challenge";
import type { Client } from "./client";
import { deriveSeed, randomFromSeed } from "./random";

export interface BriefSlots {
  name: string;
  occasion: string;
  adjective: string;
  worry: string;
}

export function fillBrief(template: string, slots: BriefSlots): string {
  const filled = template.replace(/\{(\w+)\}/g, (slot, key: string) =>
    Object.hasOwn(slots, key) ? slots[key as keyof BriefSlots] : slot,
  );
  return filled.charAt(0).toUpperCase() + filled.slice(1);
}

export function briefFor(
  challenge: Challenge,
  client: Client,
  data: GameData | undefined = dataVersions[challenge.dataVersion],
): string {
  if (!data) throw new RangeError(`unknown data version ${challenge.dataVersion}`);
  const theme = data.themes.find(({ id }) => id === challenge.themeId);
  if (!theme) throw new RangeError(`unknown theme ${challenge.themeId}`);
  const random = randomFromSeed(deriveSeed(challenge.seed, "brief"));
  const template = random.pick(theme.templates);
  return fillBrief(template, {
    name: client.human ? client.name.split(" ")[0] : client.name,
    occasion: random.pick(theme.occasions),
    adjective: random.pick(theme.adjectives),
    worry: random.pick(theme.worries),
  });
}
