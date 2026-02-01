import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { 
  Zap, Moon, Camera, FlaskConical, Settings, LogOut, Share2, Loader2, Bell
} from "lucide-react";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { CardioModal } from "@/components/dashboard/CardioModal";
import { RestDayModal } from "@/components/dashboard/RestDayModal";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";
import { CoachInvitationAlert } from "@/components/dashboard/CoachInvitationAlert";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

export default function AthleteDashboardView() {
  const navigate = useNavigate();
  const { profile, hasProAccess } = useProfile();
  
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [daysSinceCheckin, setDaysSinceCheckin] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      checkCheckin();
      fetchNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.user_id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const checkCheckin = async () => {
    const { data } = await supabase
      .from('logs')
      .select('created_at')
      .eq('user_id', profile!.user_id)
      .eq('type', 'checkin')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const lastCheckin = new Date(data.created_at);
      const diff = differenceInDays(new Date(), lastCheckin);
      setDaysSinceCheckin(diff);
      
      // Si pasaron más de 15 días, mostramos el recordatorio
      if (diff > 15) {
        setShowCheckinReminder(true);
      }
    } else {
      // Si nunca hizo uno, lo recordamos a los 7 días de registrarse
      setDaysSinceCheckin(7);
      setShowCheckinReminder(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-8 h-8 rounded-full border border-zinc-800" />}
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{profile?.display_name}</span>
        </div>
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-zinc-500 bg-black/20 backdrop-blur-sm rounded-full"><Settings className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="w-full max-w-md bg-black border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* COACH UPDATES */}
        {notifications.map(n => (
           <div key={n.id} className="bg-red-600/10 border border-red-600/30 p-4 rounded-xl animate-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-1">
                 <p className="text-xs font-black uppercase text-red-500 flex items-center gap-2">
                    <Bell className="w-3 h-3" /> Actualización de Coach
                 </p>
                 <button onClick={() => markAsRead(n.id)} className="text-[10px] text-zinc-500 uppercase font-bold hover:text-white">Cerrar</button>
              </div>
              <p className="text-sm font-bold text-white leading-tight">{n.message}</p>
              <p className="text-[9px] text-zinc-500 mt-2 font-mono">{format(new Date(n.created_at), "d MMM, HH:mm", { locale: es })}</p>
           </div>
        ))}

        {!profile?.is_coach && profile?.user_id && <CoachInvitationAlert userId={profile.user_id} />}

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg font-black uppercase tracking-wider text-white text-center">TU CUADERNO DE ENTRENAMIENTO</h2>
          <div className="w-24 h-1 bg-red-600 rounded-full" />
        </div>

        <button
          onClick={() => setShowPreWorkout(true)}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-black uppercase text-lg tracking-wide py-5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/20"
        >
          INICIAR SESIÓN DE PESAS
        </button>

        <div className="grid grid-cols-2 gap-3">
          <DashboardBtn icon={<Zap className="text-yellow-500"/>} label="CARDIO" onClick={() => setShowCardio(true)} />
          <DashboardBtn icon={<Moon className="text-blue-500"/>} label="DESCANSO" onClick={() => setShowRest(true)} />
          <DashboardBtn icon={<FlaskConical className="text-green-500"/>} label="NUTRICIÓN" onClick={() => navigate('/nutrition')} />
          <DashboardBtn icon={<Camera className="text-purple-500"/>} label="CHECK FÍSICO" onClick={() => navigate('/checkin')} />
        </div>

        <div className="pt-2 border-t border-zinc-900">
           <Button className="w-full h-14 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-widest flex items-center justify-center gap-3" onClick={() => {}} disabled={isSharing}>
              {isSharing ? <Loader2 className="animate-spin h-5 w-5" /> : <Share2 className="h-5 w-5 text-green-500" />}
              Enviar Chequeo Semanal
           </Button>
        </div>
      </div>

      <PreWorkoutModal open={showPreWorkout} onOpenChange={setShowPreWorkout} coachTone={profile?.coach_tone || 'strict'} hasProAccess={hasProAccess} />
      <CardioModal open={showCardio} onOpenChange={setShowCardio} />
      <RestDayModal open={showRest} onOpenChange={setShowRest} />
      <CheckinReminderDialog open={showCheckinReminder} onOpenChange={setShowCheckinReminder} daysSince={daysSinceCheckin} />
    </div>
  );
}

const DashboardBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg py-4 transition-all">
    <div className="w-4 h-4">{icon}</div>
    <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);