import { useEffect } from "react";
import { useProfileContext } from "@/contexts/ProfileContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import CoachDashboard from "@/pages/coach/CoachDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, coachProfile, loading, session } = useProfileContext();

  useEffect(() => {
    if (loading) return; // Esperar a que termine la carga inicial

    if (!session) {
      navigate('/auth');
      return;
    }

    // GUARDA DE SEGURIDAD: Si el usuario está logueado pero su perfil no se completó (falta el rol),
    // lo forzamos a volver al onboarding. Esto evita el congelamiento.
    if (session && !profile?.user_role) {
      navigate('/onboarding');
      return;
    }

  }, [loading, session, profile, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-6">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
           <Loader2 className="animate-spin text-red-600 h-12 w-12 relative z-10" />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Sincronizando Identidad...
        </p>
      </div>
    );
  }

  if (!session) return null;

  // Lógica de detección de Coach redundante
  const isCoach = profile?.user_role === 'coach' || profile?.is_coach === true || !!coachProfile;

  if (isCoach) {
    return <CoachDashboard />;
  }

  // Por defecto, vista de atleta
  return <AthleteDashboardView />;
}