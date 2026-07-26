/* eslint-disable */

import { Route as rootRouteImport } from "./routes/__root";
import { Route as ShellRouteImport } from "./routes/_shell";
import { Route as LoginRouteImport } from "./routes/login";
import { Route as CadastroRouteImport } from "./routes/cadastro";
import { Route as RecuperarSenhaRouteImport } from "./routes/recuperar-senha";
import { Route as RedefinirSenhaRouteImport } from "./routes/redefinir-senha";
import { Route as ShellIndexRouteImport } from "./routes/_shell.index";
import { Route as ShellCartoesRouteImport } from "./routes/_shell.cartoes";
import { Route as ShellConfiguracoesRouteImport } from "./routes/_shell.configuracoes";
import { Route as ShellFinancasRouteImport } from "./routes/_shell.financas";
import { Route as ShellMetasRouteImport } from "./routes/_shell.metas";
import { Route as ShellMinhaVidaRouteImport } from "./routes/_shell.minha-vida";
import { Route as ShellMinhaContaRouteImport } from "./routes/_shell.minha-conta";
import { Route as ShellObjetivosRouteImport } from "./routes/_shell.objetivos";
import { Route as ShellPessoalRouteImport } from "./routes/_shell.pessoal";
import { Route as ShellProjetosRouteImport } from "./routes/_shell.projetos";
import { Route as ShellRelatoriosRouteImport } from "./routes/_shell.relatorios";
import { Route as ShellPlanejamentoRouteImport } from "./routes/_shell.planejamento";
import { Route as ShellPatrimonioRouteImport } from "./routes/_shell.patrimonio";
import { Route as ShellSobreRouteImport } from "./routes/_shell.sobre";

const ShellRoute = ShellRouteImport.update({
  id: "/_shell",
  getParentRoute: () => rootRouteImport,
} as any);
const LoginRoute = LoginRouteImport.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => rootRouteImport,
} as any);
const CadastroRoute = CadastroRouteImport.update({
  id: "/cadastro",
  path: "/cadastro",
  getParentRoute: () => rootRouteImport,
} as any);
const RecuperarSenhaRoute = RecuperarSenhaRouteImport.update({
  id: "/recuperar-senha",
  path: "/recuperar-senha",
  getParentRoute: () => rootRouteImport,
} as any);
const RedefinirSenhaRoute = RedefinirSenhaRouteImport.update({
  id: "/redefinir-senha",
  path: "/redefinir-senha",
  getParentRoute: () => rootRouteImport,
} as any);
const ShellIndexRoute = ShellIndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => ShellRoute,
} as any);
const ShellCartoesRoute = ShellCartoesRouteImport.update({
  id: "/cartoes",
  path: "/cartoes",
  getParentRoute: () => ShellRoute,
} as any);
const ShellConfiguracoesRoute = ShellConfiguracoesRouteImport.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => ShellRoute,
} as any);
const ShellFinancasRoute = ShellFinancasRouteImport.update({
  id: "/financas",
  path: "/financas",
  getParentRoute: () => ShellRoute,
} as any);
const ShellMetasRoute = ShellMetasRouteImport.update({
  id: "/metas",
  path: "/metas",
  getParentRoute: () => ShellRoute,
} as any);
const ShellMinhaVidaRoute = ShellMinhaVidaRouteImport.update({
  id: "/minha-vida",
  path: "/minha-vida",
  getParentRoute: () => ShellRoute,
} as any);
const ShellMinhaContaRoute = ShellMinhaContaRouteImport.update({
  id: "/minha-conta",
  path: "/minha-conta",
  getParentRoute: () => ShellRoute,
} as any);
const ShellObjetivosRoute = ShellObjetivosRouteImport.update({
  id: "/objetivos",
  path: "/objetivos",
  getParentRoute: () => ShellRoute,
} as any);
const ShellPessoalRoute = ShellPessoalRouteImport.update({
  id: "/pessoal",
  path: "/pessoal",
  getParentRoute: () => ShellRoute,
} as any);
const ShellProjetosRoute = ShellProjetosRouteImport.update({
  id: "/projetos",
  path: "/projetos",
  getParentRoute: () => ShellRoute,
} as any);
const ShellRelatoriosRoute = ShellRelatoriosRouteImport.update({
  id: "/relatorios",
  path: "/relatorios",
  getParentRoute: () => ShellRoute,
} as any);
const ShellPlanejamentoRoute = ShellPlanejamentoRouteImport.update({
  id: "/planejamento",
  path: "/planejamento",
  getParentRoute: () => ShellRoute,
} as any);
const ShellPatrimonioRoute = ShellPatrimonioRouteImport.update({
  id: "/patrimonio",
  path: "/patrimonio",
  getParentRoute: () => ShellRoute,
} as any);
const ShellSobreRoute = ShellSobreRouteImport.update({
  id: "/sobre",
  path: "/sobre",
  getParentRoute: () => ShellRoute,
} as any);

interface ShellRouteChildren {
  ShellCartoesRoute: typeof ShellCartoesRoute;
  ShellConfiguracoesRoute: typeof ShellConfiguracoesRoute;
  ShellFinancasRoute: typeof ShellFinancasRoute;
  ShellMetasRoute: typeof ShellMetasRoute;
  ShellMinhaVidaRoute: typeof ShellMinhaVidaRoute;
  ShellMinhaContaRoute: typeof ShellMinhaContaRoute;
  ShellObjetivosRoute: typeof ShellObjetivosRoute;
  ShellPessoalRoute: typeof ShellPessoalRoute;
  ShellProjetosRoute: typeof ShellProjetosRoute;
  ShellRelatoriosRoute: typeof ShellRelatoriosRoute;
  ShellPlanejamentoRoute: typeof ShellPlanejamentoRoute;
  ShellPatrimonioRoute: typeof ShellPatrimonioRoute;
  ShellSobreRoute: typeof ShellSobreRoute;
  ShellIndexRoute: typeof ShellIndexRoute;
}

const ShellRouteChildren: ShellRouteChildren = {
  ShellCartoesRoute: ShellCartoesRoute,
  ShellConfiguracoesRoute: ShellConfiguracoesRoute,
  ShellFinancasRoute: ShellFinancasRoute,
  ShellMetasRoute: ShellMetasRoute,
  ShellMinhaVidaRoute: ShellMinhaVidaRoute,
  ShellMinhaContaRoute: ShellMinhaContaRoute,
  ShellObjetivosRoute: ShellObjetivosRoute,
  ShellPessoalRoute: ShellPessoalRoute,
  ShellProjetosRoute: ShellProjetosRoute,
  ShellRelatoriosRoute: ShellRelatoriosRoute,
  ShellPlanejamentoRoute: ShellPlanejamentoRoute,
  ShellPatrimonioRoute: ShellPatrimonioRoute,
  ShellSobreRoute: ShellSobreRoute,
  ShellIndexRoute: ShellIndexRoute,
};

const ShellRouteWithChildren = ShellRoute._addFileChildren(ShellRouteChildren);

const rootRouteChildren = {
  ShellRoute: ShellRouteWithChildren,
  LoginRoute: LoginRoute,
  CadastroRoute: CadastroRoute,
  RecuperarSenhaRoute: RecuperarSenhaRoute,
  RedefinirSenhaRoute: RedefinirSenhaRoute,
};

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes();

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/_shell": {
      id: "/_shell";
      path: "";
      fullPath: "/";
      preLoaderRoute: typeof ShellRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/login": {
      id: "/login";
      path: "/login";
      fullPath: "/login";
      preLoaderRoute: typeof LoginRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/cadastro": {
      id: "/cadastro";
      path: "/cadastro";
      fullPath: "/cadastro";
      preLoaderRoute: typeof CadastroRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/recuperar-senha": {
      id: "/recuperar-senha";
      path: "/recuperar-senha";
      fullPath: "/recuperar-senha";
      preLoaderRoute: typeof RecuperarSenhaRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/redefinir-senha": {
      id: "/redefinir-senha";
      path: "/redefinir-senha";
      fullPath: "/redefinir-senha";
      preLoaderRoute: typeof RedefinirSenhaRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/_shell/": {
      id: "/_shell/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof ShellIndexRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/cartoes": {
      id: "/_shell/cartoes";
      path: "/cartoes";
      fullPath: "/cartoes";
      preLoaderRoute: typeof ShellCartoesRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/configuracoes": {
      id: "/_shell/configuracoes";
      path: "/configuracoes";
      fullPath: "/configuracoes";
      preLoaderRoute: typeof ShellConfiguracoesRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/financas": {
      id: "/_shell/financas";
      path: "/financas";
      fullPath: "/financas";
      preLoaderRoute: typeof ShellFinancasRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/metas": {
      id: "/_shell/metas";
      path: "/metas";
      fullPath: "/metas";
      preLoaderRoute: typeof ShellMetasRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/minha-vida": {
      id: "/_shell/minha-vida";
      path: "/minha-vida";
      fullPath: "/minha-vida";
      preLoaderRoute: typeof ShellMinhaVidaRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/minha-conta": {
      id: "/_shell/minha-conta";
      path: "/minha-conta";
      fullPath: "/minha-conta";
      preLoaderRoute: typeof ShellMinhaContaRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/objetivos": {
      id: "/_shell/objetivos";
      path: "/objetivos";
      fullPath: "/objetivos";
      preLoaderRoute: typeof ShellObjetivosRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/pessoal": {
      id: "/_shell/pessoal";
      path: "/pessoal";
      fullPath: "/pessoal";
      preLoaderRoute: typeof ShellPessoalRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/projetos": {
      id: "/_shell/projetos";
      path: "/projetos";
      fullPath: "/projetos";
      preLoaderRoute: typeof ShellProjetosRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/relatorios": {
      id: "/_shell/relatorios";
      path: "/relatorios";
      fullPath: "/relatorios";
      preLoaderRoute: typeof ShellRelatoriosRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/planejamento": {
      id: "/_shell/planejamento";
      path: "/planejamento";
      fullPath: "/planejamento";
      preLoaderRoute: typeof ShellPlanejamentoRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/patrimonio": {
      id: "/_shell/patrimonio";
      path: "/patrimonio";
      fullPath: "/patrimonio";
      preLoaderRoute: typeof ShellPatrimonioRouteImport;
      parentRoute: typeof ShellRoute;
    };
    "/_shell/sobre": {
      id: "/_shell/sobre";
      path: "/sobre";
      fullPath: "/sobre";
      preLoaderRoute: typeof ShellSobreRouteImport;
      parentRoute: typeof ShellRoute;
    };
  }
}
