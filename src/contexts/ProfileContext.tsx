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

  // 1. Cargar rol guardado
  useEffect(() => {
    const savedRole = localStorage.getItem('hd_active_role');
    if (savedRole === 'coach' || savedRole === 'athlete') {
      setActiveRole(savedRole as 'athlete' | 'coach');
    }
  }, []);

  // 2. Lógica de carga de perfil
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        const userProfile = data as UserProfile;
        setProfile(userProfile);
        calculateAccess(userProfile);
        
        // Si no es coach, forzamos rol atleta
        if (!userProfile.is_coach && activeRole === 'coach') {
          setActiveRole('athlete');
          localStorage.setItem('hd_active_role', 'athlete');
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Inicialización de sesión
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data: { session: initSession } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(initSession);
        if (initSession?.user) {
          await loadUserProfile(initSession.user.id);
        } else {
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      setSession(newSession);
      
      if (newSession?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || !profile) {
           setLoading(true);
           await loadUserProfile(newSession.user.id);
        }
      } else {
        setProfile(null);
        setHasProAccess(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const calculateAccess = (p: UserProfile) => {
    if (p.is_premium || p.is_admin) {
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
        await loadUserProfile(session.user.id);
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