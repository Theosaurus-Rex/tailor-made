import { useId, useMemo } from "react";
import { Link } from "react-router";

import { ClientCard } from "@/components/ClientCard";
import { cardFor } from "@/domain/card";
import { dailyChallenge } from "@/domain/daily";
import { useNow } from "@/lib/use-now";
import { nextUtcMidnight, utcDateOf } from "@/lib/utc-date";
import { shareLinkFor } from "@/links/share-link";

const part = (options: Intl.DateTimeFormatOptions, moment: Date) =>
  new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(moment);

const longDate = (moment: Date) =>
  `${part({ weekday: "long" }, moment)} ${part({ day: "numeric" }, moment)} ${part({ month: "long" }, moment)} ${part({ year: "numeric" }, moment)}`;

const twoDigits = (value: number) => String(value).padStart(2, "0");

function Countdown({ now }: { now: Date }) {
  const labelId = useId();
  const seconds = Math.max(0, Math.ceil((nextUtcMidnight(now).getTime() - now.getTime()) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const text = `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds % 60)}`;
  return (
    <div
      aria-live="off"
      className="flex flex-col items-center gap-1 rounded-panel border border-line bg-surface p-[18px] text-center"
    >
      <p id={labelId} className="label-caps text-[11px] text-subtle">
        Next client in
      </p>
      <time
        aria-labelledby={labelId}
        dateTime={`PT${String(hours)}H${String(minutes)}M${String(seconds % 60)}S`}
        className="font-serif text-[40px] leading-[1.1] text-ink tabular-nums"
      >
        {text}
      </time>
    </div>
  );
}

export function DailyScreen() {
  const now = useNow(1000);
  const date = utcDateOf(now);
  const challenge = useMemo(() => dailyChallenge(date), [date]);

  return (
    <div className="mx-auto flex max-w-[660px] flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="label-caps text-xs text-rose">{longDate(now)}</p>
        <h1 className="text-[40px] leading-[1.1]">Today’s client</h1>
        <img src="/favicon.svg" />
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <span className="label-caps rounded-full bg-rose px-3 py-[5px] text-[11px] text-ground">
            {challenge.difficulty}
          </span>
          <p className="text-[15px] text-subtle">The same client for everyone today.</p>
        </div>
      </header>
      <ClientCard key={date} card={cardFor(challenge)} />
      <p className="text-center text-sm">
        <Link to={shareLinkFor(challenge)} className="text-rose underline underline-offset-4">
          Link to today’s client
        </Link>
      </p>
      <Countdown now={now} />
    </div>
  );
}
