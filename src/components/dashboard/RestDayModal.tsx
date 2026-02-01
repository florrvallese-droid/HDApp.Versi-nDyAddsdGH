import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Moon, Loader2, Calendar, ChevronLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface RestDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestDayModal({ open, onOpenChange }: RestDayModalProps) {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; 
      const finalDate = new Date(`${date}T${timeString}`).toISOString();

      const { error } = await supabase.from('logs').insert({
        user_id: profile.user_id,
        type: 'rest',
        created_at: finalDate,
        data: {
          notes
        }
      });

      if (error) throw error;

      toast.success("Día de descanso registrado. ¡A recuperar!");
      onOpenChange(false);
      setNotes("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-zinc-900 bg-zinc-900/30">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-zinc-500 h-8 w-8">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Moon className="h-4 w-4 text-blue-500" /> Registrar Descanso
          </DialogTitle>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500">
                <Calendar className="h-3 w-3" /> Fecha del Descanso
            </Label>
            <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-zinc-900 border-zinc-800 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-zinc-500">Notas de Recuperación</Label>
            <Textarea 
              placeholder="¿Qué hiciste hoy? (Masaje, stretching, nada...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
            />
          </div>

          <Button 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider mt-4"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirmar Descanso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}