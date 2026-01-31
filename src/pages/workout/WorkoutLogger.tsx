import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronLeft, MoreHorizontal, Check, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { calculateTotalVolume } from "@/utils/calculations";

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  // States
  const [started, setStarted] = useState(false);
  const [muscleGroupInput, setMuscleGroupInput] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Exercise Input
  const [newExerciseName, setNewExerciseName] = useState("");
  
  // New Set Inputs (Temporary state for adding a set)
  const [tempWeight, setTempWeight] = useState("");
  const [tempReps, setTempReps] = useState("");
  const [tempTempo, setTempTempo] = useState("3-0-1");
  const [tempRest, setTempRest] = useState("2");

  // History loaded
  const [prevExercises, setPrevExercises] = useState<any[]>([]);

  const startWorkout = async () => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un grupo muscular");
      return;
    }
    setLoading(true);
    // Fetch history (simplified for now)
    setStarted(true);
    setLoading(false);
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
    // Reset set inputs
    setTempWeight("");
    setTempReps("");
  };

  const addSetToExercise = (exerciseIndex: number) => {
    if (!tempWeight || !tempReps) return;
    
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      weight: parseFloat(tempWeight),
      reps: parseFloat(tempReps),
      tempo: tempTempo,
      rest_seconds: parseFloat(tempRest) * 60 // Convert min to sec
    });
    
    setExercises(updatedExercises);
    // Keep values for next set as they are likely similar
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
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
    setLoading(true);
    // Save logic same as before...
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const totalVolume = calculateTotalVolume(exercises);
        
        await supabase.from('logs').insert({
            user_id: user.id,
            type: 'workout',
            muscle_group: muscleGroupInput,
            workout_date: new Date().toISOString(),
            data: { exercises, total_volume: totalVolume, duration_minutes: 45 }, // simplified duration
            discipline: profile?.discipline || 'general'
        });

        toast.success("Sesión Finalizada");
        navigate('/workout/analysis', { state: { workoutData: { muscleGroup: muscleGroupInput, volume: totalVolume, exercises, duration: 45 } } });
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  // STEP 1: SETUP
  if (!started) {
    return (
      <div className="p-4 max-w-md mx-auto min-h-screen bg-black text-white space-y-6">
        <div className="flex justify-between items-center pt-2">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Fase 2: Registro de Guerra
            </h1>
            <div className="text-xs text-zinc-500 font-mono">SNC STATUS</div>
        </div>
        <p className="text-red-600 font-bold text-xs tracking-widest uppercase">
            Solo series efectivas al fallo.
        </p>
        <div className="h-[1px] bg-zinc-900 w-full" />

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-red-500 font-bold text-xs uppercase">Fecha de Sesión</Label>
                <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm font-bold text-zinc-300">
                    {new Date().toLocaleDateString()}
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-red-500 font-bold text-xs uppercase">Grupo Muscular</Label>
                <Input 
                    placeholder="EJ: PECTORAL..." 
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 font-bold uppercase"
                    value={muscleGroupInput}
                    onChange={(e) => setMuscleGroupInput(e.target.value)}
                />
            </div>
        </div>

        <div className="pt-8">
             <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20"
                onClick={startWorkout}
            >
                Iniciar Registro
            </Button>
            <Button 
                variant="ghost" 
                className="w-full mt-2 text-zinc-500 hover:text-white"
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
      <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
        <div>
            <div className="bg-zinc-900 text-white px-3 py-1 rounded text-sm font-bold inline-block mb-1">
                {new Date().toLocaleDateString()}
            </div>
            <h2 className="text-3xl font-black italic uppercase text-white leading-none">
                {muscleGroupInput}
            </h2>
        </div>
      </div>

      {/* EXERCISES LIST */}
      <div className="space-y-6">
        {exercises.map((ex, i) => (
            <div key={i} className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-red-500 font-black uppercase text-lg">{ex.name}</h3>
                    <Button variant="ghost" size="icon" onClick={() => removeExercise(i)}>
                        <Trash2 className="h-4 w-4 text-zinc-600" />
                    </Button>
                </div>

                {ex.sets.map((set, si) => (
                    <div key={si} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 rounded">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Peso</span>
                                <span className="text-xl font-bold text-white">{set.weight}<span className="text-xs text-zinc-500 ml-1">{profile?.units}</span></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold">Reps</span>
                                <span className="text-xl font-bold text-white">{set.reps}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSet(i, si)}>
                            <Trash2 className="h-3 w-3 text-zinc-700 hover:text-red-500" />
                        </Button>
                    </div>
                ))}

                {/* ADD SET FORM FOR THIS EXERCISE */}
                <Card className="bg-zinc-950 border border-zinc-800">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Peso ({profile?.units})</Label>
                                <Input 
                                    type="number" 
                                    className="bg-zinc-900 border-zinc-800 text-white h-10 font-bold"
                                    placeholder="0"
                                    value={tempWeight}
                                    onChange={(e) => setTempWeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Reps (Al Fallo)</Label>
                                <Input 
                                    type="number" 
                                    className="bg-zinc-900 border-zinc-800 text-white h-10 font-bold"
                                    placeholder="0"
                                    value={tempReps}
                                    onChange={(e) => setTempReps(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Cadencia</Label>
                                <Input 
                                    className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs"
                                    placeholder="3-0-1"
                                    value={tempTempo}
                                    onChange={(e) => setTempTempo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Descanso (Min)</Label>
                                <Input 
                                    type="number"
                                    className="bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs"
                                    placeholder="2"
                                    value={tempRest}
                                    onChange={(e) => setTempRest(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button 
                            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase text-xs tracking-wider mt-2"
                            onClick={() => addSetToExercise(i)}
                        >
                            Registrar Serie
                        </Button>
                    </CardContent>
                </Card>
            </div>
        ))}

        {/* ADD EXERCISE */}
        <div className="pt-4 border-t border-zinc-900">
            <Label className="text-zinc-500 font-bold uppercase text-xs mb-2 block">Agregar Ejercicio</Label>
            <Input 
                placeholder="Ej: Press Banca Inclinado" 
                className="bg-zinc-900/50 border-zinc-800 text-white h-12 mb-2 font-medium"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExercise()}
            />
            {newExerciseName && (
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white" onClick={addExercise}>
                    Confirmar Ejercicio
                </Button>
            )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-900 grid grid-cols-2 gap-3 z-50 safe-area-bottom">
        <Button 
            variant="outline" 
            className="h-12 bg-black border-zinc-800 text-zinc-400 font-bold uppercase"
            onClick={() => setStarted(false)}
        >
            Cancelar
        </Button>
        <Button 
            className="h-12 bg-red-900/80 hover:bg-red-800 text-red-100 font-black italic uppercase tracking-wider border border-red-900"
            onClick={finishWorkout}
        >
            Finalizar Sesión
        </Button>
      </div>
      
    </div>
  );
}