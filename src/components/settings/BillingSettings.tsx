import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Shield, Loader2, ExternalLink, Ticket, Users } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BillingSettings() {
  const { profile, hasProAccess, daysLeftInTrial, loading: profileLoading } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const isCoach = profile?.is_coach;

  const handleSubscribe = async (planType: 'athlete' | 'coach') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error("Debes iniciar sesión con email");

      // Aquí llamaríamos a la Edge Function de suscripción pasando el rol
      const { data, error } = await supabase.functions.invoke('create-mp-subscription', {
        body: {
          planType: billingCycle,
          roleType: planType, // Diferenciamos el plan en Mercado Pago
          userId: user.id,
          email: user.email,
          backUrl: window.location.href
        }
      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      
    } catch (err: any) {
      toast.error("Error al conectar con el procesador de pagos");
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading) return <div className="p-8"><Loader2 className="animate-spin h-6 w-6"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card className="border-zinc-800 bg-zinc-950">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Estado de Suscripción
              {hasProAccess ? (
                 <Badge className="bg-gradient-to-r from-blue-600 to-blue-400 border-0">PRO ACTIVO</Badge>
              ) : (
                 <Badge variant="outline">FREE PLAN</Badge>
              )}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {hasProAccess 
                ? daysLeftInTrial > 0 
                  ? `Periodo de prueba. Quedan ${daysLeftInTrial} días gratis.`
                  : isCoach ? "Membresía COACH activa (Incluye Atleta PRO)." : "Membresía Atleta PRO activa."
                : "Estás usando la versión gratuita limitada."}
            </p>
          </div>
          {hasProAccess && !daysLeftInTrial && (
             <Button variant="outline" onClick={() => window.open("https://www.mercadopago.com.ar/subscriptions", "_blank")} className="border-zinc-700">
               Gestionar <ExternalLink className="ml-2 h-3 w-3" />
             </Button>
          )}
        </CardContent>
      </Card>

      {!hasProAccess && (
        <div className="grid gap-6">
          <div className="text-center space-y-2">
             <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                {isCoach ? "Planes para Preparadores" : "Desbloquea tu Potencial"}
             </h2>
             <p className="text-zinc-500">
                {isCoach ? "Gestiona a tu equipo con herramientas profesionales." : "Accede al Coach IA y análisis avanzados."}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* PLAN ATLETA (Siempre visible) */}
             <Card className={cn(
                 "relative overflow-hidden border-zinc-800 bg-black transition-all",
                 !isCoach && "md:col-span-2 border-blue-500/30 bg-gradient-to-b from-blue-900/10 to-zinc-950"
             )}>
                <CardHeader>
                  <CardTitle className="flex flex-col gap-1">
                     <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Atleta PRO</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">$9.99</span>
                        <span className="text-zinc-500 text-xs">/ mes</span>
                     </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <BenefitItem>Coach IA (4 tonos)</BenefitItem>
                   <BenefitItem>Análisis Post-Workout</BenefitItem>
                   <BenefitItem>Auditoría de Patrones</BenefitItem>
                   <Button 
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                    onClick={() => handleSubscribe('athlete')}
                    disabled={isLoading}
                   >
                     Elegir Atleta
                   </Button>
                </CardContent>
             </Card>

             {/* PLAN COACH (Solo visible o destacado para coaches) */}
             {isCoach && (
                <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-b from-red-900/10 to-zinc-950">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-lg tracking-tighter">RECOMENDADO</div>
                    <CardHeader>
                    <CardTitle className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Coach Hub</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">$29.99</span>
                            <span className="text-zinc-500 text-xs">/ mes</span>
                        </div>
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <BenefitItem icon={<Star className="h-3 w-3 text-yellow-500"/>}>Tu propio Atleta PRO</BenefitItem>
                        <BenefitItem icon={<Users className="h-3 w-3 text-red-500"/>}>Gestión de Alumnos (Hasta 50)</BenefitItem>
                        <BenefitItem icon={<Zap className="h-3 w-3 text-red-500"/>}>Business Hub & Analytics</BenefitItem>
                        <Button 
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-900/20"
                            onClick={() => handleSubscribe('coach')}
                            disabled={isLoading}
                        >
                            Elegir Coach Hub
                        </Button>
                    </CardContent>
                </Card>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

const BenefitItem = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    {icon || <Check className="w-3 h-3 text-blue-500" />}
    <span className="text-xs text-zinc-300">{children}</span>
  </div>
);