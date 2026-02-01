import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, ChevronRight, Dumbbell, Utensils, Camera, Zap, Loader2, Save, Plus, Trash2, Lock, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { toast } from "sonner";
import { Routine } from "@/types";

export default function CoachAthleteDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);

  // Edit State for Nutrition
  const [kcal, setKcal] = useState<number>(0);
  const [p, setP] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  const [f, setF] = useState<number>(0);

  // Routine Editor State
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [routineExercises, setRoutineExercises] = useState<{ name: string; sets_goal: number }[]>([]);

  useEffect(() => {
    if (athleteId) fetchAthleteData();
  }, [athleteId]);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', athleteId).single();
        
        if (profileData && !profileData.is_premium) {
            toast.error("El alumno ya no es PRO.");
            navigate('/dashboard');
            return;
        }

        setProfile(profileData);

        const { data: logsData } = await supabase.from('logs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(30);
        setLogs(logsData || []);

        const { data: routineData } = await supabase.from('routines').select('*').eq('user_id', athleteId).order('created_at', { ascending: false });
        setRoutines(routineData || []);

        const nut = profileData?.settings?.nutrition?.diet_variants?.[0];
        if (nut) {
            setKcal(nut.calories || 0);
            setP(nut.macros?.p || 0);
            setC(nut.macros?.c || 0);
            setF(nut.macros?.f || 0);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateNutrition = async () => {
    setSaving(true);
    try {
      const newNutrition = {
        ...profile.settings.nutrition,
        diet_variants: [{
          id: 'base',
          name: 'Plan Coach',
          calories: kcal,
          macros: { p, c, f }
        }]
      };

      const { error } = await supabase.from('profiles').update({
        settings: { ...profile.settings, nutrition: newNutrition },
        updated_at: new Date().toISOString()
      }).eq('user_id', athleteId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: athleteId,
        title: 'Dieta Actualizada',
        message: `Tu Coach ha modificado tus macros (Kcal: ${kcal}).`,
        type: 'coach_update'
      });

      toast.success("Protocolo actualizado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName || routineExercises.length === 0) return;
    setSaving(true);
    try {
        const { error } = await supabase.from('routines').insert({
            user_id: athleteId,
            name: routineName,
            exercises: routineExercises
        });

        if (error) throw error;

        await supabase.from('notifications').insert({
            user_id: athleteId,
            title: 'Nueva Rutina',
            message: `Tu Coach ha asignado una nueva rutina: ${routineName}`,
            type: 'coach_update'
        });

        toast.success("Rutina asignada correctamente");
        setIsCreatingRoutine(false);
        setRoutineName("");
        setRoutineExercises([]);
        fetchAthleteData();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!confirm("¿Eliminar esta rutina del alumno?")) return;
    await supabase.from('routines').delete().eq('id', id);
    fetchAthleteData();
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600 h-10 w-10" /></div>;

  const workouts = logs.filter(l => l.type === 'workout');
  const checkins = logs.filter(l => l.type === 'checkin');

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <WorkoutDetailDialog open={showWorkoutDetail} onOpenChange={setShowWorkoutDetail} workout={selectedWorkout} />

      <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500"><ChevronLeft className="h-6 w-6" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">{profile?.display_name || "Atleta"}</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{profile?.discipline} • {profile?.units}</p>
        </div>
        <Badge className="bg-yellow-600 text-[10px] font-black uppercase">MIEMBRO PRO</Badge>
      </div>

      <Tabs defaultValue="comandar" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="comandar" className="flex-1 text-[10px] uppercase font-black text-red-500"><Zap className="w-3 h-3 mr-1"/> Comandar</TabsTrigger>
          <TabsTrigger value="progreso" className="flex-1 text-[10px] uppercase font-black"><Dumbbell className="w-3 h-3 mr-1"/> Progreso</TabsTrigger>
          <TabsTrigger value="checkin" className="flex-1 text-[10px] uppercase font-black"><Camera className="w-3 h-3 mr-1"/> Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="comandar" className="space-y-8 animate-in slide-in-from-left-2">
            
            {/* NUTRICIÓN SECTION */}
            <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
                <div className="bg-red-600/10 p-3 border-b border-zinc-900">
                   <h4 className="text-xs font-black uppercase text-red-500 flex items-center gap-2">
                       <Utensils className="h-3 w-3" /> Protocolo de Nutrición
                   </h4>
                </div>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Kcal Totales</Label>
                            <Input type="number" value={kcal} onChange={e => setKcal(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 h-11 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-blue-400">Proteína (g)</Label>
                            <Input type="number" value={p} onChange={e => setP(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 h-11 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-green-400">Carbos (g)</Label>
                            <Input type="number" value={c} onChange={e => setC(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 h-11 font-bold" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-yellow-400">Grasas (g)</Label>
                            <Input type="number" value={f} onChange={e => setF(Number(e.target.value))} className="bg-zinc-900 border-zinc-800 h-11 font-bold" />
                        </div>
                    </div>
                    <Button onClick={handleUpdateNutrition} disabled={saving} className="w-full bg-zinc-100 hover:bg-white text-black font-black uppercase tracking-widest text-[10px] h-12 mt-2">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                        Actualizar Macros
                    </Button>
                </CardContent>
            </Card>

            {/* RUTINAS SECTION */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-widest">Gestión de Rutinas</h3>
                  {!isCreatingRoutine && (
                    <Button size="sm" variant="outline" className="border-zinc-800 text-[10px] uppercase font-bold h-8" onClick={() => setIsCreatingRoutine(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Nueva Rutina
                    </Button>
                  )}
               </div>

               {isCreatingRoutine && (
                  <Card className="bg-zinc-900 border-red-600/30 animate-in zoom-in-95">
                     <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] text-zinc-500 uppercase font-bold">Nombre del Plan</Label>
                           <Input placeholder="Ej: Pectoral / HIT" value={routineName} onChange={e => setRoutineName(e.target.value)} className="bg-black border-zinc-800 font-bold" />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] text-zinc-500 uppercase font-bold">Ejercicios</Label>
                           {routineExercises.map((re, idx) => (
                             <div key={idx} className="flex gap-2 items-center bg-black/40 p-2 rounded border border-zinc-800">
                                <span className="flex-1 text-xs font-bold truncate">{re.name}</span>
                                <Input type="number" value={re.sets_goal} className="w-14 h-8 text-center bg-zinc-900 border-zinc-800 text-xs" onChange={e => {
                                    const next = [...routineExercises];
                                    next[idx].sets_goal = Number(e.target.value);
                                    setRoutineExercises(next);
                                }} />
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600" onClick={() => setRoutineExercises(routineExercises.filter((_, i) => i !== idx))}>
                                   <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                           ))}
                           <ExerciseSelector onSelect={(name) => setRoutineExercises([...routineExercises, { name, sets_goal: 1 }])} />
                        </div>
                        <div className="flex gap-2 pt-4">
                           <Button variant="ghost" className="flex-1 text-zinc-500 text-[10px] uppercase font-bold" onClick={() => setIsCreatingRoutine(false)}>Cancelar</Button>
                           <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase" onClick={handleSaveRoutine} disabled={saving || !routineName}>Guardar Rutina</Button>
                        </div>
                     </CardContent>
                  </Card>
               )}

               <div className="grid gap-3">
                  {routines.map(r => (
                    <Card key={r.id} className="bg-zinc-950 border-zinc-900">
                       <CardContent className="p-4 flex justify-between items-center">
                          <div>
                             <h4 className="font-bold uppercase text-sm">{r.name}</h4>
                             <p className="text-[10px] text-zinc-600 uppercase font-bold">{r.exercises.length} ejercicios planificados</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-zinc-800 hover:text-red-500" onClick={() => deleteRoutine(r.id)}>
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>
        </TabsContent>

        <TabsContent value="progreso" className="space-y-4">
           {workouts.length === 0 ? (
              <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
                 <Dumbbell className="h-10 w-10 text-zinc-800 mx-auto mb-2" />
                 <p className="text-zinc-500 text-xs font-bold uppercase">Sin entrenamientos registrados</p>
              </div>
           ) : workouts.map(log => (
              <Card key={log.id} className="bg-zinc-900 border-zinc-800 cursor-pointer" onClick={() => { setSelectedWorkout(log); setShowWorkoutDetail(true); }}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{format(new Date(log.created_at), "d MMM", { locale: es })}</span>
                    <h3 className="font-black italic uppercase text-lg">{log.muscle_group}</h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-700" />
                </CardContent>
              </Card>
           ))}
        </TabsContent>

        <TabsContent value="checkin" className="grid grid-cols-2 gap-4">
          {checkins.map(log => (
            <Card key={log.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
               <div className="aspect-[3/4] bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase">Ver Galería</div>
               <CardContent className="p-3">
                  <p className="text-xs font-bold">{log.data.weight}kg</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-mono">{format(new Date(log.created_at), "dd/MM/yyyy")}</p>
               </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}