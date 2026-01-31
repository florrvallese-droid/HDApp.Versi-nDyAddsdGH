import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CoachTone, PreWorkoutData } from "@/types";
import { Loader2, AlertTriangle, CheckCircle2, Moon, Activity, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachTone: CoachTone;
}

export function PreWorkoutModal({ open, onOpenChange, coachTone }: PreWorkoutModalProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  
  // Inputs
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(5);
  const [sensation, setSensation] = useState(7);
  const [pain, setPain] = useState(false);
  const [painDesc, setPainDesc] = useState("");

  // Result
  const [result, setResult] = useState<PreWorkoutData | null>(null);

  const analyzeData = async () => {
    setStep('processing');
    setLoading(true);

    // SIMULACIÓN DE IA / LÓGICA DETERMINÍSTICA (Fallback del PRD)
    // En el futuro, esto llamará a la Edge Function de Supabase
    
    setTimeout(() => {
      let decision: 'TRAIN_HEAVY' | 'TRAIN_LIGHT' | 'REST' = 'TRAIN_HEAVY';
      let rationale = "";
      let recommendations: string[] = [];

      // Reglas básicas del PRD
      if (pain) {
        decision = 'TRAIN_LIGHT';
        rationale = "El dolor reportado es una señal de alerta. No arriesgues una lesión mayor.";
        recommendations.push("Evita ejercicios que agraven la molestia.");
        recommendations.push("Enfócate en movilidad y flujo sanguíneo.");
      } else if (sleep < 5) {
        decision = 'REST';
        rationale = "Tu recuperación neurológica es insuficiente. Entrenar hoy solo aumentará el cortisol.";
        recommendations.push("Prioriza dormir 8 horas hoy.");
        recommendations.push("Haz una caminata ligera si necesitas movimiento.");
      } else if (stress > 8) {
        decision = 'TRAIN_LIGHT';
        rationale = "El estrés sistémico es muy alto. Añadir estrés físico intenso sería contraproducente.";
        recommendations.push("Reduce el volumen al 50%.");
        recommendations.push("No vayas al fallo hoy.");
      } else if (sensation < 4) {
        decision = 'REST';
        rationale = "Tu cuerpo te está pidiendo descanso activamente.";
        recommendations.push("Día libre total.");
      } else {
        // Default Heavy
        decision = 'TRAIN_HEAVY';
        rationale = "Tus biomarcadores están alineados para el alto rendimiento.";
        recommendations.push("Busca superar tus marcas anteriores.");
        recommendations.push("Mantén la intensidad alta.");
      }

      // Ajuste de tono
      if (coachTone === 'strict') {
        if (decision === 'TRAIN_HEAVY') rationale += " No acepto menos que tu máximo esfuerzo.";
        if (decision === 'REST') rationale += " Descansar es parte de la disciplina. Cúmplelo.";
      } else if (coachTone === 'motivational') {
        if (decision === 'TRAIN_HEAVY') rationale += " ¡Hoy es el día para brillar!";
        if (decision === 'REST') rationale += " ¡Recarga energías para volver más fuerte!";
      }

      setResult({
        inputs: { sleep, stress, sensation, pain, painDescription: painDesc },
        decision,
        rationale,
        recommendations
      });
      
      setLoading(false);
      setStep('result');
    }, 1500);
  };

  const resetForm = () => {
    setStep('input');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle>
            {step === 'input' && "Check-in Pre-Entreno"}
            {step === 'processing' && "Analizando..."}
            {step === 'result' && "Decisión del Coach"}
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && "Sé honesto. La calidad de la decisión depende de tus datos."}
            {step === 'processing' && "Procesando tus biomarcadores."}
            {step === 'result' && "Basado en tu estado actual."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: INPUT FORM */}
        {step === 'input' && (
          <div className="grid gap-6 py-4">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500"/> Calidad de Sueño</Label>
                <span className="font-bold text-lg">{sleep}/10</span>
              </div>
              <Slider value={[sleep]} min={1} max={10} step={1} onValueChange={(v) => setSleep(v[0])} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500"/> Nivel de Estrés</Label>
                <span className="font-bold text-lg">{stress}/10</span>
              </div>
              <Slider value={[stress]} min={1} max={10} step={1} onValueChange={(v) => setStress(v[0])} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500"/> Energía / Sensación</Label>
                <span className="font-bold text-lg">{sensation}/10</span>
              </div>
              <Slider value={[sensation]} min={1} max={10} step={1} onValueChange={(v) => setSensation(v[0])} />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="pain-mode" className="flex items-center gap-2">
                  <AlertTriangle className={cn("w-4 h-4", pain ? "text-red-500" : "text-muted-foreground")} />
                  ¿Dolor o molestias agudas?
                </Label>
                <Switch id="pain-mode" checked={pain} onCheckedChange={setPain} />
              </div>
              
              {pain && (
                <Textarea 
                  placeholder="Describe brevemente la molestia..." 
                  value={painDesc}
                  onChange={(e) => setPainDesc(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <Button onClick={analyzeData} className="w-full mt-2">
              Analizar Sesión
            </Button>
          </div>
        )}

        {/* STEP 2: PROCESSING */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Consultando modelo...</p>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && result && (
          <div className="py-2 space-y-6">
            
            {/* DECISION BADGE */}
            <div className={cn(
              "p-6 rounded-xl border-2 text-center space-y-2",
              result.decision === 'TRAIN_HEAVY' ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" :
              result.decision === 'TRAIN_LIGHT' ? "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-300" :
              "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300"
            )}>
              <h3 className="text-2xl font-black tracking-wider">
                {result.decision === 'TRAIN_HEAVY' ? "ENTRENAR PESADO" :
                 result.decision === 'TRAIN_LIGHT' ? "ENTRENO TÉCNICO" :
                 "DESCANSAR"}
              </h3>
            </div>

            {/* RATIONALE */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4" /> Análisis del Coach
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border">
                "{result.rationale}"
              </p>
            </div>

            {/* RECOMMENDATIONS */}
            <div className="space-y-2">
              <h4 className="font-semibold">Recomendaciones</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cerrar
              </Button>
              {result.decision !== 'REST' && (
                <Button className="w-full sm:w-auto" onClick={() => {
                  // TODO: Navigate to Workout with settings
                  onOpenChange(false);
                }}>
                  Iniciar Entrenamiento
                </Button>
              )}
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}