import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { 
  Users, Activity, ChevronRight, Search, UserCheck, Loader2, UserPlus, 
  Settings, LogOut, DollarSign, AlertCircle, Cake, ClipboardCheck, TrendingUp,
  UserMinus, Briefcase, BarChart3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AddAthleteModal } from "@/components/coach/AddAthleteModal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CoachDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({
    clients: [],
    stats: { active: 0, late: 0, pendingReview: 0, birthdays: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assignments, error } = await supabase
        .from('coach_assignments')
        .select(`
          athlete_id,
          status,
          monthly_fee,
          payment_status,
          next_payment_date,
          last_checkin_reviewed_at,
          profiles:athlete_id (
            user_id,
            display_name,
            avatar_url,
            discipline,
            is_premium,
            birth_date
          )
        `)
        .eq('coach_id', user.id);

      if (error) throw error;

      const athleteIds = assignments?.map(a => a.athlete_id) || [];
      const { data: checkins } = await supabase
        .from('logs')
        .select('user_id, created_at')
        .in('user_id', athleteIds)
        .eq('type', 'checkin')
        .order('created_at', { ascending: false });

      const today = new Date();
      let lateCount = 0;
      let reviewCount = 0;
      let birthdayCount = 0;

      const processedClients = assignments?.map(a => {
        const profile = a.profiles as any;
        const lastReview = a.last_checkin_reviewed_at;
        const lastCheckin = checkins?.find(c => c.user_id === a.athlete_id);
        
        if (a.payment_status !== 'up_to_date') lateCount++;

        const needsReview = lastCheckin && (!lastReview || new Date(lastCheckin.created_at) > new Date(lastReview));
        if (needsReview) reviewCount++;

        if (profile?.birth_date) {
            const bday = new Date(profile.birth_date);
            if (bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate()) {
                birthdayCount++;
            }
        }

        return { ...profile, status: a.status, payment_status: a.payment_status, monthly_fee: a.monthly_fee, needsReview };
      }) || [];

      setData({
        clients: processedClients,
        stats: { active: processedClients.filter(c => c.status === 'active').length, late: lateCount, pendingReview: reviewCount, birthdays: birthdayCount }
      });
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = data.clients.filter((c: any) => 
    c?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <AddAthleteModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={fetchCoachData} />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Business Unit</h1>
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest">Gestión de Equipo Di Iorio</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button 
                variant="outline" 
                className="flex-1 sm:flex-none bg-zinc-900 border-zinc-800 text-zinc-300 font-bold uppercase text-[10px] tracking-widest h-10 hover:text-white"
                onClick={() => navigate('/coach/business')}
            >
                <Briefcase className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Mi Negocio
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-zinc-500 border border-zinc-900 h-10 w-10"><Settings className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Activos" value={data.stats.active} icon={<Users className="w-4 h-4 text-blue-500" />} />
        <MetricCard label="Deuda" value={data.stats.late} icon={<AlertCircle className="w-4 h-4 text-red-500" />} color="text-red-500" />
        <MetricCard label="Chequeos" value={data.stats.pendingReview} icon={<ClipboardCheck className="w-4 h-4 text-yellow-500" />} />
        <MetricCard label="Cumpleaños" value={data.stats.birthdays} icon={<Cake className="w-4 h-4 text-pink-500" />} color="text-pink-500" />
      </div>

      {/* QUICK ACTIONS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
          <Input 
            placeholder="Buscar por nombre..." 
            className="bg-zinc-900 border-zinc-800 pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] h-11 px-6 shadow-lg shadow-red-900/20" onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Nuevo Alumno
        </Button>
      </div>

      {/* CLIENTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest px-1">
           <TrendingUp className="h-3 w-3" /> Estado de Alumnos
        </div>

        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600 h-8 w-8" /></div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl">
            <p className="text-zinc-600 text-sm font-bold uppercase">Sin resultados</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredClients.map((client: any) => (
              <Card 
                key={client.user_id} 
                className={cn("bg-zinc-950 border-zinc-900 transition-all hover:border-zinc-800 group", client.status !== 'active' && "opacity-50 grayscale")}
                onClick={() => navigate(`/coach/athlete/${client.user_id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-zinc-800">
                          <AvatarImage src={client.avatar_url} />
                          <AvatarFallback className="bg-zinc-900 text-zinc-500 font-bold">{client.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {client.needsReview && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full border-2 border-black animate-pulse" />
                        )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase text-sm text-white group-hover:text-red-500 transition-colors">{client.display_name}</span>
                        {client.payment_status === 'late' && <Badge variant="destructive" className="text-[8px] h-4">DEUDA</Badge>}
                      </div>
                      <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-bold uppercase">
                         <span>{client.discipline}</span>
                         <span>•</span>
                         <span className="text-green-600 font-mono">${client.monthly_fee}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-800 group-hover:text-white transition-all" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MetricCard = ({ label, value, icon, color = "text-white" }: any) => (
  <Card className="bg-zinc-950 border-zinc-900">
    <CardContent className="p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between text-zinc-600 uppercase text-[8px] font-black tracking-widest">
        {label}
        {icon}
      </div>
      <div className={cn("text-2xl font-black italic", color)}>{value}</div>
    </CardContent>
  </Card>
);