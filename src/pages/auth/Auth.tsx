import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Loader2, MailCheck, User, Dumbbell, Users, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifyStep, setIsVerifyStep] = useState(false);
  
  // Wizard State - Initialize from URL if present
  const [signupStep, setSignupStep] = useState(1);
  const [role, setRole] = useState<'athlete' | 'coach' | 'agency'>(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "coach" || urlRole === "agency") return urlRole;
    return "athlete";
  });
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');

  const initialTab = searchParams.get("tab") || "login";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("[Auth] Attempting login for:", email);
    
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      console.log("[Auth] Login successful");
      navigate('/dashboard');
    } catch (err: any) {
      console.error("[Auth] Login failed:", err.message);
      setError(err.message || "Error al iniciar sesión");
      toast.error("Credenciales inválidas");
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("[Auth] Starting signup process", { role, displayName, sex });

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            display_name: displayName,
            role: role, 
            sex: sex
          }
        }
      });

      if (signupError) throw signupError;
      console.log("[Auth] Signup successful, verification email sent");
      setIsVerifyStep(true);
      toast.success("Cuenta creada. Por favor verifica tu email.");
    } catch (err: any) {
      console.error("[Auth] Signup error:", err.message);
      setError(err.message);
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
            <CardTitle className="text-2xl font-black uppercase italic text-white">¡CASI LISTO!</CardTitle>
            <CardDescription className="text-zinc-400">
              Enviamos un enlace a <strong className="text-white">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Verificá tu correo para activar tu perfil y empezar con el trial de 7 días.
            </p>
            <Button variant="outline" className="w-full border-zinc-800 text-zinc-300 font-bold h-12" onClick={() => window.location.reload()}>
                YA VERIFIQUÉ, ENTRAR
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
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">HEAVY DUTY</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Bitácora Inteligente & IA Coach</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger value="login" className="font-bold uppercase text-[10px]">Ingresar</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold uppercase text-[10px]">Registro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                  <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                </div>
                <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="mt-6 space-y-6">
                
                {signupStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest text-center block mb-4">¿Cuál es tu rol?</Label>
                        <div className="grid gap-3">
                            <RoleBtn active={role === 'athlete'} onClick={() => setRole('athlete')} icon={<Dumbbell/>} title="Atleta" desc="Para registrar mis entrenos." />
                            <RoleBtn active={role === 'coach'} onClick={() => setRole('coach')} icon={<Users/>} title="Coach" desc="Para gestionar a mi equipo." />
                            <RoleBtn active={role === 'agency'} onClick={() => setRole('agency')} icon={<Building2/>} title="Agencia" desc="Gestión de múltiples coaches." />
                        </div>
                        <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" onClick={() => setSignupStep(2)}>
                            CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {signupStep === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Nombre Completo / Marca</Label>
                            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-black border-zinc-800 h-12 font-bold" placeholder="Ej: Iron Team" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sexo Biológico</Label>
                            <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-1 rounded-lg">
                                {(['male', 'female', 'other'] as const).map(s => (
                                    <button key={s} onClick={() => setSex(s)} className={cn("py-2 text-[10px] font-black uppercase rounded transition-all", sex === s ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600")}>
                                        {s === 'male' ? 'H' : s === 'female' ? 'M' : 'X'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="flex-1 text-zinc-500 font-bold uppercase text-[10px]" onClick={() => setSignupStep(1)}>Volver</Button>
                            <Button className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" onClick={() => setSignupStep(3)} disabled={!displayName}>
                                CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {signupStep === 3 && (
                    <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-zinc-500 text-[10px] font-black uppercase">Email</Label>
                                <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-zinc-500 text-[10px] font-black uppercase">Contraseña</Label>
                                <Input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required minLength={8} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-zinc-500 text-[10px] font-black uppercase">Confirmar Contraseña</Label>
                                <Input type="password" placeholder="Repite la clave" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-black border-zinc-800 h-12" required />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button variant="ghost" type="button" className="flex-1 text-zinc-500 font-bold uppercase text-[10px]" onClick={() => setSignupStep(2)}>Volver</Button>
                            <Button className="flex-[2] h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase italic" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "CREAR MI CUENTA"}
                            </Button>
                        </div>
                    </form>
                )}

              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">System v1.2 • Perfil Pre-Cargado</p>
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

export default Auth;