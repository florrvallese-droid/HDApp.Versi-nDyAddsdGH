import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CalendarX } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckinReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysSince: number;
}

export function CheckinReminderDialog({ open, onOpenChange, daysSince }: CheckinReminderDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-red-900/50 text-white">
        <DialogHeader>
          <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
            <CalendarX className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-center text-xl font-black uppercase italic tracking-tighter">
            ¡Atención Atleta!
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Han pasado <span className="text-red-500 font-bold">{daysSince} días</span> desde tu último check-in físico.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm text-center space-y-2">
          <p>Para garantizar la sobrecarga progresiva y ajustar la dieta, necesitamos datos actualizados.</p>
          <p className="text-xs text-zinc-500 italic">"Lo que no se mide, no se puede mejorar."</p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0 mt-2">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase tracking-wide"
            onClick={() => navigate('/checkin')}
          >
            <Camera className="mr-2 h-4 w-4" /> Actualizar Ahora
          </Button>
          <Button variant="ghost" className="w-full text-zinc-500 hover:text-white" onClick={() => onOpenChange(false)}>
            Lo haré más tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}