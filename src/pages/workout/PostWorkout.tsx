import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Loader2, Zap, Gavel, ChevronDown, ChevronLeft, Dumbbell, FileText } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService, PostWorkoutAIResponse } from "@/services/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function PostWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<PostWorkoutAIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [reportOpen, setReportOpen] = useState(true);
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.workoutData) {
      setWorkoutData(location.state.workoutData);
    }
  }, [location]);

  useEffect(() => {
    if (workoutData && profile && !profileLoading) {
      if (hasProAccess) {
        runAnalysis(workoutData);
      } else {
        setLoading(false);
      }
    }
  }, [workoutData, profile, profileLoading, hasProAccess]);

  const runAnalysis = async (currentWorkout: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs } = await supabase
        .from('logs')
        .select('data, created_at')
        .eq('user_id', user.id)
        .eq('type', 'workout')
        .eq('muscle_group', currentWorkout.muscleGroup)
        .order('created_at', { ascending: false });

      const previousLogs = logs?.filter(l => {
          const logDate = new Date(l.created_at).getTime();
          const now = new Date().getTime();
          return (now - logDate) > 60000;
      }) || [];

      let previousWorkout = null;
      if (previousLogs.length > 0) {
        previousWorkout = previousLogs[0].data;
      } else {
        setIsFirstSession(true);
      }

      const result = await aiService.getPostWorkoutAnalysis(
        profile?.coach_tone || 'strict',
        {
          current: currentWorkout,
          previous: previousWorkout,
          isFirstSession: previousLogs.length === 0,
          discipline: profile?.discipline || 'general',
          muscleGroup: currentWorkout.muscleGroup
        }
      );

      setAnalysis(result);

    } catch (error) {
      console.error(error);
      toast.error("Error en la auditoría de la sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (!cardRef.current) return;
    setSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null, useCORS: true });
      const image = canvas.toDataURL("image/png");

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "HD-Audit.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Heavy Duty Audit', text: `Veredicto: ${analysis?.card_data.verdict}` });
        } else { downloadImage(image); }
      } else { downloadImage(image); }
    } catch (error) {
      toast.error("Error al generar imagen");
    } finally {
      setSharing(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `HD-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  if ((!workoutData && loading) || profileLoading) return <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
    <Loader2 className="h-10 w-10 animate-spin text-red-600" />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Auditando Progresión...</p>
  </div>;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-32 flex flex-col items-center gap-10 overflow-y-auto relative">
      
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} featureName="Análisis Post-Entreno" />

      <div className="w-full max-w-2xl px-2 animate-in fade-in slide-in-from-top-8 duration-1000 mt-12 space-y-10">
        
        <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">FASE 3: EL JUICIO</h1>
            <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">AUDITORÍA TÉCNICA DE SOBRECARGA</p>
        </div>

        {/* JUDGMENT CARD (VISUAL) */}
        <div className="relative group">
            <div className="absolute -inset-1 bg-red-600/20 rounded-3xl blur opacity-25" />
            <div className="relative bg-black border border-zinc-900 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
                {loading ? (
                    <div className="py-10 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-600" />
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Generando Veredicto...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in zoom-in-95 duration-700">
                        <div className="space-y-1">
                            <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Veredicto de Sesión</p>
                            <h2 className={cn(
                                "text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none",
                                analysis?.card_data.verdict === 'PROGRESS' ? "text-green-500" :
                                analysis?.card_data.verdict === 'REGRESSION' ? "text-red-600" : "text-zinc-400"
                            )}>
                                {analysis?.card_data.verdict || "FINALIZADA"}
                            </h2>
                            <p className="text-sm font-black uppercase tracking-widest text-zinc-300">{analysis?.card_data.ui_title}</p>
                        </div>

                        {analysis?.card_data.score && (
                            <div className="flex justify-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className={cn(
                                        "h-1.5 w-6 rounded-full transition-all",
                                        i < (analysis?.card_data.score || 0) ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "bg-zinc-900"
                                    )} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* DETAILED REPORT (COLLAPSIBLE) */}
        {!loading && analysis && (
            <Collapsible open={reportOpen} onOpenChange={setReportOpen} className="w-full space-y-4">
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 h-16 font-black uppercase text-xs tracking-widest flex justify-between px-8 hover:bg-zinc-800 hover:text-white rounded-2xl group">
                       <span className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-red-500 group-hover:scale-110 transition-transform" /> 
                          Leer Informe Técnico 📄
                       </span>
                       <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", reportOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-black/50 border border-zinc-900 rounded-3xl p-8 md:p-10 animate-in slide-in-from-top-4 duration-500">
                    <MarkdownRenderer content={analysis.detailed_report} className="text-zinc-300 leading-relaxed text-lg" />
                </CollapsibleContent>
            </Collapsible>
        )}

        <div className="flex flex-col gap-4">
            <Button 
                className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-sm rounded-2xl"
                onClick={() => navigate('/dashboard')}
            >
                CERRAR CUADERNO Y CONTINUAR
            </Button>
            <Button 
                variant="ghost" 
                className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]"
                onClick={() => setReportOpen(!reportOpen)}
            >
                {reportOpen ? "Ocultar Reporte" : "Ver Análisis Detallado"}
            </Button>
        </div>
      </div>

      {/* STORY CARD PREVIEW */}
      {!loading && analysis && (
        <div className="pt-20 border-t border-zinc-900 w-full flex flex-col items-center gap-8">
            <div className="text-center space-y-1">
                <h3 className="text-xl font-black uppercase italic text-zinc-500">Visual Summary</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Generado para Redes Sociales</p>
            </div>

            <div 
                ref={cardRef}
                className="w-full max-w-[320px] aspect-[9/16] bg-black text-white rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden shadow-2xl border border-zinc-900"
            >
                <div className={cn(
                    "absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40",
                    analysis.card_data.verdict === 'PROGRESS' ? "bg-green-600" : "bg-red-700"
                )} />
                
                <div className="z-10 flex justify-between items-start mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">HEAVY<br/>DUTY</h2>
                    <div className="bg-red-600 p-2.5 rounded-full"><Trophy className="h-5 w-5 text-white" /></div>
                </div>

                <div className="flex-1 z-10 flex flex-col justify-center gap-8">
                    <div className="space-y-1">
                        <div className="inline-block px-3 py-0.5 rounded-full bg-red-600/10 border border-red-600/20 text-[8px] font-black uppercase tracking-[0.2em] text-red-500 mb-2">AUDITORÍA SESIÓN</div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-[0.85] italic">{workoutData?.muscleGroup}</h1>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Veredicto del Juez:</p>
                        <p className="text-3xl font-black uppercase text-white italic leading-none">{analysis.card_data.verdict}</p>
                        <p className="text-sm font-bold text-zinc-400 italic">"{analysis.card_data.ui_title}"</p>
                    </div>

                    <div className="h-px bg-zinc-900 w-full" />

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Intensidad HD</p>
                                <p className="text-xl font-black">{analysis.card_data.score}/10</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto z-10 pt-6 flex justify-between items-end border-t border-zinc-900">
                    <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase">Atleta</p>
                        <p className="text-xs font-bold text-white uppercase">{profile?.display_name}</p>
                    </div>
                    <p className="text-[8px] font-mono text-zinc-700">HEAVYDUTY.APP</p>
                </div>
            </div>

            <Button 
                className="w-full max-w-[320px] bg-zinc-900 hover:bg-zinc-800 text-white h-14 font-black uppercase text-xs tracking-widest rounded-2xl border border-zinc-800" 
                onClick={handleShare}
                disabled={sharing}
            >
                {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                Compartir Logro
            </Button>
        </div>
      )}

    </div>
  );
}