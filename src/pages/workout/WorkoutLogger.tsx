import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { SetupView } from "@/components/workout/logger/SetupView";
import { ActiveSessionView } from "@/components/workout/logger/ActiveSessionView";
import RoutineManager from "./RoutineManager";
import { HistoryView } from "@/components/workout/logger/HistoryView";
import { supabase } from "@/services/supabase";
import { WorkoutExercise, LoggingPreference } from "@/types";
import { Loader2 } from "lucide-react";

export default function WorkoutLogger() {
  const { profile, loading: profileLoading } = useProfile();
  const [view, setView] = useState<'history' | 'setup' | 'active' | 'routines'>('history');
  const [muscleGroup, setMuscleGroup] = useState("");
  const [loggingMode, setLoggingMode] = useState<LoggingPreference>('effective_only');
  const [preloadedExercises, setPreloadedExercises] = useState<WorkoutExercise[]>([]);

  const handleStart = async (mode: LoggingPreference, routineId?: string) => {
    if (!muscleGroup && !routineId) return;
    setLoggingMode(mode);

    if (routineId) {
      const { data: routine } = await supabase.from('routines').select('*').eq('id', routineId).single();
      if (routine) {
        const preloaded = routine.exercises.map((ex: any) => ({
          name: ex.name,
          sets: [],
        }));
        setPreloadedExercises(preloaded);
      }
    } else {
      setPreloadedExercises([]);
    }
    
    setView('active');
  };

  if (profileLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600 h-8 w-8" /></div>;
  }

  if (view === 'active') {
    return <ActiveSessionView 
      muscleGroup={muscleGroup} 
      profile={profile} 
      loggingMode={loggingMode}
      preloadedExercises={preloadedExercises}
      onCancel={() => {
        setMuscleGroup("");
        setPreloadedExercises([]);
        setView('history');
      }} 
    />;
  }

  if (view === 'setup') {
    return <SetupView 
      muscleGroup={muscleGroup}
      setMuscleGroup={setMuscleGroup}
      onStart={handleStart}
      onCancel={() => setView('history')}
    />;
  }

  if (view === 'routines') {
    return <RoutineManager onBack={() => setView('history')} />;
  }

  return <HistoryView onStartNew={() => setView('setup')} onManageRoutines={() => setView('routines')} />;
}