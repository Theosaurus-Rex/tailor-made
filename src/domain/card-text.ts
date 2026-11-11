import type { Card } from "./card";
import { capitalise } from "./text";

export function challengeAsText(card: Card, link: string): string {
  const occasion = capitalise(card.occasion);
  const list = card.rows.map((row) => `- ${row.shortLine}`);
  return [`${card.client.name} · ${occasion}`, `“${card.brief}”`, "", ...list, "", link].join("\n");
}
