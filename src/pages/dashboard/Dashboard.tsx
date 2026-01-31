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
  Camera
} from "lucide-react";
import { differenceInDays } from "date-fns";
import { CheckinReminderDialog } from "@/components/dashboard/CheckinReminderDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [userName, setUserName] = useState("");
  
  // Check-in Reminder State
  const [showCheckinReminder, setShowCheckinReminder] = useState(false);
  const [isCheckinOverdue, setIsCheckinOverdue] = useState(false);
  const [daysSinceLastCheckin, setDaysSinceLastCheckin] = useState(0);

  useEffect(() => {
    // Temporary fix: Cast profile to any to access first_name if missing in UserProfile type
    const userProfile = profile as any;
    if (userProfile?.first_name) {
      setUserName(userProfile.first_name);
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

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error("Error fetching last checkin", error);
        return;
      }

      const lastDate = data ? new Date(data.created_at) : null;
      
      if (lastDate) {
        const diff = differenceInDays(new Date(), lastDate);
        setDaysSinceLastCheckin(diff);
        
        if (diff >= 15) {
          setIsCheckinOverdue(true);
          // Only show dialog if it hasn't been dismissed in this session (optional logic, simplified here)
          setShowCheckinReminder(true);
        }
      } else {
        // No checkins ever
        setIsCheckinOverdue(true);
        // setShowCheckinReminder(true); // Uncomment to prompt new users immediately
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
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 max-w-md mx-auto relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">
            Hola, <span className="text-red-500">{userName || "Atleta"}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">¿Listo para entrenar hoy?</p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-full border border-zinc-800">
          <User className="w-6 h-6 text-zinc-300" />
        </div>
      </header>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm"
          onClick={() => navigate('/workout/new')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center h-full">
            <div className="p-3 bg-red-500/10 rounded-full group-hover:bg-red-500/20 transition-colors">
              <Dumbbell className="w-8 h-8 text-red-500" />
            </div>
            <span className="font-semibold">Entrenar</span>
          </CardContent>
        </Card>

        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm relative overflow-hidden"
          onClick={() => navigate('/checkin')}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center h-full">
            <div className="p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors relative">
              <Camera className="w-8 h-8 text-blue-500" />
              {isCheckinOverdue && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
              )}
            </div>
            <span className="font-semibold">Check-in</span>
            {isCheckinOverdue && (
              <span className="text-[10px] text-red-400 font-medium absolute bottom-2">
                ¡Pendiente!
              </span>
            )}
          </CardContent>
        </Card>

        <Card 
          className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80 transition-colors cursor-pointer group backdrop-blur-sm col-span-2"
          onClick={() => navigate('/analysis')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors">
                <LineChart className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold">Mi Progreso</span>
                <span className="text-xs text-zinc-400">Ver estadísticas y análisis</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Menu */}
      <div className="space-y-2 relative z-10">
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 pl-1">Menú Rápido</h3>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-14 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl"
          onClick={() => navigate('/logs')}
        >
          <Calendar className="w-5 h-5 text-purple-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">Historial</span>
            <span className="text-[10px] text-zinc-500">Revisar bitácora</span>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-14 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-xl"
          onClick={() => navigate('/profile')}
        >
          <Settings className="w-5 h-5 text-orange-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">Configuración</span>
            <span className="text-[10px] text-zinc-500">Ajustar perfil y preferencias</span>
          </div>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-14 text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 rounded-xl mt-4"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </Button>
      </div>

      {/* Floating Action Button (New Log) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 p-0"
          onClick={() => navigate('/log/new')}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </div>

      {/* Alerts */}
      <CheckinReminderDialog 
        open={showCheckinReminder} 
        onOpenChange={setShowCheckinReminder}
        daysSince={daysSinceLastCheckin}
      />
    </div>
  );
}