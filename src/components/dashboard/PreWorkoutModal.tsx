import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CoachTone, PreWorkoutData } from "@/types";
import { Loader2, Lock, AlertCircle, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/ai";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

interface PreWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachTone: CoachTone;
  hasProAccess?: boolean;
}

export function PreWorkoutModal({ open, onOpenChange, coachTone, hasProAccess = false }: PreWorkoutModalProps) {
  const navigate = useNavigate();
  const { profile } = useProfile(); // Need profile to check sex
  
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Inputs
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [sensation, setSensation] = useState("");
  
  // New Inputs
  const [hasPain, setHasPain] = useState(false);
  const [painDescription, setPainDescription] = useState("");
  const [cycleDay, setCycleDay] = useState(1);

  // Result
  const [result, setResult] = useState<PreWorkoutData | null>(null);

  const analyzeData = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    if (hasPain && !painDescription) {
      toast.error("Si tienes dolor, por favor describe dónde.");
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      const stressVal = stress === 'low' ? 3 : stress === 'medium' ? 6 : 9;
      
      // Prepare data packet
      const assessmentData: any = {
        sleep,
        stress: stressVal,
        sensation: 7, // Legacy numeric, kept for backend compatibility
        pain: hasPain,
        painDescription: hasPain ? painDescription : undefined,
        userFeedback: sensation // The actual text input for sensation
      };

      // Add cycle day if female
      if (profile?.sex === 'female') {
        assessmentData.cycleDay = cycleDay;
      }

      const aiResponse = await aiService.getPreWorkoutAdvice(coachTone, assessmentData);

      setResult({
        inputs: assessmentData,
        decision: aiResponse.decision,
        rationale: aiResponse.rationale,
        recommendations: aiResponse.recommendations
      });
      
      setStep('result');
    } catch (error) {
      console.error(error);
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          
          {/* HEADER */}
          <div className="p-6 pb-4 bg-zinc-900/50 border-b border-zinc-900">
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
              {step === 'input' && "Fase 1: Evaluación"}
              {step === 'processing' && "Procesando..."}
              {step === 'result' && "Veredicto"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium text-xs uppercase tracking-wider">
              {step === 'input' && "Sinceridad absoluta requerida"}
              {step === 'processing' && "Consultando principios Heavy Duty..."}
              {step === 'result' && "Decisión basada en datos"}
            </DialogDescription>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            
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
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Estrés Externo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                      <Button
                        key={lvl}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-10 border-zinc-800 bg-zinc-900 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-800 hover:text-white transition-all",
                          stress === lvl && "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                        )}
                        onClick={() => setStress(lvl)}
                      >
                        {lvl === 'low' ? 'Bajo' : lvl === 'medium' ? 'Medio' : 'Alto'}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pain / Injury */}
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      ¿Dolor o Lesión?
                    </Label>
                    <Switch 
                      checked={hasPain} 
                      onCheckedChange={setHasPain}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                  
                  {hasPain && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <Textarea 
                        placeholder="Describe zona e intensidad..." 
                        value={painDescription}
                        onChange={(e) => setPainDescription(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 text-white min-h-[60px] text-xs focus:border-red-600 resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Menstrual Cycle (Conditional) */}
                {profile?.sex === 'female' && (
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-pink-500 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                        <HeartPulse className="w-4 h-4" />
                        Día del Ciclo: {cycleDay}
                      </Label>
                    </div>
                    <Slider 
                      value={[cycleDay]} 
                      min={1} 
                      max={28} 
                      step={1} 
                      onValueChange={(v) => setCycleDay(v[0])}
                      className="[&>.relative>.bg-primary]:bg-pink-600 [&>.relative>.border-primary]:border-pink-600 [&_span]:bg-zinc-800"
                    />
                    <p className="text-[10px] text-zinc-500 text-right">Día 1 = Inicio menstruación</p>
                  </div>
                )}

                {/* Sensation Text */}
                <div className="space-y-3">
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Sensaciones (Feedback)</Label>
                  <Textarea 
                    placeholder="Motivación, pesadez, energía..." 
                    value={sensation}
                    onChange={(e) => setSensation(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white min-h-[80px] focus:border-red-600"
                  />
                </div>

              </div>
            )}

            {/* STEP 2: PROCESSING */}
            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 gap-6 h-64">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-red-600 relative z-10" />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-white font-black text-lg uppercase tracking-widest animate-pulse">Analizando Variables</p>
                   <p className="text-zinc-500 text-xs font-mono">Aplicando lógica Heavy Duty...</p>
                </div>
              </div>
            )}

            {/* STEP 3: RESULT */}
            {step === 'result' && result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                
                <div className={cn(
                  "p-8 rounded-lg border-2 text-center space-y-2 shadow-2xl relative overflow-hidden",
                  result.decision === 'TRAIN_HEAVY' ? "bg-green-950/20 border-green-600/50 text-green-400 shadow-green-900/20" :
                  result.decision === 'TRAIN_LIGHT' ? "bg-yellow-950/20 border-yellow-600/50 text-yellow-400 shadow-yellow-900/20" :
                  "bg-red-950/20 border-red-600/50 text-red-500 shadow-red-900/20"
                )}>
                  {/* Background noise texture */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                  
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase relative z-10 leading-none">
                    {result.decision === 'TRAIN_HEAVY' ? "ENTRENAR" :
                     result.decision === 'TRAIN_LIGHT' ? "REGULAR" :
                     "DESCANSAR"}
                  </h3>
                  {result.decision === 'TRAIN_HEAVY' && <p className="text-xs font-bold tracking-widest uppercase opacity-80">Sin piedad</p>}
                  {result.decision === 'TRAIN_LIGHT' && <p className="text-xs font-bold tracking-widest uppercase opacity-80">Técnica y bombeo</p>}
                  {result.decision === 'REST' && <p className="text-xs font-bold tracking-widest uppercase opacity-80">Crecimiento ocurre hoy</p>}
                </div>

                <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800 relative">
                  <div className="absolute -top-3 left-4 bg-zinc-950 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Análisis
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic">
                    "{result.rationale}"
                  </p>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Instrucciones:</p>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex gap-2 items-start text-zinc-300">
                           <span className="text-red-500 font-bold">›</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* FOOTER ACTIONS (Fixed at bottom) */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-900 mt-auto">
            {step === 'input' && (
              <div className="space-y-3">
                <Button 
                  onClick={analyzeData} 
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] relative overflow-hidden text-lg"
                >
                   {!hasProAccess && <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10 text-sm"><Lock className="w-4 h-4 mr-2"/> REQUIERE PRO</div>}
                  EVALUAR (IA)
                </Button>
                
                <div className="flex justify-center pt-1">
                    <button 
                        className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors"
                        onClick={skipToWorkout}
                    >
                        Saltar e ir a la bitácora
                    </button>
                </div>
              </div>
            )}

            {step === 'result' && result && (
              <div className="flex gap-3">
                 <Button variant="outline" className="flex-1 border-zinc-800 h-12 font-bold uppercase text-xs" onClick={() => setStep('input')}>
                    Re-evaluar
                 </Button>
                 <Button 
                  className="flex-[2] h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-wide"
                  onClick={skipToWorkout}
                >
                  {result.decision === 'REST' ? 'Registrar Descanso' : 'IR A ENTRENAR'}
                </Button>
              </div>
            )}
          </div>

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