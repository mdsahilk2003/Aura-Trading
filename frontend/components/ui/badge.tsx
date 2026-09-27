import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { DataMode } from "@aura/shared";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
        secondary:
          "border-transparent bg-[var(--color-canvas)] text-[var(--color-muted)]",
        outline: "border-[var(--color-line)] text-[var(--color-muted)] bg-white",
        success:
          "border-transparent bg-emerald-50 text-[var(--color-up)]",
        danger: "border-transparent bg-red-50 text-[var(--color-down)]",
        warning:
          "border-transparent bg-amber-50 text-[var(--color-warning)]",
        live: "border-transparent bg-emerald-100 text-emerald-800",
        demo: "border-transparent bg-sky-100 text-sky-800",
        paper: "border-transparent bg-amber-100 text-amber-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

const modeVariant: Record<DataMode, NonNullable<BadgeProps["variant"]>> = {
  LIVE: "live",
  DEMO: "demo",
  PAPER: "paper",
};

function ModeBadge({
  mode,
  className,
}: {
  mode: DataMode | "SAMPLE";
  className?: string;
}) {
  if (mode === "SAMPLE") {
    return (
      <Badge variant="secondary" className={className}>
        SAMPLE
      </Badge>
    );
  }
  return (
    <Badge variant={modeVariant[mode]} className={className}>
      {mode}
    </Badge>
  );
}

export { Badge, badgeVariants, ModeBadge };
