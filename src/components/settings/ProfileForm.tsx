import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { User, Camera, Loader2, Save, Calendar, Star, Brain, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoachTone } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function ProfileForm() {
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<'male'|'female'>("male");
  const [birthDate, setBirthDate] = useState("");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Athlete Specific
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [objectives, setObjectives] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      if (profile.sex === 'male' || profile.sex === 'female') setSex(profile.sex);
      setBirthDate(profile.birth_date || "");
      setCoachTone(profile.coach_tone || "strict");
      setAvatarUrl(profile.avatar_url || null);
      
      if (profile.settings) {
        setAge(profile.settings.age || "");
        setHeight(profile.settings.height || "");
        setWeight(profile.settings.current_weight || "");
        setObjectives(profile.settings.objectives || "");
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    const updatedSettings = {
      ...(profile.settings || {}),
      age,
      height,
      current_weight: weight,
      objectives
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          sex: sex,
          birth_date: birthDate || null,
          coach_tone: coachTone,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      toast.success("Perfil actualizado");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files?.[0] || !profile) return;
      const file = event.target.files[0];
      const fileName = `${profile.user_id}/avatar_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', profile.user_id);
      setAvatarUrl(publicUrl);
      toast.success("Foto actualizada");
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (profileLoading) return <div className="p-12 text-center text-zinc-500"><Loader2 className="animate-spin h-6 w-6 mx-auto"/></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
      
      <div className="flex flex-col items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="h-32 w-32 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center relative z-10">
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <User className="h-12 w-12 text-zinc-700" />}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Camera className="text-white h-6 w-6" />
            </div>
          </div>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar}/>
        </div>
        <Badge variant="outline" className={cn("uppercase font-black text-[10px] py-1 px-4", profile?.is_coach ? "border-blue-500 text-blue-500" : "border-red-500 text-red-500")}>
            {profile?.is_coach ? "PREPARADOR" : "ATLETA"}
        </Badge>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
            <Label className="text-zinc-500 text-[10px] uppercase font-bold">Nombre</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-black/50 border-zinc-800 h-12 font-bold" />
        </div>

        {!profile?.is_coach && (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold">Altura (cm)</Label>
                    <Input value={height} onChange={e => setHeight(e.target.value)} className="bg-black/50 border-zinc-800 h-12 font-bold" />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold">Peso Inicial (kg)</Label>
                    <Input value={weight} onChange={e => setWeight(e.target.value)} className="bg-black/50 border-zinc-800 h-12 font-bold" />
                </div>
            </div>
        )}

        <div className="space-y-6 pt-4 border-t border-zinc-900">
            <div className="flex items-center gap-2 text-red-500">
                <Brain className="h-5 w-5" />
                <h3 className="font-black uppercase italic text-sm">Personalidad de tu IA</h3>
            </div>
            <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.is_coach ? (
                    <PersonalityCard 
                      id="business_analytical" 
                      label="Strategic Business" 
                      desc="Analista de negocio. Enfoque en rentabilidad, retención y marketing de equipo." 
                      current={coachTone} 
                      className="md:col-span-2"
                    />
                ) : (
                    <>
                        <PersonalityCard id="strict" label="Strict" desc="Mentzer Style. Sin excusas." current={coachTone} />
                        <PersonalityCard id="motivational" label="Motivational" desc="Energía positiva y empuje." current={coachTone} />
                    </>
                )}
            </RadioGroup>
        </div>

        <Button className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase italic tracking-widest mt-6" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5"/> : <Save className="h-5 w-5 mr-2"/>}
            GUARDAR CONFIGURACIÓN
        </Button>
      </div>
    </div>
  );
}

function PersonalityCard({ id, label, desc, current, className }: { id: string, label: string, desc: string, current: string, className?: string }) {
    const isSelected = id === current;
    return (
        <Label htmlFor={id} className={cn(
            "flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all",
            isSelected ? 'border-red-600 bg-red-950/10' : 'border-zinc-800 bg-black/40',
            className
        )}>
            <RadioGroupItem value={id} id={id} className="mt-1 border-zinc-700" />
            <div className="grid gap-1.5 leading-none">
                <span className="font-black uppercase italic text-white text-sm">{label}</span>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-tight">{desc}</p>
            </div>
        </Label>
    );
}