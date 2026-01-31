import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Home, Dumbbell, Trophy, ArrowRight, Download } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Separator } from "@/components/ui/separator";

export default function PostWorkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [workoutData, setWorkoutData] = useState<any>(null);

  useEffect(() => {
    // Ideally we pass data via state or fetch the last ID
    if (location.state?.workoutData) {
      setWorkoutData(location.state.workoutData);
    } else {
      // If no state, redirect to dashboard or fetch last workout
      navigate('/dashboard');
    }
  }, [location, navigate]);

  if (!workoutData) return null;

  const { muscleGroup, duration, volume, exercises } = workoutData;
  const bestExercise = exercises[0]; // Simplification for MVP

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-6">
      
      {/* STORY CARD (This simulates the shareable image) */}
      <div 
        id="story-card"
        className="w-full max-w-[350px] aspect-[9/16] bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl border border-zinc-800"
      >
        {/* Background Texture/Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Header */}
        <div className="flex justify-between items-start z-10 mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">HEAVY<br/>DUTY</h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 z-10 flex flex-col justify-center gap-6">
          
          <div className="space-y-1">
            <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">SESSION COMPLETE</p>
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
            <div className="bg-zinc-800/50 p-4 rounded-xl border-l-4 border-primary">
              <p className="font-bold text-lg">{bestExercise?.name}</p>
              <p className="text-sm text-zinc-400">
                {bestExercise?.sets?.length} sets • Top: {Math.max(...bestExercise?.sets?.map((s: any) => Number(s.weight)) || [0])} {profile?.units}
              </p>
            </div>
          </div>

          {/* Coach Quote Placeholder */}
          <div className="mt-4 relative">
             <span className="absolute -top-4 -left-2 text-6xl text-white/10 serif">"</span>
             <p className="text-sm italic text-zinc-400 text-center px-4">
               {profile?.coach_tone === 'strict' ? "El dolor es debilidad abandonando el cuerpo. Buen trabajo." :
                "¡Gran esfuerzo! Esa última repetición valió oro."}
             </p>
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
        <Button className="w-full" onClick={() => alert("Share feature coming soon!")}>
          <Share2 className="mr-2 h-4 w-4" /> Compartir
        </Button>
      </div>

    </div>
  );
}