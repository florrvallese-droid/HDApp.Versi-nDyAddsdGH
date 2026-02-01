import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Loader2, Flag, Zap, Gavel, ChevronDown, ChevronLeft, Dumbbell } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService, PostWorkoutAIResponse } from "@/services/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

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
      let firstTime = false;

      if (previousLogs.length > 0) {
        previousWorkout = previousLogs[0].data;
      } else {
        firstTime = true;
        setIsFirstSession(true);
      }

      const totalSets = currentWorkout.exercises?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 0), 0) || 0;

      const result = await aiService.getPostWorkoutAnalysis(
        profile?.coach_tone || 'strict',
        {
          current: currentWorkout,
          previous: previousWorkout,
          isFirstSession: firstTime,
          discipline: profile?.discipline || 'general',
          muscleGroup: currentWorkout.muscleGroup,
          metrics: {
            totalEffectiveSets: totalSets
          }
        }
      );

      setAnalysis(result);

    } catch (error) {
      console.error(error);
      toast.error("Error analizando sesión");
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
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "heavy-duty-workout.png", { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Mi Entrenamiento Heavy Duty',
            text: `Sesión de ${workoutData?.muscleGroup} completada. ${analysis?.coach_quote}`
          });
          toast.success("Compartido exitosamente");
        } else {
          downloadImage(image);
        }
      } else {
        downloadImage(image);
      }
    } catch (error) {
      console.error("Sharing failed", error);
      toast.error("No se pudo compartir la imagen");
    } finally {
      setSharing(false);
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `HD-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
    toast.success("Imagen descargada");
  };

  if ((!workoutData && loading) || profileLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Cargando análisis...</div>;
  if (!workoutData) return <div className="min-h-screen flex items-center justify-center bg-black text-white">No hay datos de sesión</div>;

  const { muscleGroup, exercises } = workoutData;
  const totalSets = exercises?.reduce((acc: number, ex: any) => acc + (ex.sets?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-20 flex flex-col items-center gap-10 overflow-y-auto relative">
      
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="Análisis Post-Entreno"
      />

      <div className="w-full max-w-2xl px-2 animate-in fade-in slide-in-from-top-8 duration-1000 mt-12">
        <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                FASE 3: EL JUICIO
            </h1>
            <div className="flex items-center justify-center gap-2">
                <div className="h-px bg-red-600 flex-1 max-w-[60px]" />
                <p className="text-red-500 font-bold uppercase tracking-widest text-[10px]">
                    ANÁLISIS DE SOBRECARGA PROGRESIVA
                </p>
                <div className="h-px bg-red-600 flex-1 max-w-[60px]" />
            </div>
        </div>

        <div className="relative group">
            <div className="absolute -inset-1 bg-red-600/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative bg-black border border-red-900/50 rounded-2xl p-6 md:p-10 space-y-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                    <h4 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                        <Gavel className="w-6 h-6 text-red-600" /> Informe de Rendimiento
                    </h4>
                    {analysis?.verdict && (
                         <span className={cn(
                            "px-3 py-1 rounded text-xs font-black uppercase tracking-tighter border",
                            analysis.verdict === 'PROGRESS' ? "bg-green-950/30 text-green-500 border-green-500/30" :
                            analysis.verdict === 'REGRESSION' ? "bg-red-950/30 text-red-500 border-red-500/30" :
                            "bg-zinc-900 text-zinc-400 border-zinc-700"
                        )}>
                            {analysis.verdict}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-6 py-4">
                        <div className="h-4 bg-zinc-900 rounded w-full animate-pulse" />
                        <div className="h-4 bg-zinc-900 rounded w-[90%] animate-pulse" />
                        <div className="h-4 bg-zinc-900 rounded w-[95%] animate-pulse" />
                        <div className="h-24 bg-zinc-900 rounded w-full animate-pulse mt-10" />
                    </div>
                ) : (
                    <div className="space-y-8">
                         <div className="prose prose-invert max-w-none">
                            <MarkdownRenderer 
                                content={analysis?.judgment || "No se pudo generar el análisis."} 
                                className="text-zinc-200 leading-relaxed text-lg"
                            />
                         </div>

                         {!isFirstSession && (
                            <div className="pt-8 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <h5 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                        <Trophy className="w-3 h-3"/> Hitos de la sesión
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysis?.highlights.map((h, i) => (
                                            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                                                <span className="text-red-600 font-bold mt-1">•</span> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <h5 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3 h-3"/> Ajustes técnicos
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysis?.corrections.map((c, i) => (
                                            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                                                <span className="text-red-600 font-bold mt-1">›</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                         )}
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
            <Button 
                className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-sm"
                onClick={() => navigate('/dashboard')}
            >
                CERRAR CUADERNO Y CONTINUAR
            </Button>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                Scrollea para ver la Story Card <ChevronDown className="w-3 h-3 animate-bounce" />
            </p>
        </div>
      </div>

      <div className="pt-20 border-t border-zinc-900 w-full flex flex-col items-center gap-8">
        <div className="text-center space-y-1">
            <h3 className="text-xl font-black uppercase italic text-zinc-500">Story Card</h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Generar para Redes Sociales</p>
        </div>

        <div 
            ref={cardRef}
            id="story-card"
            className="w-full max-w-[320px] aspect-[9/16] bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl border border-zinc-800"
        >
            <div className={cn(
            "absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none opacity-30 mix-blend-screen",
            isFirstSession ? "bg-blue-500" :
            analysis?.verdict === 'PROGRESS' ? "bg-green-500" :
            analysis?.verdict === 'REGRESSION' ? "bg-red-500" : "bg-zinc-500"
            )} />
            
            <div className="flex justify-between items-start z-10 mb-6">
            <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">HEAVY<br/>DUTY</h2>
                <p className="text-xs text-zinc-500 font-mono mt-2 tracking-widest uppercase">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-full border border-white/10 shadow-inner">
                {isFirstSession ? <Flag className="h-6 w-6 text-blue-400" /> : <Trophy className={cn("h-6 w-6", analysis?.verdict === 'PROGRESS' ? "text-yellow-400" : "text-zinc-500")} />}
            </div>
            </div>

            <div className="flex-1 z-10 flex flex-col justify-center gap-6 relative">
            
            <div className="space-y-2">
                {loading ? (
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                ) : isFirstSession ? (
                    <div className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 border border-blue-500/30 bg-blue-500/10 text-blue-400">
                        PUNTO DE PARTIDA
                    </div>
                ) : (
                    <div className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 border",
                        analysis?.verdict === 'PROGRESS' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        analysis?.verdict === 'REGRESSION' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                        {analysis?.verdict || "ANALIZADO"}
                    </div>
                )}
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase break-words leading-[0.9]">
                {muscleGroup}
                </h1>
            </div>

            {/* Metric Card - Simplified to show only Sets */}
            <div className="bg-zinc-800/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1 flex items-center justify-center gap-1">
                    <Zap className="w-2 h-2 text-red-500" /> Series de Intensidad Máxima
                </p>
                <p className="text-5xl font-black font-mono text-white">{totalSets}</p>
                <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Al Fallo Muscular</p>
            </div>

            <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                <Dumbbell className="h-3 w-3 text-primary" /> Highlight
                </p>
                <div className="bg-zinc-900/40 backdrop-blur-sm p-4 rounded-xl border-l-2 border-primary">
                    <p className="text-sm text-zinc-300 leading-tight">
                        {analysis?.highlights && analysis.highlights[0] ? analysis.highlights[0] : (isFirstSession ? "Base técnica establecida." : "Entrenamiento registrado.")}
                    </p>
                </div>
            </div>

            <div className="mt-2">
                <p className="text-sm font-medium italic text-zinc-400 text-center px-2 leading-relaxed opacity-80">
                "{analysis?.coach_quote}"
                </p>
            </div>
            </div>

            <div className="mt-auto z-10 pt-6 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-black uppercase">
                {profile?.display_name?.substring(0, 2) || "HD"}
                </div>
                <div className="flex flex-col">
                <span className="text-xs font-bold text-white">{profile?.display_name || "Atleta"}</span>
                <span className="text-[10px] text-zinc-500 uppercase">{profile?.discipline || "Heavy Duty"}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black tracking-widest text-zinc-600">HEAVYDUTY.APP</span>
            </div>
            </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-[320px]">
            <Button 
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-12 font-bold uppercase tracking-wider text-xs border border-zinc-800" 
                onClick={handleShare}
                disabled={sharing || loading}
            >
                {sharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                Compartir Story
            </Button>
            <Button 
                variant="ghost" 
                className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => navigate('/dashboard')}
            >
                Volver al Inicio
            </Button>
        </div>
      </div>

    </div>
  );
}