import { useState } from "react";
import { Plus, X, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinance } from "../store";
import { PALETTE } from "../utils";
import type { Category } from "../types";
import { cn } from "@/lib/utils";

function CategoryList({ kind }: { kind: "income" | "expense" }) {
  const { categories, addCategory, updateCategory, removeCategory } = useFinance();
  const list = categories.filter((c) => c.kind === kind);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const add = () => {
    if (!name.trim()) return;
    addCategory({
      name: name.trim(),
      kind,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    });
    setName("");
  };

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {kind === "income" ? "Receitas" : "Despesas"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Nova categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="h-9"
          />
          <Button size="sm" onClick={add}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="divide-y divide-border/50">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => {
                  const next = PALETTE[(PALETTE.indexOf(c.color) + 1) % PALETTE.length];
                  updateCategory(c.id, { color: next });
                }}
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-label="Trocar cor"
              />
              {editing === c.id ? (
                <Input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateCategory(c.id, { name: editName.trim() || c.name });
                      setEditing(null);
                    }
                  }}
                  className="h-7 flex-1"
                />
              ) : (
                <span className="flex-1 truncate text-sm">{c.name}</span>
              )}
              {editing === c.id ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    updateCategory(c.id, { name: editName.trim() || c.name });
                    setEditing(null);
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditing(c.id);
                    setEditName(c.name);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => removeCategory(c.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
          {list.length === 0 && (
            <li className={cn("py-4 text-center text-xs text-muted-foreground")}>
              Nenhuma categoria
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CategoryManager() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CategoryList kind="income" />
      <CategoryList kind="expense" />
    </div>
  );
}
