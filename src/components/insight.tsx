import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightTone = "neutral" | "positive" | "attention";

export interface InsightMessage {
  id: string;
  text: string;
  tone?: InsightTone;
  icon?: ReactNode;
  /** Reserved for future AI-provided sources / rationales. */
  source?: "rule" | "ai";
}

interface InsightProps {
  message: InsightMessage | null | undefined;
  className?: string;
}

/**
 * Displays a single contextual message. Structured so a future AI hook
 * (e.g. `useAiInsight()`) can return the same `InsightMessage` shape
 * without any change to the presentation layer.
 */
export function Insight({ message, className }: InsightProps) {
  if (!message) return null;
  const tone = message.tone ?? "neutral";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
        tone === "neutral" &&
          "border-border/60 bg-muted/30 text-muted-foreground",
        tone === "positive" &&
          "border-success/25 bg-success/10 text-success",
        tone === "attention" &&
          "border-primary/25 bg-primary/10 text-foreground",
        className,
      )}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-background/60 text-primary">
        {message.icon ?? <Sparkles className="h-3.5 w-3.5" />}
      </span>
      <p className="min-w-0 flex-1 truncate">{message.text}</p>
      {message.source === "ai" && (
        <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          IA
        </span>
      )}
    </div>
  );
}
