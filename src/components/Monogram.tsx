import { cn } from "@/lib/utils";

const SIZES = {
  sm: "m-1 h-[30px] w-[42px] text-[17px] leading-none outline-offset-[3px]",
  md: "h-11 w-[61.6px] text-2xl outline-offset-[3px]",
  lg: "m-1 h-[52px] w-[74px] text-[28px] leading-none outline-offset-[4px]",
};

interface MonogramProps {
  size: keyof typeof SIZES;
  muted?: boolean;
}

export function Monogram({ size, muted = false }: MonogramProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-[50%] border font-serif italic outline outline-1",
        muted ? "border-rose/55 text-done outline-rose/55" : "border-rose text-ink outline-rose",
        SIZES[size],
      )}
    >
      TM
    </span>
  );
}
