import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

export function BillingSettings() {
  const { profile, hasProAccess, daysLeftInTrial, loading: profileLoading } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // TODO: Replace with your actual Stripe Price IDs
  const PRICE_IDS = {
    monthly: 'price_monthly_placeholder', 
    yearly: 'price_yearly_placeholder' 
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const priceId = billingCycle === 'monthly' ? PRICE_IDS.monthly : PRICE_IDS.yearly;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          userId: user.id,
          returnUrl: window.location.origin + '/settings?tab=billing'
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo iniciar el checkout");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error al conectar con Stripe. (Asegúrate de configurar los Price IDs)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    // In a real app, this calls create-portal-session
    toast.info("Redirigiendo al Portal de Cliente...");
    // Mock implementation for MVP
    setTimeout(() => {
        toast.warning("Función de Portal de Cliente no configurada en MVP");
    }, 1000);
  };

  if (profileLoading) return <div className="p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* STATUS BANNER */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Estado de Suscripción
              {hasProAccess ? (
                 <Badge className="bg-gradient-to-r from-yellow-600 to-amber-600 border-0">PRO ACTIVO</Badge>
              ) : (
                 <Badge variant="outline">FREE PLAN</Badge>
              )}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {hasProAccess 
                ? daysLeftInTrial > 0 
                  ? `Periodo de prueba. Quedan ${daysLeftInTrial} días gratis.`
                  : "Membresía activa. Acceso total desbloqueado."
                : "Estás usando la versión gratuita limitada."}
            </p>
          </div>
          {hasProAccess && (
             <Button variant="outline" onClick={handleManageSubscription} className="border-zinc-700">
               Gestionar Suscripción
             </Button>
          )}
        </CardContent>
      </Card>

      {!hasProAccess && (
        <div className="grid gap-6">
          <div className="text-center space-y-2">
             <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Elige tu Plan</h2>
             <p className="text-zinc-500">Desbloquea el Coach IA, Análisis Avanzados y más.</p>
             
             {/* Toggle */}
             <div className="inline-flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 mt-2">
                <button 
                   onClick={() => setBillingCycle('monthly')}
                   className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   Mensual
                </button>
                <button 
                   onClick={() => setBillingCycle('yearly')}
                   className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   Anual <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 rounded">AHORRA 25%</span>
                </button>
             </div>
          </div>

          <Card className="relative overflow-hidden border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-zinc-950">
            {billingCycle === 'yearly' && (
                <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Mejor Valor
                </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white">
                    ${billingCycle === 'monthly' ? '9.99' : '7.49'}
                 </span>
                 <span className="text-zinc-500 text-sm font-medium">/ mes</span>
              </CardTitle>
              {billingCycle === 'yearly' && (
                  <CardDescription className="text-green-500 font-medium">Facturado $89.99 anualmente</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
               <Benefit>Coach IA Personalizado (4 tonos)</Benefit>
               <Benefit>Auditoría Global de Patrones</Benefit>
               <Benefit>Análisis Post-Entreno Detallado</Benefit>
               <Benefit>Módulo de Nutrición & Farmacología</Benefit>
               <Benefit>Check-ins ilimitados</Benefit>
            </CardContent>
            <CardFooter>
               <Button 
                 className="w-full h-12 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-black uppercase tracking-wider shadow-lg shadow-yellow-900/20"
                 onClick={handleSubscribe}
                 disabled={isLoading}
               >
                 {isLoading ? (
                    <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                    </>
                 ) : (
                    <>
                       <Star className="mr-2 h-4 w-4 fill-current" /> Comenzar Trial de 7 Días
                    </>
                 )}
               </Button>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-zinc-600">
             Garantía de satisfacción. Puedes cancelar en cualquier momento durante el periodo de prueba sin cargo.
          </p>
        </div>
      )}

      {hasProAccess && (
         <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                     <Zap className="h-5 w-5 text-yellow-500" /> Potencia tu entreno
                  </CardTitle>
               </CardHeader>
               <CardContent className="text-sm text-zinc-400">
                  Estás aprovechando todas las funciones de IA. ¡Sigue registrando para mejores insights!
               </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                     <Shield className="h-5 w-5 text-green-500" /> Datos Seguros
                  </CardTitle>
               </CardHeader>
               <CardContent className="text-sm text-zinc-400">
                  Tus datos de farmacología y fotos están encriptados en bóvedas privadas.
               </CardContent>
            </Card>
         </div>
      )}

    </div>
  );
}

const Benefit = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="bg-green-500/20 p-1 rounded-full shrink-0">
      <Check className="w-3.5 h-3.5 text-green-500" />
    </div>
    <span className="text-sm text-zinc-300">{children}</span>
  </div>
);