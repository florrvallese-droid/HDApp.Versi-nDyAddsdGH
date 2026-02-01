import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "@/services/supabase";
import { format, subDays, parseISO } from "date-fns";
import { Users, DollarSign, Activity, BarChart3, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessProgressChartsProps {
  coachId: string;
}

type BizVariableKey = 'revenue' | 'athletes' | 'teamActivity';

const BIZ_VARIABLES = [
  { id: 'revenue', label: 'Ingresos (ARS)', icon: DollarSign, color: '#16a34a' },
  { id: 'athletes', label: 'Total Alumnos', icon: Users, color: '#2563eb' },
  { id: 'teamActivity', label: 'Entrenos Equipo', icon: Zap, color: '#dc2626' },
];

export function BusinessProgressCharts({ coachId }: BusinessProgressChartsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [selectedVars, setSelectedVars] = useState<BizVariableKey[]>(['revenue', 'athletes']);

  useEffect(() => {
    fetchBusinessData();
  }, [coachId]);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

      // 1. Fetch Assignments (for revenue and athlete count trends)
      const { data: assignments } = await supabase
        .from('coach_assignments')
        .select('created_at, monthly_fee, status')
        .eq('coach_id', coachId);

      // 2. Fetch Payment Logs (real revenue history)
      const { data: payments } = await supabase
        .from('coach_payment_logs')
        .select('payment_date, amount')
        .eq('coach_id', coachId)
        .gte('payment_date', thirtyDaysAgo);

      // 3. Fetch Team Activity (Workouts logged by all athletes of this coach)
      const { data: athleteAssignments } = await supabase
        .from('coach_assignments')
        .select('athlete_id')
        .eq('coach_id', coachId)
        .eq('status', 'active');
      
      const athleteIds = athleteAssignments?.map(a => a.athlete_id) || [];
      
      const { data: logs } = await supabase
        .from('logs')
        .select('created_at')
        .in('user_id', athleteIds)
        .eq('type', 'workout')
        .gte('created_at', thirtyDaysAgo);

      const dateMap: Record<string, any> = {};

      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dateMap[d] = { 
          date: format(subDays(new Date(), i), 'dd/MM'),
          revenue: 0,
          athletes: 0,
          teamActivity: 0
        };
      }

      // Process Revenue
      payments?.forEach(p => {
        const d = format(parseISO(p.payment_date), 'yyyy-MM-dd');
        if (dateMap[d]) dateMap[d].revenue += Number(p.amount);
      });

      // Process Athlete Count (cumulative based on assignment creation)
      assignments?.forEach(a => {
        const d = format(parseISO(a.created_at), 'yyyy-MM-dd');
        Object.keys(dateMap).forEach(dateKey => {
            if (dateKey >= d) dateMap[dateKey].athletes++;
        });
      });

      // Process Team Activity
      logs?.forEach(l => {
        const d = format(parseISO(l.created_at), 'yyyy-MM-dd');
        if (dateMap[d]) dateMap[d].teamActivity++;
      });

      setData(Object.values(dateMap));

    } catch (error) {
      console.error("Error fetching biz data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVariable = (id: BizVariableKey) => {
    if (selectedVars.includes(id)) {
      if (selectedVars.length > 1) setSelectedVars(selectedVars.filter(v => v !== id));
    } else {
      setSelectedVars([...selectedVars, id]);
    }
  };

  if (loading) return <div className="h-64 bg-zinc-900 animate-pulse rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {BIZ_VARIABLES.map(v => {
          const isSelected = selectedVars.includes(v.id as BizVariableKey);
          return (
            <button
              key={v.id}
              onClick={() => toggleVariable(v.id as BizVariableKey)}
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

      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-white">
            <TrendingUp className="h-4 w-4 text-primary" /> Tendencia del Business
          </CardTitle>
          <CardDescription className="text-[10px] uppercase text-zinc-500">Rentabilidad vs Crecimiento vs Compromiso</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
           <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  {selectedVars.map(v => (
                    <linearGradient key={v} id={`bizColor${v}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BIZ_VARIABLES.find(vari => vari.id === v)?.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={BIZ_VARIABLES.find(vari => vari.id === v)?.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="date" fontSize={9} tickLine={false} axisLine={false} tick={{fill: '#52525b'}} minTickGap={15} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] uppercase font-bold text-zinc-500">{BIZ_VARIABLES.find(v => v.id === value)?.label}</span>} />
                {selectedVars.map(v => (
                  <Area key={v} type="monotone" dataKey={v} stroke={BIZ_VARIABLES.find(vari => vari.id === v)?.color} fillOpacity={1} fill={`url(#bizColor${v})`} strokeWidth={2} connectNulls={true} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}