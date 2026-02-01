import { Button } from "@/components/ui/button";
import { Link2, Trash2, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WorkoutExercise, WorkoutSet, UnitSystem } from "@/types";
import { SetForm } from "./SetForm";
import { getTechColor, getTechLabel } from "./IntensitySelector";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  units: UnitSystem;
  onRemoveExercise: () => void;
  onToggleSuperset: () => void;
  onAddSet: (set: WorkoutSet) => void;
  onRemoveSet: (setIndex: number) => void;
}

export function ExerciseCard({
  exercise,
  index,
  units,
  onRemoveExercise,
  onToggleSuperset,
  onAddSet,
  onRemoveSet
}: ExerciseCardProps) {
  
  const defaultFormValues = {
    weight: exercise.previous?.weight?.toString() || "",
    tempo: "3-0-1"
  };

  return (
    <div 
      className={cn(
        "space-y-3 animate-in fade-in slide-in-from-bottom-2",
        exercise.is_superset ? "-mt-6 pt-8 border-t-2 border-dashed border-red-900/50 relative z-0" : ""
      )}
    >
      {exercise.is_superset && (
        <div className="absolute top-2 left-4 text-[10px] font-black uppercase text-red-500 flex items-center gap-1">
          <Link2 className="h-3 w-3" /> Super Serie (Pre-Agotamiento)
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-red-500 font-black uppercase text-lg">{exercise.name}</h3>
        <div className="flex gap-1">
          {index > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleSuperset}
              className={cn(
                "h-8 px-2",
                exercise.is_superset ? "text-red-500 bg-red-950/20" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRemoveExercise} className="h-8 px-2 text-zinc-600 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {exercise.previous && (
        <div className="flex items-center gap-2 text-xs bg-yellow-950/30 border border-yellow-900/50 p-2 rounded text-yellow-500 mb-2">
          <Trophy className="h-3 w-3" />
          <span className="font-bold">A SUPERAR:</span>
          <span className="font-mono">{exercise.previous.weight}kg x {exercise.previous.reps} reps</span>
        </div>
      )}

      {exercise.sets.map((set, si) => (
        <div key={si} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 rounded relative overflow-hidden">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Peso</span>
              <span className="text-xl font-bold text-white">{set.weight}<span className="text-xs text-zinc-500 ml-1">{units}</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Reps</span>
              <span className="text-xl font-bold text-white">{set.reps}</span>
            </div>
            
            {set.techniques && set.techniques.length > 0 && (
              <div className="flex flex-wrap gap-1 max-w-[100px]">
                {set.techniques.map(tech => (
                  <Badge key={tech} variant="outline" className={cn("text-[9px] px-1 py-0 h-4 border", getTechColor(tech))}>
                    {getTechLabel(tech)}
                  </Badge>
                ))}
              </div>
            )}

            {exercise.previous && (
              <div className="flex flex-col justify-center ml-2">
                {set.weight > exercise.previous.weight || (set.weight === exercise.previous.weight && set.reps > exercise.previous.reps) ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-1 w-4 bg-zinc-700 rounded"/>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveSet(si)}>
            <Trash2 className="h-3 w-3 text-zinc-700 hover:text-red-500" />
          </Button>
        </div>
      ))}

      <SetForm 
        units={units}
        isSuperset={!!exercise.is_superset}
        defaultValues={defaultFormValues}
        onAddSet={onAddSet}
      />
    </div>
  );
}