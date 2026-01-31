import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ChevronRight, Zap, Moon, Utensils, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Skeleton } from "@/components/ui/skeleton";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { CardioModal } from "@/components/dashboard/CardioModal";
import { RestDayModal } from "@/components/dashboard/RestDayModal";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { differenceInDays } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  const { flags, loading: flagsLoading } = useFeatureFlags();
  
  // Modals
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showRest, setShowRest] = useState(false);

  // Check-in Reminder Logic
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [isCheckinOverdue, setIsCheckinOverdue] = useState(false);
  const [daysSinceLastCheckin, setDaysSinceLastCheckin] = useState(0);

  useEffect(() => {
    if (profile?.user_id) {
      checkLastCheckin();
    }
  }, [profile]);

  const checkLastCheckin = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('created_at')
        .eq('user_id', profile?.user_id)
        .eq('type', 'checkin')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') return;

      const lastDate = data ? new Date(data.created_at) : null;
      
      if (lastDate) {
        const diff = differenceInDays(new Date(), lastDate);
        setDaysSinceLastCheckin(diff);
        if (diff >= 15) {
          setIsCheckinOverdue(true);
          setShowCheckinReminder(true);
        }
      } else {
        // First time user or no checkins
        setIsCheckinOverdue(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loading = profileLoading || flagsLoading;

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6 min-h-screen bg-black">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen space-y-8 bg-black">
      
      {/* USER HEADER CARD */}
      <Card className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-700 transition-colors" onClick={() => navigate('/settings')}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-zinc-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white uppercase tracking-tight text-sm sm:text-base">
                  {profile?.display_name || "ATLETA SIN NOMBRE"}
                </h2>
                {profile?.is_premium && (
                  <Badge variant="default" className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-1.5 py-0 h-5 border-0">PRO</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                {profile?.sex === 'male' ? 'HOMBRE' : 'MUJER'} | {profile?.units.toUpperCase()}
              </p>
            </div>
          </div>
          <ChevronRight className="text-zinc-600 h-5 w-5" />
        </CardContent>
      </Card>

      {/* LOGO AREA */}
      <div className="flex justify-center py-4 animate-in fade-in duration-700">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-white">
            Di Iorio <span className="text-red-600">GYM</span>
          </h1>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent mt-2 rounded-full" />
        </div>
      </div>

      {/* WORKOUT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-zinc-800" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tu Cuaderno de Entrenamiento</h3>
          <div className="h-[1px] flex-1 bg-zinc-800" />
        </div>

        {/* BIG RED BUTTON */}
        <Button 
          className="w-full h-20 text-xl font-black italic uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-red-500/20"
          onClick={() => setShowPreWorkout(true)} 
        >
          INICIAR SESIÓN DE PESAS
        </Button>

        {/* SECONDARY GRID */}
        <div className="grid grid-cols-2 gap-3">
          
          <Button 
            variant="outline" 
            className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white uppercase font-bold text-xs tracking-wide flex items-center gap-2 justify-center"
            onClick={() => setShowCardio(true)}
          >
            <Zap className="h-4 w-4" /> Cardio
          </Button>

          <Button 
            variant="outline" 
            className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white uppercase font-bold text-xs tracking-wide flex items-center gap-2 justify-center"
            onClick={() => setShowRest(true)}
          >
            <Moon className="h-4 w-4" /> Día de Descanso
          </Button>

          <Button 
            variant="outline" 
            className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white uppercase font-bold text-xs tracking-wide flex items-center gap-2 justify-center"
            onClick={() => navigate('/nutrition')}
          >
            <Utensils className="h-4 w-4" /> Nutrición & Química
          </Button>

          <Button 
            variant="outline" 
            className="h-14 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white uppercase font-bold text-xs tracking-wide flex items-center gap-2 justify-center relative overflow-hidden"
            onClick={() => navigate('/checkin')}
          >
            <Camera className="h-4 w-4" /> Check Físico
            {isCheckinOverdue && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        
        </div>
        
        {/* ANALYSIS LINK */}
        {flags['global_analysis'] !== false && (
            <div className="pt-2">
                <Button 
                    variant="ghost" 
                    className="w-full text-zinc-600 hover:text-red-500 text-xs uppercase tracking-widest"
                    onClick={() => navigate('/analysis')}
                >
                    Ver Análisis de Progreso →
                </Button>
            </div>
        )}

      </div>

      {/* MODALS */}
      <PreWorkoutModal 
        open={showPreWorkout} 
        onOpenChange={setShowPreWorkout} 
        coachTone={profile?.coach_tone || 'strict'}
        hasProAccess={hasProAccess}
      />

      <CardioModal open={showCardio} onOpenChange={setShowCardio} />
      <RestDayModal open={showRest} onOpenChange={setShowRest} />
      
      <CheckinReminderDialog 
        open={showCheckinReminder} 
        onOpenChange={setShowCheckinReminder}
        daysSince={daysSinceLastCheckin}
      />
    </div>
  );
};

export default Dashboard;