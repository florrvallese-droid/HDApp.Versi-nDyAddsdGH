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
  const { profile, loading, session } = useProfileContext();

  useEffect(() => {
    if (loading) {
      return; // Esperar a que el contexto termine de cargar.
    }

    if (!session) {
      navigate('/auth');
      return;
    }

    // Si, tras cargar, hay sesión pero no perfil, es un error.
    // Cerramos sesión para evitar bucles y forzar un reingreso limpio.
    if (session && !profile) {
      console.error(
        "[DIAGNÓSTICO DE PERFIL] El perfil no se cargó a pesar de existir una sesión.",
        {
          "session_user_id": session.user.id,
          "profile_object": profile,
          "is_loading": loading,
          "session_object": session,
        }
      );
      toast.error("Error de sincronización de perfil. Por favor, ingresa de nuevo.");
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

  if (!profile) {
    // Este estado no debería ser visible para el usuario, ya que el useEffect redirige.
    // Es una salvaguarda para evitar renderizar con datos nulos.
    return null;
  }

  // La fuente de verdad ahora es el campo 'user_role' del perfil consolidado.
  const isCoach = profile.user_role === 'coach';

  if (isCoach) {
    return <CoachDashboard />;
  }

  return <AthleteDashboardView />;
}