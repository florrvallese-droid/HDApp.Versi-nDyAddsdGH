import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Check, Star } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const UpgradeModal = ({ open, onOpenChange, featureName }: UpgradeModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-yellow-500/20">
        <DialogHeader>
          <div className="mx-auto bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-4 rounded-full mb-4 border border-yellow-500/30">
            <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-center flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Función Premium
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Para guardar datos en <strong>{featureName || "este módulo"}</strong> necesitas acceso PRO.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-left my-2">
           <p className="text-sm font-medium text-muted-foreground mb-2">Desbloquea todo el potencial:</p>
           <Benefit>Guardado ilimitado de registros</Benefit>
           <Benefit>Análisis de IA sobre tus datos</Benefit>
           <Benefit>Sin pérdida de historial</Benefit>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0 mt-2">
          <Button 
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 font-bold shadow-lg shadow-yellow-900/20"
            onClick={() => navigate('/settings?tab=billing')}
          >
            Obtener 7 Días GRATIS
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Solo estoy mirando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Benefit = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="bg-green-500/20 p-1 rounded-full shrink-0">
      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
    </div>
    <span>{children}</span>
  </div>
);