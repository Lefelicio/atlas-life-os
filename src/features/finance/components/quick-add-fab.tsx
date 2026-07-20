import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAdd } from "./quick-add";
import { cn } from "@/lib/utils";

/**
 * Floating "+" button always available on the shell. Opens the Quick Add
 * dialog with natural-language parsing.
 */
export function QuickAddFab({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-elegant ring-1 ring-primary/40 hover:ring-primary/60",
          className,
        )}
        aria-label="Quick Add"
        title="Quick Add · ⌘J"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <QuickAdd open={open} onOpenChange={setOpen} />
    </>
  );
}
