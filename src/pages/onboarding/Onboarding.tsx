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
import { User, Scale, Brain, CheckCircle, ChevronRight, ChevronLeft, Users, Dumbbell } from "lucide-react";
import { CoachTone, Discipline, Sex, UnitSystem } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Tu Perfil", icon: Users },
  { id: 2, title: "Identificación", icon: User },
  { id: 3, title: "Físico", icon: Scale },
  { id: 4, title: "Tu Coach IA", icon: Brain },
  { id: 5, title: "Confirmación", icon: CheckCircle },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [isCoach, setIsCoach] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState(70);
  const [units, setUnits] = useState<UnitSystem>("kg");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [discipline, setDiscipline] = useState<Discipline>("bodybuilding"); 

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleNext = () => {
    // Skip Coach AI step if user is a coach
    if (step === 3 && isCoach) {
      setStep(5);
      return;
    }
    
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 5 && isCoach) {
      setStep(3);
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          sex,
          units,
          coach_tone: isCoach ? 'analytical' : coachTone, // Default for coaches
          discipline,
          is_coach: isCoach,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Perfil configurado correctamente");
      
      // Redirect based on role
      if (isCoach) {
        navigate("/coach");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Error al guardar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
                (s.id === 4 && isCoach) && "opacity-20" // Visual skip for coaches
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
          <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Paso {step} de {STEPS.length}</CardDescription>
        </CardHeader>
        
        <CardContent className="py-6">
          
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
               <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs block text-center mb-4">¿Cuál es tu función principal?</Label>
               <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setIsCoach(false)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group",
                      !isCoach ? "bg-red-950/20 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className={cn("p-3 rounded-lg", !isCoach ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}>
                      <Dumbbell className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={cn("font-black uppercase italic", !isCoach ? "text-white" : "text-zinc-400")}>Soy Atleta</h4>
                      <p className="text-xs text-zinc-500">Quiero registrar mis entrenos y usar el Coach IA.</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => setIsCoach(true)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group",
                      isCoach ? "bg-red-950/20 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className={cn("p-3 rounded-lg", isCoach ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={cn("font-black uppercase italic", isCoach ? "text-white" : "text-zinc-400")}>Soy Coach / Preparador</h4>
                      <p className="text-xs text-zinc-500">Quiero gestionar y supervisar a mis alumnos.</p>
                    </div>
                  </button>
               </div>
            </div>
          )}

          {/* STEP 2: BASIC INFO */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-500 uppercase font-bold text-[10px]">¿Cómo te llamamos?</Label>
                <Input 
                  id="name" 
                  placeholder="Tu nombre o apodo profesional" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-black border-zinc-800 h-12 text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 uppercase font-bold text-[10px]">Disciplina Principal</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["bodybuilding", "powerlifting", "crossfit", "general"] as const).map((d) => (
                    <Button
                      key={d}
                      type="button"
                      variant={discipline === d ? "default" : "outline"}
                      onClick={() => setDiscipline(d)}
                      className={cn("capitalize font-bold border-zinc-800", discipline === d ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 text-zinc-400")}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHYSICAL STATS */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-zinc-500 uppercase font-bold text-[10px]">Unidad de medida</Label>
                  <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">
                    <button
                      className={`px-4 py-1.5 text-xs font-black rounded-sm transition-all ${units === 'kg' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600'}`}
                      onClick={() => setUnits('kg')}
                    >
                      KG
                    </button>
                    <button
                      className={`px-4 py-1.5 text-xs font-black rounded-sm transition-all ${units === 'lb' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600'}`}
                      onClick={() => setUnits('lb')}
                    >
                      LB
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-500 uppercase font-bold text-[10px]">Sexo Biológico</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["male", "female"] as const).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        variant={sex === s ? "default" : "outline"}
                        onClick={() => setSex(s)}
                        className={cn("font-bold border-zinc-800", sex === s ? "bg-zinc-200 text-black hover:bg-white" : "bg-zinc-900 text-zinc-400")}
                      >
                        {s === 'male' ? 'Hombre' : 'Mujer'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Peso Corporal</Label>
                    <span className="font-black text-3xl italic text-red-500">{weight} <span className="text-sm font-bold text-zinc-600 uppercase">{units}</span></span>
                  </div>
                  <Slider 
                    value={[weight]} 
                    min={30} 
                    max={200} 
                    step={0.5} 
                    onValueChange={(vals) => setWeight(vals[0])}
                    className="py-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COACH TONE (Atletas Only) */}
          {step === 4 && (
            <div className="space-y-4">
              <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs block text-center mb-2">Elige la personalidad de tu IA</Label>
              <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="space-y-3">
                
                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'strict' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900 hover:border-zinc-800')}>
                  <RadioGroupItem value="strict" id="strict" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="strict" className="font-black uppercase italic cursor-pointer text-white">Strict (Mike Mentzer Style)</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Sin excusas. Fallo absoluto. Disciplina férrea.</p>
                  </div>
                </div>

                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'analytical' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900 hover:border-zinc-800')}>
                  <RadioGroupItem value="analytical" id="analytical" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="analytical" className="font-black uppercase italic cursor-pointer text-white">Analytical</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Basado en datos. Frío y enfocado en métricas.</p>
                  </div>
                </div>

                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'motivational' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900 hover:border-zinc-800')}>
                  <RadioGroupItem value="motivational" id="motivational" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="motivational" className="font-black uppercase italic cursor-pointer text-white">Motivational</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Energía positiva y empuje constante.</p>
                  </div>
                </div>

              </RadioGroup>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase text-white">¡Todo listo, {displayName}!</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  Estás configurado como {isCoach ? "COACH" : "ATLETA"}.
                </p>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl text-left space-y-4 border border-zinc-800">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Perfil:</span>
                  <span className="font-black text-xs uppercase italic text-red-500">{isCoach ? 'Coach / Preparador' : 'Atleta Heavy Duty'}</span>
                </div>
                {!isCoach && (
                   <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Coach IA:</span>
                    <span className="font-black text-xs uppercase italic text-white">{coachTone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Peso Actual:</span>
                  <span className="font-black text-xs uppercase italic text-white">{weight} {units}</span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-600 font-bold uppercase bg-zinc-900/50 p-4 rounded-lg text-left leading-relaxed">
                ⚠️ <strong className="text-zinc-400">Nota:</strong> El sistema Di Iorio utiliza IA para el análisis de variables sistémicas. Siempre consulta a un médico antes de iniciar programas de alta intensidad.
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between gap-3 pt-4 border-t border-zinc-900">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || loading}
            className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={loading || (step === 2 && !displayName)}
            className={cn("bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-wider h-12 px-8 shadow-lg shadow-red-900/20")}
          >
            {loading ? "Configurando..." : step === 5 ? "Entrar al Sistema" : "Continuar"} 
            {!loading && step !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;