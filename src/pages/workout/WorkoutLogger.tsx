import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { HistoryView } from "@/components/workout/logger/HistoryView";
import { SetupView } from "@/components/workout/logger/SetupView";
import { ActiveSessionView } from "@/components/workout/logger/ActiveSessionView";
import { LoggingPreference } from "@/types";

export default function WorkoutLogger() {
  const { profile } = useProfile();
  
  // View State: 'history' | 'setup' | 'active'
  const [view, setView] = useState<'history' | 'setup' | 'active'>('history');
  const [muscleGroupInput, setMuscleGroupInput] = useState("");
  const [activeMode, setActiveMode] = useState<LoggingPreference>("effective_only");

  const startWorkout = (mode: LoggingPreference) => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un grupo muscular");
      return;
    }
    setActiveMode(mode);
    setView('active');
  };

  // VIEW 1: HISTORY (LOGBOOK)
  if (view === 'history') {
    return <HistoryView onStartNew={() => setView('setup')} />;
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

  // VIEW 3: ACTIVE LOGGER
  return (
    <ActiveSessionView 
      muscleGroup={muscleGroupInput}
      profile={profile}
      loggingMode={activeMode}
      onCancel={() => setView('setup')}
    />
  );
}