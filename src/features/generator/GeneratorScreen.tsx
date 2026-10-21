import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ClientCard } from "@/components/ClientCard";
import { Button } from "@/components/ui/button";
import { cardFor } from "@/domain/card";
import type { Challenge } from "@/domain/challenge";
import { shapeFor, type Difficulty } from "@/domain/difficulty";
import { generate } from "@/domain/generate";
import { LATEST_DATA_VERSION, latestData } from "@/game/data";
import { newSeed } from "@/lib/new-seed";

const DIFFICULTIES: readonly { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "chaos", label: "Chaos" },
];

const labelFor = (difficulty: Difficulty) =>
  DIFFICULTIES.find((option) => option.value === difficulty)?.label ?? difficulty;

function Dial({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}) {
  const { min, max } = shapeFor(latestData, value).directionCount;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="label-caps mb-3 text-[11px] text-subtle">Difficulty</legend>
      <div className="grid grid-cols-4 gap-1 rounded-control border border-control-edge p-1">
        {DIFFICULTIES.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name="difficulty"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-row focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
            />
            <span className="pointer-events-none flex min-h-10 items-center justify-center rounded-row px-0.5 py-2 text-sm font-semibold text-subtle peer-checked:bg-rose peer-checked:text-on-rose">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm text-subtle">
        <span className="font-serif text-[17px] text-ink italic">
          {min}–{max} directions
        </span>{" "}
        per client
      </p>
    </fieldset>
  );
}

function BurlapOnly({ checked, onChange }: { checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="flex gap-3.5 border-t border-line pt-[22px]">
      <span className="relative flex size-[22px] shrink-0">
        <input
          id="burlap-only"
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby="burlap-only-help"
          className="peer size-[22px] cursor-pointer appearance-none rounded-box border-[1.5px] border-rose checked:bg-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-on-rose peer-checked:block"
        />
      </span>
      <div className="flex flex-col">
        <label htmlFor="burlap-only" className="cursor-pointer text-base font-medium text-ink">
          Burlap only
        </label>
        <p id="burlap-only-help" className="text-sm leading-normal text-subtle">
          Every fabric must be burlap. Other fabric and colour directions are left out.
        </p>
      </div>
    </div>
  );
}

function EmptyCard() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center gap-3.5 rounded-panel border-[1.5px] border-dashed border-line-strong px-6 text-center">
      <span
        aria-hidden
        className="flex h-11 w-[61.6px] items-center justify-center rounded-[50%] border border-rose/55 font-serif text-2xl text-done italic outline outline-1 outline-offset-[3px] outline-rose/55"
      >
        TM
      </span>
      <h2 className="font-serif text-[34px] leading-[1.1] text-ink">No client yet</h2>
      <p className="max-w-[400px] text-subtle">
        Choose a difficulty and press Generate client. Someone will be along shortly.
      </p>
    </div>
  );
}

export function GeneratorScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [burlap, setBurlap] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = cardRef.current?.querySelector("h2");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [challenge]);

  const generateClient = () => {
    setChallenge(
      generate({
        seed: newSeed(),
        difficulty,
        modifiers: burlap ? ["burlap"] : [],
        dataVersion: LATEST_DATA_VERSION,
      }),
    );
    setExpanded(false);
  };

  const collapsed = challenge !== null && !expanded;

  return (
    <div className="mx-auto flex max-w-[1216px] flex-col gap-7 md:flex-row md:items-start md:gap-10">
      <h1 className="sr-only">Generator</h1>
      {collapsed && (
        <div className="flex items-center justify-between gap-3 rounded-panel border border-line bg-surface p-[18px] md:hidden">
          <div className="flex flex-col gap-1">
            <p className="text-[15px] leading-[1.3] font-medium text-ink">
              {labelFor(challenge.difficulty)} · Burlap {challenge.modifiers.length ? "on" : "off"}
            </p>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-fit text-[13px] leading-[1.3] text-rose underline underline-offset-[3px]"
            >
              Tap to change
            </button>
          </div>
          <Button size="compact" onClick={generateClient}>
            New client
          </Button>
        </div>
      )}
      <section
        aria-label="Controls"
        className={`flex-col gap-[26px] rounded-panel border border-line bg-surface p-7 md:w-[380px] md:shrink-0 ${
          collapsed ? "hidden md:flex" : "flex"
        }`}
      >
        <div>
          <p className="label-caps text-xs text-rose">The atelier</p>
          <p className="font-serif text-[34px] leading-[1.1] text-ink">New client</p>
        </div>
        <Dial value={difficulty} onChange={setDifficulty} />
        <BurlapOnly checked={burlap} onChange={setBurlap} />
        <div className="flex flex-col gap-3">
          <Button onClick={generateClient}>
            {challenge ? "Generate new client" : "Generate client"}
          </Button>
          {challenge && (
            <Button variant="outline" className="md:hidden" onClick={() => setExpanded(false)}>
              Keep current client
            </Button>
          )}
        </div>
      </section>
      <div ref={cardRef} className="min-w-0 md:flex-1">
        {challenge ? <ClientCard key={challenge.seed} card={cardFor(challenge)} /> : <EmptyCard />}
      </div>
    </div>
  );
}
