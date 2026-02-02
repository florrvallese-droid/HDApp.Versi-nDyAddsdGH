import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, Lock, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
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

      if (error) throw error;

      if (data.user) {
        // Buscamos el perfil directamente
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (profileError) throw new Error("Error verificando permisos.");

        if (profile?.is_admin) {
          toast.success("Nivel de acceso verificado.");
          navigate('/admin');
        } else {
          toast.error("No tienes permisos de administrador.");
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
          <div className="mx-auto bg-red-900/20 p-4 rounded-full w-fit">
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
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950 border-zinc-800 h-12"
                required 
              />
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Password" 
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
          <div className="mt-6 text-center">
             <Button variant="link" className="text-zinc-600 text-xs uppercase font-bold tracking-tighter" onClick={() => navigate('/')}>
               ← Volver a la App
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;