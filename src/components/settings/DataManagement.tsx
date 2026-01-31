import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DataManagement() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Fetch all relevant data
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        // Note: Supabase Auth deletion typically requires service_role key server-side or calling an Edge Function.
        // For security, standard clients often can't delete the auth user directly.
        // However, we can delete the profile/logs which triggers cascading/cleanup or marks it deleted.
        // Here we'll simulate the request or call a function if it existed. 
        // For MVP, we'll wipe the profile data we can access.
        
        // Option A: Delete Profile (Cascade should handle logs if set up)
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* EXPORT SECTION */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" /> Exportar Datos
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Descarga una copia completa de tu historial de entrenamiento, logs de nutrición e interacciones con la IA en formato JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full border-zinc-700 hover:bg-zinc-900 text-zinc-300"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando archivo...</>
            ) : (
                "Descargar Archivo"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* DANGER ZONE */}
      <Card className="bg-red-950/10 border-red-900/30">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Zona de Peligro
          </CardTitle>
          <CardDescription className="text-red-400/70">
            Estas acciones son irreversibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-red-900 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 font-bold">¿Estás absolutamente seguro?</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Esta acción borrará permanentemente tu perfil, historial de entrenamientos, fotos de progreso y suscripción activa. No se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="w-full sm:w-auto"
                        >
                            {deleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>

    </div>
  );
}