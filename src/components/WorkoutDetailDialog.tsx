import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";
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
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-xs">
              {format(new Date(created_at), "dd MMM yyyy", { locale: es }).toUpperCase()}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {muscle_group || "Entrenamiento"}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 flex gap-4 text-xs font-bold uppercase tracking-wider pt-1">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration} min</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {volume.toLocaleString()} kg vol</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {exercises.map((ex: any, i: number) => (
            <div key={i} className="space-y-2">
              <h4 className="font-bold text-red-500 uppercase text-sm flex items-center gap-2">
                <Dumbbell className="w-3 h-3" /> {ex.name}
              </h4>
              <div className="bg-zinc-900/50 rounded-lg border border-zinc-900 overflow-hidden">
                <table className="w-full text-xs md:text-sm text-left">
                  <thead className="bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Set</th>
                      <th className="px-3 py-2">Peso</th>
                      <th className="px-3 py-2">Reps</th>
                      <th className="px-3 py-2 text-right">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {ex.sets.map((set: any, j: number) => (
                      <tr key={j} className="text-zinc-300">
                        <td className="px-3 py-2 font-mono text-zinc-500">{j + 1}</td>
                        <td className="px-3 py-2 font-bold text-white">{set.weight}</td>
                        <td className="px-3 py-2">{set.reps}</td>
                        <td className="px-3 py-2 text-right text-zinc-500 text-[10px] font-mono">
                           {set.tempo ? set.tempo : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          
          {exercises.length === 0 && (
             <div className="text-center py-8 text-zinc-500 text-sm">
                Sin datos de ejercicios registrados.
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}