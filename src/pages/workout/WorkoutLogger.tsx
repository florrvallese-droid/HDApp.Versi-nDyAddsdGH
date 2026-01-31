import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Clock, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { WorkoutExercise, WorkoutSet } from "@/types";
import { useProfile } from "@/hooks/useProfile";

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

  // New Exercise Input
  const [newExerciseName, setNewExerciseName] = useState("");

  const startWorkout = () => {
    if (!muscleGroup) {
      toast.error("Selecciona un grupo muscular");
      return;
    }
    setStarted(true);
    setStartTime(new Date());
  };

  const addExercise = () => {
    if (!newExerciseName.trim()) return;
    
    const newExercise: WorkoutExercise = {
      name: newExerciseName,
      sets: [
        { weight: 0, reps: 0, rpe: 8 } // Default first set
      ]
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
      rpe: 8
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

  const finishWorkout = async () => {
    if (exercises.length === 0) {
      toast.error("Registra al menos un ejercicio");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Calculate totals
      let totalVolume = 0;
      exercises.forEach(ex => {
        ex.sets.forEach(set => {
          totalVolume += (Number(set.weight) * Number(set.reps));
        });
      });

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
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Entrenamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Grupo Muscular Principal</Label>
              <Select onValueChange={setMuscleGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={startWorkout} disabled={!muscleGroup}>
              Comenzar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto min-h-screen space-y-6">
      <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2 border-b">
        <div>
          <h2 className="font-bold text-lg">{muscleGroup}</h2>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>En curso...</span>
          </div>
        </div>
        <Button size="sm" onClick={finishWorkout} disabled={loading}>
          {loading ? "Guardando..." : "Finalizar"}
        </Button>
      </div>

      <div className="space-y-6">
        {exercises.map((exercise, exIndex) => (
          <Card key={exIndex} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="py-3 px-4 bg-muted/20 flex flex-row justify-between items-center space-y-0">
              <CardTitle className="text-base font-medium">{exercise.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-10 gap-2 text-xs text-muted-foreground text-center font-medium mb-1">
                <div className="col-span-1">Set</div>
                <div className="col-span-3">Kg / Lb</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">RPE</div>
                <div className="col-span-1"></div>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-10 gap-2 items-center">
                  <div className="col-span-1 flex justify-center">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {setIndex + 1}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Input 
                      type="number" 
                      className="h-9 text-center" 
                      value={set.weight}
                      onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input 
                      type="number" 
                      className="h-9 text-center" 
                      value={set.reps}
                      onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      className="h-9 text-center" 
                      placeholder="8"
                      value={set.rpe || ''}
                      onChange={(e) => updateSet(exIndex, setIndex, 'rpe', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive/80"
                      onClick={() => removeSet(exIndex, setIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 border-dashed" 
                onClick={() => addSet(exIndex)}
              >
                <Plus className="mr-2 h-3 w-3" /> Agregar Serie
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Section */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Nombre del ejercicio..." 
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              />
              <Button onClick={addExercise} disabled={!newExerciseName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}