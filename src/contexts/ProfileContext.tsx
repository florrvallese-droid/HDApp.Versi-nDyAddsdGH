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
        
        // Profile found, we can stop loading.
        setLoading(false);
        return fullProfile;
      }
    } catch (error) {
      // Don't log "not found" as an error, it's expected on signup
      if ((error as any).code !== 'PGRST116') {
        console.error("[ProfileContext] Fallo en carga de perfil:", error);
      }
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;
    let profileCreationListener: any = null;
    let timeoutId: any = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // Clean up previous listener if session changes
      if (profileCreationListener) {
        supabase.removeChannel(profileCreationListener);
        profileCreationListener = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      setSession(newSession);
      
      if (newSession?.user) {
        setLoading(true);
        
        // Attempt to load profile immediately (for existing users or refreshes)
        const existingProfile = await loadProfile(newSession.user.id);

        // If profile is not found, it's likely a new signup.
        // Set up a real-time listener and a timeout.
        if (!existingProfile) {
          profileCreationListener = supabase
            .channel(`public:profiles:user_id=eq.${newSession.user.id}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'profiles', filter: `user_id=eq.${newSession.user.id}` },
              (payload) => {
                if (mounted) {
                  loadProfile(newSession.user.id);
                  // Cleanup after success
                  if (profileCreationListener) supabase.removeChannel(profileCreationListener);
                  if (timeoutId) clearTimeout(timeoutId);
                }
              }
            )
            .subscribe();

          // Safety timeout: if profile isn't created in 8s, stop loading to show error.
          timeoutId = setTimeout(() => {
            if (mounted && !profile) {
              console.error("Profile creation timed out.");
              setLoading(false);
            }
          }, 8000);
        }
      } else {
        // No session, clear everything
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
      if (profileCreationListener) {
        supabase.removeChannel(profileCreationListener);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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