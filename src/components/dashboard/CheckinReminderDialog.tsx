import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Camera, AlertCircle } from "lucide-react";

interface CheckinReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daysSince: number;
}

export function CheckinReminderDialog({ open, onOpenChange, daysSince }: CheckinReminderDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">¡Check-in Pendiente!</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Han pasado {daysSince} días desde tu último registro físico.
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center text-sm text-zinc-300 py-2 space-y-2">
          <p>Para que el Coach IA pueda ajustar tu plan con precisión, necesitamos datos actualizados de tu peso y condición.</p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0 mt-2">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={() => {
              onOpenChange(false);
              navigate('/checkin');
            }}
          >
            <Camera className="w-4 h-4 mr-2" />
            Actualizar Ahora
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-zinc-500 hover:text-white" 
            onClick={() => onOpenChange(false)}
          >
            Lo haré más tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}