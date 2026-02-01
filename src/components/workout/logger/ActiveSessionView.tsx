import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet, UserProfile } from "@/types";
import { calculateTotalVolume } from "@/utils/calculations";
import { RestTimer } from "@/components/workout/RestTimer";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { ExerciseCard } from "./ExerciseCard";
import { useNavigate } from "react-router-dom";

interface ActiveSessionViewProps {
  muscleGroup: string;
  profile: UserProfile | null;
  onCancel: () => void;
}

export function ActiveSessionView({ muscleGroup, profile, onCancel }: ActiveSessionViewProps) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);

  const findPreviousExerciseStats = async (exerciseName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('logs')
      .select('data')
      .eq('user_id', user.id)
      .eq('type', 'workout')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!data) return null;

    for (const log of data) {
      const ex = log.data.exercises?.find((e: any) => e.name.toLowerCase() === exerciseName.toLowerCase());
      if (ex) return ex;
    }
    return null;
  };

  const addExercise = async () => {
    if (!newExerciseName) return;
    setLoadingPrevious(true);
    
    const prevStats = await findPreviousExerciseStats(newExerciseName);
    
    const newEx: WorkoutExercise = {
      name: newExerciseName,
      sets: [],
      is_superset: false,
      previous: prevStats ? {
        weight: prevStats.sets[0]?.weight || 0,
        reps: prevStats.sets[0]?.reps || 0
      } : undefined
    };

    setExercises([...exercises, newEx]);
    setNewExerciseName("");
    setLoadingPrevious(false);
    
    if (prevStats) {
      toast.success(`Datos previos: ${prevStats.sets[0].weight}kg x ${prevStats.sets[0].reps}`);
    }
  };

  const removeExercise = (index: number) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  // NEW: Move Exercise Up/Down
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;

    const updated = [...exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // Fix superset logic logic if moving (if it was superset attached to prev, and moves to 0, it shouldn't be superset)
    if (updated[0].is_superset) {
        updated[0].is_superset = false;
    }

    setExercises(updated);
  };

  const toggleSuperset = (index: number) => {
    if (index === 0) return;
    const updated = [...exercises];
    updated[index].is_superset = !updated[index].is_superset;
    setExercises(updated);
  };

  const handleAddSet = (exerciseIndex: number, set: WorkoutSet) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push(set);
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updated);
  };

  // NEW: Update Set
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, updatedSet: WorkoutSet) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = updatedSet;
    setExercises(updated);
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) {
      toast.error("Registra al menos un ejercicio");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const totalVolume = calculateTotalVolume(exercises);
      
      await supabase.from('logs').insert({
        user_id: user.id,
        type: 'workout',
        muscle_group: muscleGroup,
        workout_date: new Date().toISOString(),
        data: { exercises, total_volume: totalVolume, duration_minutes: 45 }, 
        discipline: profile?.discipline || 'general'
      });

      toast.success("Sesión Finalizada");
      navigate('/workout/analysis', { state: { workoutData: { muscleGroup: muscleGroup, volume: totalVolume, exercises, duration: 45 } } });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-28 max-w-md mx-auto min-h-screen bg-black text-white space-y-6 relative">
      <RestTimer />

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
        <div>
          <div className="bg-zinc-900 text-white px-3 py-1 rounded text-sm font-bold inline-block mb-1">
            {new Date().toLocaleDateString()}
          </div>
          <h2 className="text-3xl font-black italic uppercase text-white leading-none">
            {muscleGroup}
          </h2>
        </div>
      </div>

      {/* EXERCISES LIST */}
      <div className="space-y-6">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            index={i}
            totalExercises={exercises.length}
            exercise={ex}
            units={profile?.units || 'kg'}
            onRemoveExercise={() => removeExercise(i)}
            onMoveUp={() => moveExercise(i, 'up')}
            onMoveDown={() => moveExercise(i, 'down')}
            onToggleSuperset={() => toggleSuperset(i)}
            onAddSet={(set) => handleAddSet(i, set)}
            onRemoveSet={(setIndex) => handleRemoveSet(i, setIndex)}
            onUpdateSet={(setIndex, set) => handleUpdateSet(i, setIndex, set)}
          />
        ))}

        {/* ADD EXERCISE */}
        <div className="pt-4 border-t border-zinc-900">
          <Label className="text-zinc-500 font-bold uppercase text-xs mb-2 block">Agregar Ejercicio</Label>
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <ExerciseSelector 
                value={newExerciseName} 
                onSelect={(name) => setNewExerciseName(name)} 
                targetMuscleGroup={muscleGroup}
              />
            </div>
            <Button className="h-12 w-12 bg-zinc-800 hover:bg-zinc-700 text-white shrink-0" onClick={addExercise} disabled={loadingPrevious || !newExerciseName}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-900 grid grid-cols-2 gap-3 z-50 safe-area-bottom">
        <Button 
          variant="outline" 
          className="h-12 bg-black border-zinc-800 text-zinc-400 font-bold uppercase"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          className="h-12 bg-red-900/80 hover:bg-red-800 text-red-100 font-black italic uppercase tracking-wider border border-red-900"
          onClick={finishWorkout}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Finalizar Sesión"}
        </Button>
      </div>
    </div>
  );
}