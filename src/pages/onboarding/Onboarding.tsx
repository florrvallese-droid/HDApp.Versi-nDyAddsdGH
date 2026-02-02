import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Scale, Brain, CheckCircle, ChevronRight, ChevronLeft, Users, Dumbbell, Calendar, Building2, Loader2, Target } from "lucide-react";
import { CoachTone, Discipline, Sex, UnitSystem } from "@/types";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

const STEPS = [
  { id: 1, title: "Tu Perfil", icon: User },
  { id: 2, title: "Tu Objetivo", icon: Target },
  { id: 3, title: "Físico", icon: Scale }, // Este paso se salta o reduce para Coaches
  { id: 4, title: "Tu Coach IA", icon: Brain },
  { id: 5, title: "Confirmación", icon: CheckCircle },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState(70);
  const [units, setUnits] = useState<UnitSystem>("kg");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [discipline, setDiscipline] = useState<Discipline>("bodybuilding"); 

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setSex(profile.sex || "male");
      setUnits(profile.units || "kg");
      setCoachTone(profile.coach_tone || "strict");
      setDiscipline(profile.discipline || "bodybuilding");
    }
  }, [profile]);

  const isProfessional = profile?.is_coach === true;

  const handleNext = () => {
    // Si es Coach, al llegar al paso 2 y darle a siguiente, saltamos el paso 3 (Peso) y vamos al 4 (Cerebro IA)
    if (isProfessional && step === 2) {
      setStep(4);
    } else if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (isProfessional && step === 4) {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const updateData: any = {
        display_name: displayName,
        sex: sex,
        units: units,
        coach_tone: coachTone,
        discipline: discipline,
        updated_at: new Date().toISOString(),
        settings: { 
          ...profile.settings,
          current_weight: isProfessional ? null : weight.toString() 
        }
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq('user_id', profile.user_id);

      if (error) throw error;

      await refreshProfile();
      toast.success("¡Configuración finalizada!");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-red-600" />
    </div>
  );

  const CurrentIcon = STEPS[step - 1].icon;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between mb-2 px-2">
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                step >= s.id ? "text-red-500" : "text-zinc-700",
                isProfessional && s.id === 3 && "hidden" // Ocultar punto 3 en la barra si es coach
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", step >= s.id ? "bg-red-600" : "bg-zinc-800")} />
            </div>
          ))}
        </div>
        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600 transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / STEPS.length) * 100}%` }} 
          />
        </div>
      </div>

      <Card className="w-full max-w-lg bg-zinc-950 border-zinc-900 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-red-600/10 p-4 rounded-full w-fit mb-2">
            <CurrentIcon className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-black uppercase italic tracking-tight text-white">{STEPS[step - 1].title}</CardTitle>
          <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
            {isProfessional ? 'Perfil Profesional' : 'Perfil Atleta'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="py-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-500 uppercase font-bold text-[10px]">
                    Confirmar Nombre o Marca
                </Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-black border-zinc-800 h-12 text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 uppercase font-bold text-[10px]">Sexo Biológico</Label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    {(["male", "female"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setSex(s)} className={cn("py-1.5 text-[10px] font-black uppercase rounded transition-all", sex === s ? "bg-zinc-800 text-white" : "text-zinc-600")}>{s === 'male' ? 'HOMBRE' : 'MUJER'}</button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-zinc-500 uppercase font-bold text-[10px]">Especialidad / Disciplina</Label>
                <div className="grid grid-cols-2 gap-2">
                    {(["bodybuilding", "powerlifting", "crossfit", "general"] as const).map((d) => (
                    <Button key={d} type="button" variant={discipline === d ? "default" : "outline"} onClick={() => setDiscipline(d)} className={cn("capitalize font-bold border-zinc-800", discipline === d ? "bg-red-600" : "bg-zinc-900 text-zinc-400")}>{d}</Button>
                    ))}
                </div>
              </div>
              <p className="text-center text-[10px] text-zinc-600 uppercase font-bold px-8">
                {isProfessional ? "Esto define el enfoque de tus auditorías de equipo." : "Esto personaliza los algoritmos de sobrecarga de la IA."}
              </p>
            </div>
          )}

          {step === 3 && !isProfessional && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-4">
                <div className="space-y-2 text-center">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Unidad de Medida</Label>
                    <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-32 mx-auto">
                        {(["kg", "lb"] as const).map((u) => (
                        <button key={u} type="button" onClick={() => setUnits(u)} className={cn("py-1 text-[10px] font-black uppercase rounded transition-all", units === u ? "bg-zinc-800 text-white" : "text-zinc-600")}>{u}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Peso Corporal</Label>
                    <span className="font-black text-3xl italic text-red-500">{weight} <span className="text-sm font-bold text-zinc-600 uppercase">{units}</span></span>
                  </div>
                  <Slider value={[weight]} min={30} max={200} step={0.5} onValueChange={(vals) => setWeight(vals[0])} className="py-4" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs block text-center mb-2">Personalidad de tu IA</Label>
              <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="space-y-3">
                <ToneOption id="strict" title="Strict (Mentzer)" desc="Sin excusas. Disciplina férrea." current={coachTone} />
                <ToneOption id="analytical" title="Analytical" desc="Basado en datos y métricas frías." current={coachTone} />
                <ToneOption id="motivational" title="Motivational" desc="Energía positiva y empuje constante." current={coachTone} />
              </RadioGroup>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center animate-in zoom-in-95">
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase text-white">¡Bienvenido al Sistema!</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    {isProfessional ? "Tu centro de mando está listo." : "Tu coach digital está listo."}
                </p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-2xl text-left space-y-4 border border-zinc-800 text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold uppercase">Nombre:</span>
                    <span className="font-black uppercase italic text-white">{displayName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold uppercase">Rol:</span>
                    <span className="font-black uppercase italic text-red-500">{isProfessional ? 'PREPARADOR' : 'ATLETA'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500 font-bold uppercase">Disciplina:</span>
                    <span className="font-black text-white uppercase">{discipline}</span>
                </div>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between gap-3 pt-4 border-t border-zinc-900">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest"><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Button>
          <Button onClick={handleNext} disabled={loading || (step === 1 && !displayName)} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic h-12 px-8">
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : step === 5 ? "ENTRAR" : "CONTINUAR"} 
            {!loading && step !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const ToneOption = ({ id, title, desc, current }: any) => (
    <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", current === id ? 'border-red-600 bg-red-950/10' : 'border-zinc-900')}>
      <RadioGroupItem value={id} id={id} className="mt-1 border-zinc-700" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor={id} className="font-black uppercase italic cursor-pointer text-white">{title}</Label>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
);

export default Onboarding;