import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isCoachIntent = searchParams.get("role") === "coach";
  const initialTab = searchParams.get("tab") || "login";

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        checkProfileAndRedirect(session.user.id);
      }
    };
    checkSession();
  }, []);

  const checkProfileAndRedirect = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_coach, display_name')
        .eq('user_id', userId)
        .maybeSingle();

      // Si tiene perfil y ha completado el nombre (fin de onboarding)
      if (profile && profile.display_name) {
        if (profile.is_coach) {
            navigate('/coach');
        } else {
            navigate('/dashboard');
        }
      } else {
        // Usuario nuevo o incompleto
        navigate('/onboarding');
      }
    } catch (err) {
      console.error("Redirect error:", err);
      navigate('/dashboard'); 
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        await checkProfileAndRedirect(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      toast.error(err.message || "Error al iniciar sesión");
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

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;
      
      toast.success("Cuenta creada. Verifica tu email.");
      setError("Te hemos enviado un link de confirmación a tu correo.");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Button 
        variant="ghost" 
        className="absolute top-6 left-6 text-zinc-400 hover:text-white z-50 hover:bg-zinc-900/50"
        onClick={() => navigate("/")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="w-full max-w-md bg-zinc-950 border-zinc-900 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">HEAVY DUTY</CardTitle>
          <CardDescription className={cn("text-xs font-bold uppercase tracking-widest", isCoachIntent ? "text-red-500" : "text-zinc-500")}>
            {isCoachIntent 
              ? "Acceso exclusivo para preparadores" 
              : "Ingreso a la bitácora inteligente"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-950/20 border-red-900/50 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger value="login" className="font-bold uppercase text-[10px]">Ingresar</TabsTrigger>
              <TabsTrigger value="signup" className="font-bold uppercase text-[10px]">Registro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border-zinc-800 h-12"
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black border-zinc-800 h-12"
                    required 
                  />
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="remember" defaultChecked className="border-zinc-700" />
                  <Label htmlFor="remember" className="text-xs text-zinc-500 font-medium">Recordar mi sesión</Label>
                </div>

                <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black border-zinc-800 h-12"
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Contraseña (min 8 caracteres)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black border-zinc-800 h-12"
                    required 
                    minLength={8} 
                  />
                  <Input 
                    type="password" 
                    placeholder="Confirmar Contraseña" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black border-zinc-800 h-12"
                    required 
                  />
                </div>
                <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "CREAR CUENTA ATLETA"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">System v1.1 • Secure Core</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;