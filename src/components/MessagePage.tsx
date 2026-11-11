import type { ReactNode } from "react";

export function MessagePage({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto mt-12 flex max-w-[560px] flex-col items-center gap-4 text-center md:mt-20">
      {visual}
      {children}
    </div>
  );
}
