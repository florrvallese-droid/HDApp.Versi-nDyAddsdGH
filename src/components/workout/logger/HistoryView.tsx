import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Dumbbell, Clock, Plus, History, ChevronLeft } from "lucide-react";
import { supabase } from "@/services/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";

interface HistoryViewProps {
  onStartNew: () => void;
}

export function HistoryView({ onStartNew }: HistoryViewProps) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
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
      setLogs(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <WorkoutDetailDialog 
        open={showDetail} 
        onOpenChange={setShowDetail} 
        workout={selectedWorkout} 
      />

      <div className="p-4 border-b border-zinc-900 bg-black/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500 mr-1">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <History className="h-5 w-5 text-red-600" /> Bitácora
          </h1>
        </div>
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold" onClick={onStartNew}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
            <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
            <Skeleton className="h-24 w-full bg-zinc-900 rounded-xl" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 opacity-50 space-y-4">
            <Dumbbell className="h-12 w-12 mx-auto text-zinc-600" />
            <p>No hay entrenamientos registrados aún.</p>
            <Button variant="outline" onClick={onStartNew}>Comenzar el primero</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
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
                    <div className="text-2xl font-black text-red-600">
                      {log.data.exercises?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 0), 0)}
                    </div>
                    <div className="text-[10px] text-zinc-600 uppercase font-bold">Series</div>
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