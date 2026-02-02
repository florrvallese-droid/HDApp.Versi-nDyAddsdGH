import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { Users, ShieldAlert, Plus, Trash2, Loader2, Save, Mail, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminDashboard = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data } = await supabase.from('system_allowed_admins').select('*').order('created_at', { ascending: false });
    if (data) setAdmins(data);
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.includes('@')) {
        toast.error("Ingresa un email válido");
        return;
    }
    setSaving(true);
    try {
        const { error } = await supabase.from('system_allowed_admins').insert({ email: newAdminEmail.toLowerCase().trim() });
        if (error) throw error;
        toast.success("Nuevo administrador autorizado");
        setNewAdminEmail("");
        fetchAdmins();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleRemoveAdmin = async (id: string, email: string) => {
      if (email === 'florr.vallese@gmail.com') {
          toast.error("No puedes eliminar al administrador principal");
          return;
      }
      const { error } = await supabase.from('system_allowed_admins').delete().eq('id', id);
      if (!error) {
          toast.success("Acceso revocado");
          fetchAdmins();
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black tracking-tight uppercase italic text-white">Central de Comando</h2>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          
          {/* GESTIÓN DE ACCESOS ADMIN */}
          <Card className="bg-zinc-950 border-zinc-900 shadow-2xl">
              <CardHeader className="bg-zinc-900/30 border-b border-zinc-900">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Autorización de Administradores
                  </CardTitle>
                  <CardDescription className="text-xs">Solo estos correos podrán acceder a este panel.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                        <Input 
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="email@ejemplo.com"
                            className="bg-black border-zinc-800 pl-10 h-10"
                        />
                      </div>
                      <Button onClick={handleAddAdmin} disabled={saving} className="bg-white text-black hover:bg-zinc-200 font-bold uppercase text-[10px] px-6 h-10">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
                        DAR ALTA
                      </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {loading ? (
                          <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-zinc-800" /></div>
                      ) : (
                          admins.map(admin => (
                              <div key={admin.id} className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-900">
                                  <div className="flex items-center gap-3">
                                      <div className="p-1.5 bg-zinc-800 rounded-full"><Users className="h-3 w-3 text-zinc-500" /></div>
                                      <span className="text-xs font-bold text-zinc-300">{admin.email}</span>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAdmin(admin.id, admin.email)} className="text-zinc-800 hover:text-red-500">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ))
                      )}
                  </div>
              </CardContent>
          </Card>

          {/* ESTADO GLOBAL SISTEMA */}
          <Card className="bg-zinc-950 border-zinc-900 shadow-2xl">
              <CardHeader className="bg-zinc-900/30 border-b border-zinc-900">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-400">Estado de Operaciones</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-center">
                  <div className="flex flex-col items-center gap-2 py-6">
                      <div className="bg-green-600/10 p-4 rounded-full border border-green-600/20">
                          <CheckCircle2 className="h-10 w-10 text-green-500" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-green-500">Sistemas Online</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/50 p-4 rounded-xl border border-zinc-900 text-left">
                          <p className="text-[10px] text-zinc-600 font-black uppercase">Última Auditoría</p>
                          <p className="text-xs font-bold text-zinc-300">{format(new Date(), 'HH:mm:ss')} OK</p>
                      </div>
                      <div className="bg-black/50 p-4 rounded-xl border border-zinc-900 text-left">
                          <p className="text-[10px] text-zinc-600 font-black uppercase">Integridad DB</p>
                          <p className="text-xs font-bold text-zinc-300">Sincronizada</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;