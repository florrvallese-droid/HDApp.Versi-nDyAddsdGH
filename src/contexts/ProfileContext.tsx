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

  const setProfileData = (profileData: UserProfile | null) => {
    setProfile(profileData);
    if (profileData) {
      const trialDays = calculateTrial(profileData);
      setDaysLeftInTrial(trialDays);
      setHasProAccess(profileData.is_premium === true || trialDays > 0);
      setIsAdmin(profileData.is_admin === true);
    } else {
      setDaysLeftInTrial(0);
      setHasProAccess(false);
      setIsAdmin(false);
    }
  };

  const loadProfileWithRetry = async (userId: string, retries = 2, delay = 1500) => {
    for (let i = 0; i <= retries; i++) {
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (userProfile) return userProfile as UserProfile;
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
        console.error("Error fetching profile:", error);
        return null;
      }
      if (i < retries) await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        
        const timeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => resolve(null), 5000) // 5 segundos de timeout
        );

        const profilePromise = loadProfileWithRetry(session.user.id);
        const profileData = await Promise.race([profilePromise, timeoutPromise]);

        setProfileData(profileData);
        setLoading(false);
      } else {
        setProfileData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
      setLoading(true);
      const profileData = await loadProfileWithRetry(session.user.id, 0); // No retry on manual refresh
      setProfileData(profileData);
      setLoading(false);
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