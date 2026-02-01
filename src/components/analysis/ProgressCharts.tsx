import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/services/supabase";
import { format, subDays } from "date-fns";

interface ProgressChartsProps {
  userId: string;
}

export function ProgressCharts({ userId }: ProgressChartsProps) {
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Corregido: Agregando 'muscle_group' a la selección
      const { data: workouts } = await supabase
        .from('logs')
        .select('created_at, data, muscle_group')
        .eq('user_id', userId)
        .eq('type', 'workout')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      const { data: checkins } = await supabase
        .from('logs')
        .select('created_at, data')
        .eq('user_id', userId)
        .eq('type', 'checkin')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (workouts) {
        const formattedWorkouts = workouts.map(w => ({
          date: format(new Date(w.created_at), 'dd/MM'),
          volume: w.data.exercises?.reduce((acc: number, ex: any) => {
            return acc + (ex.sets?.reduce((sAcc: number, s: any) => sAcc + (s.weight * s.reps), 0) || 0);
          }, 0) || 0,
          muscle: w.muscle_group
        }));
        setWorkoutData(formattedWorkouts);
      }

      if (checkins) {
        const formattedWeight = checkins.map(c => ({
          date: format(new Date(c.created_at), 'dd/MM'),
          weight: c.data.weight
        }));
        setWeightData(formattedWeight);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="h-48 bg-zinc-900 animate-pulse rounded-xl" />
      <div className="h-48 bg-zinc-900 animate-pulse rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Evolución del Volumen</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold text-zinc-500">Kilos totales (30d)</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
           <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={workoutData}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="volume" stroke="#dc2626" fillOpacity={1} fill="url(#colorVol)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Peso Corporal</CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold text-zinc-500">Tendencia sistémica</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="weight" stroke="#2563eb" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}