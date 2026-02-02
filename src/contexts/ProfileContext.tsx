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
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

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
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("[ProfileContext] Critical Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Carga inicial de sesión
    const initialize = async () => {
      const { data: { session: initSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      setSession(initSession);
      if (initSession?.user) {
        await loadUserProfile(initSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    // 2. Escuchar cambios de estado (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
      setSession(newSession);
      
      if (newSession?.user) {
        // Solo recargamos si es un evento de entrada o no tenemos perfil
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

  const refreshProfile = async () => {
    if (session?.user) {
        await loadUserProfile(session.user.id);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, session, loading, hasProAccess, daysLeftInTrial, 
      refreshProfile 
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