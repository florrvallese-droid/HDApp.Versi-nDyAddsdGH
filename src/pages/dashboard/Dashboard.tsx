import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { 
  Activity, 
  Calendar, 
  ChevronRight, 
  Dumbbell, 
  LineChart, 
  LogOut, 
  Plus, 
  Settings, 
  User, 
  Zap,
  Camera,
  Moon,
  Footprints
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { CardioModal } from "@/components/dashboard/CardioModal";
import { RestDayModal } from "@/components/dashboard/RestDayModal";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, hasProAccess } = useProfile();
  const [userName, setUserName] = useState("");
  
  // Modals State
  const [showPreWorkout, setShowPreWorkout] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showRest, setShowRest] = useState(false);
  
  // Check-in Reminder State
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [isCheckinOverdue, setIsCheckinOverdue] = useState(false);
  const [daysSinceLastCheckin, setDaysSinceLastCheckin] = useState(0);

  useEffect(() => {
    // Cast to access properties that might not be in the strict type definition yet
    const userProfile = profile as any;
    if (userProfile?.first_name || userProfile?.display_name) {
      setUserName(userProfile.first_name || userProfile.display_name);
    }
    
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

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching last checkin", error);
        return;
      }

      const lastDate = data ? new Date(data.created_at) : null;
      
      if (lastDate) {
        const diff = differenceInDays(new Date(), lastDate);
        setDaysSinceLastCheckin(diff);
        
        if (diff >= 15) {
          setIsCheckinOverdue(true);
          // Only show dialog if significant time passed
          setShowCheckinReminder(true);
        }
      } else {
        // No checkins ever
        setIsCheckinOverdue(true);
      }
      
    } catch (err) {
      console.error("Failed to check checkin status", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 max-w-md mx-auto relative overflow-hidden animate-in fade-in duration-500">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">
            Hola, <span className="text-red-500">{userName || "Atleta"}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">¿Qué toca destruir hoy?</p>
        </div>
        <div 
          className="bg-zinc-900 p-2 rounded-full border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
          onClick={() => navigate('/settings')}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-zinc-300" />
          )}
        </div>
      </header>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        
        {/* ENTRENAR - Opens PreWorkout Modal */}
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm col-span-2 border-l-4 border-l-red-600"
          onClick={() => setShowPreWorkout(true)}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-colors">
                <Dumbbell className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-xl uppercase italic tracking-wider">Entrenar</span>
                <span className="text-xs text-zinc-400">Consultar al Coach IA</span>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors" />
          </CardContent>
        </Card>

        {/* CARDIO */}
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm"
          onClick={() => setShowCardio(true)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-full">
            <Zap className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="font-semibold text-sm">Cardio</span>
          </CardContent>
        </Card>

        {/* REST */}
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm"
          onClick={() => setShowRest(true)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-full">
            <Moon className="w-6 h-6 text-blue-500 mb-1" />
            <span className="font-semibold text-sm">Descanso</span>
          </CardContent>
        </Card>

        {/* CHECK-IN */}
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm relative overflow-hidden"
          onClick={() => navigate('/checkin')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-full">
            <div className="relative">
              <Camera className="w-6 h-6 text-purple-500 mb-1" />
              {isCheckinOverdue && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
              )}
            </div>
            <span className="font-semibold text-sm">Check-in</span>
          </CardContent>
        </Card>

        {/* PROGRESS */}
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm"
          onClick={() => navigate('/analysis')}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center h-full">
            <LineChart className="w-6 h-6 text-green-500 mb-1" />
            <span className="font-semibold text-sm">Progreso</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Menu */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 pl-1">Menú Rápido</h3>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-14 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl"
          onClick={() => navigate('/analysis')} // Goes to Global Analysis / Logs tab
        >
          <Calendar className="w-5 h-5 text-zinc-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">Bitácora</span>
            <span className="text-[10px] text-zinc-500">Historial de actividad</span>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-14 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-5 h-5 text-zinc-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">Configuración</span>
            <span className="text-[10px] text-zinc-500">Perfil y suscripción</span>
          </div>
        </Button>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button 
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 p-0"
          onClick={() => setShowPreWorkout(true)}
        >
          <Plus className="w-8 h-8" />
        </Button>
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
        daysSince={daysSinceLastCheckin}
      />
    </div>
  );
}