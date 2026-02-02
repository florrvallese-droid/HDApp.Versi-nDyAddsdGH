import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { 
    ChevronLeft, Loader2, MailCheck, User, Dumbbell, Users, 
    ChevronRight, Target, Brain, Star, CheckCircle2, ShieldCheck, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "login");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'athlete' | 'coach'>(() => (searchParams.get("role") as any) || 'athlete');
  
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState("175");
  const [phase, setPhase] = useState<'volume' | 'definition' | 'maintenance'>('maintenance');
  const [tone, setTone] = useState('strict');

  const [brandName, setBrandName] = useState("");
  const [studentCount, setStudentCount] = useState("10_30");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifyStep, setIsVerifyStep] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      toast.error("Credenciales inválidas. ¿Confirmaste tu email?");
      setLoading(false);
    }
  };

  const handleAtomicSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    
    const metadata = role === 'athlete' ? {
        role,
        weight: weight.toString(),
        height,
        phase,
        tone,
        display_name: email.split('@')[0],
    } : {
        role,
        brand_name: brandName,
        student_count: studentCount,
        display_name: brandName,
        plan_type: studentCount === 'plus_50' ? 'agency' : (studentCount === '10_30' ? 'hub' : 'starter')
    };

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: metadata
        }
      });

      if (error) throw error;
      setIsVerifyStep(true);
      toast.success("¡Registro exitoso! Por favor revisá tu email.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifyStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md bg-zinc-950 border-zinc-900 shadow-2xl text-center">
          <CardHeader>
            <div className="mx-auto bg-blue-600/10 p-4 rounded-full w-fit mb-4">
              <MailCheck className="h-10 w-10 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-black uppercase italic text-white">REVISÁ TU BANDEJA</CardTitle>
            <CardDescription className="text-zinc-400">
              Te enviamos un link de confirmación a <br/> <strong className="text-white">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-[10px] text-zinc-500 uppercase font-bold leading-relaxed">
                Por seguridad, no podrás ingresar hasta que valides tu identidad haciendo clic en el botón del correo.
            </div>
            <Button variant="outline" className="w-full border-zinc-800 text-zinc-300 font-bold h-12" onClick={() => setActiveTab('login')}>
                YA LO HICE, IR AL LOGIN
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Button variant="ghost" className="absolute top-6 left-6 text-zinc-400 hover:text-white z-50" onClick={() => navigate("/")}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="w-full max-w-md bg-zinc-950 border-zinc-900 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">HEAVY DUTY</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Atomic Profile System</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 p-1 mb-6">
              <TabsTrigger value="login" className="font-bold uppercase text-[10px]">Ingresar</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold uppercase text-[10px]">Crear Perfil</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-3">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                  <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                </div>
                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest text-center block mb-2">Paso 1: Identificación de Rol</Label>
                      <div className="grid gap-3">
                          <RoleBtn active={role === 'athlete'} onClick={() => setRole('athlete')} icon={<Dumbbell/>} title="Atleta" desc="Para registrar mis entrenos y recibir auditoría." />
                          <RoleBtn active={role === 'coach'} onClick={() => setRole('coach')} icon={<Users/>} title="Coach / Preparador" desc="Para gestionar alumnos y auditoría de negocio." />
                      </div>
                      <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" onClick={() => setStep(2)}>
                          CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest text-center block mb-2">Paso 2: Cuestionario Técnico</Label>
                      
                      {role === 'athlete' ? (
                          <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-zinc-500">Peso ({weight}kg)</Label>
                                      <Slider value={[weight]} min={40} max={150} step={1} onValueChange={(v) => setWeight(v[0])} />
                                  </div>
                                  <div className="space-y-1.5">
                                      <Label className="text-[9px] font-black uppercase text-zinc-500">Altura (cm)</Label>
                                      <Input value={height} onChange={e => setHeight(e.target.value)} type="number" className="bg-black border-zinc-800 h-9" />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-zinc-500">Fase Actual</Label>
                                  <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg">
                                      {(['volume', 'definition', 'maintenance'] as const).map(p => (
                                          <button key={p} onClick={() => setPhase(p)} className={cn("py-1.5 text-[8px] font-black uppercase rounded", phase === p ? "bg-zinc-800 text-white" : "text-zinc-600")}>
                                              {p === 'volume' ? 'Volumen' : p === 'definition' ? 'Def' : 'Mnt'}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label className="text-[9px] font-black uppercase text-zinc-500">Tono del Coach IA</Label>
                                  <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 gap-2">
                                      <ToneItem id="strict" label="Strict" current={tone} />
                                      <ToneItem id="analytical" label="Analytical" current={tone} />
                                      <ToneItem id="motivational" label="Motivational" current={tone} />
                                      <ToneItem id="friendly" label="Friendly" current={tone} />
                                  </RadioGroup>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              <div className="space-y-2">
                                  <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nombre de la Marca / Team</Label>
                                  <Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ej: Di Iorio High Performance" className="bg-black border-zinc-800 h-12 font-bold" />
                              </div>
                              <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase text-zinc-500">Cantidad de Alumnos Actuales</Label>
                                  <select value={studentCount} onChange={e => setStudentCount(e.target.value)} className="w-full h-12 bg-black border border-zinc-800 rounded-md px-3 text-sm font-bold">
                                      <option value="less_10">Menos de 10</option>
                                      <option value="10_30">Entre 10 y 30</option>
                                      <option value="plus_50">Más de 50</option>
                                  </select>
                              </div>
                          </div>
                      )}
                      
                      <div className="flex gap-2">
                          <Button variant="ghost" className="flex-1 text-zinc-500 font-bold uppercase text-[10px]" onClick={() => setStep(1)}>Volver</Button>
                          <Button className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" onClick={() => setStep(3)}>CONTINUAR</Button>
                      </div>
                  </div>
              )}

              {step === 3 && (
                  <form onSubmit={handleAtomicSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest text-center block mb-2">Paso 3: Creación de Cuenta</Label>
                      <div className="space-y-3">
                          <Input type="email" placeholder="Tu Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                          <Input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required minLength={8} />
                          <Input type="password" placeholder="Confirmar Contraseña" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <Button variant="ghost" type="button" className="flex-1 text-zinc-500 font-bold uppercase text-[10px]" onClick={() => setStep(2)}>Volver</Button>
                          <Button className="flex-[2] h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase italic" type="submit" disabled={loading}>
                              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "FINALIZAR REGISTRO"}
                          </Button>
                      </div>
                  </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-zinc-900 pt-4">
          <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> Seguridad Nivel Corporativo
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

const RoleBtn = ({ active, onClick, icon, title, desc }: any) => (
    <button onClick={onClick} className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left", active ? "bg-red-950/20 border-red-600" : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700")}>
        <div className={cn("p-2 rounded-lg", active ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500")}>{icon}</div>
        <div>
            <h4 className={cn("font-black uppercase italic text-xs", active ? "text-white" : "text-zinc-400")}>{title}</h4>
            <p className="text-[9px] text-zinc-600 uppercase font-bold leading-none mt-0.5">{desc}</p>
        </div>
    </button>
);

const ToneItem = ({ id, label, current }: any) => (
    <div className={cn("p-2 rounded-lg border text-center text-[10px] font-black uppercase transition-all", current === id ? "bg-red-600 border-red-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-600")}>
        {label}
    </div>
);

export default Auth;