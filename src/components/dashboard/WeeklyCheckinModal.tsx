import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { 
    MessageCircle, Bell, Loader2, ClipboardCheck, 
    ChevronRight, Dumbbell, Scale, Camera 
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface WeeklyCheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  athleteName: string;
}

export function WeeklyCheckinModal({ open, onOpenChange, userId, athleteName }: WeeklyCheckinModalProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<'wa' | 'app' | null>(null);
  const [coachData, setCoachData] = useState<any>(null);
  const [stats, setStats] = useState<any>({ workouts: 0, weight: null, photos: 0 });

  useEffect(() => {
    if (open) {
      fetchCheckinData();
    }
  }, [open]);

  const fetchCheckinData = async () => {
    setLoading(true);
    try {
      // 1. Obtener Coach
      const { data: assignment } = await supabase
        .from('coach_assignments')
        .select('coach:coach_id(user_id, business_info)')
        .eq('athlete_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      setCoachData(assignment?.coach);

      // 2. Obtener Actividad de la semana (últimos 7 días)
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      
      const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo);

      const workouts = logs?.filter(l => l.type === 'workout').length || 0;
      const lastCheckin = logs?.filter(l => l.type === 'checkin').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      setStats({
        workouts,
        weight: lastCheckin?.data?.weight || "N/A",
        photos: lastCheckin?.data?.photos?.length || 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInApp = async () => {
    if (!coachData) return;
    setSending('app');
    
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: coachData.user_id,
        title: "Nuevo Chequeo Semanal",
        message: `${athleteName} ha enviado su resumen semanal: ${stats.workouts} entrenos, Peso: ${stats.weight}kg.`,
        type: 'checkin_alert'
      });

      if (error) throw error;
      toast.success("Notificación enviada al panel del coach");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Error al notificar: " + err.message);
    } finally {
      setSending(null);
    }
  };

  const handleSendWhatsApp = () => {
    const phone = coachData?.business_info?.whatsapp?.replace(/\D/g, '');
    if (!phone) {
      toast.error("El coach no tiene configurado su WhatsApp");
      return;
    }

    const message = `*CHEQUEO SEMANAL - HEAVY DUTY*%0A%0A` +
      `Atleta: *${athleteName}*%0A` +
      `Semana del: ${format(subDays(new Date(), 7), 'dd/MM')} al ${format(new Date(), 'dd/MM')}%0A%0A` +
      `💪 Entrenamientos: *${stats.workouts}*%0A` +
      `⚖️ Último Peso: *${stats.weight}kg*%0A` +
      `📸 Fotos enviadas: *${stats.photos}*%0A%0A` +
      `_Datos registrados en la bitácora digital._`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-zinc-900/50 border-b border-zinc-900">
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-red-500" /> Resumen Semanal
          </DialogTitle>
          <DialogDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
            Enviar reporte a tu preparador
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-xs text-zinc-500 uppercase font-bold animate-pulse">Recopilando métricas...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatBox icon={<Dumbbell className="h-3 w-3" />} label="Entrenos" value={stats.workouts} />
                <StatBox icon={<Scale className="h-3 w-3" />} label="Peso" value={`${stats.weight}kg`} />
                <StatBox icon={<Camera className="h-3 w-3" />} label="Fotos" value={stats.photos} />
              </div>

              {!coachData ? (
                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg text-center">
                  <p className="text-xs text-red-400 font-bold uppercase">No tienes un coach vinculado</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Vincula uno en Ajustes para enviar reportes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest text-center">Elegir método de envío</p>
                  
                  <Button 
                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic tracking-wider flex items-center justify-between px-6"
                    onClick={handleSendWhatsApp}
                  >
                    <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 fill-current" />
                        <span>Enviar por WhatsApp</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full h-14 bg-zinc-900 border-zinc-800 text-zinc-300 font-black uppercase italic tracking-wider flex items-center justify-between px-6 hover:bg-zinc-800 hover:text-white"
                    onClick={handleSendInApp}
                    disabled={!!sending}
                  >
                    <div className="flex items-center gap-3">
                        {sending === 'app' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bell className="h-5 w-5" />}
                        <span>Notificar en la App</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const StatBox = ({ icon, label, value }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center flex flex-col items-center gap-1">
        <div className="text-red-500 opacity-50">{icon}</div>
        <div className="text-xs font-black text-white">{value}</div>
        <div className="text-[8px] text-zinc-600 uppercase font-bold">{label}</div>
    </div>
);