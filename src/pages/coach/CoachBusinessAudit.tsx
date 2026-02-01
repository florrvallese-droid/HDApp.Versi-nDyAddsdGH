import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { ChevronLeft, Brain, TrendingUp, Calendar, Lock, BarChart3, Loader2, DollarSign, Briefcase, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { BusinessProgressCharts } from "@/components/coach/BusinessProgressCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CoachBusinessAudit() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("visual");

  useEffect(() => {
    if (!profileLoading && profile) {
      checkLastRun();
    }
  }, [profile, profileLoading]);

  const checkLastRun = async () => {
    const { data } = await supabase
      .from('ai_logs')
      .select('created_at')
      .eq('user_id', profile!.user_id)
      .eq('action', 'globalanalysis') // Reutilizamos la misma acción técnica
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setLastRunDate(data.created_at);
  };

  const runBusinessAudit = async () => {
    setLoading(true);
    try {
      // Recopilar datos macro del negocio
      const { data: assignments } = await supabase
        .from('coach_assignments')
        .select('*')
        .eq('coach_id', profile!.user_id);

      const { data: payments } = await supabase
        .from('coach_payment_logs')
        .select('*')
        .eq('coach_id', profile!.user_id);

      const bizSummary = {
        type: 'coach_business_audit',
        coachProfile: { brand: profile?.business_info?.brand_name, specialty: profile?.business_info?.specialty },
        metrics: {
            totalAthletes: assignments?.length || 0,
            activeAthletes: assignments?.filter(a => a.status === 'active').length || 0,
            debtors: assignments?.filter(a => a.payment_status === 'late' || a.payment_status === 'unpaid').length || 0,
            courtesyAthletes: assignments?.filter(a => a.payment_status === 'scholarship').length || 0,
            totalRevenueHistory: payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
        }
      };

      const result = await aiService.getGlobalAnalysis('analytical', bizSummary);
      setAnalysis(result);
      setActiveTab("ai");
      toast.success("Auditoría de Negocio completada");
    } catch (error) {
      console.error(error);
      toast.error("Error al ejecutar la auditoría de negocio");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return <div className="p-8 bg-black min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/coach/business')} className="text-zinc-500">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Business Audit</h1>
            <p className="text-[9px] text-red-500 font-bold tracking-widest uppercase">Inteligencia de Datos Aplicada</p>
          </div>
        </div>
        <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-950/10 flex gap-1">
            <TrendingUp className="w-3 h-3" /> ANALYTICS
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="visual" className="flex-1 font-bold uppercase text-[10px] tracking-widest"><BarChart3 className="w-3 h-3 mr-2" /> Métricas</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 font-bold uppercase text-[10px] tracking-widest"><Brain className="w-3 h-3 mr-2" /> Análisis IA</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8 animate-in slide-in-from-left-2">
           <BusinessProgressCharts coachId={profile!.user_id} />
           
           <div className="grid grid-cols-2 gap-4">
              <BizStat icon={<Users className="text-blue-500"/>} label="Retención" value="94%" />
              <BizStat icon={<DollarSign className="text-green-500"/>} label="Ticket Med." value={`$${(analysis?.metrics?.totalRevenueHistory / (analysis?.metrics?.totalAthletes || 1)).toFixed(0) || '0'}`} />
           </div>

           <div className="pt-4">
              <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-900/20" onClick={runBusinessAudit} disabled={loading}>
                {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Cruzando Variables...</> : <>AUDITAR NEGOCIO CON IA</>}
              </Button>
              {lastRunDate && <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase font-bold tracking-tighter">Último Análisis: {format(new Date(lastRunDate), "d 'de' MMMM", { locale: es })}</p>}
           </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {!analysis && !loading && (
            <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl space-y-4">
               <Brain className="h-10 w-10 text-zinc-800 mx-auto" />
               <p className="text-sm text-zinc-500 font-medium">Ejecuta la auditoría para ver el análisis estratégico del Coach.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-6 py-10 flex flex-col items-center justify-center">
                <div className="relative">
                   <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full" />
                   <Loader2 className="h-12 w-12 animate-spin text-red-600 relative z-10" />
                </div>
                <p className="text-zinc-500 text-sm font-black uppercase tracking-widest animate-pulse">Analizando Ciclo Económico del Team...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <Card className="border-l-4 border-l-blue-600 bg-zinc-950/50">
                <CardHeader className="pb-2"><CardTitle className="text-sm uppercase font-black text-zinc-500">Informe Estratégico</CardTitle></CardHeader>
                <CardContent><MarkdownRenderer content={analysis.overall_assessment} /></CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-black flex items-center gap-2 text-xs uppercase tracking-widest text-white"><TrendingUp className="h-4 w-4 text-green-500" /> Patrones de Negocio</h3>
                {analysis.top_patterns.map((item: any, i: number) => (
                  <Card key={i} className="bg-zinc-900/40 border-zinc-800">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-bold text-sm text-zinc-200">{item.pattern}</p>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Dato Base: {item.evidence}</Badge>
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

const BizStat = ({ icon, label, value }: any) => (
    <Card className="bg-zinc-950 border-zinc-900">
        <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg">{icon}</div>
            <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
                <p className="text-lg font-black text-white">{value}</p>
            </div>
        </CardContent>
    </Card>
);