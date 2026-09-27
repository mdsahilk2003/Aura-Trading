import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeBadge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import type { DataMode } from "@aura/shared";

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  format?: "currency" | "number" | "raw";
  badge?: ReactNode;
  isLoading?: boolean;
  hint?: string;
  icon?: LucideIcon;
  mode?: DataMode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  label,
  value,
  format = "raw",
  badge,
  isLoading = false,
  hint,
  icon: Icon,
  mode,
  trend = "neutral",
  className,
}: StatCardProps) {
  const displayLabel = title || label || "";
  let formattedValue = String(value);

  if (typeof value === "number") {
    if (format === "currency") {
      formattedValue = formatCurrency(value);
    } else if (format === "number") {
      formattedValue = value.toLocaleString("en-IN");
    }
  }

  return (
    <Card className={cn("overflow-hidden border-slate-200 bg-white p-4 shadow-xs rounded-2xl", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0 pb-2">
        <CardTitle className="text-xs font-semibold text-slate-500 font-sans tracking-normal">
          {displayLabel}
        </CardTitle>
        <div className="flex items-center gap-2">
          {badge}
          {mode ? <ModeBadge mode={mode} /> : null}
          {Icon ? (
            <div className="rounded-xl bg-sky-50 p-2 text-sky-600">
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-1">
        {isLoading ? (
          <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-lg" />
        ) : (
          <div
            className={cn(
              "font-mono-num text-2xl font-extrabold text-slate-900 tracking-tight",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-rose-600"
            )}
          >
            {formattedValue}
          </div>
        )}
        {hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
