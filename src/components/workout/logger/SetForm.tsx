"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntensitySelector, getTechColor, getTechLabel } from "./IntensitySelector";
import { WorkoutSet, UnitSystem, SetExtension } from "@/types";
import { toast } from "sonner";

interface SetFormProps {
  units: UnitSystem;
  onAddSet: (set: WorkoutSet) => void;
  defaultValues?: { weight: string, tempo: string };
  isSuperset: boolean;
}

const COUNTABLE_TECHNIQUES = ['forced_reps', 'partial', 'static'];

export function SetForm({ units, onAddSet, defaultValues, isSuperset }: SetFormProps) {
  const [weight, setWeight] = useState(defaultValues?.weight || "");
  const [reps, setReps] = useState("");
  const [tempo, setTempo] = useState(defaultValues?.tempo || "3-0-1");
  const [rest, setRest] = useState("2");
  const [isUnilateral, setIsUnilateral] = useState(false);
  const [isFailure, setIsFailure] = useState(true); // Default to true in HD system
  
  const [techniques, setTechniques] = useState<string[]>([]);
  const [techniqueCounts, setTechniqueCounts] = useState<Record<string, string>>({});

  const [rpRest, setRpRest] = useState("15");
  const [rpReps, setRpReps] = useState("");
  const [dropWeight, setDropWeight] = useState("");
  const [dropReps, setDropReps] = useState("");

  useEffect(() => {
    if (defaultValues?.weight) setWeight(defaultValues.weight);
    if (defaultValues?.tempo) setTempo(defaultValues.tempo);
  }, [defaultValues]);

  const handleTechniqueCountChange = (techId: string, val: string) => {
    setTechniqueCounts(prev => ({ ...prev, [techId]: val }));
  };

  const handleAdd = () => {
    const hasAnyData = weight !== "" || reps !== "" || techniques.length > 0;
    
    if (!hasAnyData) {
      toast.error("Ingresa peso o repeticiones");
      return;
    }

    const finalCounts: Record<string, number> = {};
    Object.keys(techniqueCounts).forEach(key => {
      if (techniques.includes(key) && techniqueCounts[key]) {
        finalCounts[key] = parseFloat(techniqueCounts[key]);
      }
    });

    const extensions: SetExtension[] = [];
    if (techniques.includes('rest_pause') && rpReps) {
      extensions.push({ type: 'rest_pause', rest_time: parseFloat(rpRest) || 15, reps: parseFloat(rpReps) });
    }
    if (techniques.includes('drop_set') && dropReps && dropWeight) {
      extensions.push({ type: 'drop_set', weight: parseFloat(dropWeight), reps: parseFloat(dropReps) });
    }

    onAddSet({
      weight: parseFloat(weight) || 0,
      reps: parseFloat(reps) || 0,
      tempo,
      is_unilateral: isUnilateral,
      is_failure: isFailure,
      rest_seconds: parseFloat(rest) * 60,
      techniques,
      technique_counts: finalCounts,
      extensions
    });

    setReps("");
    setTechniques([]);
    setTechniqueCounts({});
    setRpReps("");
    setDropWeight("");
    setDropReps("");
    // We keep weight and tempo for next set convenience
  };

  return (
    <Card className={cn("bg-zinc-950 border border-zinc-800", isSuperset ? "border-dashed border-zinc-700" : "")}>
      <CardContent className="p-4 space-y-4">
        {/* Input Principal */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Peso ({units})</Label>
            <Input 
                type="number" 
                inputMode="decimal"
                className="bg-zinc-900 border-zinc-800 text-white h-12 font-black text-lg text-center" 
                placeholder="0" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Reps</Label>
            <Input 
                type="number" 
                inputMode="numeric"
                className="bg-zinc-900 border-zinc-800 text-white h-12 font-black text-lg text-center" 
                placeholder="0" 
                value={reps} 
                onChange={(e) => setReps(e.target.value)} 
            />
          </div>
        </div>
        
        {/* Controles de Intensidad */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[70px] space-y-1">
             <Label className="text-[9px] text-zinc-600 uppercase font-bold">Cadencia</Label>
             <Input className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs font-mono" placeholder="3-0-1" value={tempo} onChange={(e) => setTempo(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[70px] space-y-1">
             <Label className="text-[9px] text-zinc-600 uppercase font-bold">Descanso</Label>
             <Input type="number" className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs" placeholder="2" value={rest} onChange={(e) => setRest(e.target.value)} />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
                variant="outline" 
                className={cn(
                    "h-9 px-3 border-zinc-800 bg-zinc-900 text-[10px] font-black uppercase tracking-tighter",
                    isUnilateral ? "border-blue-600 bg-blue-600/10 text-blue-400" : "text-zinc-600"
                )}
                onClick={() => setIsUnilateral(!isUnilateral)}
            >
                Unilat
            </Button>
            <Button 
                variant="outline" 
                className={cn(
                    "h-9 px-3 border-zinc-800 bg-zinc-900 text-[10px] font-black uppercase tracking-tighter flex gap-1",
                    isFailure ? "border-red-600 bg-red-600/10 text-red-500" : "text-zinc-600"
                )}
                onClick={() => setIsFailure(!isFailure)}
            >
                <Skull className="h-3 w-3" /> Fallo
            </Button>
            <IntensitySelector selectedTechniques={techniques} onChange={setTechniques} />
          </div>
        </div>

        {/* Técnicas Contables */}
        {techniques.some(t => COUNTABLE_TECHNIQUES.includes(t)) && (
          <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 grid grid-cols-2 gap-2">
            {techniques.filter(t => COUNTABLE_TECHNIQUES.includes(t)).map(tech => (
              <div key={tech} className="flex items-center gap-2">
                <span className={cn("text-[9px] font-black uppercase shrink-0", getTechColor(tech).split(' ')[0])}>
                    {tech === 'static' ? 'Hold' : `+ ${getTechLabel(tech)}`}
                </span>
                <Input 
                    type="number" 
                    className="h-8 w-full text-xs text-center bg-zinc-950 border-zinc-800" 
                    placeholder={tech === 'static' ? "seg" : "#"}
                    value={techniqueCounts[tech] || ""} 
                    onChange={(e) => handleTechniqueCountChange(tech, e.target.value)} 
                />
              </div>
            ))}
          </div>
        )}

        {/* Extensiones Visuales */}
        {techniques.includes('rest_pause') && (
          <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">Rest Pause</div>
            <div className="flex items-center gap-3">
              <Input type="number" className="h-9 bg-black/50 border-blue-900/30 text-xs text-center text-white" placeholder="seg" value={rpRest} onChange={(e) => setRpRest(e.target.value)} />
              <ArrowRight className="h-4 w-4 text-blue-500 opacity-50" />
              <Input type="number" className="h-9 bg-black/50 border-blue-900/30 text-xs text-center font-black text-white" placeholder="+Reps" value={rpReps} onChange={(e) => setRpReps(e.target.value)} />
            </div>
          </div>
        )}

        {techniques.includes('drop_set') && (
          <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest">Drop Set</div>
            <div className="flex items-center gap-3">
              <Input type="number" className="h-9 bg-black/50 border-red-900/30 text-xs text-center text-white" placeholder="Peso" value={dropWeight} onChange={(e) => setDropWeight(e.target.value)} />
              <ArrowRight className="h-4 w-4 text-red-500 opacity-50" />
              <Input type="number" className="h-9 bg-black/50 border-red-900/30 text-xs text-center font-black text-white" placeholder="+Reps" value={dropReps} onChange={(e) => setDropReps(e.target.value)} />
            </div>
          </div>
        )}

        <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-xs" onClick={handleAdd}>
            Registrar Serie
        </Button>
      </CardContent>
    </Card>
  );
}