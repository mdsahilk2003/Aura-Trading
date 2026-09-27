import { cn, formatNumber, formatPercent } from "@/lib/utils";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  className?: string;
  showAbsolute?: boolean;
}

export function PriceChange({
  change,
  changePercent,
  className,
  showAbsolute = true,
}: PriceChangeProps) {
  const up = changePercent >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        up ? "text-[var(--color-up)]" : "text-[var(--color-down)]",
        className
      )}
    >
      {showAbsolute ? (
        <span>
          {up ? "+" : ""}
          {formatNumber(change)}
        </span>
      ) : null}
      <span>({formatPercent(changePercent)})</span>
    </span>
  );
}
