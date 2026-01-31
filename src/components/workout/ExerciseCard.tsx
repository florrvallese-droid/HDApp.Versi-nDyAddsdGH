import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Target, Trophy, Plus } from "lucide-react";
import { WorkoutExercise, WorkoutSet } from "@/types";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onRemove: () => void;
  onUpdate: (updated: WorkoutExercise) => void;
  units: string;
}

export function ExerciseCard({ exercise, index, onRemove, onUpdate, units }: ExerciseCardProps) {
  // Local state for adding a new set specific to this card
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [tempo, setTempo] = useState("3-0-1");
  const [rest, setRest] = useState("2");

  const addSet = () => {
    if (!weight || !reps) return;

    const newSet: WorkoutSet = {
      weight: parseFloat(weight),
      reps: parseFloat(reps),
      tempo: tempo,
      rest_seconds: parseFloat(rest) * 60
    };

    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet]
    };

    onUpdate(updatedExercise);
    
    // Check if we beat the target (simple check for feedback)
    if (exercise.previous) {
      if (newSet.weight > exercise.previous.weight || (newSet.weight === exercise.previous.weight && newSet.reps > exercise.previous.reps)) {
        // Could trigger a mini-confetti or toast here in future
      }
    }
  };

  const removeSet = (setIndex: number) => {
    const updatedSets = [...exercise.sets];
    updatedSets.splice(setIndex, 1);
    onUpdate({ ...exercise, sets: updatedSets });
  };

  const isProgressSet = (set: WorkoutSet) => {
    if (!exercise.previous) return false;
    return (set.weight > exercise.previous.weight) || 
           (set.weight === exercise.previous.weight && set.reps > exercise.previous.reps);
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-red-500 font-black uppercase text-lg leading-none">{exercise.name}</h3>
          {exercise.previous && (
            <div className="flex items-center gap-1.5 mt-1">
              <Target className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">
                Objetivo: {exercise.previous.weight}{units} × {exercise.previous.reps}
              </span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="text-zinc-600 hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {exercise.sets.map((set, si) => (
          <div 
            key={si} 
            className={cn(
              "flex items-center justify-between p-3 rounded border transition-colors",
              isProgressSet(set) 
                ? "bg-green-950/20 border-green-900/50" 
                : "bg-zinc-900/50 border-zinc-800"
            )}
          >
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Carga</span>
                <span className={cn("text-xl font-bold", isProgressSet(set) ? "text-green-400" : "text-white")}>
                  {set.weight}<span className="text-xs text-zinc-500 ml-0.5">{units}</span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Reps</span>
                <span className={cn("text-xl font-bold", isProgressSet(set) ? "text-green-400" : "text-white")}>
                  {set.reps}
                </span>
              </div>
              {isProgressSet(set) && (
                <div className="bg-green-500/10 p-1.5 rounded-full ml-2">
                  <Trophy className="h-3 w-3 text-green-500" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Tempo</div>
                <div className="text-xs font-mono text-zinc-400">{set.tempo || "-"}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSet(si)}>
                <Trash2 className="h-3.5 w-3.5 text-zinc-600 hover:text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {/* ADD SET FORM */}
        <Card className="bg-zinc-950 border border-zinc-800/50 shadow-inner">
          <CardContent className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] text-zinc-500 uppercase font-bold">Peso ({units})</Label>
                <Input 
                  type="number" 
                  className="bg-zinc-900 border-zinc-800 text-white h-9 font-bold focus-visible:ring-red-600/50"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] text-zinc-500 uppercase font-bold">Reps (Al Fallo)</Label>
                <Input 
                  type="number" 
                  className="bg-zinc-900 border-zinc-800 text-white h-9 font-bold focus-visible:ring-red-600/50"
                  placeholder="0"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <Label className="text-[9px] text-zinc-500 uppercase font-bold">Cadencia</Label>
                <Input 
                  className="bg-zinc-900 border-zinc-800 text-zinc-400 h-8 text-xs font-mono"
                  placeholder="3-0-1"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-[9px] text-zinc-500 uppercase font-bold">Descanso (m)</Label>
                <Input 
                  type="number"
                  className="bg-zinc-900 border-zinc-800 text-zinc-400 h-8 text-xs font-mono"
                  placeholder="2"
                  value={rest}
                  onChange={(e) => setRest(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  size="sm"
                  className="h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                  onClick={addSet}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}