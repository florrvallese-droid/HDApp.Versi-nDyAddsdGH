import { useEffect } from "react";
import { useProfileContext } from "@/contexts/ProfileContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import CoachDashboard from "@/pages/coach/CoachDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, athleteProfile, coachProfile, loading, session } = useProfileContext();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate('/auth');
      } else if (!profile && !athleteProfile && !coachProfile) {
        // Si hay sesión pero no hay ningún perfil, forzar Onboarding
        navigate('/onboarding');
      }
    }
  }, [loading, profile, athleteProfile, coachProfile, session, navigate]);

  if (loading) {
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

  // Si no se ha cargado nada tras el loading, evitamos flash de contenido
  if (!session) return null;

  // Renderizar Dashboard según perfil detectado
  if (coachProfile) {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}