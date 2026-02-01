import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Trash2, Trophy, Pencil, ArrowUp, ArrowDown, ChevronRight, CornerDownRight, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WorkoutExercise, WorkoutSet, UnitSystem } from "@/types";
import { SetForm } from "./SetForm";
import { getTechColor, getTechLabel } from "./IntensitySelector";
import { EditSetDialog } from "./EditSetDialog";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  totalExercises: number;
  units: UnitSystem;
  onRemoveExercise: () => void;
  onToggleSuperset: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddSet: (set: WorkoutSet) => void;
  onRemoveSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, set: WorkoutSet) => void;
}

export function ExerciseCard({
  exercise, index, totalExercises, units, onRemoveExercise, onToggleSuperset, onMoveUp, onMoveDown, onAddSet, onRemoveSet, onUpdateSet
}: ExerciseCardProps) {
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const defaultFormValues = { weight: exercise.previous?.weight?.toString() || "", tempo: "3-0-1" };

  return (
    <div className={cn("space-y-3 animate-in fade-in", exercise.is_superset ? "-mt-6 pt-8 border-t-2 border-dashed border-red-900/50 relative" : "")}>
      {exercise.is_superset && <div className="absolute top-2 left-4 text-[10px] font-black uppercase text-red-500 flex items-center gap-1"><Link2 className="h-3 w-3" /> Super Serie</div>}

      <div className="flex justify-between items-start gap-2">
        <h3 className="text-red-500 font-black uppercase text-lg leading-tight flex-1">{exercise.name}</h3>
        <div className="flex gap-1 shrink-0">
          <div className="flex bg-zinc-900 rounded-md border border-zinc-800 mr-1">
             <Button variant="ghost" size="icon" className="h-8 w-6" onClick={onMoveUp} disabled={index === 0}><ArrowUp className="h-3 w-3" /></Button>
             <Button variant="ghost" size="icon" className="h-8 w-6" onClick={onMoveDown} disabled={index === totalExercises - 1}><ArrowDown className="h-3 w-3" /></Button>
          </div>
          {index > 0 && <Button variant="ghost" size="sm" onClick={onToggleSuperset} className={cn("h-8 px-2", exercise.is_superset ? "text-red-500 bg-red-950/20" : "text-zinc-600")}><Link2 className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="sm" onClick={onRemoveExercise} className="h-8 px-2 text-zinc-600 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>

      {exercise.previous && (
        <div className="flex items-center gap-2 text-xs bg-yellow-950/30 border border-yellow-900/50 p-2 rounded text-yellow-500">
          <Trophy className="h-3 w-3" /> <span className="font-bold">A SUPERAR:</span> <span className="font-mono">{exercise.previous.weight}kg x {exercise.previous.reps}</span>
        </div>
      )}

      {exercise.sets.map((set, si) => (
        <div key={si} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded group">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-center flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Peso</span>
                <span className="text-xl font-bold text-white flex items-center gap-1">
                    {set.weight}<span className="text-xs text-zinc-500">{units}</span>
                    {set.is_unilateral && <UserCheck className="h-3 w-3 text-blue-400" />}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Reps</span>
                <span className="text-xl font-bold text-white">{set.reps}</span>
              </div>
              <div className="flex flex-wrap gap-1 max-w-[100px]">
                {set.techniques?.map(tech => (
                  <Badge key={tech} variant="outline" className={cn("text-[9px] px-1 py-0 h-4 border", getTechColor(tech))}>{getTechLabel(tech)}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => setEditingSetIndex(si)}><Pencil className="h-3.5 w-3.5" /></Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => onRemoveSet(si)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          {set.extensions?.map((ext, i) => (
            <div key={i} className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
               <CornerDownRight className="h-3 w-3" />
               <span className="font-bold uppercase">{ext.type === 'rest_pause' ? `RP ${ext.rest_time}s` : `DROP ${ext.weight}${units}`}</span>
               <ChevronRight className="h-3 w-3 opacity-50"/> <span className="text-white font-bold">+{ext.reps} reps</span>
            </div>
          ))}
        </div>
      ))}

      <SetForm units={units} isSuperset={!!exercise.is_superset} defaultValues={defaultFormValues} onAddSet={onAddSet} />
      
      {editingSetIndex !== null && <EditSetDialog open={true} onOpenChange={(open) => !open && setEditingSetIndex(null)} set={exercise.sets[editingSetIndex]} onSave={(updatedSet) => onUpdateSet(editingSetIndex, updatedSet)} />}
    </div>
  );
}