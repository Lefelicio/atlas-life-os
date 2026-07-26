import { useState } from "react";
import { Search, User, HelpCircle, LogOut, ChevronDown, Settings } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { useAuth } from "@/features/auth/auth-context";
import { firstName } from "@/features/user/store";

export function AppHeader({
  onCommandPalette,
  onHelpOpen,
}: {
  onCommandPalette?: () => void;
  onHelpOpen?: () => void;
}) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const goToAccount = () => navigate({ to: "/minha-conta" });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada.");
      navigate({ to: "/login", search: {}, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao sair.");
    }
  };

  const name = firstName(profile?.name) ?? "Usuário";
  const initials = (profile?.name ?? "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 h-5" />

      <button
        type="button"
        onClick={onCommandPalette}
        className="relative hidden h-9 max-w-md flex-1 items-center rounded-md border border-transparent bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:border-border/40 md:flex"
      >
        <Search className="pointer-events-none mr-2 h-4 w-4 text-muted-foreground" />
        <span>Buscar no Atlas: lançamentos, metas, projetos…</span>
        <kbd className="pointer-events-none absolute right-2 select-none rounded border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle compact />
        <Button variant="ghost" size="icon" aria-label="Ajuda" onClick={onHelpOpen}>
          <HelpCircle className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted/50">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{profile?.name || "Usuário"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={goToAccount}>
              <Settings className="h-4 w-4" />
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
