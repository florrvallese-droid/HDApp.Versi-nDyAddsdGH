import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronLeft, ChevronRight, Dumbbell, Utensils, Camera, Zap, Loader2, Save, Plus, Trash2, Lock, 
  AlertCircle, DollarSign, Calendar, CheckCircle2, Bell, ClipboardList, TrendingUp, Gift, Trophy
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { WorkoutDetailDialog } from "@/components/workout/WorkoutDetailDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CoachProtocolManager } from "@/components/coach/CoachProtocolManager";
import { CompetitionManager } from "@/components/coach/CompetitionManager";

export default function CoachAthleteDetail() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);

  // Business State
  const [fee, setFee] = useState<string>("0");
  const [paymentStatus, setPaymentStatus] = useState<string>("up_to_date");
  const [isCompetitor, setIsCompetitor] = useState(false);

  useEffect(() => {
    if (athleteId) fetchAthleteData();
  }, [athleteId]);

  const fetchAthleteData = async () => {
    setLoading(true);
    try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', athleteId).single();
        setProfile(profileData);
        setIsCompetitor(profileData?.is_competitor || false);

        const { data: assignData } = await supabase.from('coach_assignments').select('*').eq('athlete_id', athleteId).single();
        setAssignment(assignData);
        setFee(assignData?.monthly_fee?.toString() || "0");
        setPaymentStatus(assignData?.payment_status || "up_to_date");

        const { data: logsData } = await supabase.from('logs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(30);
        setLogs(logsData || []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateFinance = async () => {
    setSaving(true);
    try {
        // Actualizar finanzas
        await supabase
            .from('coach_assignments')
            .update({ 
                monthly_fee: parseFloat(fee),
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            })
            .eq('athlete_id', athleteId);

        // Actualizar estado de competidor
        await supabase
            .from('profiles')
            .update({ is_competitor: isCompetitor })
            .eq('user_id', athleteId);

        toast.success("Ficha actualizada correctamente");
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setSaving(false);
    }
  };

  const markAsPaid = async () => {
    setSaving(true);
    try {
        const { data: { user: coach } } = await supabase.auth.getUser();
        await supabase.from('coach_payment_logs').insert({ coach_id: coach?.id, athlete_id: athleteId, amount: parseFloat(fee), period_month: new Date().getMonth() + 1, period_year: new Date().getFullYear() });
        await supabase.from('coach_assignments').update({ payment_status: 'up_to_date', next_payment_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd') }).eq('athlete_id', athleteId);
        await supabase.from('notifications').insert({ user_id: athleteId, title: "Pago recibido ✅", message: `Tu coach ha registrado el pago de tu cuota mensual.`, type: 'payment_received' });
        setPaymentStatus('up_to_date');
        toast.success("Pago registrado y notificado");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600 h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <WorkoutDetailDialog open={showWorkoutDetail} onOpenChange={setShowWorkoutDetail} workout={selectedWorkout} />

      <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500"><ChevronLeft className="h-6 w-6" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase italic tracking-tight leading-none mb-1">{profile?.display_name || "Atleta"}</h1>
          <div className="flex items-center gap-2">
             <Badge className={cn("text-[8px] h-4", paymentStatus === 'up_to_date' ? "bg-green-600" : paymentStatus === 'scholarship' ? "bg-blue-600" : "bg-red-600")}>
                {paymentStatus === 'up_to_date' ? "AL DÍA" : paymentStatus === 'scholarship' ? "CORTESÍA" : "DEUDA"}
             </Badge>
             {isCompetitor && <Badge variant="outline" className="text-[8px] h-4 border-yellow-500 text-yellow-500 bg-yellow-950/20 font-black">COMPETIDOR</Badge>}
             <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{profile?.discipline}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="progreso" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="progreso" className="flex-1 text-[9px] uppercase font-black"><TrendingUp className="w-3 h-3 mr-1.5"/> Log</TabsTrigger>
          <TabsTrigger value="protocolos" className="flex-1 text-[9px] uppercase font-black"><ClipboardList className="w-3 h-3 mr-1.5"/> Protocol</TabsTrigger>
          {isCompetitor && <TabsTrigger value="competencia" className="flex-1 text-[9px] uppercase font-black"><Trophy className="w-3 h-3 mr-1.5 text-yellow-500"/> Show</TabsTrigger>}
          <TabsTrigger value="finanzas" className="flex-1 text-[9px] uppercase font-black"><DollarSign className="w-3 h-3 mr-1.5"/> Biz</TabsTrigger>
        </TabsList>

        <TabsContent value="progreso" className="space-y-4 animate-in slide-in-from-left-2">
             {logs.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl"><p className="text-zinc-600 text-xs font-bold uppercase">Sin actividad</p></div>
             ) : (
                logs.filter(l => l.type === 'workout').map((log) => (
                    <Card key={log.id} className="bg-zinc-950 border-zinc-900 cursor-pointer hover:border-zinc-700" onClick={() => { setSelectedWorkout(log); setShowWorkoutDetail(true); }}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div><p className="text-[10px] text-zinc-500 font-bold uppercase">{format(new Date(log.created_at), "dd MMM yyyy", { locale: es })}</p><h4 className="font-black uppercase italic text-white">{log.muscle_group}</h4></div>
                        <ChevronRight className="h-4 w-4 text-zinc-700" />
                      </CardContent>
                    </Card>
                 ))
             )}
        </TabsContent>

        <TabsContent value="protocolos" className="animate-in slide-in-from-right-2">
            {athleteId && <CoachProtocolManager athleteId={athleteId} athleteName={profile?.display_name || "Atleta"} />}
        </TabsContent>

        {isCompetitor && (
          <TabsContent value="competencia" className="animate-in slide-in-from-bottom-2">
             {athleteId && <CompetitionManager athleteId={athleteId} />}
          </TabsContent>
        )}

        <TabsContent value="finanzas" className="space-y-6 animate-in slide-in-from-bottom-2">
            <Card className="bg-zinc-950 border-zinc-900">
                <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" /> Gestión de Ficha</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase italic text-white flex items-center gap-2"><Trophy className="h-3.5 w-3.5 text-yellow-500" /> Modo Competidor</p>
                            <p className="text-[10px] text-zinc-500">Activa calendario y protocolos de puesta a punto.</p>
                        </div>
                        <Switch checked={isCompetitor} onCheckedChange={setIsCompetitor} className="data-[state=checked]:bg-yellow-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Cuota Mensual (ARS)</Label>
                            <Input type="number" value={fee} onChange={e => setFee(e.target.value)} disabled={paymentStatus === 'scholarship'} className="bg-zinc-900 border-zinc-800 font-mono font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold">Estado del Alumno</Label>
                            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm font-bold">
                                <option value="up_to_date">✅ Al Día</option>
                                <option value="late">⚠️ Con Deuda</option>
                                <option value="unpaid">🛑 Impago</option>
                                <option value="scholarship">💎 Cortesía</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleUpdateFinance} disabled={saving} className="flex-1 bg-zinc-800 text-white font-bold text-[10px] uppercase h-12">
                           <Save className="h-3 w-3 mr-2" /> Guardar Cambios
                        </Button>
                        {paymentStatus !== 'scholarship' && (
                             <Button onClick={markAsPaid} disabled={saving || paymentStatus === 'up_to_date'} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase h-12">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar Pago Hoy
                             </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}