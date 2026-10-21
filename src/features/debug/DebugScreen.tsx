import { useState } from "react";

import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { briefFor } from "@/domain/brief";
import { cardFor } from "@/domain/card";
import { rerollCountOf, type Challenge } from "@/domain/challenge";
import { clientFromSeed } from "@/domain/client";
import { clientLine, lineRandomFor } from "@/domain/client-line";
import type { Difficulty } from "@/domain/difficulty";
import { generate } from "@/domain/generate";
import { reroll } from "@/domain/reroll";
import { deriveSeed } from "@/domain/random";
import { isValidSeed, SEED_ALPHABET, SEED_LENGTH } from "@/domain/seed";
import { shortLine } from "@/domain/short-line";
import { newSeed } from "@/lib/new-seed";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard", "chaos"];
const BATCH_SIZE = 50;
const START_SEED = "k7m2qx9a";

const batchSeed = (start: number, index: number) =>
  Array.from(deriveSeed("debug-batch", start + index).slice(0, SEED_LENGTH))
    .map((char) => SEED_ALPHABET[parseInt(char, 36) % SEED_ALPHABET.length])
    .join("");

const generateFor = (seed: string, difficulty: Difficulty = "medium", burlap = false): Challenge =>
  generate({ seed, difficulty, modifiers: burlap ? ["burlap"] : [], dataVersion: 1 });

const describeError = (error: unknown) => (error instanceof Error ? error.message : String(error));

function SingleView({
  seed,
  difficulty,
  burlap,
}: {
  seed: string;
  difficulty: Difficulty;
  burlap: boolean;
}) {
  const [rerolls, setRerolls] = useState<number[]>([]);
  let challenge: Challenge;
  try {
    challenge = rerolls.reduce(
      (current, slot) => reroll(current, slot),
      generateFor(seed, difficulty, burlap),
    );
  } catch (error) {
    return <p role="alert">Could not generate: {describeError(error)}</p>;
  }
  const client = clientFromSeed(seed);
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-[660px]">
        <ClientCard
          card={cardFor(challenge)}
          onReroll={
            difficulty === "chaos"
              ? undefined
              : (slot) => setRerolls((current) => [...current, slot])
          }
          justRerolledSlot={rerolls.at(-1)}
        />
      </div>
      <p>Brief: {briefFor(challenge, client)}</p>
      <p>
        Client: {client.name}, personality {client.personality}
        {client.kind ? `, kind ${client.kind}` : ""}
      </p>
      <ol className="list-decimal space-y-2 pl-6">
        {challenge.directions.map((direction, slot) => (
          <li key={slot}>
            <div>Planned: {challenge.plan[slot]}</div>
            {direction ? (
              <>
                <div>Short line: {shortLine(direction)}</div>
                <div>
                  Client line:{" "}
                  {clientLine(
                    direction,
                    client.personality,
                    lineRandomFor(seed, slot, rerollCountOf(challenge, slot)),
                  )}
                </div>
              </>
            ) : (
              <div>(empty slot)</div>
            )}
          </li>
        ))}
      </ol>
      <pre className="overflow-x-auto rounded border p-2 text-xs">
        {JSON.stringify(challenge, null, 2)}
      </pre>
    </div>
  );
}

function batchRow(seed: string) {
  try {
    const lines = generateFor(seed).directions.map((direction) =>
      direction ? shortLine(direction) : "(empty slot)",
    );
    const { name, personality } = clientFromSeed(seed);
    return { name, personality, lines: lines.join(" / ") };
  } catch (error) {
    return { name: "", personality: "", lines: `Error: ${describeError(error)}` };
  }
}

function BatchView({ start, onPick }: { start: number; onPick: (seed: string) => void }) {
  const seeds = Array.from({ length: BATCH_SIZE }, (_, index) => batchSeed(start, index));
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr>
          <th scope="col">Seed</th>
          <th scope="col">Client</th>
          <th scope="col">Personality</th>
          <th scope="col">Short lines</th>
        </tr>
      </thead>
      <tbody>
        {seeds.map((seed) => {
          const row = batchRow(seed);
          return (
            <tr key={seed} className="border-t">
              <td>
                <Button variant="link" size="sm" onClick={() => onPick(seed)}>
                  {seed}
                </Button>
              </td>
              <td>{row.name}</td>
              <td>{row.personality}</td>
              <td>{row.lines}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function DebugScreen() {
  const [seed, setSeed] = useState(START_SEED);
  const [batchStart, setBatchStart] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [burlap, setBurlap] = useState(false);

  return (
    <main className="space-y-6 p-4">
      <h1 className="text-xl font-semibold">Generator debug</h1>
      <section aria-labelledby="single-heading" className="space-y-3">
        <h2 id="single-heading" className="font-semibold">
          Single seed
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Seed
            <input
              className="rounded border px-2 py-1"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Difficulty
            <select
              className="rounded border bg-ground px-2 py-1"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={burlap} onChange={(e) => setBurlap(e.target.checked)} />
            Burlap only
          </label>
          <Button onClick={() => setSeed(newSeed())}>Random seed</Button>
        </div>
        {isValidSeed(seed) ? (
          <SingleView
            key={`${seed}-${difficulty}-${burlap}`}
            seed={seed}
            difficulty={difficulty}
            burlap={burlap}
          />
        ) : (
          <p role="alert">That is not a valid seed.</p>
        )}
      </section>
      <section aria-labelledby="batch-heading" className="space-y-3">
        <h2 id="batch-heading" className="font-semibold">
          Batch
        </h2>
        <label className="flex flex-col gap-1 text-sm">
          Batch start
          <input
            type="number"
            className="w-32 rounded border px-2 py-1"
            value={batchStart}
            onChange={(event) => setBatchStart(Number(event.target.value) || 0)}
          />
        </label>
        <BatchView start={batchStart} onPick={setSeed} />
      </section>
    </main>
  );
}
