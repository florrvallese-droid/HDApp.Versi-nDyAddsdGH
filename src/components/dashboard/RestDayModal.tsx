import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Moon, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface RestDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestDayModal({ open, onOpenChange }: RestDayModalProps) {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('logs').insert({
        user_id: profile.user_id,
        type: 'rest',
        created_at: new Date().toISOString(),
        data: {
          notes
        }
      });

      if (error) throw error;

      toast.success("Día de descanso registrado. ¡A recuperar!");
      onOpenChange(false);
      setNotes("");
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
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Moon className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Recuperación Activa</span>
          </div>
          <DialogTitle className="text-xl font-bold">Registrar Descanso</DialogTitle>
          <DialogDescription className="text-zinc-500">
            El músculo crece cuando descansas. Tómalo en serio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Notas de Recuperación</Label>
            <Textarea 
              placeholder="¿Qué hiciste hoy? (Masaje, stretching, nada...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Descanso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}