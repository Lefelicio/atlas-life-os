import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Target,
  FolderKanban,
  Crosshair,
  BarChart3,
  Settings,
  PieChart,
  TrendingUp,
  ChevronRight,
  ListChecks,
  Landmark,
  Tags,
  Info,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/features/theme/theme-toggle";

type SubItem = { title: string; url: string; icon: LucideIcon };
type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: SubItem[];
};

const FINANCAS_CHILDREN: SubItem[] = [
  { title: "Lançamentos", url: "/financas", icon: ListChecks },
  { title: "Contas", url: "/financas?tab=accounts", icon: Landmark },
  { title: "Cartões", url: "/cartoes", icon: CreditCard },
  { title: "Faturas", url: "/faturas", icon: ReceiptText },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Planejamento", url: "/planejamento", icon: PieChart },
  { title: "Patrimônio", url: "/patrimonio", icon: TrendingUp },
  { title: "Categorias", url: "/financas?tab=categories", icon: Tags },
];

const primary: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  {
    title: "Finanças",
    url: "/financas",
    icon: Wallet,
    children: FINANCAS_CHILDREN,
  },
  { title: "Objetivos", url: "/objetivos", icon: Crosshair },
  { title: "Projetos", url: "/projetos", icon: FolderKanban },
  { title: "Pessoal", url: "/pessoal", icon: Target },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

const secondary: NavItem[] = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Sobre", url: "/sobre", icon: Info },
];

function isPathInGroup(path: string, children: SubItem[]): boolean {
  return children.some((c) => {
    if (c.url === "/") return path === "/";
    return path.startsWith(c.url);
  });
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      for (const item of primary) {
        if (item.children && isPathInGroup(currentPath, item.children)) {
          next.add(item.title);
        } else {
          next.delete(item.title);
        }
      }
      return next;
    });
  }, [currentPath]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
            <span className="text-sm font-semibold">A</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                Atlas
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Life OS
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Navegação</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children && !collapsed ? (
                    <>
                      <SidebarMenuButton
                        isActive={isPathInGroup(currentPath, item.children)}
                        tooltip={item.title}
                        onClick={() => toggleGroup(item.title)}
                        className="flex w-full items-center gap-3"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                        <ChevronRight
                          className={`ml-auto h-3 w-3 shrink-0 text-muted-foreground transition-transform ${
                            expandedGroups.has(item.title) ? "rotate-90" : ""
                          }`}
                        />
                      </SidebarMenuButton>
                      {expandedGroups.has(item.title) && (
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                                <Link to={child.url} className="flex items-center gap-2.5">
                                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate text-xs">{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : item.children && collapsed ? (
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-1 px-2 py-1">
          <ThemeToggle compact={collapsed} />
          {!collapsed && <span className="text-xs text-muted-foreground">Tema</span>}
        </div>
        <SidebarMenu>
          {secondary.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
              >
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
