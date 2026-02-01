import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { 
    Utensils, Pill, Dumbbell, Save, Plus, Trash2, 
    Loader2, Zap, Syringe, ClipboardList, Target 
} from "lucide-react";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement, Routine } from "@/types";
import { DietStrategy } from "@/components/nutrition/DietStrategy";
import { SupplementStack } from "@/components/nutrition/SupplementStack";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { cn } from "@/lib/utils";

interface CoachProtocolManagerProps {
  athleteId: string;
  athleteName: string;
}

export function CoachProtocolManager({ athleteId, athleteName }: CoachProtocolManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Nutrición & Supl
  const [phaseGoal, setPhaseGoal] = useState<PhaseGoal>("maintenance");
  const [strategyType, setStrategyType] = useState<'single' | 'cycling'>('single');
  const [variants, setVariants] = useState<DietVariant[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [visibleTimings, setVisibleTimings] = useState<string[]>(['fasted', 'pre', 'intra', 'post', 'night']);

  // Rutinas
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineExercises, setNewRoutineExercises] = useState<{ name: string; sets_goal: number }[]>([]);

  useEffect(() => {
    fetchAthleteSettings();
    fetchAthleteRoutines();
  }, [athleteId]);

  const fetchAthleteSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
    if (data?.settings?.nutrition) {
      const config = data.settings.nutrition as NutritionConfig & { timing_order?: string[] };
      setPhaseGoal(config.phase_goal);
      setStrategyType(config.strategy_type || "single");
      setVariants(config.diet_variants || []);
      setSupplements(config.supplements_stack || []);
      if (config.timing_order) setVisibleTimings(config.timing_order);
    } else {
        setVariants([{ id: crypto.randomUUID(), name: "Dieta Base", calories: 0, macros: { p: 0, c: 0, f: 0 } }]);
    }
    setLoading(false);
  };

  const fetchAthleteRoutines = async () => {
    const { data } = await supabase.from('routines').select('*').eq('user_id', athleteId);
    if (data) setRoutines(data);
  };

  const saveBiologicalProtocol = async () => {
    setSaving(true);
    try {
      const { data: current } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
      
      const nutritionConfig: NutritionConfig & { timing_order?: string[] } = {
        phase_goal: phaseGoal,
        strategy_type: strategyType,
        diet_variants: variants,
        supplements_stack: supplements,
        timing_order: visibleTimings
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
            settings: { ...current?.settings, nutrition: nutritionConfig },
            updated_at: new Date().toISOString()
        })
        .eq('user_id', athleteId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: athleteId,
        title: "Protocolo Biológico Actualizado",
        message: "Tu coach ha realizado ajustes en tu nutrición y stack de suplementos.",
        type: 'protocol_update'
      });

      toast.success("Protocolo biológico guardado y atleta notificado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addRoutine = async () => {
    if (!newRoutineName || newRoutineExercises.length === 0) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('routines').insert({
        user_id: athleteId,
        name: newRoutineName,
        exercises: newRoutineExercises
      });
      if (error) throw error;

      toast.success("Rutina asignada");
      setNewRoutineName("");
      setNewRoutineExercises([]);
      setIsAddingRoutine(false);
      fetchAthleteRoutines();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (!error) fetchAthleteRoutines();
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <Tabs defaultValue="nutricion" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-12">
          <TabsTrigger value="nutricion" className="flex-1 text-[10px] font-black uppercase"><Utensils className="w-3 h-3 mr-1.5 text-green-500" /> Nutrición</TabsTrigger>
          <TabsTrigger value="suplementacion" className="flex-1 text-[10px] font-black uppercase"><Zap className="w-3 h-3 mr-1.5 text-yellow-500" /> Stack</TabsTrigger>
          <TabsTrigger value="entrenamiento" className="flex-1 text-[10px] font-black uppercase"><Dumbbell className="w-3 h-3 mr-1.5 text-red-500" /> Rutinas</TabsTrigger>
        </TabsList>

        {/* --- NUTRITION --- */}
        <TabsContent value="nutricion" className="space-y-6">
           <div className="space-y-4">
              <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Fase del Mesociclo</Label>
              <div className="grid grid-cols-3 gap-2">
                 {(['volume', 'definition', 'maintenance'] as const).map(goal => (
                    <Button 
                        key={goal}
                        variant="outline" 
                        onClick={() => setPhaseGoal(goal)}
                        className={cn("text-[10px] font-bold uppercase h-10 border-zinc-800", phaseGoal === goal ? "bg-green-600 border-green-500 text-white" : "bg-zinc-900 text-zinc-500")}
                    >
                        {goal === 'volume' ? 'Volumen' : goal === 'definition' ? 'Definición' : 'Mant.'}
                    </Button>
                 ))}
              </div>
           </div>

           <DietStrategy 
             strategyType={strategyType} 
             setStrategyType={setStrategyType} 
             variants={variants} 
             setVariants={setVariants} 
           />

           <Button onClick={saveBiologicalProtocol} disabled={saving} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Dieta
           </Button>
        </TabsContent>

        {/* --- SUPPLEMENTS --- */}
        <TabsContent value="suplementacion" className="space-y-6">
           <SupplementStack 
              supplements={supplements} 
              setSupplements={setSupplements} 
              visibleTimings={visibleTimings} 
              setVisibleTimings={setVisibleTimings} 
           />
           <Button onClick={saveBiologicalProtocol} disabled={saving} className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase italic">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Stack
           </Button>
        </TabsContent>

        {/* --- TRAINING --- */}
        <TabsContent value="entrenamiento" className="space-y-6">
           {isAddingRoutine ? (
              <Card className="bg-zinc-950 border-zinc-800">
                 <CardHeader>
                    <CardTitle className="text-sm font-black uppercase italic">Nueva Rutina para {athleteName}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-zinc-500">Nombre (Ej: Empuje A)</Label>
                       <Input value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] uppercase font-bold text-zinc-500">Ejercicios Seleccionados</Label>
                       <div className="space-y-2">
                          {newRoutineExercises.map((ex, i) => (
                             <div key={i} className="flex gap-2 items-center bg-zinc-900 p-2 rounded border border-zinc-800">
                                <span className="flex-1 text-xs font-bold truncate">{ex.name}</span>
                                <Input 
                                   type="number" 
                                   className="w-16 h-8 text-center bg-zinc-950 border-zinc-800" 
                                   value={ex.sets_goal} 
                                   onChange={e => {
                                      const updated = [...newRoutineExercises];
                                      updated[i].sets_goal = parseInt(e.target.value) || 1;
                                      setNewRoutineExercises(updated);
                                   }}
                                />
                                <Button variant="ghost" size="icon" onClick={() => setNewRoutineExercises(newRoutineExercises.filter((_, idx) => idx !== i))} className="h-8 w-8 text-zinc-600 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                             </div>
                          ))}
                       </div>
                       <ExerciseSelector onSelect={name => setNewRoutineExercises([...newRoutineExercises, { name, sets_goal: 1 }])} />
                    </div>
                 </CardContent>
                 <CardFooter className="gap-2">
                    <Button variant="ghost" className="flex-1 text-zinc-500" onClick={() => setIsAddingRoutine(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={addRoutine} disabled={saving}>Asignar</Button>
                 </CardFooter>
              </Card>
           ) : (
              <div className="space-y-4">
                 <Button className="w-full h-14 bg-zinc-900 border border-zinc-800 border-dashed text-zinc-400 hover:text-white" onClick={() => setIsAddingRoutine(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Rutina de Entrenamiento
                 </Button>

                 <div className="grid gap-3">
                    {routines.map(r => (
                       <Card key={r.id} className="bg-zinc-950 border-zinc-900">
                          <CardContent className="p-4 flex justify-between items-center">
                             <div>
                                <h4 className="font-black uppercase italic text-sm text-white">{r.name}</h4>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase">{r.exercises.length} ejercicios planificados</p>
                             </div>
                             <Button variant="ghost" size="icon" onClick={() => deleteRoutine(r.id)} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></Button>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              </div>
           )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
         <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
         <p className="text-xs text-zinc-400 leading-relaxed">
            Como coach, tus cambios impactan directamente en el cuaderno de <strong>{athleteName}</strong>. El atleta recibirá una notificación push-app para que revise su nueva estrategia.
         </p>
      </div>
    </div>
  );
}