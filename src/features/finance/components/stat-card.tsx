import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "destructive";
}

export function StatCard({ label, value, icon, hint, tone = "default" }: Props) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-[0.15em]">{label}</span>
          {icon}
        </div>
        <p
          className={cn(
            "mt-2 text-2xl font-semibold tabular-nums tracking-tight",
            tone === "success" && "text-success",
            tone === "destructive" && "text-destructive",
          )}
        >
          {value}
        </p>
        {hint && (
          <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
