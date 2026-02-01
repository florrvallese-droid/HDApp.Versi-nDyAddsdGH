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
  User,
  Share2,
  Loader2
} from "lucide-react";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { CardioModal } from "@/components/dashboard/CardioModal";
import { RestDayModal } from "@/components/dashboard/RestDayModal";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const checkCheckin = async () => {
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

    if (profile) {
      checkCheckin();
    }
  }, [profile]);

  const handleShareReport = async () => {
    if (!profile) return;
    setIsSharing(true);
    
    try {
      // 1. Obtener último peso
      const { data: checkins } = await supabase
        .from('logs')
        .select('data')
        .eq('user_id', profile.user_id)
        .eq('type', 'checkin')
        .order('created_at', { ascending: false })
        .limit(1);

      // 2. Obtener último entrenamiento
      const { data: workouts } = await supabase
        .from('logs')
        .select('muscle_group, data')
        .eq('user_id', profile.user_id)
        .eq('type', 'workout')
        .order('created_at', { ascending: false })
        .limit(1);

      // 3. Obtener adherencia nutricional hoy
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const { data: nutrition } = await supabase
        .from('logs')
        .select('data')
        .eq('user_id', profile.user_id)
        .eq('type', 'nutrition')
        .gte('created_at', startOfDay.toISOString())
        .maybeSingle();

      const lastWeight = checkins?.[0]?.data?.weight || "N/A";
      const weightDelta = checkins?.[0]?.data?.weight_delta || 0;
      const lastWorkout = workouts?.[0];
      const nutritionAdherence = nutrition?.data?.adherence || "N/A";

      const message = `🏋️ *REPORTE HEAVY DUTY* - ${format(new Date(), 'dd/MM/yyyy')}\n` +
        `👤 *Atleta:* ${profile.display_name || 'Sin nombre'}\n\n` +
        `📉 *ESTADO FÍSICO*\n` +
        `Peso actual: ${lastWeight} ${profile.units} (${weightDelta >= 0 ? '+' : ''}${weightDelta}${profile.units})\n\n` +
        `💪 *ÚLTIMO ENTRENO*\n` +
        `${lastWorkout ? `${lastWorkout.muscle_group}: ${lastWorkout.data.exercises.length} ejercicios registrados` : 'Sin entrenos recientes'}\n\n` +
        `🥗 *NUTRICIÓN*\n` +
        `Adherencia hoy: ${nutritionAdherence}%\n\n` +
        `_Enviado desde Heavy Duty Di Iorio System_`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Mi Reporte Heavy Duty',
          text: message
        });
      } else {
        window.open(whatsappUrl, '_blank');
      }
      
    } catch (err) {
      toast.error("No se pudo generar el reporte");
    } finally {
      setIsSharing(false);
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

      <div className="w-full max-w-md bg-black border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-8">
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white text-center">
            TU CUADERNO DE ENTRENAMIENTO
          </h2>
          <div className="w-24 h-1 bg-red-600 rounded-full" />
        </div>

        <button
          onClick={() => setShowPreWorkout(true)}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-black uppercase text-lg md:text-xl tracking-wide py-5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/20"
        >
          INICIAR SESIÓN DE PESAS
        </button>

        <div className="grid grid-cols-2 gap-3">
          
          <button
            onClick={() => setShowCardio(true)}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Zap className="w-4 h-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">CARDIO</span>
          </button>

          <button
            onClick={() => setShowRest(true)}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Moon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">DÍA DE DESCANSO</span>
          </button>

          <button
            onClick={() => navigate('/nutrition')}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <FlaskConical className="w-4 h-4 text-zinc-500 group-hover:text-green-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">NUTRICIÓN</span>
          </button>

          <button
            onClick={() => navigate('/checkin')}
            className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg py-4 transition-all group"
          >
            <Camera className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
            <span className="font-bold text-xs md:text-sm uppercase tracking-wider">CHECK FÍSICO</span>
          </button>

        </div>

        {/* COMPARTIR BITÁCORA / CHEQUEO */}
        <div className="pt-2 border-t border-zinc-900">
           <Button 
             className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-widest flex items-center justify-center gap-3 group transition-all"
             onClick={handleShareReport}
             disabled={isSharing}
           >
              {isSharing ? <Loader2 className="animate-spin h-5 w-5" /> : <Share2 className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />}
              Enviar Reporte al Coach
           </Button>
           <p className="text-[9px] text-zinc-600 text-center mt-3 font-bold uppercase tracking-tighter">
             Genera un resumen de peso, entreno y dieta para WhatsApp
           </p>
        </div>
      </div>

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