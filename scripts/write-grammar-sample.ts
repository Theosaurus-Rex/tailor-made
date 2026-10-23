import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { fillBrief } from "../src/domain/brief";
import { cardFor } from "../src/domain/card";
import { clientFromSeed } from "../src/domain/client";
import type { Difficulty } from "../src/domain/difficulty";
import { generate } from "../src/domain/generate";
import { deriveSeed } from "../src/domain/random";
import { SEED_ALPHABET, SEED_LENGTH } from "../src/domain/seed";
import { personalities } from "../src/game/briefs/v1/personalities";
import { dataV1 } from "../src/game/data/v1";

const difficulties: Difficulty[] = ["easy", "medium", "hard", "chaos"];
const PLAIN_PER_DIFFICULTY = 50;
const BURLAP_PER_DIFFICULTY = 15;
const MIN_PER_THEME_AND_VOICE = 5;

const seedAt = (index: number) =>
  Array.from(deriveSeed("grammar", index).slice(0, SEED_LENGTH))
    .map((char) => SEED_ALPHABET[parseInt(char, 36) % SEED_ALPHABET.length])
    .join("");

interface Entry {
  seed: string;
  difficulty: Difficulty;
  burlap: boolean;
}

function buildCard({ seed, difficulty, burlap }: Entry) {
  const challenge = generate({
    seed,
    difficulty,
    modifiers: burlap ? ["burlap"] : [],
    dataVersion: 1,
  });
  return {
    challenge,
    card: cardFor(challenge),
    voice: clientFromSeed(seed).personality,
  };
}

const entries: Entry[] = [];
let next = 0;

for (const difficulty of difficulties) {
  for (let i = 0; i < PLAIN_PER_DIFFICULTY; i++) {
    entries.push({ seed: seedAt(next++), difficulty, burlap: false });
  }
  for (let i = 0; i < BURLAP_PER_DIFFICULTY; i++) {
    entries.push({ seed: seedAt(next++), difficulty, burlap: true });
  }
}

const themeCounts = new Map<string, number>(dataV1.themes.map(({ id }) => [id, 0]));
const voiceCounts = new Map<string, number>(personalities.map((voice) => [voice, 0]));
const built = new Map<Entry, ReturnType<typeof buildCard>>();

function add(entry: Entry) {
  const result = buildCard(entry);
  built.set(entry, result);
  themeCounts.set(result.challenge.themeId, (themeCounts.get(result.challenge.themeId) ?? 0) + 1);
  voiceCounts.set(result.voice, (voiceCounts.get(result.voice) ?? 0) + 1);
}

entries.forEach(add);
const underFilled = () =>
  [...themeCounts.values(), ...voiceCounts.values()].some((n) => n < MIN_PER_THEME_AND_VOICE);
while (underFilled()) {
  const entry: Entry = { seed: seedAt(next++), difficulty: "medium", burlap: false };
  entries.push(entry);
  add(entry);
}

const lines: string[] = [
  "# Grammar sample",
  "",
  "Written by `pnpm grammar:sample`. Read it as a player would, and fix anything that reads wrong in the content.",
  "",
  "## Counts",
  "",
];
for (const difficulty of difficulties) {
  const plain = entries.filter((e) => e.difficulty === difficulty && !e.burlap).length;
  const burlap = entries.filter((e) => e.difficulty === difficulty && e.burlap).length;
  lines.push(`- ${difficulty}: ${plain} without Burlap, ${burlap} with Burlap`);
}
lines.push("", "Cards per theme:", "");
for (const [id, n] of themeCounts) lines.push(`- ${id}: ${n}`);
lines.push("", "Cards per voice:", "");
for (const [voice, n] of voiceCounts) lines.push(`- ${voice}: ${n}`);

lines.push("", "## Cards");
for (const entry of entries) {
  const { challenge, card, voice } = built.get(entry)!;
  lines.push(
    "",
    `### ${entry.seed} · ${entry.difficulty} · Burlap ${entry.burlap ? "on" : "off"} · ${challenge.themeId} · ${voice}`,
    "",
    `${card.client.name} · ${card.occasion}`,
    "",
    card.brief,
    "",
  );
  for (const row of card.rows) {
    lines.push(`- ${row.shortLine}${row.clientLine ? ` — ${row.clientLine}` : ""}`);
  }
}

lines.push(
  "",
  "## Every template",
  "",
  "Each brief template filled with each of its theme’s occasions, using the first adjective and first worry.",
);
for (const theme of dataV1.themes) {
  lines.push("", `### ${theme.id}`, "");
  theme.templates.forEach((template, t) => {
    lines.push(`Template ${t + 1}`, "");
    for (const occasion of theme.occasions) {
      lines.push(
        `- ${fillBrief(template, {
          name: "Cecily",
          occasion,
          adjective: theme.adjectives[0],
          worry: theme.worries[0],
        })}`,
      );
    }
    lines.push("");
  });
}

const target = fileURLToPath(new URL("../docs/notes/grammar-sample.md", import.meta.url));
mkdirSync(fileURLToPath(new URL("../docs/notes", import.meta.url)), { recursive: true });
writeFileSync(
  target,
  lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n",
);
console.log(`wrote ${target}`);
