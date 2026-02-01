import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { UserPlus, Loader2, Mail } from "lucide-react";

interface AddAthleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAthleteModal({ open, onOpenChange, onSuccess }: AddAthleteModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);

    try {
      const { data: { user: coach } } = await supabase.auth.getUser();
      if (!coach) throw new Error("No autenticado");

      const { data: athleteProfile, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (searchError) throw searchError;
      if (!athleteProfile) {
        throw new Error("No se encontró ningún atleta con ese correo electrónico.");
      }

      if (athleteProfile.user_id === coach.id) {
        throw new Error("No puedes invitarte a ti mismo.");
      }

      const { data: existing } = await supabase
        .from('coach_assignments')
        .select('status')
        .eq('coach_id', coach.id)
        .eq('athlete_id', athleteProfile.user_id)
        .maybeSingle();

      if (existing) {
        throw new Error(`Ya tienes una solicitud ${existing.status} con este atleta.`);
      }

      const { error: inviteError } = await supabase
        .from('coach_assignments')
        .insert({
          coach_id: coach.id,
          athlete_id: athleteProfile.user_id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast.success(`Invitación enviada a ${athleteProfile.display_name || email}`);
      setEmail("");
      onSuccess();
      onOpenChange(false);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-red-600" /> Vincular Nuevo Atleta
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Ingresa el correo con el que tu alumno se registró en Heavy Duty.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase text-zinc-500">Email del Atleta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
              <Input 
                id="email"
                type="email"
                placeholder="alumno@ejemplo.com"
                className="bg-zinc-900 border-zinc-800 pl-10 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={handleInvite}
            disabled={loading || !email}
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Enviar Invitación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}