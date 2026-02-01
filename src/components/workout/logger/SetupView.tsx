import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Target, BookOpen, ListPlus, Check, ShieldCheck } from "lucide-react";
import { LoggingPreference, Routine } from "@/types";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";

interface SetupViewProps {
  muscleGroup: string;
  setMuscleGroup: (val: string) => void;
  onStart: (mode: LoggingPreference, routineId?: string) => void;
  onCancel: () => void;
}

export function SetupView({ muscleGroup, setMuscleGroup, onStart, onCancel }: SetupViewProps) {
  const { profile } = useProfile();
  const [mode, setMode] = useState<LoggingPreference>("effective_only");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.logging_preference) {
      setMode(profile.logging_preference);
    }
    fetchRoutines();
  }, [profile]);

  const fetchRoutines = async () => {
    const { data } = await supabase.from('routines').select('*').order('name');
    if (data) setRoutines(data);
  };

  const handleRoutineSelect = (routine: Routine) => {
    if (selectedRoutine === routine.id) {
        setSelectedRoutine(null);
        setMuscleGroup("");
    } else {
        setSelectedRoutine(routine.id);
        setMuscleGroup(routine.name);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-black text-white space-y-6 pb-20">
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-500">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Fase 2: Registro
          </h1>
        </div>
      </div>
      
      <div className="h-[1px] bg-zinc-900 w-full" />

      {routines.length > 0 && (
        <div className="space-y-3">
          <Label className="text-zinc-500 font-bold text-xs uppercase flex items-center gap-2">
            <ListPlus className="h-3 w-3" /> Cargar rutina guardada
          </Label>
          <div className="grid gap-2">
            {routines.map(r => {
               // Si la rutina fue creada por alguien que no es el usuario actual, es del coach
               const isCoachRoutine = r.user_id !== profile?.user_id;
               
               return (
                  <button
                    key={r.id}
                    onClick={() => handleRoutineSelect(r)}
                    className={cn(
                        "p-4 rounded-lg border text-left flex justify-between items-center transition-all",
                        selectedRoutine === r.id 
                            ? "bg-zinc-800 border-white text-white" 
                            : isCoachRoutine 
                                ? "bg-red-950/10 border-red-900/30 text-zinc-300"
                                : "bg-zinc-950 border-zinc-800 text-zinc-500"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold uppercase text-sm">{r.name}</span>
                        {isCoachRoutine && (
                            <span className="text-[8px] font-black text-red-500 flex items-center gap-1 uppercase tracking-widest">
                                <ShieldCheck className="h-2 w-2" /> Protocolo Oficial Di Iorio
                            </span>
                        )}
                    </div>
                    {selectedRoutine === r.id && <Check className="h-4 w-4 text-white" />}
                  </button>
               );
            })}
          </div>
          <div className="flex items-center gap-2 py-2">
             <div className="h-px bg-zinc-900 flex-1" />
             <span className="text-[10px] text-zinc-700 font-bold uppercase">O empieza de cero</span>
             <div className="h-px bg-zinc-900 flex-1" />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-red-500 font-bold text-xs uppercase">Nombre de la Sesión / Músculo</Label>
          <Input 
            placeholder="EJ: PECTORAL..." 
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 font-bold uppercase h-12"
            value={muscleGroup}
            onChange={(e) => {
                setMuscleGroup(e.target.value);
                setSelectedRoutine(null);
            }}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-zinc-500 font-bold text-xs uppercase">Método de Registro para hoy</Label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setMode('effective_only')}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-1",
                mode === 'effective_only' ? "bg-red-950/20 border-red-900/50 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-600"
              )}
            >
              <Target className={cn("h-4 w-4", mode === 'effective_only' ? "text-red-500" : "text-zinc-700")} />
              <span className="text-[9px] font-black uppercase tracking-tighter">Sólo Efectivas</span>
            </button>
            <button 
              onClick={() => setMode('full_routine')}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-1",
                mode === 'full_routine' ? "bg-zinc-800 border-zinc-700 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-600"
              )}
            >
              <BookOpen className={cn("h-4 w-4", mode === 'full_routine' ? "text-white" : "text-zinc-700")} />
              <span className="text-[9px] font-black uppercase tracking-tighter">Toda la Rutina</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-lg shadow-red-900/20"
          onClick={() => onStart(mode, selectedRoutine || undefined)}
        >
          Iniciar Registro
        </Button>
      </div>
    </div>
  );
}