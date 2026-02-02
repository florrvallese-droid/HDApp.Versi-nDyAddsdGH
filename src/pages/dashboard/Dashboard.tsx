import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, session } = useProfile();

  // Gestión de redirección inicial
  useEffect(() => {
    if (!loading) {
      if (!session) {
        navigate('/auth');
      } else if (!profile) {
        // Si hay sesión pero no hay perfil, es un usuario nuevo
        navigate('/onboarding');
      }
    }
  }, [loading, profile, session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-6">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
           <Loader2 className="animate-spin text-red-600 h-12 w-12 relative z-10" />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Sincronizando Entorno...
        </p>
      </div>
    );
  }

  // Si no hay perfil tras cargar y habiendo sesión, evitamos renderizar nada hasta que el useEffect anterior redirija
  if (!profile && session) return null;
  if (!session) return null;

  // DIVISIÓN DE INTERFAZ SEGÚN ROL
  if (profile?.is_coach) {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}