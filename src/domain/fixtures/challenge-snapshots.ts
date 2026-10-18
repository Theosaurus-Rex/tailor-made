import { dataV1 } from "@/game/data/v1";
import { briefFor } from "../brief";
import { rerollCountOf } from "../challenge";
import { clientFromSeed } from "../client";
import { clientLine, lineRandomFor } from "../client-line";
import type { Difficulty } from "../difficulty";
import { rebuild } from "../reroll";
import { shortLine } from "../short-line";

export interface SnapshotInput {
  seed: string;
  difficulty: Difficulty;
  burlap: boolean;
  history: number[];
}

const difficulties: Difficulty[] = ["easy", "medium", "hard", "chaos"];

const seeds = [
  "k7m2qx9a",
  "23456789",
  "zzzzzzzz",
  "hn4v8r2e",
  "b9c5d3fg",
  "m3p7t6w2",
  "q8s4j2xy",
  "w5e9a7kn",
  "r2d6h8cu",
  "x4g3b9vm",
  "2026-10-16",
  "2026-12-31",
  "2028-02-29",
];

const histories = [
  [0, 1, 0],
  [2, 1, 2],
  [1, 0, 1, 0],
];

export const snapshotInputs: SnapshotInput[] = [
  ...seeds.flatMap((seed) =>
    difficulties.flatMap((difficulty) =>
      [false, true].map((burlap) => ({ seed, difficulty, burlap, history: [] })),
    ),
  ),
  ...(["medium", "hard"] as const).flatMap((difficulty) =>
    histories.map((history, i) => ({ seed: seeds[i], difficulty, burlap: false, history })),
  ),
];

export function snapshotEntry(input: SnapshotInput) {
  const challenge = rebuild({
    seed: input.seed,
    difficulty: input.difficulty,
    modifiers: input.burlap ? ["burlap"] : [],
    dataVersion: dataV1.version,
    history: input.history,
  });
  const client = clientFromSeed(input.seed);
  const lines = challenge.directions.map((direction, slot) => ({
    short: direction && shortLine(direction),
    client:
      direction &&
      clientLine(
        direction,
        client.personality,
        lineRandomFor(input.seed, slot, rerollCountOf(challenge, slot)),
      ),
  }));
  return { input, challenge, client, brief: briefFor(challenge, client), lines };
}

export const buildSnapshots = () =>
  JSON.parse(JSON.stringify(snapshotInputs.map(snapshotEntry))) as unknown;
