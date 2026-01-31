import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Clock, ChevronLeft, Trophy, History, PlayCircle, StopCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet } from "@/types";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { calculateTotalVolume } from "@/utils/calculations";
import { formatDuration } from "@/utils/formatting";

const MUSCLE_GROUPS = [
  "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Full Body"
];

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  // States
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [muscleGroup, setMuscleGroup] = useState<string>("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Previous Data
  const [previousWorkout, setPreviousWorkout] = useState<any>(null);

  // New Exercise Input
  const [newExerciseName, setNewExerciseName] = useState("");

  useEffect(() => {
    let interval: any;
    if (started) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000); // Update every second
    }
    return () => clearInterval(interval);
  }, [started]);

  const startWorkout = async () => {
    if (!muscleGroup) {
      toast.error("Selecciona un grupo muscular");
      return;
    }
    setLoading(true);

    try {
      // Fetch previous workout for this muscle group
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('logs')
          .select('data, created_at')
          .eq('user_id', user.id)
          .eq('type', 'workout')
          .eq('muscle_group', muscleGroup)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setPreviousWorkout(data.data);
          // Auto-populate exercises from previous workout (empty sets)
          if (data.data.exercises) {
            const historyExercises = data.data.exercises.map((ex: WorkoutExercise) => ({
              name: ex.name,
              sets: [{ weight: 0, reps: 0, rpe: 8, tempo: "3-0-1", rest_seconds: 120 }], 
              previous: { 
                // Store best set from previous as target
                weight: Math.max(...ex.sets.map(s => Number(s.weight || 0))),
                reps: Math.max(...ex.sets.map(s => Number(s.reps || 0))) 
              }
            }));
            setExercises(historyExercises);
            toast.success("Rutina anterior cargada. ¡A superar marcas!");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching history", error);
    }

    setStarted(true);
    setStartTime(new Date());
    setLoading(false);
  };

  const addExercise = () => {
    if (!newExerciseName.trim()) return;
    
    // Check if this exercise existed in previous workout to get targets
    let prevData = null;
    if (previousWorkout?.exercises) {
      const match = previousWorkout.exercises.find((e: any) => e.name.toLowerCase() === newExerciseName.toLowerCase());
      if (match) {
        prevData = {
          weight: Math.max(...match.sets.map((s: any) => Number(s.weight || 0))),
          reps: Math.max(...match.sets.map((s: any) => Number(s.reps || 0)))
        };
      }
    }

    const newExercise: WorkoutExercise = {
      name: newExerciseName,
      sets: [
        { weight: 0, reps: 0, rpe: 8, tempo: "3-0-1", rest_seconds: 120 } // Default first set
      ],
      previous: prevData || undefined
    };
    
    setExercises([...exercises, newExercise]);
    setNewExerciseName("");
  };

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    const previousSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    
    updatedExercises[exerciseIndex].sets.push({
      weight: previousSet ? previousSet.weight : 0,
      reps: previousSet ? previousSet.reps : 0,
      rpe: 8,
      tempo: previousSet?.tempo || "3-0-1",
      rest_seconds: previousSet?.rest_seconds || 120
    });
    
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const updatedExercises = [...exercises];
    // @ts-ignore
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(exerciseIndex, 1);
    setExercises(updatedExercises);
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) {
      toast.error("Registra al menos un ejercicio");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const totalVolume = calculateTotalVolume(exercises);
      const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 60000) : 0;

      const logData = {
        exercises,
        total_volume: totalVolume,
        duration_minutes: duration
      };

      const { error } = await supabase.from('logs').insert({
        user_id: user.id,
        type: 'workout',
        muscle_group: muscleGroup,
        workout_date: new Date().toISOString(),
        data: logData,
        discipline: profile?.discipline || 'general'
      });

      if (error) throw error;

      toast.success("Entrenamiento guardado");
      
      // Redirect to Post Workout Analysis
      navigate('/workout/analysis', { 
        state: { 
          workoutData: {
            muscleGroup,
            duration,
            volume: totalVolume,
            exercises
          }
        } 
      });

    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="p-4 max-w-md mx-auto min-h-screen flex flex-col justify-center">
        <Button variant="ghost" className="self-start mb-4" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-2">
              <PlayCircle className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Iniciar Entrenamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Grupo Muscular Principal</Label>
              <Select onValueChange={setMuscleGroup}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={startWorkout} disabled={!muscleGroup || loading}>
              {loading ? "Cargando historial..." : "COMENZAR SESIÓN"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-28 max-w-md mx-auto min-h-screen space-y-6">
      {/* Header Bar */}
      <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-20 py-3 border-b border-border/50">
        <div>
          <h2 className="font-black text-xl uppercase tracking-tight">{muscleGroup}</h2>
          <div className="flex items-center text-xs font-mono text-primary gap-2">
            <Badge variant="outline" className="rounded-sm border-primary/20 text-primary bg-primary/5">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(elapsedSeconds)}
            </Badge>
          </div>
        </div>
        <Button size="sm" onClick={finishWorkout} disabled={loading} className="font-bold gap-2">
          {loading ? "Guardando..." : <><StopCircle className="h-4 w-4"/> Finalizar</>}
        </Button>
      </div>

      <div className="space-y-6">
        {exercises.map((exercise, exIndex) => (
          <Card key={exIndex} className="relative overflow-hidden border-l-4 border-l-primary shadow-lg animate-in slide-in-from-bottom-2">
            
            {/* Exercise Header */}
            <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row justify-between items-center space-y-0">
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-start w-full">
                  <CardTitle className="text-lg font-bold">{exercise.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2" onClick={() => removeExercise(exIndex)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                {exercise.previous && (
                  <div className="flex items-center gap-2 text-xs font-medium text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 w-fit px-2 py-1 rounded">
                    <Trophy className="h-3 w-3" />
                    TARGET: {exercise.previous.weight}kg × {exercise.previous.reps}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-3 space-y-4">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-muted-foreground text-center font-bold tracking-wider mb-1">
                <div className="col-span-1">Set</div>
                <div className="col-span-3">Peso ({profile?.units})</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-4">Tempo / Rest</div>
                <div className="col-span-1"></div>
              </div>

              {exercise.sets.map((set, setIndex) => {
                // Check if beating previous PR (simple logic for visual feedback)
                const isPR = exercise.previous && 
                            Number(set.weight) >= exercise.previous.weight && 
                            Number(set.reps) >= exercise.previous.reps &&
                            Number(set.weight) > 0;

                return (
                  <div key={setIndex} className="grid grid-cols-12 gap-2 items-start relative bg-card/50 p-1 rounded-md">
                    
                    {/* Set Number */}
                    <div className="col-span-1 flex justify-center pt-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${isPR ? "bg-yellow-500 text-black animate-pulse" : "bg-muted text-muted-foreground"}`}>
                        {setIndex + 1}
                      </div>
                    </div>

                    {/* Weight Input */}
                    <div className="col-span-3">
                      <Input 
                        type="number" 
                        className="h-10 text-center font-bold text-lg p-0" 
                        value={set.weight || ''}
                        placeholder="0"
                        onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <Input 
                        type="number" 
                        className="h-10 text-center font-bold text-lg p-0" 
                        value={set.reps || ''}
                        placeholder="0"
                        onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                      />
                    </div>

                    {/* Secondary Metrics (Tempo / Rest) */}
                    <div className="col-span-4 flex flex-col gap-1">
                       <div className="flex items-center relative">
                         <span className="absolute left-1.5 text-[9px] text-muted-foreground font-mono">T</span>
                         <Input 
                           className="h-5 text-[10px] pl-4 pr-1 text-center bg-muted/50 border-0" 
                           placeholder="3-0-1"
                           value={set.tempo || ''}
                           onChange={(e) => updateSet(exIndex, setIndex, 'tempo', e.target.value)}
                         />
                       </div>
                       <div className="flex items-center relative">
                         <span className="absolute left-1.5 text-[9px] text-muted-foreground font-mono">R</span>
                         <Input 
                           type="number"
                           className="h-5 text-[10px] pl-4 pr-1 text-center bg-muted/50 border-0" 
                           placeholder="120s"
                           value={set.rest_seconds || ''}
                           onChange={(e) => updateSet(exIndex, setIndex, 'rest_seconds', e.target.value)}
                         />
                       </div>
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-1 flex justify-center pt-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeSet(exIndex, setIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 border-dashed opacity-50 hover:opacity-100" 
                onClick={() => addSet(exIndex)}
              >
                <Plus className="mr-2 h-3 w-3" /> Agregar Serie
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Section */}
        <Card className="border-dashed bg-muted/10 border-2">
          <CardContent className="p-4">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Agregar Ejercicio</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Nombre del ejercicio..." 
                className="font-medium"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              />
              <Button onClick={addExercise} disabled={!newExerciseName.trim()} variant="secondary">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            {previousWorkout?.exercises && exercises.length === 0 && (
              <div className="mt-4 pt-4 border-t border-dashed">
                 <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1 font-medium">
                   <History className="h-3 w-3" /> REPETIR ÚLTIMA SESIÓN:
                 </p>
                 <div className="flex flex-wrap gap-2">
                   {previousWorkout.exercises.map((ex: any, i: number) => (
                     <Badge 
                       key={i} variant="outline" 
                       className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                       onClick={() => {
                          setNewExerciseName(ex.name);
                       }}
                      >
                       {ex.name}
                     </Badge>
                   ))}
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}