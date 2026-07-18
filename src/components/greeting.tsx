import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useUser, firstName } from "@/features/user/store";
import { cn } from "@/lib/utils";

function greetingFor(hour: number) {
  if (hour >= 5 && hour < 12) return { label: "Bom dia", emoji: "👋" };
  if (hour >= 12 && hour < 18) return { label: "Boa tarde", emoji: "👋" };
  return { label: "Boa noite", emoji: "🌙" };
}

interface GreetingProps {
  className?: string;
  eyebrow?: string;
}

/**
 * Dynamic time-based greeting with the current date spelled out.
 * Renders on the client to avoid SSR/hydration mismatch on time-of-day.
 */
export function Greeting({ className, eyebrow = "Central de Comando" }: GreetingProps) {
  const name = useUser((s) => s.name);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const first = firstName(name);
  const { label, emoji } = now ? greetingFor(now.getHours()) : { label: "", emoji: "" };
  const heading = now
    ? first
      ? `${label}, ${first} ${emoji}`
      : `${label} ${emoji}`
    : "Olá!";
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
        {heading}
      </h1>
      {dateLine && (
        <p className="mt-2 text-sm text-muted-foreground first-letter:uppercase">
          {dateLine}
        </p>
      )}
    </div>
  );
}
