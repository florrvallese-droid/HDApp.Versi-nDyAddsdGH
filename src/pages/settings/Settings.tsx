import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, LogOut, CreditCard, User, Loader2, Upload, Camera, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// In a real app, these come from Env Vars
const STRIPE_MONTHLY_PRICE_ID = "price_monthly_id"; 

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, loading: profileLoading, hasProAccess, daysLeftInTrial } = useProfile();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState("");
  const [coachTone, setCoachTone] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCoachTone(profile.coach_tone);
      setDiscipline(profile.discipline);
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  // Handle Stripe Return
  useEffect(() => {
    if (searchParams.get("session_id")) {
      toast.success("¡Suscripción exitosa!", {
        description: "Bienvenido a Heavy Duty PRO.",
        duration: 5000,
      });
      // Optionally clear params
      navigate("/settings?tab=billing", { replace: true });
    }
    if (searchParams.get("canceled")) {
      toast.info("Suscripción cancelada", {
        description: "No se ha realizado ningún cobro.",
      });
      navigate("/settings?tab=billing", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        coach_tone: coachTone,
        discipline: discipline,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    setLoading(false);
    if (error) {
      toast.error("Error al guardar cambios");
    } else {
      toast.success("Perfil actualizado");
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
      toast.success("Avatar actualizado");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleUpgrade = async () => {
    if (!profile) return;
    setCheckoutLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: STRIPE_MONTHLY_PRICE_ID,
          userId: profile.user_id,
          returnUrl: window.location.origin + '/settings'
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error iniciando pago. Contacta a soporte.");
      
      // Fallback for Demo Mode if API fails
      toast.info("MODO DEMO: Redirigiendo simulado...", { duration: 2000 });
      setTimeout(() => {
         navigate("/settings?session_id=demo_success&tab=billing");
      }, 1500);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (profileLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="min-h-screen bg-background p-4 pb-20 max-w-md mx-auto space-y-6">
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </div>

      <Tabs defaultValue={searchParams.get("tab") || "profile"}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="billing">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center group cursor-pointer">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white h-6 w-6" />
                  </div>
                  
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </div>
                {uploadingAvatar && <span className="text-xs text-muted-foreground animate-pulse">Subiendo...</span>}
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Disciplina Principal</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bodybuilding">Bodybuilding</SelectItem>
                    <SelectItem value="powerlifting">Powerlifting</SelectItem>
                    <SelectItem value="crossfit">CrossFit</SelectItem>
                    <SelectItem value="general">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Personalidad del Coach</Label>
                <Select value={coachTone} onValueChange={(v) => setCoachTone(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (Estricto)</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/> Estado de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Plan Actual</span>
                {profile?.is_premium ? (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">PRO</Badge>
                ) : daysLeftInTrial > 0 ? (
                  <Badge variant="outline" className="border-yellow-600 text-yellow-600">TRIAL ({daysLeftInTrial} días)</Badge>
                ) : (
                  <Badge variant="outline">Gratuito</Badge>
                )}
              </div>

              {!profile?.is_premium ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
                    <h3 className="font-bold text-primary">Upgrade a PRO</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Coach IA personalizado</li>
                      <li>Análisis ilimitados</li>
                      <li>Módulo de Nutrición</li>
                      <li>Farmacología (Bóveda Privada)</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold h-12"
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Obtener 7 días GRATIS"
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Luego $9.99/mes. Cancela cuando quieras.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-500">Membresía Activa</h3>
                      <p className="text-sm text-muted-foreground">
                         Tu suscripción está activa. Disfruta de todas las funciones Heavy Duty.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Administrar Suscripción
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}