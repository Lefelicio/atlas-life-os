import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

import {
  ACTIVITY_LABELS,
  MUSCLE_GROUPS,
  type WorkoutActivity,
  type MuscleGroup,
  type WorkoutInput,
} from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (data: WorkoutInput) => void;
}

export function WorkoutDialog({ open, onOpenChange, onAdd }: Props) {
  const [activity, setActivity] = useState<WorkoutActivity>("musculacao");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [professor, setProfessor] = useState("");
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      setActivity("musculacao");
      setName("");
      setDuration("");
      setProfessor("");
      setMuscles([]);
      setNotes("");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const toggleMuscle = (m: MuscleGroup) => {
    setMuscles((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const submit = () => {
    const dur = duration ? Number(duration) : undefined;
    onAdd({
      date,
      activity,
      name: activity === "outro" ? name.trim() || undefined : undefined,
      duration: dur,
      muscleGroups: activity === "musculacao" && muscles.length > 0 ? muscles : undefined,
      professor: activity === "jiu-jitsu" ? professor.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo treino</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <Label className="text-xs">Atividade</Label>
            <Select value={activity} onValueChange={(v) => setActivity(v as WorkoutActivity)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTIVITY_LABELS) as WorkoutActivity[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {ACTIVITY_LABELS[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activity === "outro" && (
            <div>
              <Label className="text-xs">Nome da atividade</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Natação" autoFocus />
            </div>
          )}

          {activity === "musculacao" && (
            <div>
              <Label className="text-xs">Grupos musculares</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {MUSCLE_GROUPS.map((m) => (
                  <Toggle
                    key={m}
                    size="sm"
                    pressed={muscles.includes(m)}
                    onPressedChange={() => toggleMuscle(m)}
                    className={cn(
                      "text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                    )}
                  >
                    {m}
                  </Toggle>
                ))}
              </div>
            </div>
          )}

          {activity === "jiu-jitsu" && (
            <div>
              <Label className="text-xs">Professor (opcional)</Label>
              <Input value={professor} onChange={(e) => setProfessor(e.target.value)} placeholder="Ex: Carlos" />
            </div>
          )}

          <div>
            <Label className="text-xs">Tempo (minutos)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
          </div>

          <div>
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
