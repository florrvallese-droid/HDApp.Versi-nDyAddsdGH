import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, Activity, Users, LogOut, ShieldAlert, Flag, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/admin/login'); 
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        toast.error("Acceso no autorizado. Área restringida.");
        navigate('/dashboard');
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Verificando credenciales...</div>;
  if (!isAdmin) return null;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Prompts IA", icon: MessageSquare, path: "/admin/prompts" },
    { label: "Logs IA", icon: Activity, path: "/admin/logs" },
    { label: "Usuarios", icon: Users, path: "/admin/users" },
    { label: "Feature Flags", icon: Flag, path: "/admin/flags" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const NavContent = () => (
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
            variant={location.pathname === item.path ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="p-4 border-t mt-auto">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col h-screen sticky top-0">
        <NavContent />
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
              <NavContent />
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
}