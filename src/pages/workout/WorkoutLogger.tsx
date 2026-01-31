import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { calculateTotalVolume } from "@/utils/calculations";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { Loader2, Plus } from "lucide-react";

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  // States
  const [started, setStarted] = useState(false);
  const [muscleGroupInput, setMuscleGroupInput] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // New Exercise Input
  const [newExerciseName, setNewExerciseName] = useState("");

  const startWorkout = async () => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un grupo muscular");
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch last workout for this muscle group (case insensitive search not directly supported easily without extensions, 
      // but we will normalize to lowercase in code)
      const normalizedMuscle = muscleGroupInput.toLowerCase();

      // We actually need to fetch logs and filter in app or rely on 'ilike' if configured.
      // Using 'ilike' for now assuming Postgres setup allows it standardly.
      const { data: previousLogs, error } = await supabase
        .from('logs')
        .select('data')
        .eq('user_id', user.id)
        .eq('type', 'workout')
        .ilike('muscle_group', normalizedMuscle) 
        .order('created_at', { ascending: false })
        .limit(1);

      if (previousLogs && previousLogs.length > 0) {
        const lastWorkout = previousLogs[0].data;
        
        // 2. Pre-fill exercises
        const prefilledExercises: WorkoutExercise[] = lastWorkout.exercises.map((ex: any) => {
            // Find best set (max weight, then max reps) to use as target
            let bestSet = ex.sets[0];
            ex.sets.forEach((s: any) => {
                if (s.weight > (bestSet?.weight || 0)) {
                    bestSet = s;
                }
            });

            return {
                name: ex.name,
                sets: [], // Start with empty sets
                previous: bestSet ? { weight: bestSet.weight, reps: bestSet.reps } : undefined,
                notes: ""
            };
        });
        
        setExercises(prefilledExercises);
        if (prefilledExercises.length > 0) {
           toast.success("Objetivos cargados. ¡A superar marcas!");
        }
      } else {
        toast.info("Primer registro para este grupo. ¡Establece la base!");
        setExercises([]);
      }
      
      setStartTime(new Date());
      setStarted(true);

    } catch (error) {
      console.error(error);
      toast.error("Error cargando historial");
      setStartTime(new Date());
      setStarted(true); // Allow starting even if history fails
    } finally {
      setLoading(false);
    }
  };

  const addExercise = () => {
    if (!newExerciseName) return;
    const newEx: WorkoutExercise = {
      name: newExerciseName,
      sets: [],
      previous: undefined
    };
    setExercises([...exercises, newEx]);
    setNewExerciseName("");
  };

  const updateExercise = (index: number, updated: WorkoutExercise) => {
    const newExercises = [...exercises];
    newExercises[index] = updated;
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) {
        toast.error("Registra al menos un ejercicio");
        return;
    }
    
    // Validate that at least one set exists
    const hasSets = exercises.some(ex => ex.sets.length > 0);
    if (!hasSets) {
        toast.error("Debes registrar al menos una serie efectiva");
        return;
    }

    setLoading(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const totalVolume = calculateTotalVolume(exercises);
        
        // Calculate duration
        const durationMinutes = startTime 
            ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) 
            : 0;

        await supabase.from('logs').insert({
            user_id: user.id,
            type: 'workout',
            muscle_group: muscleGroupInput, // Save as typed (e.g., "Pecho" not "pecho")? No, let's keep user input
            workout_date: new Date().toISOString(),
            data: { 
                exercises, 
                total_volume: totalVolume, 
                duration_minutes: durationMinutes > 0 ? durationMinutes : 45 
            },
            discipline: profile?.discipline || 'general'
        });

        toast.success("Sesión Finalizada");
        navigate('/workout/analysis', { 
            state: { 
                workoutData: { 
                    muscleGroup: muscleGroupInput, 
                    volume: totalVolume, 
                    exercises, 
                    duration: durationMinutes 
                } 
            } 
        });
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  // STEP 1: SETUP
  if (!started) {
    return (
      <div className="p-4 max-w-md mx-auto min-h-screen bg-black text-white space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center pt-2">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Fase 2: Registro
            </h1>
            <div className="text-xs text-zinc-500 font-mono">SNC STATUS: OK</div>
        </div>
        
        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
            <p className="text-red-500 font-bold text-xs tracking-widest uppercase mb-1">
                Protocolo Heavy Duty
            </p>
            <p className="text-zinc-400 text-sm">
                Solo registra las series efectivas llevadas al fallo real. El calentamiento no cuenta.
            </p>
        </div>

        <div className="h-[1px] bg-zinc-900 w-full" />

        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-red-500 font-bold text-xs uppercase">Fecha de Sesión</Label>
                <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm font-bold text-zinc-300">
                    {new Date().toLocaleDateString()}
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-red-500 font-bold text-xs uppercase">Grupo Muscular Principal</Label>
                <Input 
                    placeholder="EJ: PECTORAL..." 
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 font-bold uppercase h-12"
                    value={muscleGroupInput}
                    onChange={(e) => setMuscleGroupInput(e.target.value)}
                    autoFocus
                />
            </div>
        </div>

        <div className="pt-8 space-y-3">
             <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                onClick={startWorkout}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" /> : "Iniciar Registro"}
            </Button>
            <Button 
                variant="ghost" 
                className="w-full text-zinc-500 hover:text-white"
                onClick={() => navigate('/dashboard')}
            >
                Cancelar
            </Button>
        </div>
      </div>
    );
  }

  // STEP 2: LOGGER
  return (
    <div className="p-4 pb-28 max-w-md mx-auto min-h-screen bg-black text-white space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-zinc-900 pb-4 sticky top-0 bg-black/95 backdrop-blur z-40 pt-2">
        <div>
            <div className="bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-bold inline-block mb-1 border border-zinc-800">
                {new Date().toLocaleDateString()}
            </div>
            <h2 className="text-3xl font-black italic uppercase text-white leading-none tracking-tighter">
                {muscleGroupInput}
            </h2>
        </div>
        <div className="text-right">
             <span className="text-xs font-bold text-zinc-500 uppercase">Tiempo</span>
             <div className="text-white font-mono font-bold">
                 {/* Live timer could go here, for now static placeholder or just running */}
                 ON
             </div>
        </div>
      </div>

      {/* EXERCISES LIST */}
      <div className="space-y-8">
        {exercises.length === 0 && (
            <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-900 rounded-lg">
                <p className="text-sm">No hay ejercicios cargados.</p>
                <p className="text-xs">Agrega el primero abajo.</p>
            </div>
        )}

        {exercises.map((ex, i) => (
            <ExerciseCard 
                key={i}
                index={i}
                exercise={ex}
                onUpdate={(updated) => updateExercise(i, updated)}
                onRemove={() => removeExercise(i)}
                units={profile?.units || 'kg'}
            />
        ))}

        {/* ADD EXERCISE */}
        <div className="pt-6 border-t border-zinc-900">
            <Label className="text-zinc-500 font-bold uppercase text-[10px] mb-2 block tracking-widest">Agregar Ejercicio</Label>
            <div className="flex gap-2">
                <Input 
                    placeholder="Ej: Press Banca Inclinado" 
                    className="bg-zinc-900/50 border-zinc-800 text-white h-12 font-medium"
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addExercise()}
                />
                <Button 
                    className="h-12 w-12 bg-zinc-800 hover:bg-zinc-700 text-white shrink-0" 
                    onClick={addExercise}
                    disabled={!newExerciseName}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-black/95 border-t border-zinc-900 grid grid-cols-2 gap-3 z-50 safe-area-bottom">
        <Button 
            variant="outline" 
            className="h-12 bg-black border-zinc-800 text-zinc-400 font-bold uppercase hover:bg-zinc-900 hover:text-white"
            onClick={() => {
                if(confirm("¿Cancelar sesión? Se perderán los datos.")) {
                    setStarted(false);
                    setExercises([]);
                }
            }}
        >
            Cancelar
        </Button>
        <Button 
            className="h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            onClick={finishWorkout}
            disabled={loading}
        >
            {loading ? <Loader2 className="animate-spin" /> : "Terminar"}
        </Button>
      </div>
      
    </div>
  );
}