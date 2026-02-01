import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { Users, Activity, ChevronRight, Search, UserCheck, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AddAthleteModal } from "../../components/coach/AddAthleteModal";

const CoachDashboard = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coach_assignments')
        .select(`
          athlete_id,
          status,
          profiles:athlete_id (
            user_id,
            display_name,
            avatar_url,
            discipline,
            is_premium
          )
        `)
        .eq('coach_id', user.id);

      if (error) throw error;
      
      const athleteList = data?.map(d => ({
        ...d.profiles,
        status: d.status
      })) || [];
      setClients(athleteList);
    } catch (err: any) {
      toast.error("Error cargando alumnos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <AddAthleteModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
        onSuccess={fetchClients} 
      />

      <div className="flex justify-between items-start border-b border-zinc-900 pb-6">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <UserCheck className="text-red-600 h-8 w-8" /> Panel de Coach
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gestión de Atletas</p>
        </div>
        <Button 
            className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-4"
            onClick={() => setShowAddModal(true)}
        >
            <UserPlus className="h-4 w-4 mr-2" /> Vincular Atleta
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Atletas" value={clients.filter(c => c.status === 'active').length.toString()} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Pendientes" value={clients.filter(c => c.status === 'pending').length.toString()} icon={<Activity className="w-4 h-4 text-yellow-500" />} />
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
          <Input 
            placeholder="Buscar atleta..." 
            className="bg-zinc-900 border-zinc-800 pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-700" /></div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl">
            <Users className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No tienes atletas asignados.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredClients.map((client) => (
              <Card 
                key={client.user_id} 
                className={cn(
                    "bg-zinc-900 border-zinc-800 transition-all active:scale-[0.99]",
                    client.status === 'active' ? "hover:border-zinc-700 cursor-pointer" : "opacity-60 grayscale border-dashed"
                )}
                onClick={() => client.status === 'active' && navigate(`/coach/athlete/${client.user_id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-zinc-800">
                      <AvatarImage src={client.avatar_url} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                        {client.display_name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase text-sm text-white">{client.display_name || "Atleta Pendiente"}</span>
                        {client.is_premium && <Badge className="bg-yellow-600 text-[8px] h-4">PRO</Badge>}
                        {client.status === 'pending' && <Badge variant="outline" className="text-[8px] h-4 border-yellow-600/50 text-yellow-600">ESPERANDO ACEPTACIÓN</Badge>}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{client.discipline || "General"}</span>
                    </div>
                  </div>
                  {client.status === 'active' && <ChevronRight className="h-5 w-5 text-zinc-700" />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

const StatCard = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <Card className="bg-zinc-950 border-zinc-900">
    <CardContent className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between text-zinc-500 uppercase text-[9px] font-black tracking-widest">
        {label}
        {icon}
      </div>
      <div className="text-2xl font-black text-white italic">{value}</div>
    </CardContent>
  </Card>
);

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default CoachDashboard;