import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { CoachTone, PreWorkoutData } from "@/types";
import { Loader2, Lock, AlertCircle, HeartPulse, Calendar, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/ai";
import { toast } from "sonner";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { differenceInDays, format, isValid, parseISO } from "date-fns";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface PreWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachTone: CoachTone;
  hasProAccess?: boolean;
}

export function PreWorkoutModal({ open, onOpenChange, coachTone, hasProAccess = false }: PreWorkoutModalProps) {
  const navigate = useNavigate();
  const { profile } = useProfile(); 
  
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState<'low' | 'medium' | 'high'>('medium');
  const [sensation, setSensation] = useState("");
  const [hasPain, setHasPain] = useState(false);
  const [painDescription, setPainDescription] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [calculatedPhase, setCalculatedPhase] = useState<{day: number, phase: string, desc: string} | null>(null);
  const [result, setResult] = useState<PreWorkoutData | null>(null);

  useEffect(() => {
    if (open && profile?.sex === 'female' && profile.settings?.last_cycle_start) {
      setLastPeriodDate(profile.settings.last_cycle_start);
    }
  }, [open, profile]);

  useEffect(() => {
    if (lastPeriodDate && isValid(parseISO(lastPeriodDate))) {
      const today = new Date();
      const start = parseISO(lastPeriodDate);
      const diff = differenceInDays(today, start) + 1;

      let phase = "";
      let desc = "";

      if (diff >= 1 && diff <= 5) {
        phase = "Menstrual";
        desc = "Energía baja, inflamación. Priorizar recuperación.";
      } else if (diff >= 6 && diff <= 11) {
        phase = "Folicular";
        desc = "Aumento de estrógeno. Alta fuerza y tolerancia al dolor.";
      } else if (diff >= 12 && diff <= 16) {
        phase = "Ovulación";
        desc = "Pico máximo de fuerza (testosterona alta). Cuidado articular.";
      } else if (diff >= 17) {
        phase = "Lútea";
        desc = "Progesterona alta. Sube temperatura corporal, baja rendimiento.";
      } else {
        phase = "Nuevo Ciclo";
        desc = "Actualiza si ha comenzado un nuevo ciclo.";
      }

      setCalculatedPhase({ day: diff, phase, desc });
    } else {
      setCalculatedPhase(null);
    }
  }, [lastPeriodDate]);

  const saveCycleDate = async () => {
    if (profile && lastPeriodDate && lastPeriodDate !== profile.settings?.last_cycle_start) {
      const newSettings = { ...profile.settings, last_cycle_start: lastPeriodDate };
      await supabase.from('profiles').update({ settings: newSettings }).eq('user_id', profile.user_id);
    }
  };

  const analyzeData = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (hasPain && !painDescription) {
      toast.error("Por favor describe dónde sientes el dolor.");
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      if (profile?.sex === 'female') await saveCycleDate();

      const stressVal = stress === 'low' ? 3 : stress === 'medium' ? 6 : 9;
      const assessmentData: any = { sleep, stress: stressVal, sensation: 7, pain: hasPain, painDescription: hasPain ? painDescription : undefined, userFeedback: sensation };

      if (profile?.sex === 'female' && calculatedPhase) {
        assessmentData.cycleDay = calculatedPhase.day;
        assessmentData.cyclePhase = calculatedPhase.phase;
      }

      const aiResponse = await aiService.getPreWorkoutAdvice(coachTone, assessmentData);
      setResult({ inputs: assessmentData, decision: aiResponse.decision, rationale: aiResponse.rationale, recommendations: aiResponse.recommendations });
      setStep('result');
    } catch (error) {
      console.error(error);
      toast.error("Error al consultar al coach.");
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
          
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-zinc-500 h-8 w-8">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-white">
                {step === 'input' && "Fase 1: Evaluación"}
                {step === 'processing' && "Procesando..."}
                {step === 'result' && "Veredicto"}
              </DialogTitle>
              <DialogDescription className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-none mt-0.5">
                Heavy Duty AI Coach
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {step === 'input' && (
              <div className="grid gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Sueño (1-10)</Label>
                    <span className="font-black text-2xl">{sleep}</span>
                  </div>
                  <Slider value={[sleep]} min={1} max={10} step={1} onValueChange={(v) => setSleep(v[0])} />
                </div>

                <div className="space-y-3">
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Estrés Externo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((lvl) => (
                      <Button
                        key={lvl}
                        variant="outline"
                        className={cn("h-10 border-zinc-800 bg-zinc-900 text-zinc-400 font-bold uppercase text-xs", stress === lvl && "bg-red-600 border-red-600 text-white")}
                        onClick={() => setStress(lvl)}
                      >
                        {lvl === 'low' ? 'Bajo' : lvl === 'medium' ? 'Medio' : 'Alto'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" /> ¿Dolor o Lesión?
                    </Label>
                    <Switch checked={hasPain} onCheckedChange={setHasPain} className="data-[state=checked]:bg-red-600" />
                  </div>
                  {hasPain && (
                    <Textarea placeholder="Zona e intensidad..." value={painDescription} onChange={(e) => setPainDescription(e.target.value)} className="bg-zinc-950 border-zinc-800 text-xs" />
                  )}
                </div>

                {profile?.sex === 'female' && (
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 space-y-4">
                    <Label className="text-pink-500 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <HeartPulse className="w-4 h-4" /> Ciclo Hormonal
                    </Label>
                    <div className="space-y-2">
                      <Label className="text-[10px] text-zinc-500 uppercase">Inicio última menstruación:</Label>
                      <div className="relative">
                        <Input type="date" value={lastPeriodDate} onChange={(e) => setLastPeriodDate(e.target.value)} className="bg-zinc-950 border-zinc-800 h-10 pl-10" />
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      </div>
                    </div>
                    {calculatedPhase && (
                      <div className="mt-3 p-3 bg-pink-950/20 border border-pink-900/30 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-pink-400 font-black text-sm uppercase">Día {calculatedPhase.day}</span>
                          <span className="text-[10px] bg-pink-900/50 text-pink-200 px-2 py-0.5 rounded-full uppercase font-bold">{calculatedPhase.phase}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{calculatedPhase.desc}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Sensaciones (Feedback)</Label>
                  <Textarea placeholder="Motivación, pesadez, energía..." value={sensation} onChange={(e) => setSensation(e.target.value)} className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 gap-6 h-64">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <Loader2 className="h-16 w-16 animate-spin text-red-600 relative z-10" />
                </div>
                <p className="text-white font-black text-lg uppercase tracking-widest animate-pulse">Analizando Variables</p>
              </div>
            )}

            {step === 'result' && result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className={cn("p-8 rounded-lg border-2 text-center space-y-2 shadow-2xl relative overflow-hidden", result.decision === 'TRAIN_HEAVY' ? "bg-green-950/20 border-green-600/50 text-green-400" : result.decision === 'TRAIN_LIGHT' ? "bg-yellow-950/20 border-yellow-600/50 text-yellow-400" : "bg-red-950/20 border-red-600/50 text-red-500")}>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter relative z-10 leading-none">
                    {result.decision === 'TRAIN_HEAVY' ? "ENTRENAR" : result.decision === 'TRAIN_LIGHT' ? "REGULAR" : "DESCANSAR"}
                  </h3>
                </div>
                <div className="bg-zinc-900/50 p-5 rounded-lg border border-zinc-800">
                  <MarkdownRenderer content={result.rationale} />
                </div>
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Instrucciones:</p>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex gap-2 items-start text-zinc-300"><span className="text-red-500 font-bold">›</span> {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-950 border-t border-zinc-900 mt-auto flex flex-col gap-2">
            {step === 'input' && (
                <>
                  <Button onClick={analyzeData} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-lg relative overflow-hidden">
                    {!hasProAccess && <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10 text-sm"><Lock className="w-4 h-4 mr-2"/> REQUIERE PRO</div>}
                    EVALUAR (IA)
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-zinc-500 hover:text-zinc-300 font-bold uppercase text-[10px] tracking-widest h-8"
                    onClick={skipToWorkout}
                  >
                    Omitir Evaluación e Ir a Entrenar
                  </Button>
                </>
            )}
            {step === 'result' && (
              <div className="flex gap-3">
                 <Button variant="outline" className="flex-1 border-zinc-800 h-12 font-bold uppercase text-xs" onClick={() => setStep('input')}>Re-evaluar</Button>
                 <Button className="flex-[2] h-12 bg-white text-black font-black uppercase" onClick={skipToWorkout}>{result?.decision === 'REST' ? 'Registrar Descanso' : 'IR A ENTRENAR'}</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} featureName="Coach IA Pre-Entreno" />
    </>
  );
}