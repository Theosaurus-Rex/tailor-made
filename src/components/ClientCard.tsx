import { Check, RotateCw } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Card, CardRow } from "@/domain/card";

interface ClientCardProps {
  card: Card;
  onReroll?: (slot: number) => void;
  justRerolledSlot?: number;
}

const tickKey = ({ slot, direction }: CardRow) => `${slot}:${JSON.stringify(direction)}`;

const tag =
  "label-caps rounded-full border border-rose px-2 py-0.5 text-[10px] tracking-tag text-rose";

function DirectionRow({
  row,
  ticked,
  onToggle,
  onReroll,
  justRerolled,
}: {
  row: CardRow;
  ticked: boolean;
  onToggle: () => void;
  onReroll?: (slot: number) => void;
  justRerolled: boolean;
}) {
  const id = useId();
  const lineId = `${id}-line`;
  const fill = justRerolled
    ? "bg-raised-new outline-[1.5px] -outline-offset-1 outline-rose outline-dashed"
    : ticked
      ? ""
      : "bg-raised";
  return (
    <li
      className={`relative flex min-h-11 items-center gap-3.5 rounded-row py-3 pr-2.5 pl-3.5 ${fill}`}
    >
      <span className="relative z-10 flex size-[22px] shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={ticked}
          onChange={onToggle}
          aria-describedby={row.clientLine ? lineId : undefined}
          className="peer size-[22px] cursor-pointer appearance-none rounded-box border-[1.5px] border-rose checked:bg-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-on-rose peer-checked:block"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <label
            htmlFor={id}
            className={`cursor-pointer text-base font-medium after:absolute after:inset-0 ${
              ticked ? "text-done line-through" : "text-ink"
            }`}
          >
            {row.shortLine}
          </label>
          {row.isModifier && <span className={`${tag} relative`}>Modifier</span>}
          {justRerolled && <span className={`${tag} relative`}>New direction</span>}
        </div>
        {row.clientLine && (
          <p id={lineId} className="font-serif text-lg leading-[1.35] text-subtle italic">
            {`“${row.clientLine}”`}
          </p>
        )}
      </div>
      {onReroll &&
        (row.isModifier ? (
          <span className="label-caps relative px-1.5 text-[10px] font-medium tracking-[0.24em] text-subtle">
            Fixed
          </span>
        ) : (
          <Button
            type="button"
            size="icon"
            aria-label={`Reroll: ${row.shortLine}`}
            onClick={() => onReroll(row.slot)}
            className="relative bg-ground text-rose"
          >
            <RotateCw aria-hidden className="size-[17px]" />
          </Button>
        ))}
    </li>
  );
}

export function ClientCard({ card, onReroll, justRerolledSlot }: ClientCardProps) {
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const total = card.rows.length;
  const count = card.rows.filter((row) => ticks[tickKey(row)]).length;
  const justRerolledPosition = card.rows.findIndex((row) => row.slot === justRerolledSlot);
  const headingId = useId();

  const toggle = (row: CardRow) =>
    setTicks((current) => ({ ...current, [tickKey(row)]: !current[tickKey(row)] }));

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-panel border border-line-strong bg-surface p-1.5"
    >
      <div className="flex flex-col gap-[22px] rounded-row border border-line-strong p-4 md:p-8">
        <header className="flex flex-col items-center gap-2.5 text-center">
          <span
            aria-hidden
            className="flex size-16 items-center justify-center rounded-full border border-rose bg-mark font-serif text-[26px] text-ink italic"
          >
            {card.client.initials}
          </span>
          <h2 id={headingId} className="font-serif text-[34px] leading-[1.1] text-balance text-ink">
            {card.client.name}
          </h2>
          <p className="text-xs font-medium tracking-occasion text-rose uppercase">
            {card.occasion}
          </p>
          <p className="max-w-[520px] font-serif text-xl leading-[1.45] text-ink-soft italic">
            {`“${card.brief}”`}
          </p>
        </header>
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <span id={`${headingId}-directions`} className="label-caps text-[11px] text-subtle">
              Directions
            </span>
            <span className="text-xs font-medium tracking-[0.04em] text-subtle">
              {count} of {total} ticked
            </span>
          </div>
          <div>
            <ul aria-labelledby={`${headingId}-directions`} className="flex flex-col gap-1.5">
              {card.rows.map((row) => (
                <DirectionRow
                  key={tickKey(row)}
                  row={row}
                  ticked={Boolean(ticks[tickKey(row)])}
                  onToggle={() => toggle(row)}
                  onReroll={onReroll}
                  justRerolled={row.slot === justRerolledSlot}
                />
              ))}
            </ul>
            <p
              role="status"
              className={`text-center text-sm leading-[1.45] text-subtle ${
                justRerolledPosition >= 0 ? "pt-2" : ""
              }`}
            >
              {justRerolledPosition >= 0 && (
                <>
                  Direction {justRerolledPosition + 1} swapped for a new one. Its tick was cleared;
                  the other directions are unchanged.
                  <span className="sr-only">
                    {" "}
                    It is now {card.rows[justRerolledPosition].shortLine}.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        {total > 0 && count === total && (
          <div
            role="status"
            className="flex flex-col items-center gap-1 border-t border-line-strong pt-6 text-center"
          >
            <p className="font-serif text-2xl text-ink italic">Ready to hand over.</p>
            <p className="label-caps text-[11px] text-rose">All directions ticked</p>
          </div>
        )}
      </div>
    </section>
  );
}
