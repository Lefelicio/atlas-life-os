import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout, AuthBrand } from "@/features/auth/auth-layout";
import { useAuth } from "@/features/auth/auth-context";
import { PublicRouteGuard } from "@/features/auth/public-route-guard";

export const Route = createFileRoute("/redefinir-senha")({
  component: RedefinirSenhaPage,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Atlas" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function RedefinirSenhaPage() {
  return (
    <PublicRouteGuard>
      <RedefinirSenhaPageInner />
    </PublicRouteGuard>
  );
}

function RedefinirSenhaPageInner() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate({ to: "/" }), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout>
        <AuthBrand />
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success ring-1 ring-success/20">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Senha redefinida!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua senha foi atualizada. Redirecionando para o dashboard...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthBrand />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Redefinir senha
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Defina uma nova senha para acessar sua conta.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full gap-1.5" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Redefinir senha
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ou
          </span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" className="w-full" asChild>
          <Link to="/login" search={{}}>Voltar para o login</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
