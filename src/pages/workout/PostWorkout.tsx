import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Home, Dumbbell, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { aiService, PostWorkoutAIResponse } from "@/services/ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PostWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<PostWorkoutAIResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.workoutData) {
      const data = location.state.workoutData;
      setWorkoutData(data);
      if (profile) {
        runAnalysis(data);
      }
    } else {
      navigate('/dashboard');
    }
  }, [location, navigate, profile]);

  const runAnalysis = async (currentWorkout: any) => {
    try {
      // 1. Fetch previous workout for comparison
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs } = await supabase
        .from('logs')
        .select('data, created_at')
        .eq('user_id', user.id)
        .eq('type', 'workout')
        .eq('muscle_group', currentWorkout.muscleGroup)
        .neq('created_at', new Date().toISOString()) // Exclude mostly to be safe, though time differs
        .order('created_at', { ascending: false })
        .limit(2); // Get last 2, index 0 is current (if saved), index 1 is previous

      // Since we just saved the current workout in Logger, logs[0] is likely the current one.
      // We need the one BEFORE that.
      
      let previousWorkout = null;
      // If the log we just saved is already in DB, we skip it.
      // A safer bet is to rely on client-side state for current and DB for previous.
      
      if (logs && logs.length > 0) {
        // Find a log that is NOT the one we just did (simplest check is timestamp or ID, but we don't have ID here easily)
        // Let's assume the DB query excluded the *exact* simultaneous insert, but likely it includes it.
        // We'll just take the 2nd item if it exists, or the 1st if it's clearly older.
        
        const possiblePrev = logs.find(l => {
            const logDate = new Date(l.created_at).getTime();
            const sessionDate = new Date().getTime(); // Roughly now
            return (sessionDate - logDate) > 60000; // Older than 1 minute
        });
        
        if (possiblePrev) {
            previousWorkout = possiblePrev.data;
        }
      }

      // 2. Call AI
      const result = await aiService.getPostWorkoutAnalysis(
        profile?.coach_tone || 'strict',
        {
          current: currentWorkout,
          previous: previousWorkout,
          discipline: profile?.discipline || 'general',
          muscleGroup: currentWorkout.muscleGroup
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

  if (!workoutData) return null;

  const { muscleGroup, duration, volume, exercises } = workoutData;
  const bestExercise = exercises[0];

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-6">
      
      {/* STORY CARD */}
      <div 
        id="story-card"
        className="w-full max-w-[350px] aspect-[9/16] bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl border border-zinc-800"
      >
        {/* Background Texture/Accent */}
        <div className={cn(
          "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-40",
          analysis?.verdict === 'PROGRESS' ? "bg-green-500" :
          analysis?.verdict === 'REGRESSION' ? "bg-red-500" : "bg-blue-500"
        )} />
        
        {/* Header */}
        <div className="flex justify-between items-start z-10 mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">HEAVY<br/>DUTY</h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <Trophy className={cn(
                "h-6 w-6",
                analysis?.verdict === 'PROGRESS' ? "text-yellow-400" : "text-zinc-400"
            )} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 z-10 flex flex-col justify-center gap-4">
          
          <div className="space-y-1">
            {loading ? (
               <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : (
                <div className={cn(
                    "inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-1",
                    analysis?.verdict === 'PROGRESS' ? "bg-green-500/20 text-green-400" :
                    analysis?.verdict === 'REGRESSION' ? "bg-red-500/20 text-red-400" :
                    "bg-blue-500/20 text-blue-400"
                )}>
                    {analysis?.verdict || "ANALYZED"}
                </div>
            )}
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              {muscleGroup}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-xs text-zinc-500 uppercase">Volume</p>
              <p className="text-xl font-bold font-mono">{volume.toLocaleString()} {profile?.units || 'kg'}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-xs text-zinc-500 uppercase">Duration</p>
              <p className="text-xl font-bold font-mono">{duration} min</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" /> Highlight
            </p>
            {loading ? (
                <div className="space-y-2">
                    <div className="h-16 bg-zinc-800 rounded-xl animate-pulse" />
                </div>
            ) : (
                <div className="bg-zinc-800/50 p-4 rounded-xl border-l-4 border-primary">
                {analysis?.highlights && analysis.highlights.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-zinc-300">
                        {analysis.highlights.slice(0, 2).map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <p className="font-bold text-lg">{bestExercise?.name}</p>
                        <p className="text-sm text-zinc-400">
                            {bestExercise?.sets?.length} sets completed
                        </p>
                    </>
                )}
                </div>
            )}
          </div>

          {/* Coach Quote */}
          <div className="mt-2 relative min-h-[60px]">
             <span className="absolute -top-4 -left-2 text-6xl text-white/10 serif">"</span>
             {loading ? (
                 <div className="flex gap-2 justify-center items-center h-full">
                     <Loader2 className="animate-spin h-4 w-4 text-zinc-500"/>
                     <span className="text-xs text-zinc-500">Generando feedback...</span>
                 </div>
             ) : (
                <p className="text-sm italic text-zinc-400 text-center px-4 leading-relaxed">
                   {analysis?.coach_quote}
                </p>
             )}
          </div>

        </div>

        {/* Footer */}
        <div className="mt-auto z-10 pt-6 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-black">
              {profile?.display_name?.substring(0, 2) || "ME"}
            </div>
            <span className="text-xs font-bold">{profile?.display_name || "Atleta"}</span>
          </div>
          <span className="text-[10px] text-zinc-500">HEAVYDUTY.APP</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-[350px] grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
          <Home className="mr-2 h-4 w-4" /> Inicio
        </Button>
        <Button className="w-full" onClick={() => toast.info("Función 'Compartir' disponible pronto")}>
          <Share2 className="mr-2 h-4 w-4" /> Compartir
        </Button>
      </div>

    </div>
  );
}