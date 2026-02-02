import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Loader2, Trophy, Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const { athleteProfile, coachProfile, session, refreshProfile } = useProfileContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form states
  const [role, setRole] = useState<'athlete' | 'coach'>('athlete');
  const [displayName, setDisplayName] = useState("");
  const [planType, setPlanType] = useState<'starter' | 'hub' | 'agency'>('starter');

  // REDIRECCIÓN AUTOMÁTICA: Si el trigger ya hizo su trabajo, nos vamos al dashboard
  useEffect(() => {
    if (athleteProfile || coachProfile) {
      navigate('/dashboard');
    }
  }, [athleteProfile, coachProfile, navigate]);

  const handleFinish = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      // 1. Actualizar perfil base (Display Name y Rol)
      // Usamos upsert para que no falle si ya existe
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || session.user.email?.split('@')[0],
          user_role: role,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (profileError) throw profileError;

      // 2. Crear perfil específico SOLO si no existe (el trigger debería haberlo hecho)
      if (role === 'athlete') {
        await supabase.from('athlete_profiles').upsert({ user_id: session.user.id, tier: 'free' });
      } else {
        await supabase.from('coach_profiles').upsert({ 
            user_id: session.user.id, 
            plan_type: planType,
            business_name: displayName,
            student_limit: planType === 'starter' ? 15 : planType === 'hub' ? 50 : 999
        });
      }

      await refreshProfile();
      toast.success("¡Configuración terminada!");
      navigate('/dashboard');
    } catch (err: any) {
      // Si el error es que ya existe, simplemente refrescamos y navegamos
      if (err.code === '23505') {
          await refreshProfile();
          navigate('/dashboard');
      } else {
          toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-900 shadow-2xl relative overflow-hidden">
        <div className="h-1.5 w-full bg-red-600" />
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            FINALIZAR PERFIL
          </CardTitle>
          <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
            Confirmación de Identidad
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <p className="text-zinc-400 text-xs text-center uppercase font-bold tracking-tight">Confirmá tu función en el sistema:</p>
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setRole('athlete')}
                        className={cn("p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all", role === 'athlete' ? "border-red-600 bg-red-600/10" : "border-zinc-900 bg-zinc-900/40 text-zinc-500")}
                      >
                          <Trophy className={cn("h-8 w-8", role === 'athlete' ? "text-red-500" : "text-zinc-700")} />
                          <span className="font-black uppercase text-xs tracking-widest">Atleta</span>
                      </button>
                      <button 
                        onClick={() => setRole('coach')}
                        className={cn("p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all", role === 'coach' ? "border-blue-600 bg-blue-600/10" : "border-zinc-900 bg-zinc-900/40 text-zinc-500")}
                      >
                          <Briefcase className={cn("h-8 w-8", role === 'coach' ? "text-blue-500" : "text-zinc-700")} />
                          <span className="font-black uppercase text-xs tracking-widest">Coach</span>
                      </button>
                  </div>
                  <Button className="w-full h-14 bg-white text-black font-black uppercase italic tracking-widest" onClick={() => setStep(2)}>
                      CONTINUAR <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
          ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                      <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        {role === 'coach' ? 'Nombre de tu Marca / Team' : 'Tu Nombre o Alias'}
                      </Label>
                      <Input 
                        value={displayName} 
                        onChange={e => setDisplayName(e.target.value)} 
                        placeholder="Ej: John Doe" 
                        className="bg-black border-zinc-800 h-12 font-bold text-white"
                      />
                  </div>

                  {role === 'coach' && (
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Plan de Coach</Label>
                        <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
                            <SelectTrigger className="bg-black border-zinc-800 h-12 font-bold text-xs uppercase text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="starter">Independent (15 alumnos)</SelectItem>
                                <SelectItem value="hub">Hub (50 alumnos)</SelectItem>
                                <SelectItem value="agency">Agency (Ilimitado)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 text-zinc-500 font-bold uppercase text-[10px]" onClick={() => setStep(1)}>Volver</Button>
                    <Button 
                        className="flex-[2] h-12 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest"
                        onClick={handleFinish}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "ENTRAR AL SISTEMA"}
                    </Button>
                  </div>
              </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}