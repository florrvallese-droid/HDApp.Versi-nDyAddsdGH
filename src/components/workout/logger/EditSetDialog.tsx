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

export function EditSetDialog({ open, onOpenChange, set, onSave }: EditSetDialogProps) {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());
  const [tempo, setTempo] = useState(set.tempo || "3-0-1");
  const [techniques, setTechniques] = useState<string[]>(set.techniques || []);

  const handleSave = () => {
    onSave({
      ...set,
      weight: parseFloat(weight) || 0,
      reps: parseFloat(reps) || 0,
      tempo,
      techniques
    });
    onOpenChange(false);
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
            
            {techniques.length > 0 && (
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