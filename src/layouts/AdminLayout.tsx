import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Activity, Users, LogOut, ShieldAlert, Flag, Menu, History, ShieldCheck } from "lucide-react";
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
    <div className="p-6 border-b md:border-none">
      <h1 className="font-black text-xl flex items-center gap-2">
        <ShieldAlert className="text-primary" />
        HD ADMIN
      </h1>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={currentPath === item.path ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => onNavigate(item.path)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
    <div className="p-4 border-t mt-auto">
      <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onLogout}>
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
    const checkAdmin = async () => {
      try {
        // Obtenemos la sesión actual de forma segura
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.warn("No active session for admin area.");
          navigate('/admin/login'); 
          return;
        }

        // Consultamos el perfil verificando específicamente el campo is_admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
            console.error("Error fetching admin profile:", profileError);
            toast.error("Error al verificar permisos.");
            navigate('/dashboard');
            return;
        }

        if (profile?.is_admin) {
          setIsAdmin(true);
        } else {
          toast.error("Acceso no autorizado.");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Critical admin check failed:", error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <ShieldAlert className="h-12 w-12 text-red-600 animate-pulse" />
        <span className="font-bold uppercase tracking-widest text-xs">Verificando Credenciales...</span>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col h-screen sticky top-0">
        <NavContent currentPath={location.pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-background border-b z-50 p-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent currentPath={location.pathname} onNavigate={handleNavigate} onLogout={handleLogout} />
            </SheetContent>
          </Sheet>
          <span className="font-bold">Admin Panel</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;