import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ChevronLeft, ShieldCheck, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiService, BioStopResponse } from "@/services/ai";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [reportOpen, setReportOpen] = useState(false);
  
  const [sleep, setSleep] = useState(7);
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
      }, coachTone);

      setResult(audit);
      setStep('result');
    } catch (error: any) {
      toast.error("Error analizando variables biológicas.");
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
            <DialogDescription className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5 leading-none">Análisis de Preparación Física</DialogDescription>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {step === 'input' && (
            <div className="grid gap-8 py-2">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-red-600 font-black uppercase tracking-widest text-[10px]">Horas de Sueño</Label>
                  <span className="font-black text-3xl italic">{sleep}h</span>
                </div>
                <Slider value={[sleep]} min={2} max={12} step={1} onValueChange={(v) => setSleep(v[0])} className="py-4" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Nivel de Estrés</Label>
                  <span className="font-black text-3xl italic text-zinc-400">{stress}</span>
                </div>
                <Slider value={[stress]} min={1} max={10} step={1} onValueChange={(v) => setStress(v[0])} className="py-4" />
              </div>

              <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-900 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" /> ¿Molestias Musculares?
                  </Label>
                  <Switch checked={hasPain} onCheckedChange={setHasPain} className="data-[state=checked]:bg-red-600" />
                </div>
                {hasPain && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <Input placeholder="Ej: Hombro derecho, lumbar..." value={painLocation} onChange={e => setPainLocation(e.target.value)} className="bg-black border-zinc-800 h-12 font-bold" />
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-600"><span>Intensidad</span><span>{painLevel}/10</span></div>
                      <Slider value={[painLevel]} min={1} max={10} step={1} onValueChange={(v) => setPainLevel(v[0])} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
                <Loader2 className="h-16 w-16 animate-spin text-red-600 relative z-10" />
              </div>
              <p className="text-zinc-500 font-black text-sm uppercase tracking-widest animate-pulse">Auditando Sistema Nervioso...</p>
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={cn(
                "p-8 rounded-2xl border-4 text-center space-y-2 shadow-2xl relative overflow-hidden",
                result.card_data.ui_color === 'green' ? "bg-green-950/20 border-green-600/30 text-green-400" : 
                result.card_data.ui_color === 'yellow' ? "bg-yellow-950/20 border-yellow-600/30 text-yellow-400" : 
                "bg-red-950/20 border-red-600/30 text-red-500"
              )}>
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <ShieldCheck className="h-20 w-20" />
                </div>
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{result.card_data.status}</h3>
                <p className="text-xs font-black uppercase tracking-[0.2em]">{result.card_data.ui_title}</p>
              </div>
              
              <Collapsible open={reportOpen} onOpenChange={setReportOpen} className="space-y-2">
                 <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 h-12 font-black uppercase text-[10px] tracking-widest flex justify-between px-6 hover:bg-zinc-800 hover:text-white">
                       <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-500" /> Leer Informe Técnico Completo
                       </span>
                       <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", reportOpen && "rotate-180")} />
                    </Button>
                 </CollapsibleTrigger>
                 <CollapsibleContent className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-6 mt-4 animate-in slide-in-from-top-2 duration-300">
                    <MarkdownRenderer content={result.detailed_report} className="text-zinc-300" />
                 </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-900">
          {step === 'input' && (
            <Button onClick={analyzeData} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-lg shadow-xl shadow-red-950/20">
              SOLICITAR AUDITORÍA SNC
            </Button>
          )}
          {step === 'result' && (
            <div className="flex gap-3">
               <Button variant="outline" className="flex-1 border-zinc-800 h-14 font-black uppercase text-[10px] tracking-widest text-zinc-500" onClick={() => setStep('input')}>Re-Evaluar</Button>
               <Button className="flex-[2] h-14 bg-white text-black font-black uppercase italic tracking-widest" onClick={() => { onOpenChange(false); if(result?.card_data.status !== 'STOP') navigate('/workout'); }}>
                {result?.card_data.status === 'STOP' ? 'CERRAR E INFORMAR' : 'INICIAR ENTRENAMIENTO'}
               </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}