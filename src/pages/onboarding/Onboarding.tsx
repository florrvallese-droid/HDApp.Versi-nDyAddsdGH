import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Scale, Brain, Dumbbell, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { CoachTone, Discipline, Sex, UnitSystem } from "@/types";

const STEPS = [
  { id: 1, title: "Datos Básicos", icon: User },
  { id: 2, title: "Físico", icon: Scale },
  { id: 3, title: "Tu Coach", icon: Brain },
  { id: 4, title: "Disciplina", icon: Dumbbell },
  { id: 5, title: "Listo", icon: CheckCircle },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [weight, setWeight] = useState(70);
  const [units, setUnits] = useState<UnitSystem>("kg");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [discipline, setDiscipline] = useState<Discipline>("general");

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
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
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
          coach_tone: coachTone,
          discipline,
          // Initialize checking weight log? Maybe later.
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Perfil configurado correctamente");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Error al guardar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const CurrentIcon = STEPS[step - 1].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between mb-2 px-2">
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={`flex flex-col items-center gap-1 transition-colors ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className={`h-2 w-2 rounded-full ${step >= s.id ? "bg-primary" : "bg-muted"}`} />
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / STEPS.length) * 100}%` }} 
          />
        </div>
      </div>

      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <CurrentIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{STEPS[step - 1].title}</CardTitle>
          <CardDescription>Paso {step} de {STEPS.length}</CardDescription>
        </CardHeader>
        
        <CardContent className="py-6">
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">¿Cómo te llamamos?</Label>
                <Input 
                  id="name" 
                  placeholder="Tu nombre o apodo" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sexo Biológico</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["male", "female", "other"] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={sex === s ? "default" : "outline"}
                      onClick={() => setSex(s)}
                      className="capitalize"
                    >
                      {s === 'male' ? 'Hombre' : s === 'female' ? 'Mujer' : 'Otro'}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Importante para cálculos hormonales y de fuerza relativa.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: PHYSICAL STATS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Unidad de medida</Label>
                  <div className="flex bg-muted rounded-md p-1">
                    <button
                      className={`px-3 py-1 text-sm rounded-sm transition-all ${units === 'kg' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                      onClick={() => setUnits('kg')}
                    >
                      KG
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded-sm transition-all ${units === 'lb' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                      onClick={() => setUnits('lb')}
                    >
                      LB
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Peso Corporal</Label>
                    <span className="font-bold text-xl">{weight} {units}</span>
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

          {/* STEP 3: COACH TONE */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base">Elige la personalidad de tu IA</Label>
              <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="space-y-3">
                
                <div className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-all ${coachTone === 'strict' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                  <RadioGroupItem value="strict" id="strict" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="strict" className="font-bold cursor-pointer">Strict (Estricto)</Label>
                    <p className="text-sm text-muted-foreground">
                      Sin excusas. Directo al grano. Exige disciplina máxima.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-all ${coachTone === 'motivational' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                  <RadioGroupItem value="motivational" id="motivational" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="motivational" className="font-bold cursor-pointer">Motivational</Label>
                    <p className="text-sm text-muted-foreground">
                      Energía positiva. Celebra victorias, empuja en las derrotas.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-all ${coachTone === 'analytical' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                  <RadioGroupItem value="analytical" id="analytical" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="analytical" className="font-bold cursor-pointer">Analytical</Label>
                    <p className="text-sm text-muted-foreground">
                      Basado en datos. Frío, calculador y enfocado en métricas.
                    </p>
                  </div>
                </div>

                <div className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-all ${coachTone === 'friendly' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}>
                  <RadioGroupItem value="friendly" id="friendly" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="friendly" className="font-bold cursor-pointer">Friendly</Label>
                    <p className="text-sm text-muted-foreground">
                      Empático y comprensivo. Un compañero de entreno.
                    </p>
                  </div>
                </div>

              </RadioGroup>
            </div>
          )}

          {/* STEP 4: DISCIPLINE */}
          {step === 4 && (
            <div className="space-y-4">
              <Label className="text-base">¿Cuál es tu enfoque principal?</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'bodybuilding', label: 'Bodybuilding', desc: 'Hipertrofia y estética' },
                  { id: 'powerlifting', label: 'Powerlifting', desc: 'Fuerza máxima (SBD)' },
                  { id: 'crossfit', label: 'CrossFit', desc: 'Resistencia y funcionalidad' },
                  { id: 'general', label: 'General Fitness', desc: 'Salud y bienestar general' }
                ].map((d) => (
                  <div 
                    key={d.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${discipline === d.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent'}`}
                    onClick={() => setDiscipline(d.id as Discipline)}
                  >
                    <div>
                      <p className="font-bold">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                    {discipline === d.id && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">¡Todo listo, {displayName}!</h3>
                <p className="text-muted-foreground text-sm">
                  Estás a punto de comenzar tu trial gratuito de 7 días con Heavy Duty Pro.
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg text-left text-sm space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Coach:</span>
                  <span className="font-medium capitalize">{coachTone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Disciplina:</span>
                  <span className="font-medium capitalize">{discipline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso inicial:</span>
                  <span className="font-medium">{weight} {units}</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-yellow-500/10 p-3 rounded text-left">
                ⚠️ <strong>Disclaimer:</strong> Esta app utiliza Inteligencia Artificial para sugerencias. Siempre escucha a tu cuerpo y consulta a un profesional de la salud antes de cambios drásticos.
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={loading || (step === 1 && !displayName)}
            className={step === 5 ? "w-32" : ""}
          >
            {loading ? "Guardando..." : step === 5 ? "Comenzar" : "Siguiente"} 
            {!loading && step !== 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;