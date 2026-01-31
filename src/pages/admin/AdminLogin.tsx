import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, Lock } from "lucide-react";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      checkAdminStatus(session.user.id);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (profile?.is_admin) {
      navigate('/admin');
    } else {
      // If logged in but not admin, maybe sign them out or just stay here?
      // Better to sign out to allow admin login
      await supabase.auth.signOut();
    }
  };

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
        // Verify is_admin BEFORE letting them in
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', data.user.id)
          .single();

        if (profile?.is_admin) {
          toast.success("Acceso concedido");
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
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-red-900/20 p-4 rounded-full w-fit">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-wider uppercase">Heavy Duty Admin</CardTitle>
            <CardDescription className="text-zinc-400">Acceso restringido solo para personal autorizado</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="admin@heavyduty.app" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 pl-4"
                  required 
                />
              </div>
              <div className="relative">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 pl-4"
                  required 
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-zinc-500" />
              </div>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Verificando..." : "Entrar al Panel"}
            </Button>
          </form>
          <div className="mt-4 text-center">
             <Button variant="link" className="text-zinc-500 text-xs" onClick={() => navigate('/')}>
               ← Volver a la App
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;