import { Loader2 } from "lucide-react";

export function FullScreenLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
          <span className="text-sm font-semibold">A</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {label ?? "Carregando..."}
        </div>
      </div>
    </div>
  );
}
