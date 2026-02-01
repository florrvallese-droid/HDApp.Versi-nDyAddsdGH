import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Users, MessageCircle, Instagram, Calendar, DollarSign, 
    ShieldCheck, Loader2, Cake, ExternalLink, AlertCircle, UserMinus, Trash2, Award, Check, Tag, Star, Copy
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CoachInfo({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    fetchCoachData();
  }, [userId]);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coach_assignments')
        .select(`
          id,
          status,
          monthly_fee,
          payment_status,
          next_payment_date,
          coach:coach_id (
            user_id,
            display_name,
            avatar_url,
            birth_date,
            business_info
          )
        `)
        .eq('athlete_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (data) setAssignment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const { error } = await supabase
        .from('coach_assignments')
        .delete()
        .eq('athlete_id', userId);

      if (error) throw error;

      toast.success("Has desvinculado a tu preparador");
      setAssignment(null);
    } catch (err: any) {
      toast.error("Error al desvincular: " + err.message);
    } finally {
      setUnlinking(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado: " + code);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-red-600" /></div>;

  if (!assignment) {
    return (
      <div className="text-center py-20 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl space-y-4">
         <Users className="h-12 w-12 text-zinc-800 mx-auto" />
         <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">No tienes un coach vinculado actualmente.</p>
         <p className="text-[10px] text-zinc-700 px-10">Tu preparador debe enviarte una invitación por correo para aparecer aquí.</p>
      </div>
    );
  }

  const coach = assignment.coach;
  const business = coach?.business_info || {};
  const collabs = business.collaborations || [];
  
  const whatsappUrl = business.whatsapp 
    ? `https://wa.me/${business.whatsapp.replace(/\D/g, '')}` 
    : null;
    
  const instagramUrl = business.instagram 
    ? `https://instagram.com/${business.instagram.replace('@', '')}` 
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* CARD PRINCIPAL COACH */}
      <Card className="bg-zinc-950 border-zinc-900 overflow-hidden">
        <CardHeader className="bg-zinc-900/50 border-b border-zinc-900 pb-6">
           <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border-2 border-red-600 p-0.5 overflow-hidden">
                 <img 
                    src={coach?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'} 
                    className="w-full h-full object-cover rounded-full" 
                 />
              </div>
              <div>
                 <h3 className="text-xl font-black uppercase italic text-white leading-none">
                    {business.brand_name || coach?.display_name}
                 </h3>
                 <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mt-1">Preparador Oficial</p>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
           
           <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] tracking-widest h-12"
                onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank')}
                disabled={!whatsappUrl}
              >
                <MessageCircle className="w-4 h-4 mr-2 fill-current" /> WhatsApp
              </Button>
              <Button 
                variant="outline"
                className="border-zinc-800 bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest h-12"
                onClick={() => instagramUrl && window.open(instagramUrl, '_blank')}
                disabled={!instagramUrl}
              >
                <Instagram className="w-4 h-4 mr-2" /> Instagram
              </Button>
           </div>

           {business.bio && (
              <p className="text-zinc-400 text-xs italic leading-relaxed border-l-2 border-red-600 pl-4">
                 "{business.bio}"
              </p>
           )}

           <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
              <div className="space-y-1">
                 <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-1">
                    <Cake className="w-3 h-3" /> Cumpleaños
                 </span>
                 <p className="text-sm font-bold text-zinc-300">
                    {coach?.birth_date 
                      ? format(new Date(coach.birth_date), "d 'de' MMMM", { locale: es }) 
                      : "No disponible"}
                 </p>
              </div>
              <div className="space-y-1">
                 <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Especialidad
                 </span>
                 <p className="text-sm font-bold text-zinc-300 capitalize">{business.specialty || "General"}</p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* COLABORACIONES Y DESCUENTOS */}
      {collabs.length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Beneficios de mi Coach</h4>
             </div>
             <div className="grid gap-3">
                {collabs.map((col: any, i: number) => (
                   <Card key={i} className="bg-zinc-900/50 border-zinc-800 overflow-hidden border-l-2 border-l-red-600">
                      <CardContent className="p-4">
                         <div className="flex justify-between items-start">
                            <div>
                               <h5 className="font-black uppercase italic text-sm text-white">{col.brand}</h5>
                               <p className="text-[10px] text-zinc-400 mt-1">{col.description}</p>
                            </div>
                            {col.link && (
                                <button onClick={() => window.open(col.link, '_blank')} className="text-zinc-500 hover:text-white transition-colors">
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            )}
                         </div>
                         
                         {col.code && (
                             <div className="mt-4 flex items-center justify-between bg-black p-2 rounded border border-dashed border-red-900/30">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-red-500" />
                                    <span className="text-xs font-mono font-bold text-white tracking-widest">{col.code}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => copyCode(col.code)} className="h-7 text-[8px] uppercase font-black text-zinc-500 hover:text-white">
                                    <Copy className="h-3 w-3 mr-1" /> Copiar
                                </Button>
                             </div>
                         )}
                      </CardContent>
                   </Card>
                ))}
             </div>
          </div>
      )}

      {/* ESTADO ADMINISTRATIVO */}
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader>
           <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" /> Mi Suscripción
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-900">
              <div className="space-y-1">
                 <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Próximo Vencimiento</p>
                 <p className="text-lg font-black text-white">
                    {assignment.next_payment_date 
                       ? format(new Date(assignment.next_payment_date), "dd 'de' MMM", { locale: es }).toUpperCase()
                       : "POR DEFINIR"}
                 </p>
              </div>
              <Badge className={cn(
                 "text-[10px] font-black uppercase px-3 py-1",
                 assignment.payment_status === 'up_to_date' ? "bg-green-600" : "bg-red-600"
              )}>
                 {assignment.payment_status === 'up_to_date' ? "AL DÍA" : "CON DEUDA"}
              </Badge>
           </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-red-900 hover:text-red-500 hover:bg-red-950/20 text-[10px] font-black uppercase tracking-widest">
              <UserMinus className="w-3 h-3 mr-2" /> Desvincular de mi preparador
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500 font-black uppercase italic">¿Confirmar desvinculación?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Al desvincularte, el coach ya no podrá ver tus registros, ni ajustar tu nutrición o tus rutinas. Deberás ser invitado nuevamente si deseas retomar el vínculo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleUnlink}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                disabled={unlinking}
              >
                {unlinking ? "Procesando..." : "Sí, desvincular"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </div>
  );
}