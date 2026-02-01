import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntensitySelector, getTechColor, getTechLabel } from "./IntensitySelector";
import { WorkoutSet, UnitSystem } from "@/types";

interface SetFormProps {
  units: UnitSystem;
  onAddSet: (set: WorkoutSet) => void;
  defaultValues?: { weight: string, tempo: string };
  isSuperset: boolean;
}

export function SetForm({ units, onAddSet, defaultValues, isSuperset }: SetFormProps) {
  const [weight, setWeight] = useState(defaultValues?.weight || "");
  const [reps, setReps] = useState("");
  const [tempo, setTempo] = useState(defaultValues?.tempo || "3-0-1");
  const [rest, setRest] = useState("2");
  const [techniques, setTechniques] = useState<string[]>([]);

  useEffect(() => {
    if (defaultValues?.weight) setWeight(defaultValues.weight);
    if (defaultValues?.tempo) setTempo(defaultValues.tempo);
  }, [defaultValues]);

  const handleAdd = () => {
    if (!weight || !reps) return;

    onAddSet({
      weight: parseFloat(weight),
      reps: parseFloat(reps),
      tempo,
      rest_seconds: parseFloat(rest) * 60,
      techniques
    });

    setReps("");
    setTechniques([]);
  };

  return (
    <Card className={cn("bg-zinc-950 border border-zinc-800", isSuperset ? "border-dashed border-zinc-700" : "")}>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Peso ({units})</Label>
            <Input 
              type="number" 
              className="bg-zinc-900 border-zinc-800 text-white h-10 font-bold"
              placeholder="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Reps (Al Fallo)</Label>
            <Input 
              type="number" 
              className="bg-zinc-900 border-zinc-800 text-white h-10 font-bold"
              placeholder="0"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Cadencia</Label>
            <Input 
              className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs"
              placeholder="3-0-1"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Descanso</Label>
            <Input 
              type="number"
              className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs"
              placeholder="2"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
            />
          </div>
          
          <IntensitySelector 
            selectedTechniques={techniques} 
            onChange={setTechniques} 
          />
        </div>

        {techniques.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {techniques.map(tech => (
              <span key={tech} className={cn("text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1", getTechColor(tech))}>
                {getTechLabel(tech)}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setTechniques(techniques.filter(t => t !== tech))}/>
              </span>
            ))}
          </div>
        )}

        <Button 
          className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase text-xs tracking-wider mt-2"
          onClick={handleAdd}
        >
          Registrar Serie
        </Button>
      </CardContent>
    </Card>
  );
}