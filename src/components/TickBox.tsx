import { Check } from "lucide-react";
import type { ChangeEventHandler } from "react";

import { cn } from "@/lib/utils";

interface TickBoxProps {
  id: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  "aria-describedby"?: string;
  className?: string;
}

export function TickBox({
  id,
  checked,
  onChange,
  "aria-describedby": describedBy,
  className,
}: TickBoxProps) {
  return (
    <span className={cn("flex size-[22px] shrink-0", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-describedby={describedBy}
        className="peer size-[22px] cursor-pointer appearance-none rounded-box border-[1.5px] border-rose checked:bg-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
      />
      <Check
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-on-rose peer-checked:block"
      />
    </span>
  );
}
