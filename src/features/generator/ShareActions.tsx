import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cardFor } from "@/domain/card";
import { challengeAsText } from "@/domain/card-text";
import type { Challenge } from "@/domain/challenge";
import { shareLinkFor } from "@/links/share-link";

type Kind = "link" | "text";

interface Outcome {
  challenge: Challenge;
  kind: Kind;
  worked: boolean;
  copied: string;
}

const IDLE_LABEL: Record<Kind, string> = { link: "Copy link", text: "Copy as text" };
const DONE_LABEL: Record<Kind, string> = { link: "Link copied", text: "Text copied" };

async function writeToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function CopyBox({ kind, value, failed }: { kind: Kind; value: string; failed: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (failed) ref.current?.select();
  }, [failed]);
  return (
    <textarea
      ref={ref}
      readOnly
      value={value}
      rows={kind === "text" ? value.split("\n").length : 2}
      aria-label={failed ? `Copy the ${kind} by hand` : "Copied text"}
      onFocus={(event) => event.currentTarget.select()}
      className={`w-full resize-none rounded-row p-4 font-mono text-[13px] leading-[1.6] text-ink ${
        failed
          ? "border-[1.5px] border-rose bg-inset break-all"
          : "border border-line bg-inset-quiet"
      }`}
    />
  );
}

export function ShareActions({ challenge }: { challenge: Challenge }) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const current = outcome?.challenge === challenge ? outcome : null;

  const copy = async (kind: Kind) => {
    const link = window.location.origin + shareLinkFor(challenge);
    const copied = kind === "link" ? link : challengeAsText(cardFor(challenge), link);
    const worked = await writeToClipboard(copied);
    setOutcome({ challenge, kind, worked, copied });
  };

  const buttonFor = (kind: Kind) => {
    const shown = current?.kind === kind ? current : null;
    return (
      <Button
        variant="outline"
        className={shown?.worked ? "bg-raised" : ""}
        onClick={() => void copy(kind)}
      >
        {!shown && IDLE_LABEL[kind]}
        {shown?.worked && (
          <>
            {DONE_LABEL[kind]} <Check aria-hidden />
          </>
        )}
        {shown && !shown.worked && "Couldn’t copy"}
      </Button>
    );
  };

  let status = "";
  if (current?.worked) {
    status =
      current.kind === "link"
        ? "Link copied. Anyone who opens it gets this client with these directions."
        : "Card copied as plain text. Paste it anywhere:";
  } else if (current) {
    status = `Couldn’t copy. Your browser blocked the clipboard. Select the ${current.kind} below and copy it yourself.`;
  }

  return (
    <div className="mt-6 flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {buttonFor("link")}
        {buttonFor("text")}
      </div>
      <p role="status" className="text-sm leading-[1.45] text-subtle">
        {status}
      </p>
      {current && (!current.worked || current.kind === "text") && (
        <CopyBox
          key={`${current.kind}-${String(current.worked)}`}
          kind={current.kind}
          value={current.copied}
          failed={!current.worked}
        />
      )}
    </div>
  );
}
