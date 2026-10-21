import type { Card } from "./card";

export function challengeAsText(card: Card, link: string): string {
  const occasion = card.occasion.charAt(0).toUpperCase() + card.occasion.slice(1);
  const list = card.rows.map((row) => `- ${row.shortLine}`);
  return [`${card.client.name} · ${occasion}`, `"${card.brief}"`, "", ...list, "", link].join("\n");
}
