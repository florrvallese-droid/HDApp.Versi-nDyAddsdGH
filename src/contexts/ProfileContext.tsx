import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { UserProfile } from "@/types";
import { Session } from "@supabase/supabase-js";
import { differenceInDays, addDays } from "date-fns";

interface ProfileContextType {
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  hasProAccess: boolean;
  daysLeftInTrial: number;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

  const calculateTrial = (profileData: UserProfile) => {
    if (!profileData?.trial_started_at) return 0;
    const endTrial = addDays(new Date(profileData.trial_started_at), 7);
    const diff = differenceInDays(endTrial, new Date());
    return diff > 0 ? diff : 0;
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (userProfile) {
        const fullProfile = userProfile as UserProfile;
        setProfile(fullProfile);
        
        const trialDays = calculateTrial(fullProfile);
        setDaysLeftInTrial(trialDays);
        setHasProAccess(fullProfile.is_premium === true || trialDays > 0);
        setIsAdmin(fullProfile.is_admin === true);
      }
    } catch (error) {
      console.error("[ProfileContext] Fallo en sincronización de perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data: { session: initSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      setSession(initSession);
      if (initSession?.user) {
        await loadProfile(initSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      
      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setHasProAccess(false);
        setDaysLeftInTrial(0);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
        await loadProfile(session.user.id);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, session, loading, isAdmin, hasProAccess, daysLeftInTrial, refreshProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) throw new Error("useProfileContext must be used within a ProfileProvider");
  return context;
};