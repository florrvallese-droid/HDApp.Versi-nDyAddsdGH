import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

const ADMIN_EMAIL = "florr.vallese@gmail.com";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setInputEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario ya tiene una sesión activa con el mail correcto
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            setAlreadyLoggedIn(true);
        }
    };
    checkSession();
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      toast.error("Este correo no tiene permisos de administración.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;
      setSent(true);
      toast.success("Enlace de acceso enviado a tu casilla.");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el enlace");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToAdmin = () => {
      navigate('/admin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-red-600" />
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto bg-red-900/20 p-4 rounded-full w-fit mb-2">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-wider uppercase italic">Cerebro Heavy Duty</CardTitle>
            <CardDescription className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Acceso Restringido Propietario</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {alreadyLoggedIn ? (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in">
                <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-xl space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-bold text-white">Sesión Identificada</p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black">{ADMIN_EMAIL}</p>
                </div>
                <Button 
                    onClick={handleGoToAdmin}
                    className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest"
                >
                    ENTRAR AL PANEL <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="link" className="text-zinc-600 text-xs uppercase font-bold" onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}>
                    Cerrar sesión e ingresar con otro mail
                </Button>
            </div>
          ) : sent ? (
            <div className="space-y-6 text-center py-4 animate-in slide-in-from-bottom-4">
                <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-xl space-y-3">
                    <Mail className="h-10 w-10 text-blue-500 mx-auto animate-bounce" />
                    <p className="text-sm font-bold text-white uppercase tracking-tight">¡Enlace Enviado!</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Revisá tu correo <strong>{email}</strong> y hacé click en el botón de acceso.
                    </p>
                </div>
                <Button variant="outline" className="w-full border-zinc-800 text-zinc-500 h-12 uppercase font-bold text-xs" onClick={() => setSent(false)}>
                    Volver a intentar
                </Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] ml-1">Email de Propietario</Label>
                <div className="relative">
                    <Input 
                        type="email" 
                        placeholder="tu@email.com" 
                        value={email}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="bg-black border-zinc-800 h-14 pl-12 font-bold text-white placeholder:text-zinc-800"
                        required 
                    />
                    <Mail className="absolute left-4 top-5 h-4 w-4 text-zinc-700" />
                </div>
              </div>
              <Button 
                className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-sm shadow-xl shadow-red-900/20" 
                type="submit" 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "SOLICITAR ACCESO DIRECTO"}
              </Button>
              <p className="text-[9px] text-zinc-700 text-center uppercase font-black tracking-tighter italic">
                El sistema enviará un código de un solo uso para verificar tu identidad biométrica.
              </p>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
             <Button variant="link" className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest" onClick={() => navigate('/')}>
                ← VOLVER A LA APP PÚBLICA
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;