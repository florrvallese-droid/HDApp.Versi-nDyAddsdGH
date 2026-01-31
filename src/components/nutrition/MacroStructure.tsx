import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Scale, Activity } from "lucide-react";
import { PhaseGoal } from "@/types";

interface MacroStructureProps {
  currentDate: string;
  weight: string;
  setWeight: (val: string) => void;
  phaseGoal: PhaseGoal;
  setPhaseGoal: (val: PhaseGoal) => void;
}

export function MacroStructure({
  currentDate,
  weight,
  setWeight,
  phaseGoal,
  setPhaseGoal
}: MacroStructureProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        <Activity className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Macro-Estructura</span>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 text-white">
        <CardContent className="p-4 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Fecha</Label>
              <div className="flex items-center h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300">
                <Calendar className="mr-2 h-3 w-3 text-zinc-500" /> {currentDate}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Peso Hoy (Kg)</Label>
              <div className="relative">
                <Input 
                  type="number"
                  className="bg-zinc-900 border-zinc-800 text-white font-bold h-10 pl-8"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Scale className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Fase Objetivo</Label>
            <Select value={phaseGoal} onValueChange={(v: PhaseGoal) => setPhaseGoal(v)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white font-bold h-11 uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="volume">Volumen</SelectItem>
                <SelectItem value="definition">Definición</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}