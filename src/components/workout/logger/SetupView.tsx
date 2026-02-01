import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Target, BookOpen } from "lucide-react";
import { LoggingPreference } from "@/types";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

interface SetupViewProps {
  muscleGroup: string;
  setMuscleGroup: (val: string) => void;
  onStart: (mode: LoggingPreference) => void;
  onCancel: () => void;
}

export function SetupView({ muscleGroup, setMuscleGroup, onStart, onCancel }: SetupViewProps) {
  const { profile } = useProfile();
  const [mode, setMode] = useState<LoggingPreference>("effective_only");

  useEffect(() => {
    if (profile?.logging_preference) {
      setMode(profile.logging_preference);
    }
  }, [profile]);

  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-black text-white space-y-6">
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-500">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Fase 2: Registro
          </h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono">SNC STATUS</div>
      </div>
      
      <div className="h-[1px] bg-zinc-900 w-full" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-red-500 font-bold text-xs uppercase">Grupo Muscular</Label>
          <Input 
            placeholder="EJ: PECTORAL..." 
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 font-bold uppercase h-12"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
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
          <p className="text-[10px] text-zinc-600 text-center italic">
            {mode === 'effective_only' 
              ? "HIT Purista: Se analiza cada serie como un intento al fallo." 
              : "Trackeo de volumen: Puedes cargar series ligeras y pesadas."}
          </p>
        </div>
      </div>

      <div className="pt-8 space-y-3">
        <Button 
          className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-lg shadow-red-900/20"
          onClick={() => onStart(mode)}
        >
          Iniciar Registro
        </Button>
      </div>
    </div>
  );
}