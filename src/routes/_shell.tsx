import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QuickAddFab } from "@/features/finance/components/quick-add-fab";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-1 flex-col">
          <AppHeader />
          <div className="flex-1">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
              <Outlet />
            </div>
          </div>
          <AppFooter />
        </SidebarInset>
        <QuickAddFab />
      </div>
    </SidebarProvider>
  );
}
