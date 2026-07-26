import type { ReactNode } from "react";

export function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px 300px at 20% 10%, oklch(0.55 0.18 255 / 0.18), transparent 60%), radial-gradient(500px 260px at 80% 90%, oklch(0.7 0.16 155 / 0.08), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}

export function AuthBrand() {
  return (
    <div className="mb-8 flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
        <span className="text-sm font-semibold">A</span>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">Atlas</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Life OS
        </p>
      </div>
    </div>
  );
}
