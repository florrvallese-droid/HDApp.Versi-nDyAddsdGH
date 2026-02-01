import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { UserCheck, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CoachInvitationAlert({ userId }: { userId: string }) {
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingInvitation();
  }, [userId]);

  const fetchPendingInvitation = async () => {
    const { data, error } = await supabase
      .from('coach_assignments')
      .select(`
        id,
        coach:coach_id (
          display_name
        )
      `)
      .eq('athlete_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (data) setInvitation(data);
  };

  const handleAction = async (status: 'active' | 'rejected') => {
    setLoading(true);
    try {
      if (status === 'rejected') {
        await supabase.from('coach_assignments').delete().eq('id', invitation.id);
        toast.info("Invitación rechazada");
      } else {
        await supabase.from('coach_assignments').update({ status: 'active' }).eq('id', invitation.id);
        toast.success("¡Ahora tienes un coach vinculado!");
      }
      setInvitation(null);
    } catch (err) {
      toast.error("Error al procesar solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (!invitation) return null;

  return (
    <Card className="bg-blue-900/20 border-blue-800 animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Invitación de Preparador</p>
            <p className="text-xs text-blue-400">
               <span className="font-bold text-white">{invitation.coach?.display_name || "Un preparador"}</span> quiere ver tu bitácora.
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 sm:flex-none text-zinc-400 hover:text-white"
            onClick={() => handleAction('rejected')}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" /> Rechazar
          </Button>
          <Button 
            size="sm" 
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold"
            onClick={() => handleAction('active')}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4 mr-1" />}
            Aceptar Coach
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}