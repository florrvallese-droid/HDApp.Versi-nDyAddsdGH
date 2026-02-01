import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/services/supabase";
import { format, subDays, startOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Activity, Zap, Moon, Scale, Utensils, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProgressChartsProps {
  userId: string;
}

type VariableKey = 'volume' | 'weight' | 'sleep' | 'stress' | 'adherence';

const VARIABLES = [
  { id: 'volume', label: 'Volumen', icon: Zap, color: '#dc2626', unit: 'kg' },
  { id: 'weight', label: 'Peso', icon: Scale, color: '#2563eb', unit: 'kg' },
  { id: 'sleep', label: 'Sueño', icon: Moon, color: '#9333ea', unit: 'pts' },
  { id: 'stress', label: 'Estrés', icon: Activity, color: '#ea580c', unit: 'pts' },
  { id: 'adherence', label: 'Nutrición', icon: Utensils, color: '#16a34a', unit: '%' },
];

export function ProgressCharts({ userId }: ProgressChartsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedVars, setSelectedVars] = useState<VariableKey[]>(['volume', 'sleep']);

  useEffect(() => {
    fetchAndProcessData();
  }, [userId]);

  const fetchAndProcessData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // Fetch all relevant logs in one window
      const { data: logs } = await supabase
        .from('logs')
        .select('created_at, type, data')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (!logs) return;

      // Group data by Date
      const dateMap: Record<string, any> = {};

      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dateMap[d] = { 
          date: format(subDays(new Date(), i), 'dd/MM'),
          fullDate: d,
          volume: null,
          weight: null,
          sleep: null,
          stress: null,
          adherence: null
        };
      }

      logs.forEach(log => {
        const d = format(parseISO(log.created_at), 'yyyy-MM-dd');
        if (!dateMap[d]) return;

        if (log.type === 'workout') {
          const vol = log.data.exercises?.reduce((acc: number, ex: any) => {
            return acc + (ex.sets?.reduce((sAcc: number, s: any) => sAcc + (s.weight * s.reps), 0) || 0);
          }, 0) || 0;
          dateMap[d].volume = (dateMap[d].volume || 0) + vol;
        }

        if (log.type === 'checkin') {
          dateMap[d].weight = log.data.weight;
        }

        if (log.type === 'preworkout') {
          dateMap[d].sleep = log.data.inputs?.sleep;
          dateMap[d].stress = log.data.inputs?.stress;
        }

        if (log.type === 'nutrition') {
          dateMap[d].adherence = log.data.adherence;
        }
      });

      // Convert map to array and fill gaps (simple interpolation for weight/adherence)
      const chartArray = Object.values(dateMap);
      setData(chartArray);

    } catch (error) {
      console.error("Error processing dynamic trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVariable = (id: VariableKey) => {
    if (selectedVars.includes(id)) {
      if (selectedVars.length > 1) setSelectedVars(selectedVars.filter(v => v !== id));
    } else {
      if (selectedVars.length < 3) setSelectedVars([...selectedVars, id]);
    }
  };

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="h-64 bg-zinc-900 animate-pulse rounded-xl" />
      <div className="grid grid-cols-5 gap-2">
        {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-zinc-900 animate-pulse rounded-md" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* VARIABLE SELECTOR */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Seleccionar variables a cruzar (Máx 3):</p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map(v => {
            const isSelected = selectedVars.includes(v.id as VariableKey);
            return (
              <button
                key={v.id}
                onClick={() => toggleVariable(v.id as VariableKey)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-bold uppercase",
                  isSelected 
                    ? "bg-zinc-800 border-zinc-700 text-white" 
                    : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400"
                )}
              >
                <v.icon className={cn("w-3.5 h-3.5", isSelected ? "" : "opacity-30")} style={{ color: isSelected ? v.color : undefined }} />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC CHART */}
      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden relative">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
            <BarChart3 className="h-4 w-4 text-red-500" /> Cruce de Tendencias
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-bold text-zinc-500">Últimos 30 días de registros sistémicos</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
           <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  {selectedVars.map(v => {
                    const varInfo = VARIABLES.find(vari => vari.id === v);
                    return (
                      <linearGradient key={v} id={`color${v}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={varInfo?.color} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={varInfo?.color} stopOpacity={0}/>
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis 
                   dataKey="date" 
                   fontSize={9} 
                   tickLine={false} 
                   axisLine={false} 
                   tick={{fill: '#52525b'}} 
                   minTickGap={15}
                />
                <YAxis 
                   hide 
                   domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                  itemStyle={{ padding: '2px 0' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid #18181b', paddingBottom: '4px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] uppercase font-bold text-zinc-500">{VARIABLES.find(v => v.id === value)?.label}</span>}
                />
                {selectedVars.map(v => (
                  <Area 
                    key={v}
                    type="monotone" 
                    dataKey={v} 
                    stroke={VARIABLES.find(vari => vari.id === v)?.color} 
                    fillOpacity={1} 
                    fill={`url(#color${v})`} 
                    strokeWidth={2} 
                    connectNulls={true}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-zinc-900/30 border-zinc-800 p-3">
          <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Dato del Mes</p>
          <p className="text-xs text-zinc-300">Cruce más relevante para tu Coach IA es <strong>Volumen vs Sueño</strong>.</p>
        </Card>
        <Card className="bg-zinc-900/30 border-zinc-800 p-3">
          <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Tip</p>
          <p className="text-xs text-zinc-300">Si las curvas se separan mucho, hay una <strong>desincronía</strong> metabólica.</p>
        </Card>
      </div>

    </div>
  );
}