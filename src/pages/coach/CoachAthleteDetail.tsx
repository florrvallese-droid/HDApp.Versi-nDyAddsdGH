import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, ChevronRight, Dumbbell, Utensils, Camera, Zap, Loader2, Save, Send, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";
import { toast } from "sonner";

export default function CoachAthleteDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);

  // Edit State for Nutrition
  const [kcal, setKcal] = useState<number>(0);
  const [p, setP] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  const [f, setF] = useState<number>(0);

  useEffect(() => {
    if (athleteId) fetchAthleteData();
  }, [athleteId]);

  const fetchAthleteData = async () => {
    setLoading(true);
    const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', athleteId).single();
    setProfile(profileData);

    const { data: logsData } = await supabase.from('logs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(30);
    setLogs(logsData || []);

    // Set Nutrition local state from profile settings
    const nut = profileData?.settings?.nutrition?.diet_variants?.[0];
    if (nut) {
      setKcal(nut.calories || 0);
      setP(nut.macros?.p || 0);
      setC(nut.macros?.c || 0);
      setF(nut.macros?.f || 0);
    }
    setLoading(false);
  };

  const handleUpdateNutrition = async () => {
    setSaving(true);
    try {
      const { data: { user: coach } } = await supabase.auth.getUser();
      
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

      // 2. Notificar al alumno
      await supabase.from('notifications').insert({
        user_id: athleteId,
        title: 'Plan Actualizado',
        message: `Tu Coach ha modificado tu protocolo nutricional.`,
        type: 'coach_update'
      });

      toast.success("Protocolo actualizado y alumno notificado.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  const workouts = logs.filter(l => l.type === 'workout');
  const nutrition = logs.filter(l => l.type === 'nutrition');
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
      </div>

      <Tabs defaultValue="comandar" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="comandar" className="flex-1 text-[10px] uppercase font-black text-red-500"><Zap className="w-3 h-3 mr-1"/> Comandar</TabsTrigger>
          <TabsTrigger value="progreso" className="flex-1 text-[10px] uppercase font-black"><Dumbbell className="w-3 h-3 mr-1"/> Progreso</TabsTrigger>
          <TabsTrigger value="checkin" className="flex-1 text-[10px] uppercase font-black"><Camera className="w-3 h-3 mr-1"/> Fotos</TabsTrigger>
        </TabsList>

        <TabsContent value="comandar" className="space-y-6 animate-in slide-in-from-left-2">
            <Card className="bg-zinc-950 border-red-900/30">
                <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-red-600" /> Protocolo de Nutrición
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Kcal Totales</Label>
                            <Input type="number" value={kcal} onChange={e => setKcal(Number(e.target.value))} className="bg-zinc-900 border-zinc-800" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-blue-400">Proteína (g)</Label>
                            <Input type="number" value={p} onChange={e => setP(Number(e.target.value))} className="bg-zinc-900 border-zinc-800" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-green-400">Carbos (g)</Label>
                            <Input type="number" value={c} onChange={e => setC(Number(e.target.value))} className="bg-zinc-900 border-zinc-800" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold text-yellow-400">Grasas (g)</Label>
                            <Input type="number" value={f} onChange={e => setF(Number(e.target.value))} className="bg-zinc-900 border-zinc-800" />
                        </div>
                    </div>
                    <Button onClick={handleUpdateNutrition} disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] h-11 mt-4">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                        Actualizar Protocolo
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed">
               <CardHeader><CardTitle className="text-sm uppercase font-black text-zinc-500">Gestión de Rutinas</CardTitle></CardHeader>
               <CardContent className="text-[10px] uppercase font-bold text-zinc-700 text-center py-4">Próximamente: Editor de Rutinas Remoto</CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="progreso" className="space-y-4">
           {workouts.map(log => (
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
                  <p className="text-[10px] text-zinc-500 uppercase">{format(new Date(log.created_at), "dd/MM/yyyy")}</p>
               </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}