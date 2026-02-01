import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { 
  Zap,
  Moon,
  Camera,
  FlaskConical,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { CardioModal } from "@/components/dashboard/CardioModal";
import { RestDayModal } from "@/components/dashboard/RestDayModal";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, hasProAccess } = useProfile();
  
  // Modals State
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showRest, setShowRest] = useState(false);
  
  // Checkin Reminder State
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [daysSinceCheckin, setDaysSinceCheckin] = useState(0);

  useEffect(() => {
    if (profile) {
      checkLastCheckin();
    }
  }, [profile]);

  const checkLastCheckin = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('logs')
        .select('created_at')
        .eq('user_id', profile.user_id)
        .eq('type', 'checkin')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) return;

      if (data && data.length > 0) {
        const lastDate = new Date(data[0].created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 15) {
          setDaysSinceCheckin(diffDays);
          setShowCheckinReminder(true);
        }
      } else {
        // If no checkins ever, check account age
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 3) {
           setDaysSinceCheckin(diffDays);
           setShowCheckinReminder(true);
        }
      }
    } catch (err) {
      console.error("Error in checkLastCheckin:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 w-full">
           <Skeleton className="h-20 w-full rounded-xl" />
           <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Top Bar for Settings/Profile (Fixed Z-Index) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/settings')} 
          className="text-zinc-500 hover:text-white bg-black/20 backdrop-blur-sm rounded-full"
        >
          <Settings className="w-6 h-6" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          className="text-zinc-500 hover:text-red-500 bg-black/20 backdrop-blur-sm rounded-full"
        >
          <LogOut className="w-6 h-6" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
         {profile?.avatar_url && (
            <img src={profile.avatar_url} className="w-8 h-8 rounded-full border border-zinc-800" alt="Avatar" />
         )}
         <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {profile?.display_name || "Atleta"}
         </span>
      </div>

      {/* MAIN CONTAINER FRAME */}
      <div className="w-full max-w-md bg-black border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-8">
        
        {/* HEADER: TU CUADERNO... */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white text-center">
            TU CUADERNO DE ENTRENAMIENTO
          </h2>
          <div className="w-24 h-1 bg-red-600 rounded-full" />
        </div>

        {/* BIG RED BUTTON: INICIAR SESIÓN */}
        <button
          onClick={() => setShowPreWorkout(true)}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-black uppercase text-lg md:text-xl tracking-wide py-5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/20"
        >
          INICIAR SESIÓN DE PESAS
        </button>

        {/* GRID ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* CARDIO */}
          <button
            onClick={() => setShowCardio(true)}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Zap className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">CARDIO</span>
          </button>

          {/* DESCANS0 */}
          <button
            onClick={() => setShowRest(true)}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Moon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">DÍA DE DESCANSO</span>
          </button>

          {/* NUTRICIÓN */}
          <button
            onClick={() => navigate('/nutrition')}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <FlaskConical className="w-4 h-4 text-zinc-500 group-hover:text-green-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">NUTRICIÓN & QUÍMICA</span>
          </button>

          {/* CHECK FÍSICO */}
          <button
            onClick={() => navigate('/checkin')}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Camera className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">CHECK FÍSICO</span>
          </button>

        </div>
      </div>

      {/* MODALS */}
      <PreWorkoutModal 
        open={showPreWorkout} 
        onOpenChange={setShowPreWorkout} 
        coachTone={profile?.coach_tone || 'strict'} 
        hasProAccess={hasProAccess}
      />
      
      <CardioModal 
        open={showCardio} 
        onOpenChange={setShowCardio} 
      />
      
      <RestDayModal 
        open={showRest} 
        onOpenChange={setShowRest} 
      />
      
      <CheckinReminderDialog
        open={showCheckinReminder}
        onOpenChange={setShowCheckinReminder}
        daysSince={daysSinceCheckin}
      />
      
    </div>
  );
}