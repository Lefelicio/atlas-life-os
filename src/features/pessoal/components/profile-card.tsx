import { useState } from "react";
import { User, Cake, Ruler, Scale, Target, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePessoal } from "../store";
import { ageLabel, calcBMI, bmiCategory, formatWeight } from "../utils";
import { cn } from "@/lib/utils";

export function ProfileCard() {
  const { profile, weights, updateProfile } = usePessoal();
  const [open, setOpen] = useState(false);

  const currentWt = weights.length > 0
    ? [...weights].sort((a, b) => b.date.localeCompare(a.date))[0].weight
    : undefined;
  const bmi = calcBMI(currentWt, profile.height);
  const cat = bmiCategory(bmi);

  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Perfil
              </p>
              <h2 className="mt-0.5 text-xl font-semibold tracking-tight">
                {profile.name || "Sem nome"}
              </h2>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setOpen(true)}>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <InfoRow icon={<Cake className="h-3.5 w-3.5" />} label="Nascimento" value={profile.birthDate ? new Date(profile.birthDate).toLocaleDateString("pt-BR") : "—"} />
          <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Idade" value={ageLabel(profile.birthDate)} />
          <InfoRow icon={<Ruler className="h-3.5 w-3.5" />} label="Altura" value={profile.height ? `${profile.height} cm` : "—"} />
          <InfoRow icon={<Scale className="h-3.5 w-3.5" />} label="Peso atual" value={currentWt !== undefined ? formatWeight(currentWt) : "—"} />
          <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="Peso objetivo" value={profile.weightGoal !== undefined ? formatWeight(profile.weightGoal) : "—"} />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <span>IMC</span>
            </div>
            <p className={cn("text-sm font-semibold tabular-nums", cat?.color ?? "text-muted-foreground")}>
              {bmi !== null ? bmi.toFixed(1).replace(".", ",") : "—"}
            </p>
            {cat && (
              <p className={cn("text-[11px]", cat.color)}>{cat.label}</p>
            )}
          </div>
        </div>
      </CardContent>

      <ProfileEditDialog
        open={open}
        onOpenChange={setOpen}
        profile={profile}
        onSave={updateProfile}
      />
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}

function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  profile: { name: string; birthDate?: string; height?: number; weightGoal?: number };
  onSave: (data: Partial<{ name: string; birthDate: string; height: number; weightGoal: number }>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");
  const [height, setHeight] = useState(profile.height ? String(profile.height) : "");
  const [weightGoal, setWeightGoal] = useState(profile.weightGoal ? String(profile.weightGoal) : "");

  const save = () => {
    onSave({
      name: name.trim(),
      birthDate: birthDate || undefined,
      height: height ? Number(height) : undefined,
      weightGoal: weightGoal ? Number(weightGoal) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <Label className="text-xs">Data de nascimento</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Altura (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Peso objetivo (kg)</Label>
              <Input type="number" step="0.1" value={weightGoal} onChange={(e) => setWeightGoal(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
