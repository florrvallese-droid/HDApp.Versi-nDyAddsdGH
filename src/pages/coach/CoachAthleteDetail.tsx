import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Dumbbell, 
  Utensils, 
  Camera, 
  TrendingUp, 
  Calendar,
  Activity,
  Zap,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";

export default function CoachAthleteDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);

  useEffect(() => {
    if (athleteId) {
      fetchAthleteData();
    }
  }, [athleteId]);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
      // 1. Perfil del alumno
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', athleteId)
        .single();
      
      setProfile(profileData);

      // 2. Últimos logs (entrenos, dieta, checkins)
      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(50);

      setLogs(logsData || []);
    } catch (err) {
      console.error("Error fetching athlete detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  const workouts = logs.filter(l => l.type === 'workout');
  const nutrition = logs.filter(l => l.type === 'nutrition');
  const checkins = logs.filter(l => l.type === 'checkin');

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <WorkoutDetailDialog 
        open={showWorkoutDetail} 
        onOpenChange={setShowWorkoutDetail} 
        workout={selectedWorkout} 
      />

      {/* Header Alumno */}
      <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/coach')} className="text-zinc-500">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
            {profile?.display_name || "Atleta"}
            {profile?.is_premium && <Badge className="bg-yellow-600 text-[8px] h-4">PRO</Badge>}
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{profile?.discipline} • {profile?.units}</p>
        </div>
      </div>

      <Tabs defaultValue="workouts" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="workouts" className="flex-1 text-[10px] uppercase font-black"><Dumbbell className="w-3 h-3 mr-1"/> Entrenos</TabsTrigger>
          <TabsTrigger value="nutrition" className="flex-1 text-[10px] uppercase font-black"><Utensils className="w-3 h-3 mr-1"/> Dieta</TabsTrigger>
          <TabsTrigger value="checkin" className="flex-1 text-[10px] uppercase font-black"><Camera className="w-3 h-3 mr-1"/> Fotos</TabsTrigger>
        </TabsList>

        {/* WORKOUTS TAB */}
        <TabsContent value="workouts" className="space-y-4">
          {workouts.length === 0 ? (
            <div className="text-center py-20 text-zinc-600">No hay registros de entrenamiento.</div>
          ) : (
            workouts.map((log) => (
              <Card 
                key={log.id} 
                className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700"
                onClick={() => {
                  setSelectedWorkout(log);
                  setShowWorkoutDetail(true);
                }}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                      {format(new Date(log.created_at), "d 'de' MMMM", { locale: es })}
                    </span>
                    <h3 className="font-black italic uppercase text-lg">{log.muscle_group}</h3>
                  </div>
                  <ChevronLeft className="h-4 w-4 rotate-180 text-zinc-700" />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* NUTRITION TAB */}
        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid gap-3">
            {nutrition.map((log) => (
              <Card key={log.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      {format(new Date(log.created_at), "EEEE d", { locale: es })}
                    </span>
                    <span className="text-sm font-bold uppercase text-zinc-300">Cumplimiento</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black ${log.data.adherence >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {log.data.adherence}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CHECK-IN TAB */}
        <TabsContent value="checkin" className="grid grid-cols-2 gap-4">
          {checkins.map((log) => (
            <Card key={log.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
               <div className="aspect-[3/4] bg-zinc-950 relative">
                  {/* Aquí iría la primera foto del array log.data.photos si tuviéramos lógica de firmado */}
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase">Ver Galería</div>
               </div>
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