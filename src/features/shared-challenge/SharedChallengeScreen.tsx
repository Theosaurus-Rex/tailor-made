import { useMemo } from "react";
import { Link, useLocation } from "react-router";

import { ClientCard } from "@/components/ClientCard";
import { MessagePage } from "@/components/MessagePage";
import { Monogram } from "@/components/Monogram";
import { buttonVariants } from "@/components/ui/button";
import { cardFor } from "@/domain/card";
import { readShareLink, type ShareLinkProblem } from "@/links/share-link";

const UNRECOGNISED_VERSION = "This link was made with a version of Tailor-Made we don’t recognise.";
const PARTS_CHANGED = "Part of this link is missing or changed.";

const PROBLEM_MESSAGES: Record<ShareLinkProblem, string> = {
  missingVersion: UNRECOGNISED_VERSION,
  unknownVersion: UNRECOGNISED_VERSION,
  badSeed: "The client code in this link is damaged.",
  unknownDifficulty: PARTS_CHANGED,
  unknownModifier: PARTS_CHANGED,
  repeatedParameter: PARTS_CHANGED,
  repeatedModifier: PARTS_CHANGED,
  badRerolls: PARTS_CHANGED,
  chaosRerolled: "Chaos cards can’t be rerolled, so this link can’t be right.",
};

function BadLink({ problem }: { problem: ShareLinkProblem }) {
  return (
    <MessagePage visual={<Monogram size="lg" />}>
      <p className="label-caps text-xs text-rose">Link problem</p>
      <h1 className="text-[44px] leading-[1.1]">We couldn’t read this link</h1>
      <p className="text-lg text-ink-soft">
        Part of it may have been cut off when it was copied, or it was made with an older version of
        Tailor-Made.
      </p>
      <p className="text-subtle">{PROBLEM_MESSAGES[problem]}</p>
      <Link to="/" className={buttonVariants()}>
        Make a new one
      </Link>
    </MessagePage>
  );
}

export function SharedChallengeScreen() {
  const { search } = useLocation();
  const result = useMemo(() => readShareLink(search), [search]);

  if (!result.ok) return <BadLink problem={result.problem} />;

  return (
    <div className="mx-auto flex max-w-[660px] flex-col gap-6">
      <header className="text-center">
        <p className="label-caps text-xs text-rose">Shared challenge</p>
        <h1 className="mt-2 text-[40px] leading-[1.1]">Someone sent you a client</h1>
      </header>
      <ClientCard key={search} card={cardFor(result.challenge)} />
      <div className="flex flex-col gap-4 rounded-panel border border-line-strong bg-surface p-5 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-serif text-2xl text-ink italic">Fancy a client of your own?</p>
        <Link to="/" className={buttonVariants({ className: "self-start md:self-auto" })}>
          Make your own
        </Link>
      </div>
    </div>
  );
}
