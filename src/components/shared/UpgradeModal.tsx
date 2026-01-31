import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Star } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const UpgradeModal = ({ open, onOpenChange, featureName }: UpgradeModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-yellow-500/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-4 rounded-full mb-4 border border-yellow-500/30">
            <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-center flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Heavy Duty PRO
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base text-zinc-300">
            La versión gratuita es solo un cuaderno. <br/>
            <strong className="text-white">La versión PRO es tu coach integrado con IA.</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-left my-2 border border-white/5">
           <Benefit>🧠 Pre-Entreno: Análisis de SNC</Benefit>
           <Benefit>📊 Post-Entreno: Auditoría de Progreso</Benefit>
           <Benefit>🥗 Módulo de Nutrición y Química</Benefit>
           <Benefit>📸 Check Físico, fotos y comparativa</Benefit>
           <Benefit>📈 Gráficos de Evolución</Benefit>
           <Benefit>🤖 Auditoría Global de Estrategia</Benefit>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0 mt-2">
          <Button 
            className="w-full h-12 text-base bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 font-bold shadow-lg shadow-yellow-900/20"
            onClick={() => navigate('/settings?tab=billing')}
          >
            Obtener 7 Días GRATIS
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-500 hover:text-white">
            Solo estoy mirando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Benefit = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm">
    <span className="shrink-0 mt-0.5">{children}</span>
  </div>
);