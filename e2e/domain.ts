import { cardFor } from "@/domain/card";
import { dailyChallenge } from "@/domain/daily";
import { readShareLink } from "@/links/share-link";

export const dailyCardFor = (date: string) => cardFor(dailyChallenge(date));

export function sharedCardFor(link: string) {
  const result = readShareLink(new URL(link, "http://localhost").search);
  if (!result.ok) throw new Error(`${link} is not a good link`);
  return cardFor(result.challenge);
}
