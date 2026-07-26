import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AuthLayout, AuthBrand } from "@/features/auth/auth-layout";
import { useAuth } from "@/features/auth/auth-context";
import { PublicRouteGuard } from "@/features/auth/public-route-guard";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (): { redirect?: string } => ({}),
  head: () => ({
    meta: [
      { title: "Entrar — Atlas" },
      { name: "description", content: "Acesse sua conta Atlas." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  return (
    <PublicRouteGuard>
      <LoginPageInner />
    </PublicRouteGuard>
  );
}

function LoginPageInner() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success("Bem-vindo de volta!");
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthBrand />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Entrar na sua conta
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Acesse seu sistema operacional pessoal.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              to="/recuperar-senha"
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v === true)}
          />
          <Label htmlFor="remember" className="text-xs text-muted-foreground">
            Lembrar-me
          </Label>
        </div>

        <Button type="submit" className="w-full gap-1.5" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Entrar
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ou
          </span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" className="w-full" asChild>
          <Link to="/cadastro">Criar uma conta</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
