import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { User, Camera, Loader2, Save, Target, BookOpen, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoggingPreference, CoachTone } from "@/types";

export function ProfileForm() {
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<'male'|'female'>("male");
  const [loggingPreference, setLoggingPreference] = useState<LoggingPreference>("effective_only");
  const [coachTone, setCoachTone] = useState<CoachTone>("strict");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [objectives, setObjectives] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      if (profile.sex === 'male' || profile.sex === 'female') {
          setSex(profile.sex);
      }
      setLoggingPreference(profile.logging_preference || "effective_only");
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
          logging_preference: loggingPreference,
          coach_tone: coachTone,
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      toast.success("Ficha técnica actualizada");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) return;
      if (!profile) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile.user_id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto actualizada");

    } catch (error: any) {
      toast.error("Error al subir imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (profileLoading) {
    return <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-2"><Loader2 className="animate-spin h-6 w-6"/> Cargando perfil...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Ficha Técnica */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">FICHA TÉCNICA</h2>
        <p className="text-red-600 font-bold tracking-[0.2em] text-xs uppercase mt-2">IDENTIFICACIÓN DEL ATLETA</p>
        <div className="w-full h-px bg-zinc-800 mt-6" />
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-10 items-start">
        
        {/* LEFT COLUMN: AVATAR & BADGE */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 rounded-full border-2 border-red-600 blur-[4px] opacity-70" />
            <div className="h-48 w-48 rounded-full border-4 border-zinc-950 overflow-hidden bg-zinc-900 flex items-center justify-center relative z-10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-20 w-20 text-zinc-700" />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Camera className="text-white h-8 w-8" />
              </div>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-20" 
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>
          
          {profile?.is_premium ? (
             <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black uppercase py-2 px-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] tracking-widest border border-red-500/50">
               MIEMBRO PRO
             </div>
          ) : (
             <div className="bg-zinc-800 text-zinc-400 text-xs font-bold uppercase py-2 px-6 rounded-full tracking-widest border border-zinc-700">
               MIEMBRO FREE
             </div>
          )}
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="space-y-8 w-full">
          <div className="space-y-2">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Nombre Completo</Label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="bg-black/50 border-zinc-800 h-12 text-white font-bold text-lg focus:border-red-600/50 focus:ring-0 placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
              <Brain className="h-3 w-3" /> Personalidad del Coach IA
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['strict', 'motivational', 'analytical', 'friendly'] as CoachTone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCoachTone(t)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-md border transition-all text-[10px] font-black uppercase tracking-tighter",
                    coachTone === t 
                      ? "bg-red-600 border-red-500 text-white" 
                      : "bg-black/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 italic">Define cómo te hablará la IA durante la evaluación y el análisis post-entreno.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Filosofía de Registro</Label>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setLoggingPreference('effective_only')} 
                className={cn("p-4 rounded-md border text-left transition-all", loggingPreference === 'effective_only' ? "bg-red-950/20 border-red-900/50" : "bg-black/50 border-zinc-800")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target className={cn("h-4 w-4", loggingPreference === 'effective_only' ? "text-red-500" : "text-zinc-600")} />
                  <span className={cn("font-bold text-sm uppercase tracking-tight", loggingPreference === 'effective_only' ? "text-white" : "text-zinc-500")}>Sólo Series Efectivas (Pure HIT)</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">Registra solo las series llevadas al fallo muscular absoluto. Ideal para Heavy Duty.</p>
              </button>
              <button 
                onClick={() => setLoggingPreference('full_routine')} 
                className={cn("p-4 rounded-md border text-left transition-all", loggingPreference === 'full_routine' ? "bg-zinc-800 border-zinc-700" : "bg-black/50 border-zinc-800")}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className={cn("h-4 w-4", loggingPreference === 'full_routine' ? "text-white" : "text-zinc-600")} />
                  <span className={cn("font-bold text-sm uppercase tracking-tight", loggingPreference === 'full_routine' ? "text-white" : "text-zinc-500")}>Rutina Completa (Volumen Total)</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">Registra calentamiento, aproximación y series efectivas. Ideal para trackear volumen total.</p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Sexo Biológico</Label>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSex('male')} className={cn("h-12 rounded-md border text-sm font-bold uppercase transition-all tracking-wider", sex === 'male' ? "bg-[#1a2332] border-blue-900/50 text-white" : "bg-black/50 border-zinc-800 text-zinc-500")}>Masculino</button>
              <button onClick={() => setSex('female')} className={cn("h-12 rounded-md border text-sm font-bold uppercase transition-all tracking-wider", sex === 'female' ? "bg-[#321a25] border-pink-900/50 text-white" : "bg-black/50 border-zinc-800 text-zinc-500")}>Femenino</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Edad</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-black/50 border-zinc-800 h-12 text-white font-bold text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Altura (cm)</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="bg-black/50 border-zinc-800 h-12 text-white font-bold text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Peso (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-black/50 border-zinc-800 h-12 text-white font-bold text-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Objetivos</Label>
            <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} className="bg-black/50 border-zinc-800 text-zinc-300 min-h-[120px]" placeholder="Mis metas..." />
          </div>

          <div className="pt-4">
            <Button className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black italic uppercase tracking-wider text-lg" onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5"/>}
                {loading ? "Guardando..." : "GUARDAR CAMBIOS"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}