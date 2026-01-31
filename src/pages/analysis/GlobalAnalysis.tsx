import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { GlobalAnalysisResponse, Log } from "@/types";
import { ChevronLeft, Brain, TrendingUp, AlertTriangle, Calendar, Lock, Activity, Scale, History, Dumbbell, Moon, Zap, Syringe, Camera } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function GlobalAnalysis() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  // AI State
  const [analysis, setAnalysis] = useState<GlobalAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Dashboard Data State
  const [logs, setLogs] = useState<Log[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!profileLoading && profile) {
      checkLastRun();
      fetchDashboardData();
    }
  }, [profile, profileLoading]);

  const checkLastRun = async () => {
    const { data } = await supabase
      .from('ai_logs')
      .select('created_at')
      .eq('user_id', profile!.user_id)
      .eq('action', 'globalanalysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLastRunDate(data.created_at);
    }
  };

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // Fetch last 30 days of logs for charts and list
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', profile!.user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedLogs = data as Log[];
      setLogs(typedLogs);

      // Process for Volume Chart (Workouts)
      const workouts = typedLogs
        .filter(l => l.type === 'workout')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const volData = workouts.map(w => ({
        date: format(new Date(w.created_at), 'dd/MM'),
        volume: w.data.total_volume || 0,
        muscle: w.muscle_group
      }));
      setVolumeData(volData);

      // Process for Weight Chart (Checkins)
      const checkins = typedLogs
        .filter(l => l.type === 'checkin')
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const wData = checkins.map(c => ({
        date: format(new Date(c.created_at), 'dd/MM'),
        weight: c.data.weight || 0
      }));
      setWeightData(wData);

    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setDataLoading(false);
    }
  };

  const runAudit = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    setAiLoading(true);
    try {
      const summary = {
        userProfile: {
          discipline: profile!.discipline,
          tone: profile!.coach_tone,
          units: profile!.units
        },
        logsCount: logs?.length,
        logs: logs?.slice(0, 30).map(l => ({
          type: l.type,
          date: l.created_at,
          muscle: l.muscle_group,
          data: l.data
        }))
      };

      const result = await aiService.getGlobalAnalysis(profile!.coach_tone, summary);
      setAnalysis(result);

    } catch (error) {
      console.error(error);
      toast.error("Error al ejecutar la auditoría");
    } finally {
      setAiLoading(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'workout': return <Dumbbell className="h-4 w-4 text-red-500" />;
      case 'checkin': return <Camera className="h-4 w-4 text-blue-500" />;
      case 'cardio': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'rest': return <Moon className="h-4 w-4 text-purple-500" />;
      case 'pharmacology': return <Syringe className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getLogDescription = (log: Log) => {
    switch(log.type) {
      case 'workout': return `${log.muscle_group} - ${log.data.exercises?.length || 0} Ejercicios`;
      case 'checkin': return `Peso: ${log.data.weight} ${profile?.units}`;
      case 'cardio': return `${log.data.type === 'walking' ? 'Caminata' : 'Cardio'} (${log.data.duration_minutes} min)`;
      case 'rest': return "Día de Recuperación";
      case 'pharmacology': return `Ciclo: ${log.data.name}`;
      default: return "Registro de actividad";
    }
  };

  if (profileLoading) return <div className="p-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-24 max-w-md mx-auto space-y-6">
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="Auditoría Global con IA" 
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" /> Auditoría
          </h1>
        </div>
        {!hasProAccess && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
            <Lock className="w-3 h-3" /> PRO
          </Badge>
        )}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
          <TabsTrigger value="dashboard">Bitácora & Gráficos</TabsTrigger>
          <TabsTrigger value="ai-audit" className="gap-2">
             <Brain className="h-3 w-3" /> Auditoría Global
          </TabsTrigger>
        </TabsList>

        {/* --- DASHBOARD TAB --- */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          
          {/* Charts */}
          {dataLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="space-y-6">
              {/* Volume Chart */}
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase text-zinc-400 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" /> Rendimiento (Volumen Total)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] w-full pl-0">
                  {volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                           itemStyle={{ color: '#fff' }}
                           cursor={{fill: '#27272a'}}
                        />
                        <Bar dataKey="volume" fill="#dc2626" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                     <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                        Sin datos de entrenamiento recientes
                     </div>
                  )}
                </CardContent>
              </Card>

              {/* Weight Chart */}
              <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase text-zinc-400 flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-500" /> Peso Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] w-full pl-0">
                  {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightData}>
                        <defs>
                          <linearGradient id="colorWeightAudit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="weight" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWeightAudit)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                     <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                        Sin registros de peso recientes
                     </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bitácora (Logbook) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-zinc-500" /> Bitácora Reciente
            </h3>
            
            <div className="space-y-3">
              {dataLoading ? (
                 <>
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                   <Skeleton className="h-16 w-full" />
                 </>
              ) : logs.length === 0 ? (
                 <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded">
                    No hay actividad registrada.
                 </div>
              ) : (
                logs.map((log) => (
                  <Card key={log.id} className="bg-zinc-900/50 border-zinc-800">
                    <div className="flex items-center p-4 gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                         {getLogIcon(log.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <p className="font-bold text-sm text-zinc-200 truncate capitalize">
                              {log.type === 'workout' ? 'Entrenamiento' : log.type === 'checkin' ? 'Check-in Físico' : log.type}
                           </p>
                           <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                              {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: es })}
                           </span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                           {getLogDescription(log)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* --- AI AUDIT TAB --- */}
        <TabsContent value="ai-audit" className="mt-4 space-y-6">
          {!analysis && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Brain className="h-5 w-5" /> Medí tu Progreso
                </CardTitle>
                <CardDescription>
                  Analizá tus registros y descubrí si estás progresando o si hay patrones que frenan tu llegada a la meta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {lastRunDate && (
                    <p className="text-xs text-muted-foreground text-center">
                      Último análisis: {format(new Date(lastRunDate), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  )}
                  <Button 
                    className="w-full h-12 text-lg relative overflow-hidden bg-primary hover:bg-red-700" 
                    onClick={runAudit}
                    disabled={aiLoading}
                  >
                    {!hasProAccess && <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-4 h-4 mr-2"/> PRO</div>}
                    {aiLoading ? "Analizando Datos..." : "Ejecutar Auditoría"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {aiLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-muted rounded-xl"></div>
              <div className="h-48 bg-muted rounded-xl"></div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="border-l-4 border-l-primary shadow-lg bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Evaluación General</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {analysis.overall_assessment}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" /> Patrones Detectados
                </h3>
                {analysis.top_patterns.map((item, i) => (
                  <Card key={i} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold text-sm text-zinc-200">{item.pattern}</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Evidencia: {item.evidence}</Badge>
                      </div>
                      <p className="text-xs text-zinc-400 bg-black/40 p-2 rounded border border-zinc-800/50">
                        👉 {item.action}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {analysis.red_flags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2 text-lg text-red-500">
                    <AlertTriangle className="h-5 w-5" /> Alertas
                  </h3>
                  <Card className="border-red-900/30 bg-red-950/10">
                    <CardContent className="p-4">
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
                        {analysis.red_flags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-blue-500" /> Plan Táctico (14 días)
                </h3>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-0">
                    {analysis.next_14_days_plan.map((plan, i) => (
                      <div key={i} className="p-4 border-b border-zinc-800 last:border-0 flex gap-3 text-sm items-start">
                        <span className="font-bold text-zinc-900 bg-zinc-200 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                          {i + 1}
                        </span>
                        <span className="text-zinc-300">{plan}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              <Button variant="outline" className="w-full border-zinc-800" onClick={() => setAnalysis(null)}>
                Volver
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}