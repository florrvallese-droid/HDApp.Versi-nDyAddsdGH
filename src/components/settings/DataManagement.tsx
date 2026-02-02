import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Trash2, AlertTriangle, Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DataManagement() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || null);
    };
    getUser();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: logs } = await supabase.from('logs').select('*').eq('user_id', user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      const { data: aiLogs } = await supabase.from('ai_logs').select('*').eq('user_id', user.id);

      const exportData = {
        user_id: user.id,
        exported_at: new Date().toISOString(),
        profile,
        logs: logs || [],
        ai_history: aiLogs || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heavyduty-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Datos exportados correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al exportar datos: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success("Contraseña actualizada correctamente");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Error al actualizar: " + error.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { error } = await supabase.from('profiles').delete().eq('user_id', user.id);
        if (error) throw error;

        await supabase.auth.signOut();
        toast.success("Cuenta eliminada y datos borrados.");
        navigate('/');
    } catch (error: any) {
        toast.error("Error eliminando cuenta: " + error.message);
        setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* INFO SECTION */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-black uppercase italic text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-500" /> Cuenta de Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Email Vinculado</span>
            <span className="text-white font-bold text-sm">{userEmail || "Cargando..."}</span>
          </div>
        </CardContent>
      </Card>

      {/* SECURITY SECTION */}
      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
        <CardHeader className="bg-zinc-900/50 border-b border-zinc-900">
          <CardTitle className="text-lg font-black uppercase italic text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-500" /> Seguridad
          </CardTitle>
          <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Cambiar contraseña de acceso</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Nueva Contraseña</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-black border-zinc-800 h-11 pr-10"
                placeholder="Mínimo 8 caracteres"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Confirmar Contraseña</Label>
            <Input 
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black border-zinc-800 h-11"
            />
          </div>
          <Button 
            onClick={handleUpdatePassword}
            disabled={updatingPassword || !newPassword}
            className="w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase italic tracking-widest text-[10px]"
          >
            {updatingPassword ? <Loader2 className="animate-spin h-4 w-4" /> : <Lock className="h-3 w-3 mr-2" />}
            Actualizar Credenciales
          </Button>
        </CardContent>
      </Card>

      {/* EXPORT SECTION */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase italic text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-green-500" /> Mi Bitácora (JSON)
          </CardTitle>
          <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Descarga una copia completa de tu historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full border-zinc-800 bg-black/40 hover:bg-zinc-900 text-zinc-400 font-bold uppercase text-[10px] tracking-widest h-11"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando...</>
            ) : (
                "Exportar mi Historial"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="bg-red-950/10 border-red-900/30">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase italic text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Zona Crítica
          </CardTitle>
          <CardDescription className="text-red-400/50 text-[10px] font-bold uppercase tracking-widest">
            Estas acciones no se pueden deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full bg-red-900/20 hover:bg-red-900 text-red-500 hover:text-white border border-red-900/50 font-black uppercase italic text-[10px] tracking-widest h-11">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta Definitivamente
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-red-900 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 font-black uppercase italic">¿ESTÁS ABSOLUTAMENTE SEGURO?</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Esta acción borrará permanentemente tu perfil, historial de entrenamientos, fotos de progreso y suscripción activa. El acceso a la IA será revocado de inmediato.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="w-full font-black uppercase italic"
                        >
                            {deleting ? "Eliminando..." : "SÍ, BORRAR TODO"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>

    </div>
  );
}