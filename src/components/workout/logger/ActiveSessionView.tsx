"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Clock, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, UserProfile } from "@/types";
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
    
    // Auto-scroll to bottom to show new exercise
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
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
    <div className="p-4 pb-40 max-w-md mx-auto min-h-screen bg-black text-white space-y-8 relative animate-in fade-in duration-500">
      <RestTimer />

      {/* Header Fijo */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 sticky top-0 bg-black/80 backdrop-blur-md z-50 -mx-4 px-4 pt-2">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-500 h-10 w-10">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h2 className="text-xl font-black italic uppercase text-white leading-none truncate max-w-[200px]">
            {muscleGroup}
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Sesión en Curso</p>
        </div>
      </div>

      <div className="space-y-10">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            index={i}
            totalExercises={exercises.length}
            exercise={ex}
            units={profile?.units || 'kg'}
            onRemoveExercise={() => setExercises(exercises.filter((_, idx) => idx !== i))}
            onMoveUp={() => {
                if (i === 0) return;
                const updated = [...exercises];
                [updated[i], updated[i - 1]] = [updated[i - 1], updated[i]];
                setExercises(updated);
            }} 
            onMoveDown={() => {
                if (i === exercises.length - 1) return;
                const updated = [...exercises];
                [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
                setExercises(updated);
            }} 
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

        {/* Agregar Ejercicio */}
        <div className="pt-8 border-t border-zinc-900 bg-zinc-950/30 p-4 rounded-2xl">
          <Label className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-3 block">Próximo Ejercicio</Label>
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <ExerciseSelector 
                value={newExerciseName} 
                onSelect={(name) => setNewExerciseName(name)} 
                targetMuscleGroup={muscleGroup}
              />
            </div>
            <Button className="h-12 w-12 bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white shrink-0" onClick={addExercise} disabled={loadingPrevious || !newExerciseName}>
              {loadingPrevious ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Mobile Fijo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 grid grid-cols-[1fr_2fr] gap-3 z-[100] safe-area-bottom pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <Button variant="ghost" className="h-14 bg-zinc-900/50 border border-zinc-800 text-zinc-500 font-bold uppercase text-xs" onClick={onCancel}>
            Salir
        </Button>
        <Button className="h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]" onClick={handleOpenFinish}>
            FINALIZAR SESIÓN
        </Button>
      </div>

      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-xs max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center font-black uppercase italic text-xl">¿Sesión Terminada?</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">Confirma el tiempo bajo tensión total.</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
             <div className="space-y-3">
                <Label className="text-xs font-black uppercase text-zinc-400 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" /> Minutos de Entrenamiento
                </Label>
                <Input 
                    type="number" 
                    inputMode="numeric"
                    value={manualDuration} 
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-3xl font-black text-center h-20 text-red-500"
                />
             </div>
          </div>
          <DialogFooter>
             <Button className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest" onClick={finishWorkout} disabled={loading}>
                {loading ? "PROCESANDO..." : "GUARDAR Y ANALIZAR"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}