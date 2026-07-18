import { useState } from "react";
import { Bell, Search, User } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/**
 * Search scopes prepared for Sprint 2B+. Each entry describes where a
 * query should eventually be routed. The UI already groups suggestions
 * by scope so plugging real search only requires filling `run(query)`.
 */
export type SearchScope =
  | "transactions"
  | "goals"
  | "projects"
  | "life"
  | "reports";

export const SEARCH_SCOPES: { key: SearchScope; label: string; hint: string }[] = [
  { key: "transactions", label: "Movimentações", hint: "Lançamentos, contas, categorias" },
  { key: "goals", label: "Metas", hint: "Objetivos e progresso" },
  { key: "projects", label: "Projetos", hint: "Iniciativas e tarefas" },
  { key: "life", label: "Minha Vida", hint: "Hábitos e missões" },
  { key: "reports", label: "Relatórios", hint: "Indicadores e exportações" },
];

export function AppHeader() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const showPanel = focused && query.trim().length === 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/70 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 h-5" />

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="atlas-search-scopes"
          placeholder="Buscar no Atlas: lançamentos, metas, projetos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          className="h-9 border-transparent bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
          ⌘K
        </kbd>

        {showPanel && (
          <div
            id="atlas-search-scopes"
            role="listbox"
            className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-md border border-border/70 bg-popover/95 shadow-elegant backdrop-blur"
          >
            <p className="px-3 pt-2.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Pesquisar em
            </p>
            <ul className="p-1.5">
              {SEARCH_SCOPES.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-left text-sm text-muted-foreground opacity-70"
                  >
                    <span className="text-foreground">{s.label}</span>
                    <span className="text-[11px]">{s.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
              Busca unificada chega em breve.
            </p>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Conta">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
