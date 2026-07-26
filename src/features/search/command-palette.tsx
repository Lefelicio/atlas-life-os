import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Target,
  FolderKanban,
  Scale,
  Dumbbell,
  Search as SearchIcon,
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  Settings,
  Crosshair,
  User,
  type LucideIcon,
} from "lucide-react";
import { Command } from "cmdk";

import { useGlobalSearch, type SearchResult } from "@/features/search/use-global-search";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { useObjetivos } from "@/features/objetivos/hooks/use-objetivos";
import { usePatrimony } from "@/features/patrimony/store";
import { usePessoal } from "@/features/pessoal/store";
import { useActivity } from "@/features/activity/store";

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  group: string;
}

interface NavAction {
  id: string;
  label: string;
  icon: LucideIcon;
  url: string;
  group: string;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const searchResults = useGlobalSearch(query);
  const { addTransaction } = useFinance();
  const { addObjective } = useObjetivos();
  const { addEntry } = usePatrimony();
  const { addWeight, addWorkout } = usePessoal();
  const { log } = useActivity();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const runAction = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  const navigateTo = (url: string) => {
    navigate({ to: url });
    onOpenChange(false);
  };

  const quickActions: QuickAction[] = [
    {
      id: "new-income",
      label: "Nova Receita",
      icon: TrendingUp,
      group: "Ações rápidas",
      action: () => runAction(() => {
        navigate({ to: "/financas" });
        log({ type: "transaction", action: "Nova receita iniciada", source: "command-palette" });
      }),
    },
    {
      id: "new-expense",
      label: "Nova Despesa",
      icon: TrendingDown,
      group: "Ações rápidas",
      action: () => runAction(() => {
        navigate({ to: "/financas" });
        log({ type: "transaction", action: "Nova despesa iniciada", source: "command-palette" });
      }),
    },
    {
      id: "new-objective",
      label: "Novo Objetivo",
      icon: Target,
      group: "Ações rápidas",
      action: () => runAction(() => {
        navigate({ to: "/objetivos" });
        log({ type: "objective", action: "Novo objetivo iniciado", source: "command-palette" });
      }),
    },
    {
      id: "new-project",
      label: "Novo Projeto",
      icon: FolderKanban,
      group: "Ações rápidas",
      action: () => runAction(() => navigate({ to: "/projetos" })),
    },
    {
      id: "register-weight",
      label: "Registrar Peso",
      icon: Scale,
      group: "Ações rápidas",
      action: () => runAction(() => navigate({ to: "/pessoal" })),
    },
    {
      id: "register-workout",
      label: "Registrar Treino",
      icon: Dumbbell,
      group: "Ações rápidas",
      action: () => runAction(() => navigate({ to: "/pessoal" })),
    },
    {
      id: "register-asset",
      label: "Registrar Aporte",
      icon: TrendingUp,
      group: "Ações rápidas",
      action: () => runAction(() => navigate({ to: "/patrimonio" })),
    },
  ];

  const navActions: NavAction[] = [
    { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, url: "/", group: "Navegação" },
    { id: "nav-financas", label: "Finanças", icon: Wallet, url: "/financas", group: "Navegação" },
    { id: "nav-cartoes", label: "Cartões", icon: CreditCard, url: "/cartoes", group: "Navegação" },
    { id: "nav-planejamento", label: "Planejamento", icon: PieChart, url: "/planejamento", group: "Navegação" },
    { id: "nav-patrimonio", label: "Patrimônio", icon: TrendingUp, url: "/patrimonio", group: "Navegação" },
    { id: "nav-objetivos", label: "Objetivos", icon: Crosshair, url: "/objetivos", group: "Navegação" },
    { id: "nav-metas", label: "Metas", icon: Target, url: "/metas", group: "Navegação" },
    { id: "nav-projetos", label: "Projetos", icon: FolderKanban, url: "/projetos", group: "Navegação" },
    { id: "nav-pessoal", label: "Pessoal", icon: User, url: "/pessoal", group: "Navegação" },
    { id: "nav-minha-vida", label: "Minha Vida", icon: User, url: "/minha-vida", group: "Navegação" },
    { id: "nav-relatorios", label: "Relatórios", icon: BarChart3, url: "/relatorios", group: "Navegação" },
    { id: "nav-config", label: "Configurações", icon: Settings, url: "/configuracoes", group: "Navegação" },
  ];

  if (!open) return null;

  const grouped = groupResults(searchResults);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/60 pt-[15vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <Command
        className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border/60 bg-popover shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border/40 px-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            autoFocus
            placeholder="Buscar ou executar uma ação..."
            value={query}
            onValueChange={setQuery}
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado.
          </Command.Empty>

          {query.trim().length < 2 && (
            <>
              <Command.Group heading="Ações rápidas" className="mb-2">
                {quickActions.map((a) => (
                  <Command.Item
                    key={a.id}
                    onSelect={() => a.action()}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                  >
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{a.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="Navegação">
                {navActions.map((a) => (
                  <Command.Item
                    key={a.id}
                    onSelect={() => navigateTo(a.url)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                  >
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{a.label}</span>
                    <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            </>
          )}

          {query.trim().length >= 2 && grouped.map((g) => (
            <Command.Group key={g.category} heading={g.category} className="mb-1">
              {g.items.map((r) => (
                <Command.Item
                  key={r.id}
                  onSelect={() => navigateTo(r.url)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <span className="truncate">{r.title}</span>
                  {r.subtitle && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {r.subtitle}
                    </span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}

function groupResults(results: SearchResult[]): { category: string; items: SearchResult[] }[] {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.category)) map.set(r.category, []);
    map.get(r.category)!.push(r);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}
