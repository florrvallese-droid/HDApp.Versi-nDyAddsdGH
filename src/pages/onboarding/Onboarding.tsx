import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Loader2, Trophy, Briefcase } from "lucide-react";

const Onboarding = () => {
  const { profile, session, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<string>("other");
  const [discipline, setDiscipline] = useState<string>("general");

  useEffect(() => {
    if (profile) {
      if (profile.display_name && profile.sex && profile.sex !== 'other') {
        navigate('/dashboard');
      }
      setDisplayName(profile.display_name || "");
      setSex(profile.sex || "other");
    }
  }, [profile, navigate]);

  const handleFinish = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          sex: sex,
          discipline: discipline,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("¡Perfil completado!");
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCoach = session?.user?.user_metadata?.role === 'coach';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-600/5 pointer-events-none" />
      
      <Card className="w-full max-w-md bg-zinc-950 border-zinc-900 shadow-2xl relative z-10 overflow-hidden">
        <div className="h-1 w-full bg-red-600" />
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            BIENVENIDO AL SISTEMA
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Finalizando configuración de {isCoach ? 'Preparador' : 'Atleta'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-center mb-4">
            <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800">
                {isCoach ? <Briefcase className="h-8 w-8 text-blue-500" /> : <Trophy className="h-8 w-8 text-red-500" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                {isCoach ? 'Nombre de tu Marca / Team' : 'Tu Nombre Completo'}
              </Label>
              <Input 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                placeholder="Ej: John Doe" 
                className="bg-black border-zinc-800 h-12 font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Sexo</Label>
                    <Select value={sex} onValueChange={setSex}>
                        <SelectTrigger className="bg-black border-zinc-800 h-12 font-bold text-xs uppercase text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Femenino</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Disciplina</Label>
                    <Select value={discipline} onValueChange={setDiscipline}>
                        <SelectTrigger className="bg-black border-zinc-800 h-12 font-bold text-xs uppercase text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="bodybuilding">Culturismo</SelectItem>
                            <SelectItem value="crossfit">Crossfit</SelectItem>
                            <SelectItem value="powerlifting">Powerlifting</SelectItem>
                            <SelectItem value="general">Fitness Gral</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest mt-4"
            onClick={handleFinish}
            disabled={loading || !displayName}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "ACCEDER A MI PANEL"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;