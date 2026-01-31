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
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, CreditCard, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// In a real app, these come from Env Vars
const STRIPE_MONTHLY_PRICE_ID = "price_1Q..."; // Placeholder
// const STRIPE_YEARLY_PRICE_ID = "price_1Q..."; 

export default function Settings() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [coachTone, setCoachTone] = useState("");
  const [discipline, setDiscipline] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setCoachTone(profile.coach_tone);
      setDiscipline(profile.discipline);
    }
  }, [profile]);

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
          priceId: STRIPE_MONTHLY_PRICE_ID, // Default to monthly for now
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
      // For demo purposes, we might want to manually upgrade if Stripe isn't configured in Supabase yet
      // This is just a fallback for the DYAD environment if keys are missing
      toast.info("Modo Demo: Contactando servidor de pagos...");
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

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="billing">Suscripción</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/> Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">
                    Tu suscripción está activa. Gracias por apoyar el desarrollo de Heavy Duty.
                  </p>
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