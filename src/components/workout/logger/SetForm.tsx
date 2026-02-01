import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntensitySelector, getTechColor, getTechLabel } from "./IntensitySelector";
import { WorkoutSet, UnitSystem, SetExtension } from "@/types";

interface SetFormProps {
  units: UnitSystem;
  onAddSet: (set: WorkoutSet) => void;
  defaultValues?: { weight: string, tempo: string };
  isSuperset: boolean;
}

// Techniques that modify the main set
const COUNTABLE_TECHNIQUES = ['forced_reps', 'partial'];
// Techniques that EXTEND the set
const EXTENSION_TECHNIQUES = ['rest_pause', 'drop_set'];

export function SetForm({ units, onAddSet, defaultValues, isSuperset }: SetFormProps) {
  const [weight, setWeight] = useState(defaultValues?.weight || "");
  const [reps, setReps] = useState("");
  const [tempo, setTempo] = useState(defaultValues?.tempo || "3-0-1");
  const [rest, setRest] = useState("2");
  
  // Basic Techniques
  const [techniques, setTechniques] = useState<string[]>([]);
  const [techniqueCounts, setTechniqueCounts] = useState<Record<string, string>>({});

  // Extensions State
  const [rpRest, setRpRest] = useState("15");
  const [rpReps, setRpReps] = useState("");
  const [dropWeight, setDropWeight] = useState("");
  const [dropReps, setDropReps] = useState("");

  useEffect(() => {
    if (defaultValues?.weight) setWeight(defaultValues.weight);
    if (defaultValues?.tempo) setTempo(defaultValues.tempo);
  }, [defaultValues]);

  const handleAdd = () => {
    if (!weight || !reps) return;

    // Convert string counts to numbers
    const finalCounts: Record<string, number> = {};
    Object.keys(techniqueCounts).forEach(key => {
      if (techniques.includes(key) && techniqueCounts[key]) {
        finalCounts[key] = parseFloat(techniqueCounts[key]);
      }
    });

    // Build Extensions Array
    const extensions: SetExtension[] = [];
    
    if (techniques.includes('rest_pause') && rpReps) {
      extensions.push({
        type: 'rest_pause',
        rest_time: parseFloat(rpRest) || 15,
        reps: parseFloat(rpReps)
      });
    }

    if (techniques.includes('drop_set') && dropReps && dropWeight) {
      extensions.push({
        type: 'drop_set',
        weight: parseFloat(dropWeight),
        reps: parseFloat(dropReps)
      });
    }

    onAddSet({
      weight: parseFloat(weight),
      reps: parseFloat(reps),
      tempo,
      rest_seconds: parseFloat(rest) * 60,
      techniques,
      technique_counts: finalCounts,
      extensions
    });

    // Reset fields relevant to the set, keep tempo/weight suggestions
    setReps("");
    setTechniques([]);
    setTechniqueCounts({});
    setRpReps("");
    setDropWeight("");
    setDropReps("");
  };

  const handleTechniqueCountChange = (techId: string, val: string) => {
    setTechniqueCounts(prev => ({ ...prev, [techId]: val }));
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

        {/* --- MODIFIERS (Forced, Partial) --- */}
        {techniques.some(t => COUNTABLE_TECHNIQUES.includes(t)) && (
          <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1">
            {techniques.filter(t => COUNTABLE_TECHNIQUES.includes(t)).map(tech => (
              <div key={tech} className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold uppercase shrink-0", getTechColor(tech).split(' ')[0])}>
                  + {getTechLabel(tech)}
                </span>
                <Input 
                  type="number" 
                  className="h-7 w-full text-xs text-center bg-zinc-950 border-zinc-800"
                  placeholder="#"
                  value={techniqueCounts[tech] || ""}
                  onChange={(e) => handleTechniqueCountChange(tech, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {/* --- EXTENSIONS (Rest Pause / Drop Set) --- */}
        
        {/* Rest Pause Input */}
        {techniques.includes('rest_pause') && (
          <div className="bg-blue-950/20 border border-blue-900/30 p-2 rounded space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/> Rest Pause
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input 
                  type="number"
                  className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white"
                  placeholder="Pausa (seg)"
                  value={rpRest}
                  onChange={(e) => setRpRest(e.target.value)}
                />
              </div>
              <ArrowRight className="h-4 w-4 text-blue-500/50" />
              <div className="flex-1">
                <Input 
                  type="number"
                  className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white font-bold"
                  placeholder="+ Reps"
                  value={rpReps}
                  onChange={(e) => setRpReps(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Drop Set Input */}
        {techniques.includes('drop_set') && (
          <div className="bg-red-950/20 border border-red-900/30 p-2 rounded space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> Drop Set
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input 
                  type="number"
                  className="h-8 bg-black/50 border-red-900/30 text-xs text-center text-white"
                  placeholder={`Bajar a (${units})`}
                  value={dropWeight}
                  onChange={(e) => setDropWeight(e.target.value)}
                />
              </div>
              <ArrowRight className="h-4 w-4 text-red-500/50" />
              <div className="flex-1">
                <Input 
                  type="number"
                  className="h-8 bg-black/50 border-red-900/30 text-xs text-center text-white font-bold"
                  placeholder="+ Reps"
                  value={dropReps}
                  onChange={(e) => setDropReps(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Simple Tags (Static, etc) */}
        {techniques.length > 0 && !techniques.some(t => [...COUNTABLE_TECHNIQUES, ...EXTENSION_TECHNIQUES].includes(t)) && (
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