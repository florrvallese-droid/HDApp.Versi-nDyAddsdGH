import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { profile, loading, activeRole, refreshProfile, session } = useProfile();
  const [recovering, setRecovering] = useState(false);

  // AUTO-REPARACIÓN: Si hay sesión pero no perfil tras la carga, intentamos crearlo.
  useEffect(() => {
    if (!loading && !profile && session?.user) {
      attemptRecovery(session.user.id, session.user.email);
    }
  }, [loading, profile, session]);

  const attemptRecovery = async (userId: string, email?: string) => {
    setRecovering(true);
    try {
        console.warn("[Dashboard] Perfil no encontrado. Iniciando auto-reparación para:", userId);
        const { error } = await supabase.from('profiles').upsert({
            user_id: userId,
            display_name: email?.split('@')[0] || "Atleta",
            email: email,
            sex: 'other',
            units: 'kg',
            coach_tone: 'strict',
            discipline: 'general',
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

        if (error) throw error;
        await refreshProfile();
        
    } catch (err) {
        console.error("[Dashboard] Falló la recuperación de emergencia:", err);
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
            {recovering ? "Sincronizando Ficha..." : "Iniciando System Core..."}
        </p>
      </div>
    );
  }

  // FALLBACK CRÍTICO: Si después de todo no hay perfil, mostramos UI de error manual
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="bg-red-600/10 p-6 rounded-full border border-red-600/20">
            <AlertCircle className="h-14 w-14 text-red-600" />
        </div>
        <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">ERROR DE ACCESO</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed max-w-xs mx-auto">
                No logramos conectar con tu perfil. Probá recargando la aplicación o verificá tu conexión.
            </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button onClick={() => window.location.reload()} className="h-14 bg-white text-black font-black uppercase italic tracking-widest shadow-xl">
                <RefreshCcw className="mr-2 h-4 w-4" /> REINTENTAR CARGA
            </Button>
            <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="text-zinc-600 font-bold uppercase text-[10px]">
                CERRAR SESIÓN
            </Button>
        </div>
      </div>
    );
  }

  // RENDER SEGURO SEGÚN ROL
  if (profile.is_coach && activeRole === 'coach') {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}