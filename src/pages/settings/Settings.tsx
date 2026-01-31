import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { User, Camera, Loader2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState<'male'|'female'>("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [objectives, setObjectives] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setSex((profile.sex as 'male'|'female') || 'male');
      setAvatarUrl(profile.avatar_url || null);
      
      // Load extra fields from settings jsonb
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

    // Merge new fields into settings
    const updatedSettings = {
      ...profile.settings,
      age,
      height,
      current_weight: weight,
      objectives
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        sex: sex,
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    setLoading(false);
    if (error) {
      toast.error("Error al guardar ficha técnica");
    } else {
      toast.success("Ficha técnica actualizada");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Selecciona una imagen");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.user_id}/avatar.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile?.user_id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Foto actualizada");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (profileLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-600"><Loader2 className="animate-spin h-8 w-8" /></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl text-center mb-8 space-y-1">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
          FICHA TÉCNICA
        </h1>
        <p className="text-red-600 font-bold tracking-widest text-xs uppercase">
          IDENTIFICACIÓN DEL ATLETA
        </p>
        <div className="h-[1px] w-full bg-zinc-900 mt-6" />
      </div>

      <div className="w-full max-w-2xl grid md:grid-cols-[200px_1fr] gap-8">
        
        {/* LEFT COLUMN: AVATAR & BADGE */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group cursor-pointer">
            <div className="h-40 w-40 rounded-full border-[3px] border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-zinc-700" />
              )}
              
              {/* Overlay for upload */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white h-8 w-8" />
              </div>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </div>

          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-black uppercase tracking-widest px-6 py-1.5 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            {profile?.is_premium ? "MIEMBRO PRO" : "MIEMBRO FREE"}
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="space-y-5 w-full">
          
          {/* Nombre */}
          <div className="space-y-1">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Nombre Completo</Label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="bg-zinc-950 border-zinc-800 h-11 text-white font-bold text-lg focus:border-red-600 transition-colors"
            />
          </div>

          {/* Sexo Toggle */}
          <div className="space-y-1">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Sexo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSex('male')}
                className={cn(
                  "h-10 rounded border text-sm font-bold uppercase transition-all",
                  sex === 'male' 
                    ? "bg-[#1a1a2e] border-[#2a2a4e] text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                Masculino
              </button>
              <button
                onClick={() => setSex('female')}
                className={cn(
                  "h-10 rounded border text-sm font-bold uppercase transition-all",
                  sex === 'female' 
                    ? "bg-[#2e1a25] border-[#4e2a3a] text-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.2)]" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                Femenino
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Edad</Label>
              <Input 
                type="number"
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Altura (cm)</Label>
              <Input 
                type="number"
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Peso (kg)</Label>
              <Input 
                type="number"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-1">
            <Label className="text-red-600 font-bold text-[10px] uppercase tracking-wider">Objetivos Trimestrales</Label>
            <Textarea 
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white min-h-[100px] resize-none focus:border-red-600"
              placeholder="Ej: Aumentar 5kg de masa magra..."
            />
          </div>

        </div>
      </div>

      <div className="h-[1px] w-full max-w-2xl bg-zinc-900 mt-8 mb-6" />

      {/* FOOTER ACTIONS */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-12 bg-transparent border-zinc-800 text-white hover:bg-zinc-900 font-bold uppercase tracking-wider"
          onClick={() => navigate('/dashboard')}
        >
          Volver
        </Button>
        <Button 
          className="h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wider shadow-[0_0_20px_rgba(220,38,38,0.4)]"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Perfil"}
        </Button>
      </div>

    </div>
  );
}