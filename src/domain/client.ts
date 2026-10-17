import { firstNames, nonHumanClients, surnames } from "@/game/briefs/v1/names";
import { personalities, type Personality } from "@/game/briefs/v1/personalities";
import { deriveSeed, randomFromSeed } from "./random";

export interface Client {
  name: string;
  human: boolean;
  kind?: string;
  personality: Personality;
}

const NON_HUMAN_SHARE = 0.1;

export function clientFromSeed(seed: string): Client {
  const personality = randomFromSeed(deriveSeed(seed, "personality")).pick(personalities);
  const random = randomFromSeed(deriveSeed(seed, "client"));
  if (random.fraction() < NON_HUMAN_SHARE) {
    const { name, kind } = random.pick(nonHumanClients);
    return { name, human: false, kind, personality };
  }
  return { name: `${random.pick(firstNames)} ${random.pick(surnames)}`, human: true, personality };
}
