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

  useEffect(() => {
    if (!loading && !profile && session?.user) {
      navigate('/onboarding');
    }
  }, [loading, profile, session, navigate]);

  // Si después de cargar no hay sesión, mandamos a Auth (seguridad extra)
  useEffect(() => {
    if (!loading && !session) {
      navigate('/auth');
    }
  }, [loading, session, navigate]);

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

  // Fallback para errores de red o inconsistencias en la base de datos
  if (!profile && session?.user) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
            <h2 className="font-black uppercase italic text-white text-xl">Error de Perfil</h2>
            <p className="text-zinc-500 text-sm">No pudimos vincular tu cuenta con un perfil de atleta.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/onboarding')}>
                Completar Onboarding
            </Button>
        </div>
    );
  }

  if (!profile) return null;

  // DIVISIÓN DEFINITIVA DE INTERFAZ
  if (profile.is_coach) {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}