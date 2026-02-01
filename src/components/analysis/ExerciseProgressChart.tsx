import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/services/supabase";
import { format, parseISO } from "date-fns";
import { Dumbbell, TrendingUp, Target, Loader2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateOneRM } from "@/utils/calculations";
import { cn } from "@/lib/utils";

interface ExerciseProgressChartProps {
  userId: string;
}

export function ExerciseProgressChart({ userId }: ExerciseProgressChartProps) {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchUniqueExercises();
  }, [userId]);

  useEffect(() => {
    if (selectedExercise) {
      fetchExerciseHistory(selectedExercise);
    }
  }, [selectedExercise]);

  const fetchUniqueExercises = async () => {
    setLoading(true);
    const { data: logs } = await supabase
      .from('logs')
      .select('data')
      .eq('user_id', userId)
      .eq('type', 'workout');

    if (logs) {
      const names = new Set<string>();
      logs.forEach(log => {
        log.data.exercises?.forEach((ex: any) => names.add(ex.name));
      });
      const sortedNames = Array.from(names).sort();
      setExercises(sortedNames);
      if (sortedNames.length > 0) setSelectedExercise(sortedNames[0]);
    }
    setLoading(false);
  };

  const fetchExerciseHistory = async (exerciseName: string) => {
    const { data: logs } = await supabase
      .from('logs')
      .select('created_at, data')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .order('created_at', { ascending: true });

    if (logs) {
      const history = logs
        .map(log => {
          const ex = log.data.exercises?.find((e: any) => e.name === exerciseName);
          if (!ex || !ex.sets || ex.sets.length === 0) return null;

          // Encontrar el mejor set (mayor 1RM estimado)
          const sets = ex.sets.map((s: any) => ({
            weight: s.weight,
            reps: s.reps,
            oneRM: calculateOneRM(s.weight, s.reps)
          }));
          
          const bestSet = sets.reduce((prev: any, current: any) => (prev.oneRM > current.oneRM) ? prev : current);

          return {
            date: format(parseISO(log.created_at), 'dd/MM'),
            weight: bestSet.weight,
            oneRM: bestSet.oneRM,
            reps: bestSet.reps
          };
        })
        .filter(Boolean);

      setChartData(history);
    }
  };

  if (loading) return <div className="h-40 bg-zinc-900 animate-pulse rounded-xl" />;

  return (
    <Card className="bg-zinc-950 border-zinc-900 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
                    <Target className="h-4 w-4 text-primary" /> Foco en Ejercicio
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-zinc-500">Análisis de sobrecarga específica</CardDescription>
            </div>
            <div className="w-48">
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 h-9 text-xs font-bold uppercase">
                        <SelectValue placeholder="Ejercicio" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
                        {exercises.map(ex => (
                            <SelectItem key={ex} value={ex} className="text-xs uppercase font-bold">{ex}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        {chartData.length > 0 ? (
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                        <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
                            formatter={(value: any, name: string) => [
                                `${value}kg`, 
                                name === 'oneRM' ? '1RM Estimado' : 'Peso Máximo'
                            ]}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] uppercase font-bold text-zinc-500">{value === 'oneRM' ? 'Fuerza (1RM)' : 'Carga Real'}</span>} />
                        <Line type="monotone" dataKey="oneRM" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="weight" stroke="#52525b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-[250px] flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-tighter">Sin datos suficientes para este ejercicio</p>
            </div>
        )}
        
        {chartData.length > 1 && (
            <div className="p-4 bg-zinc-900/30 border-t border-zinc-900 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Progreso Total</span>
                    <span className={cn(
                        "text-lg font-black italic uppercase",
                        chartData[chartData.length-1].oneRM >= chartData[0].oneRM ? "text-green-500" : "text-red-500"
                    )}>
                        {chartData[chartData.length-1].oneRM >= chartData[0].oneRM ? "+" : ""}
                        {((chartData[chartData.length-1].oneRM - chartData[0].oneRM) / chartData[0].oneRM * 100).toFixed(1)}%
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Último Récord</span>
                    <p className="text-sm font-bold text-white uppercase">{chartData[chartData.length-1].weight}kg x {chartData[chartData.length-1].reps}</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}