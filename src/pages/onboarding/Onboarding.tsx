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
import { User, Scale, Brain, CheckCircle, ChevronRight, ChevronLeft, Users, Dumbbell, Calendar, Building2, Loader2 } from "lucide-react";
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
  const [role, setRole] = useState<'athlete' | 'coach' | 'agency'>('athlete');
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState(70);
  const [units, setUnits] = useState<UnitSystem>("kg");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [discipline, setDiscipline] = useState<Discipline>("bodybuilding"); 

  useEffect(() => {
    const fetchUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            setUserId(data.user.id);
        } else {
            navigate("/auth");
        }
    };
    fetchUser();
  }, [navigate]);

  const isProfessional = role === 'coach' || role === 'agency';

  const handleNext = () => {
    // Si es profesional, saltamos los pasos de configuración física y coach IA personal
    // Directamente a confirmación
    if (step === 2 && isProfessional) {
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
    if (step === 5 && isProfessional) {
      setStep(2); // Volver al nombre
      return;
    }
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!userId) {
        toast.error("Error de sesión. Por favor recarga la página.");
        return;
    }
    setLoading(true);

    try {
      const updateData: any = {
        user_id: userId, // CRÍTICO para el upsert
        display_name: displayName,
        updated_at: new Date().toISOString(),
      };

      if (isProfessional) {
        updateData.is_coach = true;
        // Valores por defecto para profesionales (no se piden en UI)
        updateData.coach_tone = 'analytical';
        updateData.sex = 'other'; 
        updateData.units = 'kg';
        // Si es agencia, podríamos guardar un flag adicional en business_info si fuera necesario
        if (role === 'agency') {
            updateData.business_info = { type: 'agency' };
        }
      } else {
        // Datos de Atleta
        updateData.sex = sex;
        updateData.birth_date = birthDate || null;
        updateData.units = units;
        updateData.coach_tone = coachTone;
        updateData.discipline = discipline;
        updateData.is_coach = false;
        updateData.settings = { current_weight: weight.toString() }; 
      }

      // Usamos UPSERT en lugar de UPDATE para garantizar que se guarde 
      // incluso si el perfil no se creó correctamente en el registro.
      const { error } = await supabase
        .from("profiles")
        .upsert(updateData, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Perfil configurado correctamente");
      
      // Forzar recarga del contexto de perfil navegando
      if (isProfessional) {
          window.location.href = "/coach";
      } else {
          window.location.href = "/dashboard";
      }
      
    } catch (error: any) {
      console.error("Onboarding error:", error);
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
                (s.id === 3 || s.id === 4) && isProfessional && "opacity-20" // Visual clue that steps are skipped
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
          
          {step === 1 && (
            <div className="space-y-4">
               <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs block text-center mb-4">¿Cuál es tu función principal?</Label>
               <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setRole('athlete')}
                    className={cn("flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group", role === 'athlete' ? "bg-red-950/20 border-red-600" : "bg-zinc-900 border-zinc-800")}
                  >
                    <div className={cn("p-3 rounded-lg", role === 'athlete' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}><Dumbbell className="w-6 h-6" /></div>
                    <div><h4 className={cn("font-black uppercase italic", role === 'athlete' ? "text-white" : "text-zinc-400")}>Soy Atleta</h4><p className="text-xs text-zinc-500">Quiero registrar mis entrenos y usar el Coach IA.</p></div>
                  </button>
                  
                  <button 
                    onClick={() => setRole('coach')}
                    className={cn("flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group", role === 'coach' ? "bg-red-950/20 border-red-600" : "bg-zinc-900 border-zinc-800")}
                  >
                    <div className={cn("p-3 rounded-lg", role === 'coach' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}><Users className="w-6 h-6" /></div>
                    <div><h4 className={cn("font-black uppercase italic", role === 'coach' ? "text-white" : "text-zinc-400")}>Soy Coach Independiente</h4><p className="text-xs text-zinc-500">Gestiono mis alumnos y su facturación.</p></div>
                  </button>

                  <button 
                    onClick={() => setRole('agency')}
                    className={cn("flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group", role === 'agency' ? "bg-red-950/20 border-red-600" : "bg-zinc-900 border-zinc-800")}
                  >
                    <div className={cn("p-3 rounded-lg", role === 'agency' ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}><Building2 className="w-6 h-6" /></div>
                    <div><h4 className={cn("font-black uppercase italic", role === 'agency' ? "text-white" : "text-zinc-400")}>Soy Agencia / Team</h4><p className="text-xs text-zinc-500">Coordino un equipo de coaches y atletas.</p></div>
                  </button>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-500 uppercase font-bold text-[10px]">
                    {role === 'agency' ? "Nombre de la Agencia / Team" : "¿Cómo te llamamos?"}
                </Label>
                <Input id="name" placeholder={role === 'agency' ? "Ej: Iron Team Performance" : "Tu nombre"} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-black border-zinc-800 h-12 text-lg font-bold" />
              </div>
              
              {!isProfessional && (
                  <div className="space-y-2">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Disciplina Principal</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["bodybuilding", "powerlifting", "crossfit", "general"] as const).map((d) => (
                        <Button key={d} type="button" variant={discipline === d ? "default" : "outline"} onClick={() => setDiscipline(d)} className={cn("capitalize font-bold border-zinc-800", discipline === d ? "bg-red-600" : "bg-zinc-900 text-zinc-400")}>{d}</Button>
                      ))}
                    </div>
                  </div>
              )}
            </div>
          )}

          {/* PASO 3: Solo atletas */}
          {step === 3 && !isProfessional && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-500 uppercase font-bold text-[10px]">Sexo Biológico</Label>
                        <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            {(["male", "female"] as const).map((s) => (
                            <button key={s} type="button" onClick={() => setSex(s)} className={cn("py-1.5 text-[10px] font-black uppercase rounded transition-all", sex === s ? "bg-zinc-800 text-white" : "text-zinc-600")}>{s === 'male' ? 'H' : 'M'}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-500 uppercase font-bold text-[10px]">Unidad</Label>
                        <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            {(["kg", "lb"] as const).map((u) => (
                            <button key={u} type="button" onClick={() => setUnits(u)} className={cn("py-1.5 text-[10px] font-black uppercase rounded transition-all", units === u ? "bg-zinc-800 text-white" : "text-zinc-600")}>{u}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Fecha de Nacimiento</Label>
                    <div className="relative">
                        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-black border-zinc-800 h-12 font-bold" />
                        <Calendar className="absolute right-3 top-4 h-4 w-4 text-zinc-600 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-baseline">
                    <Label className="text-zinc-500 uppercase font-bold text-[10px]">Peso Corporal</Label>
                    <span className="font-black text-3xl italic text-red-500">{weight} <span className="text-sm font-bold text-zinc-600 uppercase">{units}</span></span>
                  </div>
                  <Slider value={[weight]} min={30} max={200} step={0.5} onValueChange={(vals) => setWeight(vals[0])} className="py-4" />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Solo atletas */}
          {step === 4 && !isProfessional && (
            <div className="space-y-4">
              <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs block text-center mb-2">Elige la personalidad de tu IA</Label>
              <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="space-y-3">
                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'strict' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900')}>
                  <RadioGroupItem value="strict" id="strict" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="strict" className="font-black uppercase italic cursor-pointer text-white">Strict (Mike Mentzer Style)</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Sin excusas. Fallo absoluto. Disciplina férrea.</p>
                  </div>
                </div>
                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'analytical' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900')}>
                  <RadioGroupItem value="analytical" id="analytical" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="analytical" className="font-black uppercase italic cursor-pointer text-white">Analytical</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Basado en datos. Frío y enfocado en métricas.</p>
                  </div>
                </div>
                <div className={cn("flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all", coachTone === 'motivational' ? 'border-red-600 bg-red-950/10' : 'border-zinc-900')}>
                  <RadioGroupItem value="motivational" id="motivational" className="mt-1 border-zinc-700" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="motivational" className="font-black uppercase italic cursor-pointer text-white">Motivational</Label>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Energía positiva y empuje constante.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-xl font-black italic uppercase text-white">¡Todo listo, {displayName}!</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    Estás configurado como {role === 'agency' ? 'AGENCIA' : role === 'coach' ? 'COACH' : 'ATLETA'}.
                </p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-2xl text-left space-y-4 border border-zinc-800 text-xs">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-bold uppercase">Perfil:</span>
                    <span className="font-black uppercase italic text-red-500">{role === 'agency' ? 'Agencia' : role === 'coach' ? 'Coach' : 'Atleta'}</span>
                </div>
                {!isProfessional && birthDate && (
                    <div className="flex justify-between border-b border-zinc-800 pb-2"><span className="text-zinc-500 font-bold uppercase">Nacimiento:</span><span className="font-black text-white">{birthDate}</span></div>
                )}
                {!isProfessional && (
                    <div className="flex justify-between"><span className="text-zinc-500 font-bold uppercase">Peso:</span><span className="font-black text-white">{weight} {units}</span></div>
                )}
                {isProfessional && (
                    <div className="flex justify-between"><span className="text-zinc-500 font-bold uppercase">Panel:</span><span className="font-black text-white">Business Hub Habilitado</span></div>
                )}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between gap-3 pt-4 border-t border-zinc-900">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest"><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Button>
          <Button onClick={handleNext} disabled={loading || (step === 2 && !displayName)} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase italic h-12 px-8">
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : step === 5 ? "Entrar" : "Continuar"} 
            {!loading && step !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;