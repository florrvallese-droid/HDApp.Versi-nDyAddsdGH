import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, activeRole, refreshProfile, session } = useProfile();
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // Si terminó de cargar y no hay perfil pero hay sesión, intentamos auto-reparar
    if (!loading && !profile && session?.user) {
      attemptRecovery(session.user.id, session.user.email);
    }
  }, [loading, profile, session]);

  const attemptRecovery = async (userId: string, email?: string) => {
    setRecovering(true);
    try {
        console.warn("[Dashboard] Perfil no encontrado. Intentando recuperación...");
        
        // Verificamos si realmente no existe
        const { data: existing } = await supabase.from('profiles').select('user_id').eq('user_id', userId).maybeSingle();
        
        if (!existing) {
            // Si no existe, lo mandamos a onboarding mejor que crearlo a ciegas
            navigate('/onboarding');
            return;
        }

        // Si existe pero el contexto no lo tiene, refrescamos
        await refreshProfile();
        
    } catch (err) {
        console.error("[Dashboard] Error de recuperación:", err);
    } finally {
        setRecovering(false);
    }
  };

  if (loading || recovering) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-6">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
           <Loader2 className="animate-spin text-red-600 h-12 w-12 relative z-10" />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Sincronizando System Core...
        </p>
      </div>
    );
  }

  // Si después de todo no hay perfil (ni en DB ni en el refresco), forzamos onboarding
  if (!profile && !loading && session?.user) {
    navigate('/onboarding');
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="bg-red-600/10 p-6 rounded-full border border-red-600/20">
            <AlertCircle className="h-14 w-14 text-red-600" />
        </div>
        <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">ERROR DE ACCESO</h1>
        <Button onClick={() => window.location.reload()} className="h-14 bg-white text-black font-black uppercase">
            REINTENTAR CARGA
        </Button>
      </div>
    );
  }

  if (profile.is_coach && activeRole === 'coach') {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}