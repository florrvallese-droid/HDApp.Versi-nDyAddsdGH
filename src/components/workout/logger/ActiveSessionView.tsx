import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Clock, Save, X, ChevronLeft } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet, UserProfile } from "@/types";
import { calculateTotalVolume } from "@/utils/calculations";
import { RestTimer } from "@/components/workout/RestTimer";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { ExerciseCard } from "./ExerciseCard";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

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
  
  // Finish Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [manualDuration, setManualDuration] = useState("");
  const [startTime] = useState(Date.now());

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
      previous: prevStats ? { weight: prevStats.sets[0]?.weight || 0, reps: prevStats.sets[0]?.reps || 0 } : undefined
    };
    setExercises([...exercises, newEx]);
    setNewExerciseName("");
    setLoadingPrevious(false);
  };

  const handleOpenFinish = () => {
    if (exercises.length === 0) {
      toast.error("Registra al menos un ejercicio");
      return;
    }
    const currentDuration = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    setManualDuration(currentDuration.toString());
    setShowFinishModal(true);
  };

  const finishWorkout = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const finalDuration = parseInt(manualDuration) || 1;
      const totalVolume = calculateTotalVolume(exercises);
      
      await supabase.from('logs').insert({
        user_id: user.id,
        type: 'workout',
        muscle_group: muscleGroup,
        workout_date: new Date().toISOString(),
        data: { 
          exercises, 
          total_volume: totalVolume, 
          duration_minutes: finalDuration 
        }, 
        discipline: profile?.discipline || 'general'
      });

      toast.success("Sesión Finalizada");
      navigate('/workout/analysis', { 
        state: { 
          workoutData: { 
            muscleGroup: muscleGroup, 
            volume: totalVolume, 
            exercises, 
            duration: finalDuration 
          } 
        } 
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32 max-w-md mx-auto min-h-screen bg-black text-white space-y-6 relative">
      <RestTimer />

      <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
        <div className="flex items-start gap-1">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-500 mt-1">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <div className="bg-zinc-900 text-white px-3 py-1 rounded text-sm font-bold inline-block mb-1">
              {new Date().toLocaleDateString()}
            </div>
            <h2 className="text-3xl font-black italic uppercase text-white leading-none">
              {muscleGroup}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            index={i}
            totalExercises={exercises.length}
            exercise={ex}
            units={profile?.units || 'kg'}
            onRemoveExercise={() => setExercises(exercises.filter((_, idx) => idx !== i))}
            onMoveUp={() => {}} 
            onMoveDown={() => {}} 
            onToggleSuperset={() => {
                const updated = [...exercises];
                updated[i].is_superset = !updated[i].is_superset;
                setExercises(updated);
            }}
            onUpdateName={(name) => {
                const updated = [...exercises];
                updated[i].name = name;
                setExercises(updated);
            }}
            onAddSet={(set) => {
                const updated = [...exercises];
                updated[i].sets.push(set);
                setExercises(updated);
            }}
            onRemoveSet={(si) => {
                const updated = [...exercises];
                updated[i].sets.splice(si, 1);
                setExercises(updated);
            }}
            onUpdateSet={(si, set) => {
                const updated = [...exercises];
                updated[i].sets[si] = set;
                setExercises(updated);
            }}
          />
        ))}

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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 grid grid-cols-2 gap-3 z-[100] safe-area-bottom pb-8">
        <Button variant="outline" className="h-14 bg-black border-zinc-800 text-zinc-400 font-bold uppercase" onClick={onCancel}>Cancelar</Button>
        <Button className="h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wider border border-red-500 shadow-[0_-4px_20px_rgba(220,38,38,0.2)]" onClick={handleOpenFinish}>Finalizar Sesión</Button>
      </div>

      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase italic text-xl">¿Entrenamiento Terminado?</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">Confirma la duración real de tu esfuerzo.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Duración Total (Minutos)
                </Label>
                <Input 
                    type="number" 
                    value={manualDuration} 
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-2xl font-black text-center h-14"
                />
                <p className="text-[10px] text-center text-zinc-600">Calculamos {manualDuration} min basándonos en tu uso de la app.</p>
             </div>
          </div>
          <DialogFooter>
             <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase" onClick={finishWorkout} disabled={loading}>
                {loading ? "GUARDANDO..." : "GUARDAR Y ANALIZAR"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}