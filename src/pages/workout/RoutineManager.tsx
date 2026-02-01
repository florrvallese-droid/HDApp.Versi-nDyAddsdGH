import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronLeft, Save, Dumbbell, Loader2, ListPlus } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Routine } from "@/types";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";

interface RoutineManagerProps {
  onBack: () => void;
}

export default function RoutineManager({ onBack }: RoutineManagerProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<{ name: string; sets_goal: number }[]>([]);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setRoutines(data);
    setLoading(false);
  };

  const addExercise = (exerciseName: string) => {
    setExercises([...exercises, { name: exerciseName, sets_goal: 1 }]);
  };

  const updateSetsGoal = (index: number, val: string) => {
    const updated = [...exercises];
    updated[index].sets_goal = parseInt(val) || 1;
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const saveRoutine = async () => {
    if (!name || exercises.length === 0) {
      toast.error("Nombre y al menos un ejercicio requeridos");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('routines').insert({
        user_id: user?.id,
        name,
        exercises
      });

      if (error) throw error;

      toast.success("Rutina guardada");
      setIsCreating(false);
      setName("");
      setExercises([]);
      fetchRoutines();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else fetchRoutines();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-zinc-500">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Mis Rutinas</h1>
      </div>

      {isCreating ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Nueva Rutina</CardTitle>
            <CardDescription>Define el plan que cargarás al entrenar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-zinc-500">Nombre de la Rutina</Label>
              <Input 
                placeholder="Ej: Empuje / Pectoral" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-zinc-800"
              />
            </div>

            <div className="space-y-3 pt-4">
              <Label className="text-xs uppercase font-bold text-zinc-500">Ejercicios & Series</Label>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex gap-2 items-center bg-black/40 p-2 rounded border border-zinc-800">
                    <div className="flex-1 text-sm font-bold truncate">{ex.name}</div>
                    <Input 
                      type="number" 
                      className="w-16 h-8 text-center bg-zinc-900 border-zinc-800"
                      value={ex.sets_goal}
                      onChange={(e) => updateSetsGoal(i, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => removeExercise(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <ExerciseSelector onSelect={addExercise} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
             <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>Cancelar</Button>
             <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={saveRoutine} disabled={saving}>
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Plan
             </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button className="w-full bg-zinc-900 border border-zinc-800 h-16 text-lg font-bold" onClick={() => setIsCreating(true)}>
             <Plus className="mr-2 h-5 w-5" /> Crear Nueva Rutina
          </Button>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-700" /></div>
          ) : routines.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 space-y-4">
              <ListPlus className="h-12 w-12 mx-auto opacity-20" />
              <p className="text-sm">Aún no tienes rutinas guardadas.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {routines.map((r) => (
                <Card key={r.id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-black italic uppercase text-lg">{r.name}</h3>
                      <p className="text-xs text-zinc-500">{r.exercises.length} Ejercicios planificados</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-zinc-700 hover:text-red-500" onClick={() => deleteRoutine(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}