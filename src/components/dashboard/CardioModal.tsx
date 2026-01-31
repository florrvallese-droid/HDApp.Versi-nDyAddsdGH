import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Zap, Loader2, Footprints, Calendar } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface CardioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardioModal({ open, onOpenChange }: CardioModalProps) {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState("");
  const [type, setType] = useState("walking");
  const [calories, setCalories] = useState("");
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!duration || !profile) return;
    setLoading(true);

    try {
      // Create a date object with the selected date and current time (to avoid timezone shifts to previous day)
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const finalDate = new Date(`${date}T${timeString}`).toISOString();

      const { error } = await supabase.from('logs').insert({
        user_id: profile.user_id,
        type: 'cardio',
        created_at: finalDate,
        data: {
          duration_minutes: parseInt(duration),
          type,
          calories: calories ? parseInt(calories) : null,
          steps: (type === 'walking' && steps) ? parseInt(steps) : null,
          notes
        }
      });

      if (error) throw error;

      toast.success("Sesión de cardio registrada");
      onOpenChange(false);
      
      // Reset form
      setDuration("");
      setCalories("");
      setSteps("");
      setNotes("");
      setType("walking");
      setDate(format(new Date(), "yyyy-MM-dd"));
      
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Actividad Cardiovascular</span>
          </div>
          <DialogTitle className="text-xl font-bold">Registrar Cardio</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Post-entreno o actividad diaria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-zinc-400" /> Fecha de Actividad
            </Label>
            <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Actividad</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="walking">🚶 Caminata</SelectItem>
                <SelectItem value="cycling">🚴 Bicicleta</SelectItem>
                <SelectItem value="elliptical">🏃 Elíptico</SelectItem>
                <SelectItem value="stairmaster">🪜 Escalera</SelectItem>
                <SelectItem value="running">🏃 Correr</SelectItem>
                <SelectItem value="other">⚡ Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duración (min)</Label>
              <Input 
                type="number" 
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Calorías (Opcional)</Label>
              <Input 
                type="number" 
                placeholder="kcal"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-11"
              />
            </div>
          </div>

          {type === 'walking' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <Label className="flex items-center gap-2">
                <Footprints className="h-3 w-3 text-zinc-500" /> 
                Cantidad de Pasos (Opcional)
              </Label>
              <Input 
                type="number" 
                placeholder="Ej: 5000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea 
              placeholder="Sensaciones, inclinación, velocidad..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
            onClick={handleSubmit}
            disabled={loading || !duration}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}