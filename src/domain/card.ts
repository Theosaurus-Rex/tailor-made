import { dataVersions } from "@/game/data";
import type { GameData } from "@/game/data/v1";
import { briefPartsFor } from "./brief";
import { rerollCountOf, type Challenge } from "./challenge";
import { clientFromSeed } from "./client";
import { clientLine, lineRandomFor } from "./client-line";
import type { Direction } from "./direction";
import { shortLine } from "./short-line";

export interface CardRow {
  slot: number;
  direction: Direction;
  shortLine: string;
  clientLine?: string;
  isModifier: boolean;
}

export interface Card {
  client: { name: string; initials: string; human: boolean; kind?: string };
  occasion: string;
  brief: string;
  rows: CardRow[];
}

const TITLES = new Set([
  "lady",
  "sir",
  "dame",
  "miss",
  "mrs",
  "madame",
  "lord",
  "captain",
  "professor",
  "baroness",
  "duchess",
  "grandmother",
  "old",
  "the",
]);

export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const named = words.filter((word) => !TITLES.has(word.toLowerCase()));
  return (named.length > 0 ? named : words.slice(0, 1))
    .slice(-2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function cardFor(
  challenge: Challenge,
  data: GameData | undefined = dataVersions[challenge.dataVersion],
): Card {
  const client = clientFromSeed(challenge.seed);
  const { text, occasion } = briefPartsFor(challenge, client, data);
  const rows = challenge.directions.flatMap((direction, slot): CardRow[] =>
    direction
      ? [
          {
            slot,
            direction,
            shortLine: shortLine(direction),
            clientLine: clientLine(
              direction,
              client.personality,
              lineRandomFor(challenge.seed, slot, rerollCountOf(challenge, slot)),
            ),
            isModifier: direction.type === "burlapOnly",
          },
        ]
      : [],
  );
  return {
    client: {
      name: client.name,
      initials: initialsOf(client.name),
      human: client.human,
      kind: client.kind,
    },
    occasion: occasion.replace(/^(a|an|the) /i, ""),
    brief: text,
    rows,
  };
}
