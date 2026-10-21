import { useMemo, useState } from "react";
import { Link } from "react-router";

import { ClientCard } from "@/components/ClientCard";
import { cardFor } from "@/domain/card";
import { dailyChallenge } from "@/domain/daily";
import { utcDateOf } from "@/lib/utc-date";
import { shareLinkFor } from "@/links/share-link";

const part = (options: Intl.DateTimeFormatOptions, moment: Date) =>
  new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(moment);

const longDate = (moment: Date) =>
  `${part({ weekday: "long" }, moment)} ${part({ day: "numeric" }, moment)} ${part({ month: "long" }, moment)} ${part({ year: "numeric" }, moment)}`;

export function DailyScreen() {
  const [now] = useState(() => new Date());
  const date = utcDateOf(now);
  const challenge = useMemo(() => dailyChallenge(date), [date]);

  return (
    <div className="mx-auto flex max-w-[660px] flex-col gap-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="label-caps text-xs text-rose">{longDate(now)}</p>
        <h1 className="text-[40px] leading-[1.1]">Today’s client</h1>
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
    </div>
  );
}
