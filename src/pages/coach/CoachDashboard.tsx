import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { 
  Search, Loader2, UserPlus, 
  Settings, Briefcase, TrendingUp, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { AddAthleteModal } from "@/components/coach/AddAthleteModal";
import { SmartBriefing } from "@/components/coach/SmartBriefing";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { LockedFeature } from "@/components/shared/LockedFeature";

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { profile, hasProAccess } = useProfile();
  
  const [data, setData] = useState<any>({
    clients: [],
    stats: { active: 0, late: 0, pendingReview: 0, birthdays: 0 }
  });
  
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (hasProAccess) {
        fetchCoachData();
    } else {
        setLoading(false);
    }
  }, [hasProAccess]);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assignments, error } = await supabase
        .from('coach_assignments')
        .select(`
          athlete_id, status, monthly_fee, payment_status, next_payment_date, last_checkin_reviewed_at,
          profiles:athlete_id (user_id, display_name, avatar_url, discipline, is_premium, birth_date)
        `)
        .eq('coach_id', user.id);

      if (error) throw error;

      const athleteIds = assignments?.map(a => a.athlete_id) || [];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: recentLogs } = await supabase
        .from('logs')
        .select('*')
        .in('user_id', athleteIds)
        .gte('created_at', yesterday.toISOString());

      const processedClients = assignments?.map(a => {
        const clientProfile = a.profiles as any;
        return { ...clientProfile, status: a.status, payment_status: a.payment_status, monthly_fee: a.monthly_fee };
      }) || [];

      setData({
        clients: processedClients,
        stats: { active: processedClients.length, late: processedClients.filter(c => c.payment_status !== 'up_to_date').length, pendingReview: 0, birthdays: 0 }
      });

      const snapshot = {
        financial_alerts: assignments?.filter(a => a.payment_status !== 'up_to_date').map(a => ({
            student: (a.profiles as any).display_name,
            issue: a.payment_status,
            value: a.monthly_fee
        })) || [],
        health_alerts: recentLogs?.filter(l => l.data.pain === true || l.data.verdict === 'REGRESSION').map(l => ({
            student: processedClients.find(c => c.user_id === l.user_id)?.display_name,
            issue: l.data.pain ? 'injury_reported' : 'regression'
        })) || [],
        marketing_opportunities: recentLogs?.filter(l => l.data.verdict === 'PROGRESS').map(l => ({
            student: processedClients.find(c => c.user_id === l.user_id)?.display_name,
            event: 'PR_BROKEN'
        })) || []
      };

      generateBriefing(user.id, profile?.display_name || "Coach", snapshot);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBriefing = async (userId: string, coachName: string, snapshot: any) => {
    const cached = localStorage.getItem(`brief_${userId}`);
    const cacheTime = localStorage.getItem(`brief_time_${userId}`);
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
        setBriefing(JSON.parse(cached));
        return;
    }

    setLoadingBrief(true);
    try {
        const brief = await aiService.getDashboardBriefing(coachName, snapshot);
        setBriefing(brief);
        localStorage.setItem(`brief_${userId}`, JSON.stringify(brief));
        localStorage.setItem(`brief_time_${userId}`, Date.now().toString());
    } catch (e) {
        console.error("Briefing error:", e);
    } finally {
        setLoadingBrief(false);
    }
  };

  if (!hasProAccess) {
      return (
        <div className="min-h-screen bg-black flex flex-col p-4">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-xl font-black uppercase italic text-white">Coach Hub</h1>
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-zinc-500 border border-zinc-900 h-11 w-11"><Settings className="w-5 h-5" /></Button>
            </div>
            <LockedFeature 
                title="Centro de Mando Bloqueado" 
                description="La gestión de equipo requiere una suscripción Coach Hub activa." 
            />
        </div>
      );
  }

  const filteredClients = data.clients.filter((c: any) => 
    c?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Determinar el nombre del equipo del coach
  const coachTeamName = profile?.business_info?.brand_name || profile?.display_name || "Preparador";

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <AddAthleteModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={fetchCoachData} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Business Unit</h1>
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Equipo {coachTeamName}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button 
                variant="outline" 
                className="flex-1 sm:flex-none bg-zinc-900 border-zinc-800 text-zinc-300 font-bold uppercase text-[10px] tracking-widest h-11 hover:text-white"
                onClick={() => navigate('/coach/business')}
            >
                <Briefcase className="w-3.5 h-3.5 mr-2 text-yellow-500" /> Mi Negocio
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-zinc-500 border border-zinc-900 h-11 w-11"><Settings className="w-5 h-5" /></Button>
        </div>
      </div>

      <SmartBriefing data={briefing} loading={loadingBrief} />

      <div className="h-px bg-zinc-900 w-full" />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
          <Input 
            placeholder="Buscar por nombre..." 
            className="bg-zinc-950 border-zinc-800 pl-10 h-12 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs h-12 px-8 shadow-lg shadow-red-900/20" onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Nuevo Alumno
        </Button>
      </div>

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
                    <Avatar className="h-12 w-12 border-2 border-zinc-800">
                      <AvatarImage src={client.avatar_url} />
                      <AvatarFallback className="bg-zinc-900 text-zinc-500 font-bold">{client.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase text-sm text-white group-hover:text-red-500 transition-colors">{client.display_name}</span>
                        {client.payment_status !== 'up_to_date' && <Badge variant="destructive" className="text-[8px] h-4">DEUDA</Badge>}
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