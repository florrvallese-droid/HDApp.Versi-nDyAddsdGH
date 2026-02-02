import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Activity, Users, LogOut, ShieldAlert, Flag, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Prompts IA", icon: MessageSquare, path: "/admin/prompts" },
  { label: "Logs IA", icon: Activity, path: "/admin/logs" },
  { label: "Usuarios", icon: Users, path: "/admin/users" },
  { label: "Feature Flags", icon: Flag, path: "/admin/flags" },
];

const NavContent = ({ currentPath, onNavigate, onLogout }: { currentPath: string, onNavigate: (path: string) => void, onLogout: () => void }) => (
  <div className="flex flex-col h-full">
    <div className="p-6 border-b border-zinc-800">
      <h1 className="font-black text-xl flex items-center gap-2 text-white uppercase italic">
        <ShieldAlert className="text-red-600" />
        HD ADMIN
      </h1>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={currentPath === item.path ? "secondary" : "ghost"}
          className="w-full justify-start gap-2 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => onNavigate(item.path)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
    <div className="p-4 border-t border-zinc-800 mt-auto">
      <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/20" onClick={onLogout}>
        <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
      </Button>
    </div>
  </div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Escape hatch: si después de 5 segundos sigue cargando, algo falló
    const timer = setTimeout(() => {
      if (loading) {
        console.error("Admin verification timeout");
        setLoading(false);
        navigate('/dashboard');
      }
    }, 5000);

    const checkAdmin = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          navigate('/admin/login'); 
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.is_admin) {
          setIsAdmin(true);
        } else {
          toast.error("No tienes permisos de administrador.");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    };

    checkAdmin();
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-zinc-400">
        <ShieldAlert className="h-12 w-12 text-red-600 animate-pulse" />
        <span className="font-bold uppercase tracking-widest text-xs animate-pulse">Autenticando Nivel de Acceso...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 hidden md:flex flex-col h-screen sticky top-0">
        <NavContent currentPath={location.pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-zinc-950 border-b border-zinc-900 z-50 p-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-zinc-900">
              <NavContent currentPath={location.pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
          <span className="font-black uppercase italic text-sm text-white">ADMIN CENTER</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;