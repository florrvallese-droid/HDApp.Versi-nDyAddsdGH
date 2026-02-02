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

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("[ProfileContext] Loading profile for UID:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        const userProfile = data as UserProfile;
        console.log("[ProfileContext] Profile loaded successfully:", { 
          role: userProfile.is_coach ? "COACH" : "ATHLETE",
          admin: userProfile.is_admin,
          displayName: userProfile.display_name
        });
        setProfile(userProfile);
        calculateAccess(userProfile);
      } else {
        console.warn("[ProfileContext] No profile found in database for this user.");
        setProfile(null);
      }
    } catch (error) {
      console.error("[ProfileContext] Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      console.log("[ProfileContext] Initializing session check...");
      const { data: { session: initSession } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      setSession(initSession);
      
      if (initSession?.user) {
        console.log("[ProfileContext] Active session found:", initSession.user.email);
        await loadUserProfile(initSession.user.id);
      } else {
        console.log("[ProfileContext] No active session.");
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      console.log("[ProfileContext] Auth State Change:", event);
      
      setSession(newSession);
      
      if (newSession?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
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

  const refreshProfile = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
        await loadUserProfile(currentSession.user.id);
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