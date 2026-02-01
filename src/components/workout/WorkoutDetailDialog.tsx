import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dumbbell, Clock, TrendingUp, UserCheck, ChevronRight, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkoutDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: any;
}

export function WorkoutDetailDialog({ open, onOpenChange, workout }: WorkoutDetailDialogProps) {
  if (!workout) return null;

  const { data, created_at, muscle_group } = workout;
  const exercises = data.exercises || [];
  const duration = data.duration_minutes || 0;
  const volume = data.total_volume || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-xs w-fit">{format(new Date(created_at), "dd MMM yyyy", { locale: es }).toUpperCase()}</Badge>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">{muscle_group || "Entrenamiento"}</DialogTitle>
          <DialogDescription className="text-zinc-500 flex gap-4 text-xs font-bold uppercase tracking-wider pt-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration} min</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {volume.toLocaleString()} kg vol</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {exercises.map((ex: any, i: number) => (
            <div key={i} className="space-y-3">
              <h4 className="font-bold text-red-500 uppercase text-sm flex items-center gap-2">
                <Dumbbell className="w-3 h-3" /> {ex.name}
                {ex.is_superset && <Badge variant="outline" className="text-[9px] border-red-900/50 text-red-700">SUPER SET</Badge>}
              </h4>
              <div className="space-y-2">
                {ex.sets.map((set: any, j: number) => (
                  <div key={j} className="bg-zinc-900/40 border border-zinc-900 rounded p-3">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-zinc-600">Set {j+1}</span>
                                <span className="text-sm font-black text-white flex items-center gap-1">
                                    {set.weight}kg {set.is_unilateral && <UserCheck className="h-3 w-3 text-blue-500" />}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-zinc-600">Reps</span>
                                <span className="text-sm font-black text-zinc-300">{set.reps}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col">
                             <span className="text-[9px] uppercase font-bold text-zinc-600">Tempo</span>
                             <span className="text-xs font-mono text-zinc-500">{set.tempo || '-'}</span>
                        </div>
                    </div>
                    {set.extensions?.map((ext: any, k: number) => (
                        <div key={k} className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500 border-t border-zinc-800/50 pt-1">
                            <CornerDownRight className="h-3 w-3" />
                            <span className="font-bold uppercase">{ext.type === 'rest_pause' ? `RP ${ext.rest_time}s` : `DROP ${ext.weight}kg`}</span>
                            <ChevronRight className="h-3 w-3 opacity-30"/> <span className="text-zinc-300 font-bold">+{ext.reps} reps</span>
                        </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}