import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { 
    ChevronLeft, Loader2, MailCheck, 
    ShieldCheck, Trophy, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "login");
  const [loading, setLoading] = useState(false);
  const [isVerifyStep, setIsVerifyStep] = useState(false);

  const [formData, setFormData] = useState({
    role: 'athlete' as 'athlete' | 'coach',
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: formData.email.trim().toLowerCase(), 
        password: formData.password
      });
      
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Error al ingresar");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 8) {
        toast.error("La contraseña debe tener al menos 8 caracteres.");
        return;
    }

    setLoading(true);
    
    const cleanEmail = formData.email.trim().toLowerCase();
    const metadata = {
        role: formData.role,
    };

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
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

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              Te enviamos un link de confirmación a <br/> <strong className="text-white">{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-[10px] text-zinc-500 uppercase font-bold leading-relaxed">
                Hacé clic en el link del mail para activar tu cuenta y entrar directamente al Dashboard.
            </div>
            <Button 
                variant="outline" 
                className="w-full border-zinc-800 text-zinc-300 font-bold h-12" 
                onClick={() => {
                    setIsVerifyStep(false);
                    setActiveTab('login');
                }}
            >
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
                  <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} className="bg-black border-zinc-800 h-12" required />
                  <Input type="password" placeholder="Contraseña" value={formData.password} onChange={(e) => handleFormChange('password', e.target.value)} className="bg-black border-zinc-800 h-12" required />
                </div>
                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ACCEDER"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Tu Función</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => handleFormChange('role', 'athlete')} className={cn("p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all", formData.role === 'athlete' ? "border-red-600 bg-red-600/10" : "border-zinc-900 bg-zinc-900/40 text-zinc-500")}>
                            <Trophy className={cn("h-4 w-4", formData.role === 'athlete' ? "text-red-500" : "text-zinc-700")} />
                            <span className="font-black uppercase text-xs tracking-widest">Atleta</span>
                        </button>
                        <button type="button" onClick={() => handleFormChange('role', 'coach')} className={cn("p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all", formData.role === 'coach' ? "border-blue-600 bg-blue-600/10" : "border-zinc-900 bg-zinc-900/40 text-zinc-500")}>
                            <Briefcase className={cn("h-4 w-4", formData.role === 'coach' ? "text-blue-500" : "text-zinc-700")} />
                            <span className="font-black uppercase text-xs tracking-widest">Coach</span>
                        </button>
                    </div>
                </div>
                <div className="space-y-3">
                    <Input type="email" placeholder="Email" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} className="bg-black border-zinc-800 h-12" required />
                    <Input type="password" placeholder="Contraseña (mín. 8 caracteres)" value={formData.password} onChange={e => handleFormChange('password', e.target.value)} className="bg-black border-zinc-800 h-12" required minLength={8} />
                    <Input type="password" placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={e => handleFormChange('confirmPassword', e.target.value)} className="bg-black border-zinc-800 h-12" required />
                </div>
                <Button className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "FINALIZAR REGISTRO"}
                </Button>
              </form>
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

export default Auth;