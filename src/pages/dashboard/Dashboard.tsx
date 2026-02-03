import { useEffect } from "react";
import { useProfileContext } from "@/contexts/ProfileContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AthleteDashboardView from "@/components/dashboard/AthleteDashboardView";
import CoachDashboard from "@/pages/coach/CoachDashboard";
import { toast } from "sonner";
import { supabase } from "@/services/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, coachProfile, loading, session } = useProfileContext();

  useEffect(() => {
    if (loading) {
      return; // Do nothing while the context is loading session and profile.
    }

    if (!session) {
      navigate('/auth');
      return;
    }

    // If the session exists but the profile hasn't been created yet (race condition),
    // sign out to prevent an infinite loop and notify the user.
    if (session && !profile) {
      toast.error("Error de perfil. Se cerrará la sesión para reintentar.");
      supabase.auth.signOut().then(() => {
        navigate('/auth');
      });
      return;
    }

  }, [loading, session, profile, navigate]);

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

  // If loading is false, but there's no profile, the useEffect has already handled redirection.
  // This is a safeguard to prevent rendering with a null profile.
  if (!profile) {
    return null;
  }

  const isCoach = profile?.user_role === 'coach' || profile?.is_coach === true || !!coachProfile;

  if (isCoach) {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}