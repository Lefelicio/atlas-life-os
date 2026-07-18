import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PeriodKey } from "../types";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "year", label: "Ano" },
];

interface Props {
  value: PeriodKey;
  onChange: (k: PeriodKey) => void;
  custom: { from: string; to: string };
  onCustomChange: (v: { from: string; to: string }) => void;
}

export function PeriodFilter({ value, onChange, custom, onCustomChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-border/60 bg-muted/30 p-1">
      {OPTIONS.map((o) => (
        <Button
          key={o.key}
          size="sm"
          variant="ghost"
          onClick={() => onChange(o.key)}
          className={cn(
            "h-7 px-2.5 text-xs",
            value === o.key && "bg-background text-foreground shadow-sm",
          )}
        >
          {o.label}
        </Button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 px-2.5 text-xs",
              value === "custom" && "bg-background text-foreground shadow-sm",
            )}
          >
            Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-2" align="end">
          <div>
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={custom.from}
              onChange={(e) => {
                onCustomChange({ ...custom, from: e.target.value });
                onChange("custom");
              }}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Até</label>
            <Input
              type="date"
              value={custom.to}
              onChange={(e) => {
                onCustomChange({ ...custom, to: e.target.value });
                onChange("custom");
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
