import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, activeRole } = useProfile();

  useEffect(() => {
    if (!loading && !profile) {
      // Si terminó de cargar y no hay perfil, redirigir a onboarding
      navigate("/onboarding");
    }
  }, [loading, profile, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-red-600 h-10 w-10" />
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando Heavy Duty...</p>
      </div>
    );
  }

  // Si no hay perfil (y el useEffect aún no redirigió), no renderizar nada para evitar flashes
  if (!profile) return null;

  // Ahora respetamos el activeRole en lugar de solo chequear si es coach
  if (profile.is_coach && activeRole === 'coach') {
    return <CoachDashboard />;
  }

  // Por defecto, o si el rol activo es atleta, mostramos la vista de entrenamiento
  return <AthleteDashboardView />;
}