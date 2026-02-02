import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, loading, session } = useProfile();

  useEffect(() => {
    if (!loading && !profile && session?.user) {
      navigate('/onboarding');
    }
    // Ya no redirigimos al coach fuera de aquí. 
    // Un coach es también un atleta y debe poder usar su bitácora.
  }, [loading, profile, session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-6">
        <div className="relative">
           <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
           <Loader2 className="animate-spin text-red-600 h-12 w-12 relative z-10" />
        </div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Sincronizando Perfil...
        </p>
      </div>
    );
  }

  if (!profile) return null;

  return <AthleteDashboardView />;
}