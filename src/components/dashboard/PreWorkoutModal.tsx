import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { CoachTone, PreWorkoutData } from "@/types";
import { Loader2, Lock, ChevronLeft, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/ai";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { useNavigate } from "react-router-dom";

interface PreWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachTone: CoachTone;
  hasProAccess?: boolean;
}

export function PreWorkoutModal({ open, onOpenChange, coachTone, hasProAccess = false }: PreWorkoutModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Inputs
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [sensation, setSensation] = useState("");

  // Result
  const [result, setResult] = useState<PreWorkoutData | null>(null);

  const analyzeData = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      const stressVal = stress === 'low' ? 3 : stress === 'medium' ? 6 : 9;
      
      const aiResponse = await aiService.getPreWorkoutAdvice(coachTone, {
        sleep,
        stress: stressVal,
        sensation: 7, // Defaulting as we use text input now
        pain: false,
        painDescription: sensation // Using the text input for context
      });

      setResult({
        inputs: { sleep, stress: stressVal, sensation: 7, pain: false, painDescription: sensation },
        decision: aiResponse.decision,
        rationale: aiResponse.rationale,
        recommendations: aiResponse.recommendations
      });
      
      setStep('result');
    } catch (error) {
      toast.error("Error al consultar al coach. Intenta nuevamente.");
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const skipToWorkout = () => {
    onOpenChange(false);
    navigate('/workout');
  };

  const resetForm = () => {
    setStep('input');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-6 gap-6">
          
          {/* HEADER */}
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
              {step === 'input' && "Fase 1: Evaluación Sistémica"}
              {step === 'processing' && "Procesando..."}
              {step === 'result' && "Veredicto del Coach"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium">
              {step === 'input' && "¿Estás para entrenar o para perder el tiempo?"}
              {step === 'processing' && "Analizando variables de recuperación..."}
              {step === 'result' && "Plan de acción sugerido."}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: INPUT FORM */}
          {step === 'input' && (
            <div className="grid gap-6">
              
              {/* Sleep */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Calidad de Sueño (1-10)</Label>
                  <span className="font-black text-2xl">{sleep}</span>
                </div>
                <Slider 
                  value={[sleep]} 
                  min={1} 
                  max={10} 
                  step={1} 
                  onValueChange={(v) => setSleep(v[0])}
                  className="[&>.relative>.bg-primary]:bg-red-600 [&>.relative>.border-primary]:border-red-600 [&_span]:bg-zinc-800"
                />
              </div>

              {/* Stress */}
              <div className="space-y-3">
                <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Nivel de Estrés Externo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-10 border-zinc-800 bg-zinc-900 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-800 hover:text-white",
                        stress === lvl && "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:text-white"
                      )}
                      onClick={() => setStress(lvl)}
                    >
                      {lvl === 'low' ? 'Bajo' : lvl === 'medium' ? 'Medio' : 'Alto'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sensation Text */}
              <div className="space-y-3">
                <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">¿Cómo te sentís hoy?</Label>
                <Textarea 
                  placeholder="Motivación, dolores, energía..." 
                  value={sensation}
                  onChange={(e) => setSensation(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white min-h-[80px] focus:border-red-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={analyzeData} 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] relative overflow-hidden"
                >
                   {!hasProAccess && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-4 h-4 mr-2"/> PRO</div>}
                  Evaluar Capacidad (IA)
                </Button>
                
                <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" className="h-10 border-zinc-800 bg-transparent text-white hover:bg-zinc-900 w-24 font-bold" onClick={() => onOpenChange(false)}>
                        VOLVER
                    </Button>
                    <button 
                        className="text-xs text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-800 pb-0.5 hover:text-zinc-300 transition-colors"
                        onClick={skipToWorkout}
                    >
                        Omitir IA e Ir a Pesas
                    </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <Loader2 className="h-16 w-16 animate-spin text-red-600" />
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse">Procesando...</p>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && result && (
            <div className="space-y-6">
              
              <div className={cn(
                "p-6 rounded-lg border-2 text-center space-y-2",
                result.decision === 'TRAIN_HEAVY' ? "bg-green-950/30 border-green-600/50 text-green-400" :
                result.decision === 'TRAIN_LIGHT' ? "bg-yellow-950/30 border-yellow-600/50 text-yellow-400" :
                "bg-red-950/30 border-red-600/50 text-red-500"
              )}>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase">
                  {result.decision === 'TRAIN_HEAVY' ? "ENTRENAR PESADO" :
                   result.decision === 'TRAIN_LIGHT' ? "ENTRENO TÉCNICO" :
                   "DESCANSAR"}
                </h3>
              </div>

              <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{result.rationale}"
                </p>
              </div>

              <Button 
                className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-wide"
                onClick={skipToWorkout}
              >
                {result.decision === 'REST' ? 'Registrar Descanso' : 'Iniciar Sesión'}
              </Button>
            </div>
          )}

        </DialogContent>
      </Dialog>
      
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="Coach IA Pre-Entreno"
      />
    </>
  );
}