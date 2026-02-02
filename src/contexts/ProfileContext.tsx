import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { UserProfile, AthleteProfile, CoachProfile } from "@/types";
import { Session } from "@supabase/supabase-js";
import { differenceInDays, addDays } from "date-fns";

interface ProfileContextType {
  profile: UserProfile | null;
  athleteProfile: AthleteProfile | null;
  coachProfile: CoachProfile | null;
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
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
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

  const loadAllProfiles = async (userId: string) => {
    try {
      // Carga del perfil base (Bloqueante mínimo)
      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (baseProfile) {
        const fullProfile = baseProfile as UserProfile;
        setProfile(fullProfile);
        
        const trialDays = calculateTrial(fullProfile);
        setDaysLeftInTrial(trialDays);
        setHasProAccess(fullProfile.is_premium === true || trialDays > 0);
        setIsAdmin(fullProfile.is_admin === true);

        // Consultas secundarias (No bloqueantes)
        if (fullProfile.user_role === 'athlete' || !fullProfile.is_coach) {
             supabase.from('athlete_profiles').select('*').eq('user_id', userId).maybeSingle()
                .then(({ data }) => setAthleteProfile(data));
        } 
        
        if (fullProfile.user_role === 'coach' || fullProfile.is_coach) {
             supabase.from('coach_profiles').select('*').eq('user_id', userId).maybeSingle()
                .then(({ data }) => setCoachProfile(data));
        }
      }
    } catch (error) {
      console.error("[ProfileContext] Error en carga:", error);
    } finally {
      // El apagado del loading es obligatorio aquí
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
        await loadAllProfiles(initSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      
      if (newSession?.user) {
        await loadAllProfiles(newSession.user.id);
      } else {
        setProfile(null);
        setAthleteProfile(null);
        setCoachProfile(null);
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
        await loadAllProfiles(session.user.id);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, athleteProfile, coachProfile, session, loading, isAdmin, hasProAccess, daysLeftInTrial, refreshProfile 
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