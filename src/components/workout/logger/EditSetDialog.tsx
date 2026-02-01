import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkoutSet } from "@/types";
import { IntensitySelector, getTechColor, getTechLabel } from "./IntensitySelector";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: WorkoutSet;
  onSave: (updatedSet: WorkoutSet) => void;
}

const COUNTABLE_TECHNIQUES = ['forced_reps', 'partial', 'negatives', 'rest_pause'];

export function EditSetDialog({ open, onOpenChange, set, onSave }: EditSetDialogProps) {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());
  const [tempo, setTempo] = useState(set.tempo || "3-0-1");
  const [techniques, setTechniques] = useState<string[]>(set.techniques || []);
  
  // Initialize technique counts with defaults from set or empty string
  const [techniqueCounts, setTechniqueCounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (set.technique_counts) {
      Object.entries(set.technique_counts).forEach(([k, v]) => {
        initial[k] = v.toString();
      });
    }
    return initial;
  });

  const handleSave = () => {
    const finalCounts: Record<string, number> = {};
    
    // Only save counts for currently selected techniques
    Object.keys(techniqueCounts).forEach(key => {
      if (techniques.includes(key) && techniqueCounts[key]) {
        finalCounts[key] = parseFloat(techniqueCounts[key]);
      }
    });

    onSave({
      ...set,
      weight: parseFloat(weight) || 0,
      reps: parseFloat(reps) || 0,
      tempo,
      techniques,
      technique_counts: finalCounts
    });
    onOpenChange(false);
  };

  const handleTechniqueCountChange = (techId: string, val: string) => {
    setTechniqueCounts(prev => ({ ...prev, [techId]: val }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center font-bold uppercase">Editar Serie</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Peso</Label>
              <Input 
                type="number" 
                className="bg-zinc-900 border-zinc-800 text-white font-bold"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Reps</Label>
              <Input 
                type="number" 
                className="bg-zinc-900 border-zinc-800 text-white font-bold"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Cadencia</Label>
            <Input 
              className="bg-zinc-900 border-zinc-800 text-zinc-300"
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label className="text-[10px] text-zinc-500 uppercase font-bold">Técnicas</Label>
               <IntensitySelector 
                  selectedTechniques={techniques} 
                  onChange={setTechniques} 
               />
            </div>
            
            {/* Dynamic Inputs for Countable Techniques */}
            {techniques.some(t => COUNTABLE_TECHNIQUES.includes(t)) && (
              <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 grid grid-cols-2 gap-2 mt-2">
                {techniques.filter(t => COUNTABLE_TECHNIQUES.includes(t)).map(tech => (
                  <div key={tech} className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase", getTechColor(tech).split(' ')[0])}>
                      + {getTechLabel(tech)}
                    </span>
                    <Input 
                      type="number" 
                      className="h-7 w-14 text-xs text-center bg-zinc-950 border-zinc-800"
                      placeholder="#"
                      value={techniqueCounts[tech] || ""}
                      onChange={(e) => handleTechniqueCountChange(tech, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags Display (for non-countable) */}
            {techniques.length > 0 && !techniques.some(t => COUNTABLE_TECHNIQUES.includes(t)) && (
              <div className="flex flex-wrap gap-1">
                {techniques.map(tech => (
                  <span key={tech} className={cn("text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1", getTechColor(tech))}>
                    {getTechLabel(tech)}
                    <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setTechniques(techniques.filter(t => t !== tech))}/>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full bg-white text-black hover:bg-zinc-200 font-bold">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}