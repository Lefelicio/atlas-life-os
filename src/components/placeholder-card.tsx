import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderCardProps {
  title: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
  height?: string;
}

export function PlaceholderCard({
  title,
  hint = "Em breve",
  icon,
  className,
  height = "h-40",
}: PlaceholderCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card/60 shadow-elegant transition-colors hover:border-border",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="truncate text-sm font-medium text-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground",
            height,
          )}
        >
          {hint}
        </div>
      </CardContent>
    </Card>
  );
}
