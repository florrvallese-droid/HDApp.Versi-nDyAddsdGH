import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, ChevronLeft, Calendar, Dumbbell, Clock, Plus, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { calculateTotalVolume } from "@/utils/calculations";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/WorkoutDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  // View State: 'history' | 'setup' | 'active'
  const [view, setView] = useState<'history' | 'setup' | 'active'>('history');

  // History State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Active Workout State
  const [muscleGroupInput, setMuscleGroupInput] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Exercise Input
  const [newExerciseName, setNewExerciseName] = useState("");
  
  // New Set Inputs
  const [tempWeight, setTempWeight] = useState("");
  const [tempReps, setTempReps] = useState("");
  const [tempTempo, setTempTempo] = useState("3-0-1");
  const [tempRest, setTempRest] = useState("2");

  useEffect(() => {
    if (view === 'history') {
      fetchHistory();
    }
  }, [view]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'workout')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistoryLogs(data);
    }
    setLoadingHistory(false);
  };

  const handleStartSetup = () => {
    setView('setup');
  };

  const startWorkout = async () => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un grupo muscular");
      return;
    }
    setView('active');
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
      rest_seconds: parseFloat(tempRest) * 60
    });
    
    setExercises(updatedExercises);
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
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const totalVolume = calculateTotalVolume(exercises);
        
        await supabase.from('logs').insert({
            user_id: user.id,
            type: 'workout',
            muscle_group: muscleGroupInput,
            workout_date: new Date().toISOString(),
            data: { exercises, total_volume: totalVolume, duration_minutes: 45 },
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

  // VIEW 1: HISTORY (LOGBOOK)
  if (view === 'history') {
    return (
      <div className="min-h-screen bg-black text-white pb-24">
        <WorkoutDetailDialog 
            open={showDetail} 
            onOpenChange={setShowDetail} 
            workout={selectedWorkout} 
        />

        <div className="p-4 border-b border-zinc-900 bg-black/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
             <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <History className="h-5 w-5 text-red-600" /> Bitácora
             </h1>
             <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleStartSetup}>
                <Plus className="h-4 w-4 mr-1" /> Nuevo
             </Button>
        </div>

        <div className="p-4 space-y-4">
            {loadingHistory ? (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
                    <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
                    <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
                </div>
            ) : historyLogs.length === 0 ? (
                <div className="text-center py-20 opacity-50 space-y-4">
                    <Dumbbell className="h-12 w-12 mx-auto text-zinc-600" />
                    <p>No hay entrenamientos registrados aún.</p>
                    <Button variant="outline" onClick={handleStartSetup}>Comenzar el primero</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {historyLogs.map((log) => (
                        <Card 
                            key={log.id} 
                            className="bg-zinc-900 border-zinc-800 active:scale-[0.98] transition-transform cursor-pointer hover:border-zinc-700"
                            onClick={() => {
                                setSelectedWorkout(log);
                                setShowDetail(true);
                            }}
                        >
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(log.created_at), "d MMM", { locale: es })}
                                    </div>
                                    <h3 className="text-lg font-black italic text-white uppercase">{log.muscle_group || "Entrenamiento"}</h3>
                                    <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                                        <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {log.data.exercises?.length || 0} Ejercicios</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {log.data.duration_minutes || '-'} min</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-zinc-800">{log.data.total_volume ? (log.data.total_volume / 1000).toFixed(1) : '0'}</div>
                                    <div className="text-[10px] text-zinc-600 uppercase font-bold">Ton</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    );
  }

  // VIEW 2: SETUP
  if (view === 'setup') {
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

        <div className="pt-8 space-y-3">
             <Button 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20"
                onClick={startWorkout}
            >
                Iniciar Registro
            </Button>
            <Button 
                variant="ghost" 
                className="w-full text-zinc-500 hover:text-white"
                onClick={() => setView('history')}
            >
                Cancelar y Volver
            </Button>
        </div>
      </div>
    );
  }

  // VIEW 3: ACTIVE LOGGER
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
            <div key={i} className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
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
            onClick={() => setView('setup')}
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