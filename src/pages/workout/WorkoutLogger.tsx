import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { HistoryView } from "@/components/workout/logger/HistoryView";
import { SetupView } from "@/components/workout/logger/SetupView";
import { ActiveSessionView } from "@/components/workout/logger/ActiveSessionView";

export default function WorkoutLogger() {
  const { profile } = useProfile();
  
  // View State: 'history' | 'setup' | 'active'
  const [view, setView] = useState<'history' | 'setup' | 'active'>('history');
  const [muscleGroupInput, setMuscleGroupInput] = useState("");

  const startWorkout = () => {
    if (!muscleGroupInput) {
      toast.error("Ingresa un grupo muscular");
      return;
    }
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
      onCancel={() => setView('setup')}
    />
  );
}