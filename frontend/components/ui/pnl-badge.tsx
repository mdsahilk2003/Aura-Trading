import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface PnlBadgeProps {
  pnl?: number;
  amount?: number;
  pnlPercent?: number;
  percentage?: number;
  className?: string;
  currency?: boolean;
}

export function PnlBadge({
  pnl,
  amount,
  pnlPercent,
  percentage,
  className,
  currency = true,
}: PnlBadgeProps) {
  const val = amount ?? pnl ?? 0;
  const pct = percentage ?? pnlPercent;
  const up = val >= 0;
  const label = currency
    ? `${up ? "+" : ""}${formatCurrency(val)}`
    : `${up ? "+" : ""}${val.toFixed(2)}`;

  return (
    <Badge
      variant={up ? "success" : "danger"}
      className={cn("normal-case tracking-normal font-mono-num font-bold", className)}
    >
      {label}
      {pct != null ? ` (${formatPercent(pct)})` : null}
    </Badge>
  );
}
