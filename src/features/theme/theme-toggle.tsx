import { Sun, Moon, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/features/theme/store";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: "light", label: "Claro", icon: Sun },
  { mode: "dark", label: "Escuro", icon: Moon },
  { mode: "system", label: "Sistema", icon: Monitor },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useTheme();
  const current = OPTIONS.find((o) => o.mode === mode);
  const CurrentIcon = current?.icon ?? Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          aria-label="Alternar tema"
          className="gap-2"
        >
          <CurrentIcon className="h-4 w-4" />
          {!compact && <span className="text-sm">{current?.label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            className={cn("gap-2", mode === opt.mode && "font-medium")}
          >
            <opt.icon className="h-4 w-4" />
            <span>{opt.label}</span>
            {mode === opt.mode && (
              <span className="ml-auto text-xs text-primary">●</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
