import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useAuth } from "@/features/auth/auth-context";
import { getGreeting } from "@/lib/greeting";
import { cn } from "@/lib/utils";

interface GreetingProps {
  className?: string;
  eyebrow?: string;
}

export function Greeting({ className, eyebrow = "Central de Comando" }: GreetingProps) {
  const { profile } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { title, subtitle } = now ? getGreeting(profile?.name, now) : { title: "Olá!", subtitle: "" };
  const dateLine = now
    ? (() => {
        const s = format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
        return s.charAt(0).toUpperCase() + s.slice(1) + ".";
      })()
    : "";

  return (
    <div className={cn("min-w-0", className)}>
      {eyebrow && (
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
      {dateLine && (
        <p className="mt-1 text-xs text-muted-foreground/70 first-letter:uppercase">
          {dateLine}
        </p>
      )}
    </div>
  );
}
