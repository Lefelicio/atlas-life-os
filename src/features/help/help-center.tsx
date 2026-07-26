import { useMemo, useState, useEffect } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  GraduationCap,
  Compass,
  CircleHelp,
  Keyboard,
  ChevronRight,
  Clock,
  ArrowUp,
  CornerUpLeft,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  HELP_ARTICLES,
  HELP_TUTORIALS,
  MODULE_GUIDES,
  FAQ_ITEMS,
  HELP_CATEGORIES,
  KEYBOARD_SHORTCUTS,
  type HelpArticle,
  type HelpTutorial,
  type ModuleGuide,
} from "./data";

type Tab = "search" | "tutorials" | "guides" | "faq" | "shortcuts";

const TABS: { key: Tab; label: string; icon: typeof Search }[] = [
  { key: "search", label: "Pesquisar", icon: Search },
  { key: "tutorials", label: "Tutoriais", icon: GraduationCap },
  { key: "guides", label: "Guias", icon: Compass },
  { key: "faq", label: "FAQ", icon: CircleHelp },
  { key: "shortcuts", label: "Atalhos", icon: Keyboard },
];

export function HelpCenter({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<HelpTutorial | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<ModuleGuide | null>(null);
  const [showTop, setShowTop] = useState(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: { type: string; title: string; excerpt: string; id: string }[] = [];
    for (const a of HELP_ARTICLES) {
      if (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      ) {
        results.push({ type: a.category, title: a.title, excerpt: a.excerpt, id: a.id });
      }
    }
    for (const t of HELP_TUTORIALS) {
      if (
        t.title.toLowerCase().includes(q) ||
        t.objective.toLowerCase().includes(q) ||
        t.steps.some((s) => s.toLowerCase().includes(q))
      ) {
        results.push({ type: "Tutorial", title: t.title, excerpt: t.objective, id: t.id });
      }
    }
    for (const g of MODULE_GUIDES) {
      if (
        g.title.toLowerCase().includes(q) ||
        g.objective.toLowerCase().includes(q) ||
        g.howToUse.some((s) => s.toLowerCase().includes(q)) ||
        g.bestPractices.some((s) => s.toLowerCase().includes(q)) ||
        g.tips.some((s) => s.toLowerCase().includes(q))
      ) {
        results.push({ type: "Guia", title: g.title, excerpt: g.objective, id: g.moduleId });
      }
    }
    for (const f of FAQ_ITEMS) {
      if (f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)) {
        results.push({ type: "FAQ", title: f.question, excerpt: f.answer, id: f.id });
      }
    }
    return results;
  }, [query]);

  useEffect(() => {
    const el = document.querySelector("[data-radix-scroll-area-viewport]");
    if (!el) return;
    const handler = () => setShowTop(el.scrollTop > 300);
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [open, tab]);

  const scrollToTop = () => {
    const el = document.querySelector("[data-radix-scroll-area-viewport]");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetSelection = () => {
    setSelectedArticle(null);
    setSelectedTutorial(null);
    setSelectedGuide(null);
  };

  const breadcrumb = selectedArticle
    ? ["Ajuda", selectedArticle.category, selectedArticle.title]
    : selectedTutorial
      ? ["Ajuda", "Tutoriais", selectedTutorial.title]
      : selectedGuide
        ? ["Ajuda", "Guias", selectedGuide.title]
        : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Central de Ajuda
          </SheetTitle>
        </SheetHeader>

        {breadcrumb && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground" : ""}>
                  {b}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); resetSelection(); }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <ScrollArea className="mt-4 h-[calc(100vh-12rem)]">
          {tab === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Pesquisar artigos, tutoriais, guias, FAQ..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); resetSelection(); }}
                  className="pl-9"
                />
              </div>

              {selectedArticle ? (
                <ArticleDetail
                  article={selectedArticle}
                  onBack={() => setSelectedArticle(null)}
                  onRelated={(id) => {
                    const a = HELP_ARTICLES.find((x) => x.id === id);
                    if (a) setSelectedArticle(a);
                  }}
                />
              ) : query.trim().length < 2 ? (
                <div className="space-y-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categorias
                  </p>
                  {HELP_CATEGORIES.map((cat) => {
                    const catArticles = HELP_ARTICLES.filter((a) => a.category === cat);
                    if (catArticles.length === 0) return null;
                    return (
                      <div key={cat}>
                        <p className="mb-2 text-sm font-medium">{cat}</p>
                        <div className="space-y-1">
                          {catArticles.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setSelectedArticle(a)}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                            >
                              <ChevronRight className="h-3 w-3 shrink-0" />
                              <span className="truncate">{a.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchResults.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado para "{query}".
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {searchResults.length} resultado{searchResults.length === 1 ? "" : "s"} para "{query}"
                  </p>
                  {searchResults.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => {
                        const article = HELP_ARTICLES.find((a) => a.id === r.id);
                        if (article) {
                          setSelectedArticle(article);
                          return;
                        }
                        const tutorial = HELP_TUTORIALS.find((t) => t.id === r.id);
                        if (tutorial) {
                          setTab("tutorials");
                          setSelectedTutorial(tutorial);
                          return;
                        }
                        const guide = MODULE_GUIDES.find((g) => g.moduleId === r.id);
                        if (guide) {
                          setTab("guides");
                          setSelectedGuide(guide);
                          return;
                        }
                        const faq = FAQ_ITEMS.find((f) => f.id === r.id);
                        if (faq) {
                          setTab("faq");
                        }
                      }}
                      className="block w-full rounded-md border border-border/40 bg-card/30 p-3 text-left hover:bg-card/50"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.type}</p>
                      <p className="mt-0.5 text-sm font-medium">{r.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.excerpt}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "tutorials" && (
            <div className="space-y-3">
              {selectedTutorial ? (
                <TutorialDetail
                  tutorial={selectedTutorial}
                  onBack={() => setSelectedTutorial(null)}
                  onRelated={(id) => {
                    const t = HELP_TUTORIALS.find((x) => x.id === id);
                    if (t) setSelectedTutorial(t);
                  }}
                />
              ) : (
                HELP_TUTORIALS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTutorial(t)}
                    className="block w-full rounded-md border border-border/40 bg-card/30 p-3 text-left hover:bg-card/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t.title}</p>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.readTime}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.objective}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {tab === "guides" && (
            <div className="space-y-3">
              {selectedGuide ? (
                <GuideDetail
                  guide={selectedGuide}
                  onBack={() => setSelectedGuide(null)}
                />
              ) : (
                MODULE_GUIDES.map((g) => (
                  <button
                    key={g.moduleId}
                    onClick={() => setSelectedGuide(g)}
                    className="block w-full rounded-md border border-border/40 bg-card/30 p-4 text-left hover:bg-card/50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{g.title}</p>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {g.readTime}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{g.objective}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {tab === "faq" && (
            <div className="space-y-3">
              {FAQ_ITEMS.map((f) => (
                <div key={f.id} className="rounded-md border border-border/40 bg-card/30 p-3">
                  <p className="text-sm font-medium">{f.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{f.answer}</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{f.category}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "shortcuts" && (
            <div className="space-y-3">
              <div className="rounded-md border border-border/40 bg-card/30 p-4">
                <p className="text-sm font-semibold">Atalhos de Teclado</p>
                <Separator className="my-3" />
                <div className="space-y-2">
                  {KEYBOARD_SHORTCUTS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.description}</span>
                      <kbd className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px]">
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showTop && (
            <Button
              size="icon"
              variant="outline"
              className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-elegant"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function ArticleDetail({
  article,
  onBack,
  onRelated,
}: {
  article: HelpArticle;
  onBack: () => void;
  onRelated: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 p-4">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <CornerUpLeft className="h-3 w-3" />
        Voltar
      </button>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{article.category}</p>
      <h3 className="mt-1 text-sm font-semibold">{article.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{article.content}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {article.tags.map((t) => (
          <span key={t} className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            #{t}
          </span>
        ))}
      </div>
      {article.related && article.related.length > 0 && (
        <>
          <Separator className="my-3" />
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Artigos relacionados
            </p>
            <div className="space-y-1">
              {article.related.map((id) => {
                const r = HELP_ARTICLES.find((a) => a.id === id);
                if (!r) return null;
                return (
                  <button
                    key={id}
                    onClick={() => onRelated(id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TutorialDetail({
  tutorial,
  onBack,
  onRelated,
}: {
  tutorial: HelpTutorial;
  onBack: () => void;
  onRelated: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 p-4">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <CornerUpLeft className="h-3 w-3" />
        Voltar
      </button>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{tutorial.category}</p>
      <h3 className="mt-1 text-sm font-semibold">{tutorial.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{tutorial.objective}</p>
      <Separator className="my-3" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Passo a passo</p>
        <ol className="mt-1 space-y-1.5">
          {tutorial.steps.map((s, i) => (
            <li key={i} className="text-xs text-foreground">
              <span className="font-medium">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>
      </div>
      {tutorial.bestPractices.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Boas práticas</p>
          <ul className="mt-1 space-y-1">
            {tutorial.bestPractices.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
      )}
      {tutorial.commonMistakes && tutorial.commonMistakes.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Erros comuns</p>
          <ul className="mt-1 space-y-1">
            {tutorial.commonMistakes.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
      )}
      {tutorial.tips && tutorial.tips.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dicas</p>
          <ul className="mt-1 space-y-1">
            {tutorial.tips.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
      )}
      {tutorial.related && tutorial.related.length > 0 && (
        <>
          <Separator className="my-3" />
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Artigos relacionados
            </p>
            <div className="space-y-1">
              {tutorial.related.map((id) => {
                const r = HELP_ARTICLES.find((a) => a.id === id);
                if (!r) return null;
                return (
                  <button
                    key={id}
                    onClick={() => onRelated(id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">{r.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GuideDetail({ guide, onBack }: { guide: ModuleGuide; onBack: () => void }) {
  return (
    <div className="rounded-md border border-border/40 bg-card/30 p-4">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <CornerUpLeft className="h-3 w-3" />
        Voltar
      </button>
      <h3 className="text-sm font-semibold">{guide.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{guide.objective}</p>
      <Separator className="my-3" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Quando utilizar</p>
        <p className="mt-1 text-xs text-foreground">{guide.whenToUse}</p>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Como utilizar</p>
        <ul className="mt-1 space-y-1">
          {guide.howToUse.map((s, i) => (
            <li key={i} className="text-xs text-foreground">{i + 1}. {s}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Boas práticas</p>
        <ul className="mt-1 space-y-1">
          {guide.bestPractices.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground">• {s}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Erros comuns</p>
        <ul className="mt-1 space-y-1">
          {guide.commonMistakes.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground">• {s}</li>
          ))}
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dicas</p>
        <ul className="mt-1 space-y-1">
          {guide.tips.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground">• {s}</li>
          ))}
        </ul>
      </div>
      <Separator className="my-3" />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Relacionados</p>
        <p className="mt-1 text-xs text-muted-foreground">{guide.related.join(", ")}</p>
      </div>
    </div>
  );
}
