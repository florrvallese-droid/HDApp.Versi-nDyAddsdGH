import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { UserProfile } from "@/types";
import { Session } from "@supabase/supabase-js";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Role switching logic
  const [activeRole, setActiveRole] = useState<'athlete' | 'coach'>('athlete');
  
  // Derived state
  const [hasProAccess, setHasProAccess] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);

  useEffect(() => {
    const savedRole = localStorage.getItem('hd_active_role');
    if (savedRole === 'coach' || savedRole === 'athlete') {
      setActiveRole(savedRole);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setHasProAccess(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        const userProfile = data as UserProfile;
        setProfile(userProfile);
        calculateAccess(userProfile);
        
        if (!userProfile.is_coach) {
          setActiveRole('athlete');
          localStorage.setItem('hd_active_role', 'athlete');
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = () => {
    if (profile?.is_coach) {
      const newRole = activeRole === 'athlete' ? 'coach' : 'athlete';
      setActiveRole(newRole);
      localStorage.setItem('hd_active_role', newRole);
    }
  };

  const calculateAccess = (p: UserProfile) => {
    // ESTRATEGIA: Si es Coach y está pagando su suscripción (is_premium), tiene PRO en todo.
    // O si es un Atleta individual pagando PRO.
    if (p.is_premium) {
      setHasProAccess(true);
      setDaysLeftInTrial(0);
      return;
    }

    // Trial de 7 días automático para nuevos
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

  return { profile, session, loading, hasProAccess, daysLeftInTrial, activeRole, toggleRole };
}