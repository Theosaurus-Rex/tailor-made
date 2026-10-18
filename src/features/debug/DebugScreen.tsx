import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Challenge } from "@/domain/challenge";
import { clientFromSeed } from "@/domain/client";
import { clientLine, lineRandomFor } from "@/domain/client-line";
import { generate } from "@/domain/generate";
import { deriveSeed } from "@/domain/random";
import { isValidSeed, SEED_ALPHABET, SEED_LENGTH } from "@/domain/seed";
import { shortLine } from "@/domain/short-line";
import { newSeed } from "@/lib/new-seed";

const BATCH_SIZE = 50;
const START_SEED = "k7m2qx9a";

const rerollCountOf = (challenge: Challenge, slot: number) => challenge.rerolls[slot] ?? 0;

const batchSeed = (start: number, index: number) =>
  Array.from(deriveSeed("debug-batch", start + index).slice(0, SEED_LENGTH))
    .map((char) => SEED_ALPHABET[parseInt(char, 36) % SEED_ALPHABET.length])
    .join("");

const generateFor = (seed: string): Challenge =>
  generate({ seed, difficulty: "medium", modifiers: [], dataVersion: 1 });

const describeError = (error: unknown) => (error instanceof Error ? error.message : String(error));

function SingleView({ seed }: { seed: string }) {
  let challenge: Challenge;
  try {
    challenge = generateFor(seed);
  } catch (error) {
    return <p role="alert">Could not generate: {describeError(error)}</p>;
  }
  const client = clientFromSeed(seed);
  return (
    <div className="space-y-4">
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

  return (
    <main className="space-y-6 p-4">
      <h1 className="text-xl font-semibold">Generator debug</h1>
      <section aria-labelledby="single-heading" className="space-y-3">
        <h2 id="single-heading" className="font-semibold">
          Single seed (medium)
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
          <Button onClick={() => setSeed(newSeed())}>Random seed</Button>
        </div>
        {isValidSeed(seed) ? (
          <SingleView seed={seed} />
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
