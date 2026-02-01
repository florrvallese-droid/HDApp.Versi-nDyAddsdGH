import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/services/supabase";
import { format, subDays, parseISO } from "date-fns";
import { Activity, Zap, Moon, Scale, Utensils, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DietVariant } from "@/types";

interface ProgressChartsProps {
  userId: string;
  dietVariants?: DietVariant[];
}

type VariableKey = 'volume' | 'weight' | 'sleep' | 'stress' | 'calories';

const VARIABLES = [
  { id: 'volume', label: 'Volumen', icon: Zap, color: '#dc2626', unit: 'kg' },
  { id: 'calories', label: 'Calorías', icon: Utensils, color: '#16a34a', unit: 'kcal' },
  { id: 'weight', label: 'Peso', icon: Scale, color: '#2563eb', unit: 'kg' },
  { id: 'sleep', label: 'Sueño', icon: Moon, color: '#9333ea', unit: 'pts' },
  { id: 'stress', label: 'Estrés', icon: Activity, color: '#ea580c', unit: 'pts' },
];

export function ProgressCharts({ userId, dietVariants = [] }: ProgressChartsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedVars, setSelectedVars] = useState<VariableKey[]>(['volume', 'calories']);

  useEffect(() => {
    fetchAndProcessData();
  }, [userId, dietVariants]);

  const fetchAndProcessData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      const { data: logs } = await supabase
        .from('logs')
        .select('created_at, type, data')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (!logs) return;

      const dateMap: Record<string, any> = {};

      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dateMap[d] = { 
          date: format(subDays(new Date(), i), 'dd/MM'),
          fullDate: d,
          volume: null,
          weight: null,
          sleep: null,
          stress: null,
          calories: null
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
          // Mapear el ID de la variante a las calorías reales definidas por el usuario
          const variant = dietVariants.find(v => v.id === log.data.day_variant_id);
          if (variant) {
            // Si la adherencia es baja, podrías ajustar las kcal, pero para tendencias usamos el objetivo
            dateMap[d].calories = variant.calories;
          }
        }
      });

      setData(Object.values(dateMap));

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

  if (loading) return <div className="h-64 bg-zinc-900 animate-pulse rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Variables a cruzar (Máx 3):</p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map(v => {
            const isSelected = selectedVars.includes(v.id as VariableKey);
            return (
              <button
                key={v.id}
                onClick={() => toggleVariable(v.id as VariableKey)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[10px] font-bold uppercase",
                  isSelected ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-950 border-zinc-900 text-zinc-600"
                )}
              >
                <v.icon className="w-3 h-3" style={{ color: isSelected ? v.color : undefined }} />
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
            <BarChart3 className="h-4 w-4 text-red-500" /> Correlación de Carga
          </CardTitle>
          <CardDescription className="text-[10px] uppercase text-zinc-500">Volumen vs Nutrición vs Recuperación</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
           <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  {selectedVars.map(v => (
                    <linearGradient key={v} id={`color${v}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={VARIABLES.find(vari => vari.id === v)?.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={VARIABLES.find(vari => vari.id === v)?.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} minTickGap={15} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] uppercase font-bold text-zinc-500">{VARIABLES.find(v => v.id === value)?.label}</span>} />
                {selectedVars.map(v => (
                  <Area key={v} type="monotone" dataKey={v} stroke={VARIABLES.find(vari => vari.id === v)?.color} fillOpacity={1} fill={`url(#color${v})`} strokeWidth={2} connectNulls={true} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}