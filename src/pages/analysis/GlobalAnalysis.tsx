import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { GlobalAnalysisResponse, NutritionConfig } from "@/types";
import { ChevronLeft, Brain, TrendingUp, Calendar, Lock, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { ProgressCharts } from "@/components/analysis/ProgressCharts";
import { ExerciseProgressChart } from "@/components/analysis/ExerciseProgressChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockedFeature } from "@/components/shared/LockedFeature";

export default function GlobalAnalysis() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  const [analysis, setAnalysis] = useState<GlobalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");

  const dietVariants = (profile?.settings?.nutrition as NutritionConfig)?.diet_variants || [];

  useEffect(() => {
    if (!profileLoading && profile) {
      checkLastRun();
    }
  }, [profile, profileLoading]);

  const checkLastRun = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('ai_logs')
      .select('created_at')
      .eq('user_id', profile.user_id)
      .eq('action', 'globalanalysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setLastRunDate(data.created_at);
  };

  const runAudit = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    if (!profile) return;

    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', profile.user_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const summary = {
        userProfile: { 
          discipline: profile.discipline, 
          tone: profile.coach_tone, 
          units: profile.units,
          dietStrategy: profile.settings?.nutrition 
        },
        logsCount: logs?.length,
        logs: logs?.map(l => ({ type: l.type, date: l.created_at, muscle: l.muscle_group, data: l.data }))
      };

      const result = await aiService.getGlobalAnalysis(profile.coach_tone, summary);
      setAnalysis(result);
      setActiveTab("ai");
    } catch (error) {
      console.error(error);
      toast.error("Error al ejecutar la auditoría");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading || (!profile && loading)) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-red-600 h-8 w-8" />
        </div>
    );
  }

  // Si después de cargar el perfil sigue siendo null, mostramos error
  if (!profile) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-4">
            <AlertCircle className="text-red-600 h-10 w-10" />
            <p className="text-white font-bold">No se encontró el perfil de usuario.</p>
            <Button onClick={() => navigate('/dashboard')}>Volver</Button>
        </div>
    );
  }

  if (!hasProAccess && activeTab === 'ai') {
      return (
        <div className="min-h-screen bg-black p-4">
            <div className="flex items-center gap-2 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-black uppercase italic tracking-tighter text-white">Auditoría IA</h1>
            </div>
            <LockedFeature 
                title="Cerebro Analítico Bloqueado" 
                description="La auditoría de patrones requiere el procesamiento avanzado del motor PRO." 
            />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto space-y-6">
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} featureName="Auditoría Global con IA" />

      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Auditoría</h1>
        </div>
        {!hasProAccess && <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1 bg-yellow-950/10"><Lock className="w-3 h-3" /> PRO</Badge>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="visual" className="flex-1 font-bold uppercase text-[10px] tracking-widest"><BarChart3 className="w-3 h-3 mr-2" /> Tendencias</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 font-bold uppercase text-[10px] tracking-widest"><Brain className="w-3 h-3 mr-2" /> Juicio IA</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8 animate-in fade-in slide-in-from-left-2">
           <ProgressCharts userId={profile.user_id} dietVariants={dietVariants} />
           
           <ExerciseProgressChart userId={profile.user_id} />

           <div className="pt-4">
              <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-900/20" onClick={runAudit} disabled={loading}>
                {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Procesando...</> : <>EJECUTAR AUDITORÍA IA</>}
              </Button>
              {lastRunDate && <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase font-bold tracking-tighter">Última Auditoría: {format(new Date(lastRunDate), "d 'de' MMMM", { locale: es })}</p>}
           </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {!analysis && !loading && (
            <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl space-y-4">
               <Brain className="h-10 w-10 text-zinc-800 mx-auto" />
               <p className="text-sm text-zinc-500 font-medium">Ejecuta la auditoría para ver el análisis del Coach.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-6 py-10 flex flex-col items-center justify-center">
                <div className="relative">
                   <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full" />
                   <Loader2 className="h-12 w-12 animate-spin text-red-600 relative z-10" />
                </div>
                <p className="text-zinc-500 text-sm font-black uppercase tracking-widest animate-pulse">Cruzando Variables Sistémicas...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <Card className="border-l-4 border-l-red-600 bg-zinc-950/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase font-black text-zinc-500">Evaluación General</CardTitle></CardHeader>
                <CardContent><MarkdownRenderer content={analysis.overall_assessment} /></CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-black flex items-center gap-2 text-xs uppercase tracking-widest text-white"><TrendingUp className="h-4 w-4 text-green-500" /> Patrones Detectados</h3>
                {analysis.top_patterns.map((item, i) => (
                  <Card key={i} className="bg-zinc-900/40 border-zinc-800">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-bold text-sm text-zinc-200">{item.pattern}</p>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Evidencia: {item.evidence}</Badge>
                      <p className="text-xs text-zinc-500 italic pt-1">{item.action}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}