import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, Lock, Loader2, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setInputEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
            throw new Error("El email aún no ha sido confirmado. Revisá tu casilla.");
        }
        throw error;
      }

      if (data.user) {
        // Buscamos el perfil directamente
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profileError) throw new Error("Error verificando permisos de base de datos.");

        if (profile?.is_admin) {
          toast.success("Acceso administrativo concedido.");
          navigate('/admin');
        } else {
          toast.error("Tu cuenta no tiene nivel de acceso ADMINISTRADOR.");
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-red-900/20 p-4 rounded-full w-fit mb-2">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-wider uppercase italic">Heavy Duty Admin</CardTitle>
            <CardDescription className="text-zinc-400">Control Central de Inteligencia</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Email de Administrador" 
                value={email}
                onChange={(e) => setInputEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 h-12"
                required 
              />
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 h-12"
                  required 
                />
                <Lock className="absolute right-3 top-4 h-4 w-4 text-zinc-600" />
              </div>
            </div>
            <Button 
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest" 
              type="submit" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "ENTRAR AL PANEL"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 space-y-4">
             <div className="flex items-start gap-3 bg-blue-900/10 p-4 rounded-lg border border-blue-900/20">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-400 font-bold uppercase leading-relaxed">
                    Si acabás de registrarte, recordá confirmar tu email antes de intentar ingresar al panel de control.
                </p>
             </div>
             <div className="text-center">
                <Button variant="link" className="text-zinc-600 text-xs uppercase font-bold tracking-tighter" onClick={() => navigate('/')}>
                    ← Volver a la App
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;