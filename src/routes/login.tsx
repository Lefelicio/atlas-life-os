import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — Atlas" },
      { name: "description", content: "Acesse sua conta Atlas." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Fundação: navegação apenas. Autenticação será implementada depois.
    navigate({ to: "/" });
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(600px 300px at 20% 10%, oklch(0.55 0.18 255 / 0.18), transparent 60%), radial-gradient(500px 260px at 80% 90%, oklch(0.7 0.16 155 / 0.08), transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-sm">
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

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Entrar na sua conta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse seu sistema operacional pessoal.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@exemplo.com" autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Esqueci a senha
              </button>
            </div>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>

          <Button type="submit" className="w-full gap-1.5">
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              ou
            </span>
            <Separator className="flex-1" />
          </div>

          <Button type="button" variant="outline" className="w-full">
            Continuar com Google
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Novo por aqui?{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Solicitar acesso
          </Link>
        </p>
      </div>
    </div>
  );
}
