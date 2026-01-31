import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Activity, Users, LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Si no hay usuario logueado, mandar al login de ADMIN, no al de la app
    if (!user) {
      navigate('/admin/login'); 
      return;
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profile?.is_admin) {
      setIsAdmin(true);
    } else {
      // Si está logueado pero NO es admin, sacarlo de aquí
      toast.error("Acceso no autorizado. Área restringida.");
      navigate('/dashboard'); // O logout
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Verificando credenciales...</div>;
  if (!isAdmin) return null;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Prompts IA", icon: MessageSquare, path: "/admin/prompts" },
    { label: "Logs IA", icon: Activity, path: "/admin/logs" },
    { label: "Usuarios", icon: Users, path: "/admin/users" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="font-black text-xl flex items-center gap-2">
            <ShieldAlert className="text-primary" />
            HD ADMIN
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Nav (Top) */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-50 p-4 flex justify-between items-center">
        <span className="font-bold">Admin Panel</span>
        <Button size="sm" variant="outline" onClick={handleLogout}>Salir</Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto mt-14 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}