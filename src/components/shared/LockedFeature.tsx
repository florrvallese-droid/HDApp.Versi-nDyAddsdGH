import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Lock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedFeatureProps {
  title?: string;
  description?: string;
}

export const LockedFeature = ({ title, description }: LockedFeatureProps) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
      
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 rounded-full animate-pulse" />
        <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 p-8 rounded-full relative z-10 border border-yellow-500/30">
          <Lock className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h2 className="text-3xl font-black uppercase tracking-tight">
          {title || "Función Premium"}
        </h2>
        <p className="text-muted-foreground text-lg">
          {description || "Esta herramienta es exclusiva para miembros PRO."}
        </p>
      </div>

      <Card className="w-full max-w-sm border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent overflow-hidden shadow-2xl">
        <CardHeader className="bg-yellow-500/10 pb-6 border-b border-yellow-500/20">
          <CardTitle className="flex justify-center items-center gap-2 text-yellow-700 dark:text-yellow-400 text-xl">
            <Star className="fill-current w-6 h-6" /> HEAVY DUTY PRO
          </CardTitle>
          <CardDescription className="text-center font-medium text-yellow-600/80 dark:text-yellow-500/80">
            Desbloquea tu máximo potencial
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-left space-y-4">
          <Benefit>Coach IA Personalizado (4 tonos)</Benefit>
          <Benefit>Análisis Post-Workout Avanzado</Benefit>
          <Benefit>Auditoría Global de Patrones</Benefit>
          <Benefit>Módulo de Nutrición Completo</Benefit>
          <Benefit>Bóveda de Farmacología</Benefit>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 bg-yellow-500/5 pt-6 border-t border-yellow-500/20">
           <Button 
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold h-12 text-lg shadow-lg shadow-yellow-900/20 transition-all hover:scale-[1.02]" 
            onClick={() => navigate('/settings?tab=billing')}
          >
            Suscribirse Ahora
          </Button>
          <p className="text-xs text-muted-foreground">Sin compromiso. Cancela cuando quieras.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

const Benefit = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="bg-green-500/20 p-1 rounded-full shrink-0">
      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
    </div>
    <span className="text-sm font-medium">{children}</span>
  </div>
);