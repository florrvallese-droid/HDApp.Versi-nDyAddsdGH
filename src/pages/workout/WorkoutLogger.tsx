import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { HistoryView } from "@/components/workout/logger/HistoryView";
import { SetupView } from "@/components/workout/logger/SetupView";
import { ActiveSessionView } from "@/components/workout/logger/ActiveSessionView";
import RoutineManager from "@/pages/workout/RoutineManager";
import { LoggingPreference } from "@/types";
import { supabase } from "@/services/supabase";

export default function WorkoutLogger() {
  const { profile } = useProfile();
  
  // View State: 'history' | 'setup' | 'active' | 'routines'
  const [view, setView] = useState<'history' | 'setup' | 'active' | 'routines'>('history');
  const [muscleGroupInput, setMuscleGroupInput] = useState("");
  const [activeMode, setActiveMode] = useState<LoggingPreference>("effective_only");
  const [initialExercises, setInitialExercises] = useState<any[]>([]);

  const startWorkout = async (mode: LoggingPreference, routineId?: string) => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un nombre para la sesión");
      return;
    }

    if (routineId) {
        const { data } = await supabase.from('routines').select('exercises').eq('id', routineId).single();
        if (data && data.exercises) {
            // Transform routine exercises into workout exercises structure
            const exercises = data.exercises.map((ex: any) => ({
                name: ex.name,
                sets: [], // Will be filled during session
                is_superset: false,
            }));
            setInitialExercises(exercises);
        }
    } else {
        setInitialExercises([]);
    }

    setActiveMode(mode);
    setView('active');
  };

  // VIEW 1: HISTORY (LOGBOOK)
  if (view === 'history') {
    return <HistoryView 
        onStartNew={() => setView('setup')} 
        onManageRoutines={() => setView('routines')} 
    />;
  }

  // VIEW 2: SETUP
  if (view === 'setup') {
    return (
      <SetupView 
        muscleGroup={muscleGroupInput}
        setMuscleGroup={setMuscleGroupInput}
        onStart={startWorkout}
        onCancel={() => setView('history')}
      />
    );
  }

  // VIEW 3: ROUTINE MANAGER
  if (view === 'routines') {
    return <RoutineManager onBack={() => setView('history')} />;
  }

  // VIEW 4: ACTIVE LOGGER
  return (
    <ActiveSessionView 
      muscleGroup={muscleGroupInput}
      profile={profile}
      loggingMode={activeMode}
      preloadedExercises={initialExercises}
      onCancel={() => setView('setup')}
    />
  );
}