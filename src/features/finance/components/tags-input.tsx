import { useState } from "react";
import { Tag as TagIcon, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFinance } from "../store";
import { PALETTE } from "../utils";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

export function TagsInput({ value, onChange }: Props) {
  const { tags, addTag } = useFinance();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = tags.filter((t) => value.includes(t.id));
  const available = tags.filter(
    (t) => !value.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase()),
  );
  const canCreate =
    query.trim().length > 0 &&
    !tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const create = () => {
    const tag = addTag({
      name: query.trim(),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    });
    onChange([...value, tag.id]);
    setQuery("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {selected.map((t) => (
        <Badge
          key={t.id}
          variant="outline"
          className="gap-1 border-border/60"
          style={{ borderColor: t.color, color: t.color }}
        >
          <TagIcon className="h-3 w-3" />
          {t.name}
          <button type="button" onClick={() => toggle(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs text-muted-foreground">
            <Plus className="h-3 w-3" /> Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <Input
            autoFocus
            placeholder="Buscar ou criar tag"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                create();
              }
            }}
          />
          <div className="mt-2 flex max-h-40 flex-wrap gap-1 overflow-auto">
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={cn(
                  "rounded-full border border-border/60 px-2 py-0.5 text-[11px]",
                )}
                style={{ color: t.color, borderColor: t.color }}
              >
                {t.name}
              </button>
            ))}
            {available.length === 0 && !canCreate && (
              <p className="text-[11px] text-muted-foreground">Nenhuma tag</p>
            )}
          </div>
          {canCreate && (
            <Button size="sm" variant="ghost" className="mt-2 w-full justify-start text-xs" onClick={create}>
              <Plus className="h-3 w-3" /> Criar "{query.trim()}"
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
