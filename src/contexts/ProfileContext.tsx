import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { UserProfile } from "@/types";
import { Session } from "@supabase/supabase-js";

interface ProfileContextType {
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  hasProAccess: boolean;
  daysLeftInTrial: number;
  activeRole: 'athlete' | 'coach';
  toggleRole: () => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'athlete' | 'coach'>('athlete');
  const [hasProAccess, setHasProAccess] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

  useEffect(() => {
    // 1. Recuperar rol guardado
    const savedRole = localStorage.getItem('hd_active_role');
    if (savedRole === 'coach' || savedRole === 'athlete') {
      setActiveRole(savedRole);
    }

    let mounted = true;

    // 2. Función de carga de perfil robusta
    const loadUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(); // Usamos maybeSingle para no lanzar error si no existe

        if (mounted) {
          if (data) {
            const userProfile = data as UserProfile;
            setProfile(userProfile);
            calculateAccess(userProfile);
            
            // Forzar modo atleta si no es coach
            if (!userProfile.is_coach) {
              setActiveRole('athlete');
              localStorage.setItem('hd_active_role', 'athlete');
            }
          } else {
            // Usuario autenticado pero sin perfil (raro, pero posible)
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // 3. Inicialización de sesión
    const initialize = async () => {
      try {
        const { data: { session: initSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initSession);
          if (initSession?.user) {
            await loadUserProfile(initSession.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("Session init error:", e);
        if (mounted) setLoading(false);
      }
    };

    initialize();

    // 4. Listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      
      setSession(newSession);
      
      if (newSession?.user) {
        // Solo recargar si el usuario cambió o si no tenemos perfil cargado
        if (!profile || profile.user_id !== newSession.user.id) {
            setLoading(true);
            await loadUserProfile(newSession.user.id);
        }
      } else {
        setProfile(null);
        setHasProAccess(false);
        setLoading(false);
      }
    });

    // 5. Timeout de seguridad (Escape Hatch)
    // Si por alguna razón supabase cuelga, liberamos la UI en 5 segundos
    const safetyTimeout = setTimeout(() => {
      if (loading && mounted) {
        console.warn("Profile loading timed out, forcing UI render");
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const calculateAccess = (p: UserProfile) => {
    if (p.is_premium) {
      setHasProAccess(true);
      setDaysLeftInTrial(0);
      return;
    }

    if (p.trial_started_at) {
      const trialStart = new Date(p.trial_started_at).getTime();
      const now = new Date().getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const timeLeft = (trialStart + sevenDays) - now;
      
      if (timeLeft > 0) {
        setHasProAccess(true);
        setDaysLeftInTrial(Math.ceil(timeLeft / (24 * 60 * 60 * 1000)));
      } else {
        setHasProAccess(false);
        setDaysLeftInTrial(0);
      }
    } else {
      setHasProAccess(false);
    }
  };

  const toggleRole = () => {
    if (profile?.is_coach) {
      const newRole = activeRole === 'athlete' ? 'coach' : 'athlete';
      setActiveRole(newRole);
      localStorage.setItem('hd_active_role', newRole);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).single();
        if (data) {
            setProfile(data as UserProfile);
            calculateAccess(data as UserProfile);
        }
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, session, loading, hasProAccess, daysLeftInTrial, 
      activeRole, toggleRole, refreshProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};