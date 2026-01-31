import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { GlobalAnalysisResponse } from "@/types";
import { ChevronLeft, Brain, TrendingUp, AlertTriangle, Calendar, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

export default function GlobalAnalysis() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  const [analysis, setAnalysis] = useState<GlobalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
      .eq('action', 'globalanalysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLastRunDate(data.created_at);
    }
  };

  const runAudit = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', profile!.user_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!logs || logs.length < 5) {
        toast.warning("Necesitamos al menos 5 registros recientes para un análisis útil.");
      }

      const summary = {
        userProfile: {
          discipline: profile!.discipline,
          tone: profile!.coach_tone,
          units: profile!.units
        },
        logsCount: logs?.length,
        logs: logs?.map(l => ({
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
      setLoading(false);
    }
  };

  if (profileLoading) return <div className="p-8"><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-20 max-w-md mx-auto space-y-6">
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
            <Brain className="text-primary" /> Auditoría Global
          </h1>
        </div>
        {!hasProAccess && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
            <Lock className="w-3 h-3" /> Vista Previa
          </Badge>
        )}
      </div>

      {!analysis && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Inteligencia de Enjambre</CardTitle>
            <CardDescription>
              Analiza tus últimos 30 días de datos para detectar patrones ocultos.
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
                className="w-full h-12 text-lg relative overflow-hidden" 
                onClick={runAudit}
                disabled={loading}
              >
                {!hasProAccess && <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-4 h-4 mr-2"/> PRO</div>}
                {loading ? "Analizando Datos..." : "Ejecutar Auditoría"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-48 bg-muted rounded-xl"></div>
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-l-4 border-l-primary shadow-lg bg-zinc-950/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Evaluación General</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Using the new Markdown Renderer here */}
              <MarkdownRenderer content={analysis.overall_assessment} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-green-500" /> Patrones Detectados
            </h3>
            {analysis.top_patterns.map((item, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-sm">{item.pattern}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary">Evidencia: {item.evidence}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
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
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4">
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
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
            <Card>
              <CardContent className="p-0">
                {analysis.next_14_days_plan.map((plan, i) => (
                  <div key={i} className="p-4 border-b last:border-0 flex gap-3 text-sm items-start">
                    <span className="font-bold text-muted-foreground bg-muted w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">
                      {i + 1}
                    </span>
                    <span>{plan}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}