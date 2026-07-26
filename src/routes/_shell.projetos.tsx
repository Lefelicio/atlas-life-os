import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Search,
  FolderKanban,
  MoreVertical,
  Trash2,
  Pencil,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { FullScreenLoader } from "@/components/full-screen-loader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useProjects } from "@/features/projetos/hooks/use-projetos";
import { useTasks } from "@/features/projetos/hooks/use-tarefas";
import type { Project, ProjectInput, Task, TaskInput, TaskStatus } from "@/features/projetos/types";

export const Route = createFileRoute("/_shell/projetos")({
  component: ProjetosPage,
  head: () => ({ meta: [{ title: "Projetos — Atlas" }] }),
});

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

function ProjetosPage() {
  const projectsHook = useProjects();
  const tasksHook = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projectsHook.projects.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [projectsHook.projects, search]);

  const tasksForProject = (projectId: string) =>
    tasksHook.tasks.filter((t) => t.projectId === projectId);

  if (projectsHook.loading) return <FullScreenLoader />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Módulo"
        title="Projetos"
        description="Iniciativas pessoais e profissionais, tarefas e entregas."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> Novo projeto
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      {projectsHook.error ? (
        <EmptyState
          title="Erro ao carregar projetos"
          description="Verifique sua conexão e tente novamente."
          icon={<FolderKanban className="h-4 w-4" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={projectsHook.projects.length === 0 ? "Nenhum projeto criado" : "Nenhum resultado"}
          description={
            projectsHook.projects.length === 0
              ? "Crie seu primeiro projeto para organizar tarefas e acompanhar entregas."
              : "Tente ajustar a busca."
          }
          icon={<FolderKanban className="h-4 w-4" />}
          action={
            projectsHook.projects.length === 0 ? (
              <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4" /> Criar primeiro projeto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              tasks={tasksForProject(p.id)}
              onEdit={() => { setEditing(p); setDialogOpen(true); }}
              onRemove={() => {
                projectsHook.removeProject(p.id).then(() => toast.success("Projeto excluído"));
              }}
              onToggleArchive={() => {
                projectsHook.updateProject({ id: p.id, data: { archived: !p.archived } }).then(() =>
                  toast.success(p.archived ? "Projeto desarquivado" : "Projeto arquivado"),
                );
              }}
              onToggleTask={(task) => {
                const newStatus: TaskStatus = task.status === "completed" ? "pending" : "completed";
                tasksHook.updateTask({ id: task.id, data: { status: newStatus } });
              }}
              onAddTask={(title) => {
                const input: TaskInput = {
                  projectId: p.id,
                  title,
                  status: "pending",
                  priority: "media",
                };
                tasksHook.addTask(input);
              }}
              onRemoveTask={(id) => tasksHook.removeTask(id)}
              expanded={selectedProject === p.id}
              onToggleExpand={() =>
                setSelectedProject((prev) => (prev === p.id ? null : p.id))
              }
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
        onSave={async (data) => {
          if (editing) {
            await projectsHook.updateProject({ id: editing.id, data });
            toast.success("Projeto atualizado");
          } else {
            await projectsHook.addProject(data);
            toast.success("Projeto criado");
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  tasks,
  onEdit,
  onRemove,
  onToggleArchive,
  onToggleTask,
  onAddTask,
  onRemoveTask,
  expanded,
  onToggleExpand,
}: {
  project: Project;
  tasks: Task[];
  onEdit: () => void;
  onRemove: () => void;
  onToggleArchive: () => void;
  onToggleTask: (task: Task) => void;
  onAddTask: (title: string) => void;
  onRemoveTask: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const pct = project.targetAmount > 0
    ? Math.min(100, Math.round((project.currentAmount / project.targetAmount) * 100))
    : 0;
  const done = tasks.filter((t) => t.status === "completed").length;
  const deadline = project.deadline ? parseISO(project.deadline) : null;
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;
  const [newTask, setNewTask] = useState("");

  return (
    <Card
      className={cn(
        "group relative border-border/40 bg-card/40 transition hover:border-border hover:shadow-sm",
        project.archived && "opacity-60",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{project.title}</p>
              {project.description && (
                <p className="truncate text-[11px] text-muted-foreground">{project.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleArchive}>
                {project.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                {project.archived ? "Desarquivar" : "Arquivar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">{pct}%</span>
            {deadline && (
              <span className="text-[11px] text-muted-foreground">
                {daysLeft !== null && daysLeft >= 0
                  ? `${daysLeft} dias restantes`
                  : daysLeft !== null && daysLeft < 0
                    ? `${Math.abs(daysLeft)} dias atrás`
                    : format(deadline, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
          <Progress value={pct} className="mt-2" />
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ListTodo className="h-3 w-3" /> {tasks.length} tarefas
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> {done} concluídas
          </span>
          {project.targetAmount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {project.currentAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} /{" "}
              {project.targetAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          )}
        </div>

        <button
          onClick={onToggleExpand}
          className="mt-3 w-full text-left text-[11px] text-primary hover:underline"
        >
          {expanded ? "Ocultar tarefas" : `Ver tarefas (${tasks.length})`}
        </button>

        {expanded && (
          <div className="mt-3 space-y-1.5 border-t border-border/30 pt-3">
            {tasks.length === 0 && (
              <p className="text-[11px] text-muted-foreground">Nenhuma tarefa neste projeto.</p>
            )}
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 group/task">
                <button
                  onClick={() => onToggleTask(t)}
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded border transition",
                    t.status === "completed"
                      ? "border-success bg-success text-white"
                      : "border-border hover:border-primary",
                  )}
                >
                  {t.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <span
                  className={cn(
                    "flex-1 text-xs",
                    t.status === "completed" && "line-through text-muted-foreground",
                  )}
                >
                  {t.title}
                </span>
                <button
                  onClick={() => onRemoveTask(t.id)}
                  className="opacity-0 group-hover/task:opacity-100 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-1.5 pt-1">
              <Input
                placeholder="Nova tarefa..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTask.trim()) {
                    onAddTask(newTask.trim());
                    setNewTask("");
                  }
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={() => {
                  if (newTask.trim()) {
                    onAddTask(newTask.trim());
                    setNewTask("");
                  }
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  project: Project | null;
  onSave: (data: ProjectInput) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description ?? "");
      setTargetAmount(project.targetAmount ? String(project.targetAmount) : "");
      setCurrentAmount(project.currentAmount ? String(project.currentAmount) : "");
      setDeadline(project.deadline ?? "");
    } else {
      setTitle(""); setDescription(""); setTargetAmount(""); setCurrentAmount(""); setDeadline("");
    }
  }, [project]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetAmount: Number(targetAmount.replace(/[^\d.,]/g, "").replace(",", ".")) || 0,
      currentAmount: Number(currentAmount.replace(/[^\d.,]/g, "").replace(",", ".")) || 0,
      deadline: deadline || undefined,
    });
    setTitle(""); setDescription(""); setTargetAmount(""); setCurrentAmount(""); setDeadline("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setTitle(""); setDescription(""); setTargetAmount(""); setCurrentAmount(""); setDeadline(""); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? "Editar projeto" : "Novo projeto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Valor atual</Label>
              <Input type="text" inputMode="decimal" placeholder="R$ 0,00" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Valor objetivo</Label>
              <Input type="text" inputMode="decimal" placeholder="R$ 0,00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Prazo (opcional)</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {project ? "Salvar" : "Criar projeto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
