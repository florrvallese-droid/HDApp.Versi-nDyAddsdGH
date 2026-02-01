import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkoutSet, SetExtension } from "@/types";
import { IntensitySelector, getTechColor, getTechLabel } from "./IntensitySelector";
import { X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: WorkoutSet;
  onSave: (updatedSet: WorkoutSet) => void;
}

const COUNTABLE_TECHNIQUES = ['forced_reps', 'partial', 'static'];
const EXTENSION_TECHNIQUES = ['rest_pause', 'drop_set'];

export function EditSetDialog({ open, onOpenChange, set, onSave }: EditSetDialogProps) {
  const [weight, setWeight] = useState(set.weight === 0 && set.reps === 0 && set.techniques?.length ? "" : set.weight.toString());
  const [reps, setReps] = useState(set.weight === 0 && set.reps === 0 && set.techniques?.length ? "" : set.reps.toString());
  const [tempo, setTempo] = useState(set.tempo || "3-0-1");
  const [isUnilateral, setIsUnilateral] = useState(set.is_unilateral || false);
  const [techniques, setTechniques] = useState<string[]>(set.techniques || []);
  
  const [techniqueCounts, setTechniqueCounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (set.technique_counts) {
      Object.entries(set.technique_counts).forEach(([k, v]) => {
        initial[k] = v.toString();
      });
    }
    return initial;
  });

  const [extensions, setExtensions] = useState<SetExtension[]>(set.extensions || []);
  
  const rpExt = extensions.find(e => e.type === 'rest_pause');
  const dropExt = extensions.find(e => e.type === 'drop_set');

  const [rpRest, setRpRest] = useState(rpExt?.rest_time?.toString() || "15");
  const [rpReps, setRpReps] = useState(rpExt?.reps.toString() || "");
  const [dropWeight, setDropWeight] = useState(dropExt?.weight?.toString() || "");
  const [dropReps, setDropReps] = useState(dropExt?.reps.toString() || "");

  const handleSave = () => {
    const w = parseFloat(weight) || 0;
    const r = parseFloat(reps) || 0;

    const hasAnyData = weight !== "" || reps !== "" || techniques.length > 0;
    
    if (!hasAnyData) {
      toast.error("Ingresa al menos un valor");
      return;
    }

    const finalCounts: Record<string, number> = {};
    Object.keys(techniqueCounts).forEach(key => {
      if (techniques.includes(key) && techniqueCounts[key]) {
        finalCounts[key] = parseFloat(techniqueCounts[key]);
      }
    });

    const finalExtensions: SetExtension[] = [];
    if (techniques.includes('rest_pause') && rpReps) {
      finalExtensions.push({
        type: 'rest_pause',
        rest_time: parseFloat(rpRest) || 15,
        reps: parseFloat(rpReps)
      });
    }
    if (techniques.includes('drop_set') && dropReps && dropWeight) {
      finalExtensions.push({
        type: 'drop_set',
        weight: parseFloat(dropWeight),
        reps: parseFloat(dropReps)
      });
    }

    onSave({
      ...set,
      weight: w,
      reps: r,
      tempo,
      is_unilateral: isUnilateral,
      techniques,
      technique_counts: finalCounts,
      extensions: finalExtensions
    });
    onOpenChange(false);
  };

  const handleTechniqueCountChange = (techId: string, val: string) => {
    setTechniqueCounts(prev => ({ ...prev, [techId]: val }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-xs max-h-[90vh] overflow-y-auto">
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
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Reps</Label>
              <Input 
                type="number" 
                className="bg-zinc-900 border-zinc-800 text-white font-bold"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase font-bold">Cadencia</Label>
              <Input 
                className="bg-zinc-900 border-zinc-800 text-zinc-300"
                value={tempo}
                onChange={(e) => setTempo(e.target.value)}
              />
            </div>
            <Button 
                variant="outline" 
                className={cn(
                  "h-10 px-3 border-zinc-800 bg-zinc-900 text-[10px] font-black uppercase tracking-tighter",
                  isUnilateral ? "border-blue-600 bg-blue-600/10 text-blue-400" : "text-zinc-600"
                )}
                onClick={() => setIsUnilateral(!isUnilateral)}
            >
                Unilat
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <Label className="text-[10px] text-zinc-500 uppercase font-bold">Técnicas</Label>
               <IntensitySelector 
                  selectedTechniques={techniques} 
                  onChange={setTechniques} 
               />
            </div>
            
            {techniques.some(t => COUNTABLE_TECHNIQUES.includes(t)) && (
              <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 grid grid-cols-2 gap-2 mt-2">
                {techniques.filter(t => COUNTABLE_TECHNIQUES.includes(t)).map(tech => (
                  <div key={tech} className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold uppercase", getTechColor(tech).split(' ')[0])}>
                      {tech === 'static' ? 'Hold' : `+ ${getTechLabel(tech)}`}
                    </span>
                    <Input 
                      type="number" 
                      className="h-7 w-14 text-xs text-center bg-zinc-950 border-zinc-800"
                      placeholder={tech === 'static' ? "seg" : "#"}
                      value={techniqueCounts[tech] || ""}
                      onChange={(e) => handleTechniqueCountChange(tech, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {techniques.includes('rest_pause') && (
              <div className="bg-blue-950/20 border border-blue-900/30 p-2 rounded space-y-2 mt-2">
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase">Rest Pause</div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white"
                    placeholder="Pausa (s)"
                    value={rpRest}
                    onChange={(e) => setRpRest(e.target.value)}
                  />
                  <ArrowRight className="h-4 w-4 text-blue-500/50" />
                  <Input 
                    type="number"
                    className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white font-bold"
                    placeholder="+ Reps"
                    value={rpReps}
                    onChange={(e) => setRpReps(e.target.value)}
                  />
                </div>
              </div>
            )}

            {techniques.includes('drop_set') && (
              <div className="bg-red-950/20 border border-red-900/30 p-2 rounded space-y-2 mt-2">
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase">Drop Set</div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white"
                    placeholder="Nuevo Peso"
                    value={dropWeight}
                    onChange={(e) => setDropWeight(e.target.value)}
                  />
                  <ArrowRight className="h-4 w-4 text-red-500/50" />
                  <Input 
                    type="number"
                    className="h-8 bg-black/50 border-blue-900/30 text-xs text-center text-white font-bold"
                    placeholder="+ Reps"
                    value={dropReps}
                    onChange={(e) => setDropReps(e.target.value)}
                  />
                </div>
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