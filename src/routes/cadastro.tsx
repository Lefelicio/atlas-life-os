import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout, AuthBrand } from "@/features/auth/auth-layout";
import { useAuth } from "@/features/auth/auth-context";
import { PublicRouteGuard } from "@/features/auth/public-route-guard";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
  head: () => ({
    meta: [
      { title: "Criar conta — Atlas" },
      { name: "description", content: "Crie sua conta Atlas." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CadastroPage() {
  return (
    <PublicRouteGuard>
      <CadastroPageInner />
    </PublicRouteGuard>
  );
}

function CadastroPageInner() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false);

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
      await signUp(name.trim(), email.trim(), password);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setEmailConfirmationNeeded(true);
      } else {
        toast.success("Conta criada com sucesso!");
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  if (emailConfirmationNeeded) {
    return (
      <AuthLayout>
        <AuthBrand />
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Confirme seu e-mail
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação para{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Acesse sua caixa de entrada para ativar a conta antes de entrar.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/login" search={{}}>Ir para o login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthBrand />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Criar sua conta
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Comece a organizar sua vida hoje mesmo.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <Label htmlFor="password">Senha</Label>
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
          Criar conta
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ou
          </span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" className="w-full" asChild>
          <Link to="/login" search={{}}>Já tenho conta</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
