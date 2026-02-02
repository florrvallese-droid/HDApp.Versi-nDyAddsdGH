import { useEffect } from "react";
import { useProfileContext } from "@/contexts/ProfileContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import CoachDashboard from "@/pages/coach/CoachDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, coachProfile, loading, session } = useProfileContext();

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
            Sincronizando Identidad...
        </p>
      </div>
    );
  }

  if (!session) return null;

  // Si es Coach, dashboard de gestión
  if (coachProfile || profile?.user_role === 'coach') {
    return <CoachDashboard />;
  }

  // Por defecto (o Atleta), dashboard de entreno
  return <AthleteDashboardView />;
}