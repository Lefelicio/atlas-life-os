import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  label: string;
  value?: string;
  /** Rendered instead of `value` when data is unavailable. */
  emptyText?: string;
  icon?: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "destructive" | "primary";
  className?: string;
}

/**
 * Enhanced stat card used across the dashboard. Falls back to a friendly
 * empty-state text instead of showing R$ 0,00 when there's no data yet.
 */
export function StatusCard({
  label,
  value,
  emptyText,
  icon,
  hint,
  tone = "default",
  className,
}: StatusCardProps) {
  const showEmpty = !value && emptyText;
  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 transition-colors hover:border-border",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-[0.15em]">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        {showEmpty ? (
          <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tabular-nums tracking-tight",
              tone === "success" && "text-success",
              tone === "destructive" && "text-destructive",
              tone === "primary" && "text-primary",
            )}
          >
            {value}
          </p>
        )}
        {hint && (
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
