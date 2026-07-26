import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QuickAddFab } from "@/features/finance/components/quick-add-fab";
import { CommandPalette } from "@/features/search/command-palette";
import { HelpCenter } from "@/features/help/help-center";
import { onHelpOpen } from "@/features/help/help-events";
import { useAuth } from "@/features/auth/auth-context";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true });
    }
  }, [loading, user, navigate, pathname]);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => onHelpOpen(() => setHelpOpen(true)), []);

  if (loading || !user) {
    return <FullScreenLoader label="Carregando sua conta..." />;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-1 flex-col">
          <AppHeader onCommandPalette={() => setCmdOpen(true)} onHelpOpen={() => setHelpOpen(true)} />
          <div className="flex-1">
            <div data-atlas-page className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
              <Outlet />
            </div>
          </div>
          <AppFooter />
        </SidebarInset>
        <QuickAddFab />
        <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
        <HelpCenter open={helpOpen} onOpenChange={setHelpOpen} />
      </div>
    </SidebarProvider>
  );
}
