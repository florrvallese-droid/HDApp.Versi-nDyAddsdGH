import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, activeRole, refreshProfile, session } = useProfile();
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // Self-healing: If loading is done, we have a session, but NO profile -> Create one.
    if (!loading && !profile && session?.user) {
      attemptRecovery(session.user.id, session.user.email);
    } else if (!loading && !profile && !session) {
      // No session at all -> Go to onboarding/auth
      navigate("/onboarding");
    }
  }, [loading, profile, session, navigate]);

  const attemptRecovery = async (userId: string, email?: string) => {
    setRecovering(true);
    try {
        console.log("Attempting profile recovery for:", userId);
        // Intentar crear un perfil default
        const { error } = await supabase.from('profiles').insert({
            user_id: userId,
            display_name: email?.split('@')[0] || "Usuario",
            email: email,
            sex: 'other', // Default safe value
            units: 'kg',
            coach_tone: 'strict',
            discipline: 'general'
        });

        if (error) {
            // Si ya existe (duplicate key), ignoramos el error, significa que hubo un problema de lectura momentáneo
            console.warn("Recovery insert note:", error);
        }

        toast.success("Perfil restaurado");
        await refreshProfile();
        
    } catch (err) {
        console.error("Recovery failed", err);
        // Last resort
        navigate("/onboarding");
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

  // Si no hay perfil (y falló la recuperación), no renderizar nada para evitar flashes
  if (!profile) return null;

  // Ahora respetamos el activeRole en lugar de solo chequear si es coach
  if (profile.is_coach && activeRole === 'coach') {
    return <CoachDashboard />;
  }

  // Por defecto, o si el rol activo es atleta, mostramos la vista de entrenamiento
  return <AthleteDashboardView />;
}