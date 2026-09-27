import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/60 px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-down)] shadow-sm">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-[var(--color-muted)]">{message}</p>
      {onRetry ? (
        <Button className="mt-5" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}
