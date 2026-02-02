import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, activeRole, refreshProfile, session } = useProfile();
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // Si terminó de cargar y no hay perfil pero hay sesión, intentamos restaurar
    if (!loading && !profile && session?.user) {
      attemptRecovery(session.user.id, session.user.email);
    }
  }, [loading, profile, session]);

  const attemptRecovery = async (userId: string, email?: string) => {
    setRecovering(true);
    try {
        console.log("Iniciando recuperación de perfil para:", userId);
        const { error } = await supabase.from('profiles').upsert({
            user_id: userId,
            display_name: email?.split('@')[0] || "Usuario",
            email: email,
            sex: 'other',
            units: 'kg',
            coach_tone: 'strict',
            discipline: 'general',
            updated_at: new Date().toISOString()
        });

        if (error) throw error;
        await refreshProfile();
        
    } catch (err) {
        console.error("Fallo la recuperación:", err);
    } finally {
        setRecovering(false);
    }
  };

  if (loading || recovering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            {recovering ? "Restaurando acceso..." : "Cargando Heavy Duty..."}
        </p>
      </div>
    );
  }

  // SI NO HAY PERFIL: Evitamos pantalla en negro mostrando una alerta y botón de reintento
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-red-600/10 p-4 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <div className="space-y-2">
            <h1 className="text-xl font-black uppercase italic text-white">Error de Sincronización</h1>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">No logramos conectar con tu perfil de atleta. Esto puede deberse a una conexión inestable.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => window.location.reload()} className="bg-white text-black font-bold uppercase">
                <RefreshCcw className="mr-2 h-4 w-4" /> Reintentar Carga
            </Button>
            <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="text-zinc-600">
                Cerrar Sesión
            </Button>
        </div>
      </div>
    );
  }

  if (profile.is_coach && activeRole === 'coach') {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}