import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { User, Camera, Loader2, Save, Calendar, Star, TrendingUp, Target, Brain, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoggingPreference, CoachTone } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";

export function ProfileForm() {
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<'male'|'female'>("male");
  const [birthDate, setBirthDate] = useState("");
  const [loggingPreference, setLoggingPreference] = useState<LoggingPreference>("effective_only");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Coach Specific State
  const [referralCode, setReferralCode] = useState("");
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

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
      setLoggingPreference(profile.logging_preference || "effective_only");
      setCoachTone(profile.coach_tone || "strict");
      setAvatarUrl(profile.avatar_url || null);
      
      setReferralCode(profile.referral_code || "");
      if (profile.business_info) {
        setBrandName(profile.business_info.brand_name || "");
        setBio(profile.business_info.bio || "");
        setInstagram(profile.business_info.instagram || "");
        setWhatsapp(profile.business_info.whatsapp || "");
      }

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

    const businessData = {
      ...profile.business_info,
      brand_name: brandName,
      bio: bio,
      instagram: instagram,
      whatsapp: whatsapp
    };

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
          logging_preference: loggingPreference,
          coach_tone: coachTone,
          referral_code: referralCode.toUpperCase().trim(),
          business_info: businessData,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      toast.error("Error: " + (error.message.includes('unique') ? "El código ya existe" : error.message));
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

  if (profileLoading) return <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin h-6 w-6"/> Cargando...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          {profile?.is_coach ? "CENTRO DE COMANDO" : "FICHA TÉCNICA"}
        </h2>
        <p className="text-red-600 font-bold tracking-[0.2em] text-xs uppercase mt-2">
          {profile?.is_coach ? "GESTIÓN COMERCIAL Y MARCA" : "IDENTIFICACIÓN DEL ATLETA"}
        </p>
        <div className="w-full h-px bg-zinc-800 mt-6" />
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-10 items-start">
        
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 rounded-full border-2 border-red-600 blur-[4px] opacity-70" />
            <div className="h-52 w-52 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-900 flex items-center justify-center relative z-10">
              {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <User className="h-24 w-24 text-zinc-700" />}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Camera className="text-white h-8 w-8" />
              </div>
            </div>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar}/>
          </div>
          <div className={cn("text-white text-[10px] font-black uppercase py-2 px-6 rounded-full tracking-[0.2em] border shadow-lg", profile?.is_coach ? "bg-blue-600 border-blue-400" : "bg-red-600 border-red-400")}>
            {profile?.is_coach ? "PREPARADOR OFICIAL" : "MIEMBRO HEAVY DUTY"}
          </div>

          {/* ADMIN ACCESS BUTTON */}
          {profile?.is_admin && (
            <Button 
                variant="outline"
                className="mt-4 w-full border-red-600/30 bg-red-600/5 text-red-500 font-black uppercase text-[10px] tracking-widest h-12 hover:bg-red-600 hover:text-white"
                onClick={() => navigate('/admin')}
            >
                <ShieldAlert className="w-4 h-4 mr-2" /> Panel de Control
                <ChevronRight className="ml-auto w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-10 w-full">
          
          {profile?.is_coach && (
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
               <div className="flex items-center gap-2 text-red-500 mb-2">
                  <Star className="h-5 w-5 fill-current" />
                  <h3 className="font-black uppercase italic text-sm">Programa de Referidos</h3>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Tu Código de Descuento</Label>
                  <Input value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="EJ: COACHDIORIO10" className="bg-black border-zinc-700 h-12 text-lg font-black uppercase tracking-widest text-center" />
               </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-400">
                  <User className="h-5 w-5" />
                  <h3 className="font-black uppercase italic text-sm">Identidad</h3>
            </div>
            <div className="grid gap-6">
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold">Nombre para Mostrar</Label>
                    <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-black/50 border-zinc-800 h-12 font-bold text-lg" />
                </div>
                <div className="space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold">Fecha de Nacimiento</Label>
                    <div className="relative">
                        <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="bg-black/50 border-zinc-800 h-12 font-bold" />
                        <Calendar className="absolute right-3 top-4 h-4 w-4 text-zinc-600" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-500">
                <Brain className="h-5 w-5" />
                <h3 className="font-black uppercase italic text-sm">Personalidad de tu IA</h3>
            </div>
            <RadioGroup value={coachTone} onValueChange={(v) => setCoachTone(v as CoachTone)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.is_coach ? (
                    <PersonalityCard 
                      id="business_analytical" 
                      label="High Performance Strategy" 
                      desc="Socio Estratégico. Combina Auditoría Técnica HIT con Visión de Negocio (LTV/Churn)." 
                      current={coachTone} 
                      icon={<ShieldCheck className="h-4 w-4 text-red-500"/>} 
                      className="md:col-span-2"
                    />
                ) : (
                    <>
                        <PersonalityCard id="strict" label="Strict" desc="Mike Mentzer Style. Sin excusas." current={coachTone} />
                        <PersonalityCard id="analytical" label="Analytical" desc="Basado en datos y métricas frías." current={coachTone} />
                        <PersonalityCard id="motivational" label="Motivational" desc="Energía positiva y empuje constante." current={coachTone} />
                        <PersonalityCard id="friendly" label="Friendly" desc="Cercano, profesional y comprensivo." current={coachTone} />
                    </>
                )}
            </RadioGroup>
          </div>

          <div className="pt-10">
            <Button className="w-full h-16 bg-white text-black hover:bg-zinc-200 font-black italic uppercase tracking-wider text-lg shadow-2xl" onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin"/> : <Save className="mr-2 h-6 w-6"/>}
                GUARDAR CONFIGURACIÓN
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalityCard({ id, label, desc, current, icon, className }: { id: string, label: string, desc: string, current: string, icon?: React.ReactNode, className?: string }) {
    const isSelected = id === current;
    return (
        <Label htmlFor={id} className={cn(
            "flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all hover:bg-zinc-900/50",
            isSelected ? 'border-red-600 bg-red-950/10' : 'border-zinc-800 bg-black/40',
            className
        )}>
            <RadioGroupItem value={id} id={id} className="mt-1 border-zinc-700" />
            <div className="grid gap-1 leading-none">
                <div className="flex items-center gap-2">
                    <span className="font-black uppercase italic text-white text-sm">{label}</span>
                    {icon}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-tight">{desc}</p>
            </div>
        </Label>
    );
}