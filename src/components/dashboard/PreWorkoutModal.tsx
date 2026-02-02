import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ChevronLeft, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService, BioStopResponse } from "@/services/ai";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { differenceInDays, parseISO, isValid } from "date-fns";

interface PreWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachTone: string;
  hasProAccess: boolean;
}

export function PreWorkoutModal({ open, onOpenChange, coachTone, hasProAccess }: PreWorkoutModalProps) {
  const navigate = useNavigate();
  const { profile } = useProfile(); 
  
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  
  const [sleep, setSleep] = useState(5);
  const [stress, setStress] = useState(5);
  const [hasPain, setHasPain] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [painLocation, setPainLocation] = useState("");
  const [result, setResult] = useState<BioStopResponse | null>(null);

  const analyzeData = async () => {
    setStep('processing');
    setLoading(true);

    try {
      let cycleDay = undefined;
      if (profile?.sex === 'female' && profile.settings?.last_cycle_start) {
        const start = parseISO(profile.settings.last_cycle_start);
        if (isValid(start)) {
          cycleDay = differenceInDays(new Date(), start) + 1;
        }
      }

      const audit = await aiService.getPreWorkoutAudit({
        sleep,
        stress,
        cycle_day: cycleDay,
        pain_level: hasPain ? painLevel : 0,
        pain_location: hasPain ? painLocation : "none"
      });

      setResult(audit);
      setStep('result');
    } catch (error: any) {
      toast.error("Motor de auditoría fuera de línea. Intenta de nuevo.");
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-0 gap-0 overflow-hidden">
        
        <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-zinc-500 h-8 w-8">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">BIO-STOP FILTER</DialogTitle>
            <DialogDescription className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest leading-none mt-0.5">Heavy Duty Logic Engine</DialogDescription>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'input' && (
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-red-500 font-bold uppercase tracking-wider text-xs">Horas de Sueño</Label>
                  <span className="font-black text-2xl">{sleep}h</span>
                </div>
                <Slider value={[sleep]} min={2} max={10} step={1} onValueChange={(v) => setSleep(v[0])} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs">Estrés (1-10)</Label>
                  <span className="font-black text-2xl">{stress}</span>
                </div>
                <Slider value={[stress]} min={1} max={10} step={1} onValueChange={(v) => setStress(v[0])} />
              </div>

              <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" /> ¿Dolor Agudo?
                  </Label>
                  <Switch checked={hasPain} onCheckedChange={setHasPain} className="data-[state=checked]:bg-red-600" />
                </div>
                {hasPain && (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <Input placeholder="¿Dónde?" value={painLocation} onChange={e => setPainLocation(e.target.value)} className="bg-zinc-950 border-zinc-800 h-11" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500"><span>Intensidad</span><span>{painLevel}/10</span></div>
                      <Slider value={[painLevel]} min={1} max={10} step={1} onValueChange={(v) => setPainLevel(v[0])} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6 h-64">
              <Loader2 className="h-12 w-12 animate-spin text-red-600" />
              <p className="text-zinc-500 font-black text-sm uppercase tracking-widest animate-pulse">Auditando Variables Biológicas...</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className={cn(
                "p-8 rounded-lg border-2 text-center space-y-2",
                result.ui_color === 'green' ? "bg-green-950/20 border-green-600/50 text-green-400" : 
                result.ui_color === 'yellow' ? "bg-yellow-950/20 border-yellow-600/50 text-yellow-400" : 
                "bg-red-950/20 border-red-600/50 text-red-500"
              )}>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{result.status}</h3>
                <p className="text-sm font-bold uppercase tracking-widest">{result.short_message}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Fundamento Técnico:</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.rationale}</p>
                </div>
                {result.modification && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Modificación Requerida:</p>
                      <p className="text-sm font-bold text-white">{result.modification}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-900">
          {step === 'input' && (
            <Button onClick={analyzeData} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-lg shadow-lg">
              AUDITAR ESTADO
            </Button>
          )}
          {step === 'result' && (
            <div className="flex gap-3">
               <Button variant="outline" className="flex-1 border-zinc-800 h-12 font-bold uppercase text-xs" onClick={() => setStep('input')}>Re-Evaluar</Button>
               <Button className="flex-[2] h-12 bg-white text-black font-black uppercase" onClick={() => { onOpenChange(false); if(result?.status !== 'STOP') navigate('/workout'); }}>
                {result?.status === 'STOP' ? 'REGISTRAR DESCANSO' : 'IR AL CUADERNO'}
               </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}