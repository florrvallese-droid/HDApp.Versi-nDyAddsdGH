import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { User, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileForm() {
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

  if (profileLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-zinc-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid md:grid-cols-[160px_1fr] gap-8">
        
        {/* LEFT COLUMN: AVATAR & BADGE */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer">
            <div className="h-32 w-32 rounded-full border-2 border-zinc-800 shadow-xl overflow-hidden bg-zinc-900 flex items-center justify-center relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-zinc-700" />
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white h-6 w-6" />
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
          
          <div className="text-center">
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Foto de Perfil</p>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="space-y-5 w-full">
          
          <div className="space-y-1">
            <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Nombre Completo</Label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="bg-zinc-950 border-zinc-800 h-10 text-white font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Sexo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSex('male')}
                className={cn(
                  "h-10 rounded border text-sm font-bold uppercase transition-all",
                  sex === 'male' 
                    ? "bg-[#1a1a2e] border-[#2a2a4e] text-blue-400" 
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
                    ? "bg-[#2e1a25] border-[#4e2a3a] text-pink-400" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                Femenino
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Edad</Label>
              <Input 
                type="number"
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Altura (cm)</Label>
              <Input 
                type="number"
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Peso ({profile?.units})</Label>
              <Input 
                type="number"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-red-500 font-bold text-[10px] uppercase tracking-wider">Objetivos</Label>
            <Textarea 
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white min-h-[80px] resize-none"
              placeholder="Ej: Hipertrofia sarco..."
            />
          </div>

        </div>
      </div>

      <Button 
        className="w-full h-12 bg-zinc-100 text-black hover:bg-white font-black italic uppercase tracking-wider"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Actualizar Ficha Técnica"}
      </Button>
    </div>
  );
}