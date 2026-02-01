import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Dumbbell, Plus, History, ChevronLeft, Zap, ListPlus } from "lucide-react";
import { supabase } from "@/services/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";

interface HistoryViewProps {
  onStartNew: () => void;
  onManageRoutines: () => void;
}

export function HistoryView({ onStartNew, onManageRoutines }: HistoryViewProps) {
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

      <div className="p-4 border-b border-zinc-900 bg-black/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500 mr-1 shrink-0">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2 truncate">
            <History className="h-5 w-5 text-red-600 shrink-0" /> <span className="truncate">Bitácora</span>
          </h1>
        </div>
        <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon" className="text-zinc-500 h-9 w-9" onClick={onManageRoutines}>
                <ListPlus className="h-5 w-5" />
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold h-9" onClick={onStartNew}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo
            </Button>
        </div>
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
            {logs.map((log) => {
              const setsCount = log.data.exercises?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 0), 0) || 0;
              return (
                <Card 
                  key={log.id} 
                  className="bg-zinc-900 border-zinc-800 active:scale-[0.98] transition-transform cursor-pointer hover:border-zinc-700"
                  onClick={() => {
                    setSelectedWorkout(log);
                    setShowDetail(true);
                  }}
                >
                  <CardContent className="p-4 flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(log.created_at), "d MMM", { locale: es })}
                      </div>
                      <h3 className="text-lg font-black italic text-white uppercase truncate">{log.muscle_group || "Entrenamiento"}</h3>
                      <div className="flex gap-3 mt-2 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {log.data.exercises?.length || 0}</span>
                        <span className="flex items-center gap-1 text-red-500"><Zap className="h-3 w-3" /> {setsCount}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                       <ChevronLeft className="h-4 w-4 rotate-180 text-zinc-700" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}