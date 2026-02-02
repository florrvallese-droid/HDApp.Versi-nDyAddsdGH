import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Star, Zap, Shield, Loader2, ExternalLink, Ticket, Users, Percent, ShieldCheck } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BillingSettings() {
  const { profile, hasProAccess, daysLeftInTrial, loading: profileLoading } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [referralCode, setReferralCode] = useState("");

  const handleSubscribe = async (planRole: 'athlete' | 'coach') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error("Debes iniciar sesión con un email válido.");

      const { data, error } = await supabase.functions.invoke('create-mp-subscription', {
        body: {
          planType: billingCycle,
          roleType: planRole,
          userId: user.id,
          email: user.email,
          referralCode: referralCode,
          backUrl: window.location.href
        }
      });

      if (error) throw error;
      if (data?.url) {
          toast.info("Redirigiendo a Mercado Pago...");
          window.location.href = data.url;
      }
      
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con el procesador de pagos.");
    } finally {
      setIsLoading(false);
    }
  };

  if (profileLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-red-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card className="border-zinc-800 bg-zinc-950 overflow-hidden relative">
        {hasProAccess && <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-red-600 via-blue-600 to-yellow-600" />}
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
              Estado de Cuenta
              {hasProAccess ? (
                 <Badge className="bg-red-600 border-0 font-black">PRO ACTIVO</Badge>
              ) : (
                 <Badge variant="outline" className="text-zinc-500 border-zinc-800 font-bold">FREE PLAN</Badge>
              )}
            </h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
              {hasProAccess 
                ? daysLeftInTrial > 0 
                  ? `Fase de Prueba: Quedan ${daysLeftInTrial} días de acceso total.`
                  : "Membresía Premium activa por suscripción."
                : "Limitado a funciones de bitácora básica."}
            </p>
          </div>
          {hasProAccess && !daysLeftInTrial && (
             <Button variant="outline" onClick={() => window.open("https://www.mercadopago.com.ar/subscriptions", "_blank")} className="border-zinc-800 bg-zinc-900 font-bold text-xs uppercase h-10">
               Gestionar Cobros <ExternalLink className="ml-2 h-3 w-3" />
             </Button>
          )}
        </CardContent>
      </Card>

      {!hasProAccess && (
        <div className="space-y-8">
          
          {/* Selector de Ciclo */}
          <div className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full max-w-[300px]">
                  <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={cn(
                        "py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        billingCycle === 'monthly' ? "bg-zinc-800 text-white" : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    Mensual
                  </button>
                  <button 
                    onClick={() => setBillingCycle('yearly')}
                    className={cn(
                        "py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1",
                        billingCycle === 'yearly' ? "bg-red-600 text-white" : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    Anual <span className="text-[8px] bg-black/20 px-1 rounded">-25%</span>
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* PLAN ATLETA */}
             <Card className="relative overflow-hidden border-zinc-800 bg-zinc-950 flex flex-col hover:border-blue-600/30 transition-all">
                <CardHeader>
                  <CardTitle className="flex flex-col gap-1">
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Atleta PRO</span>
                     <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-4xl font-black text-white">{billingCycle === 'monthly' ? '$9.900' : '$89.000'}</span>
                        <span className="text-zinc-500 text-xs font-bold uppercase">{billingCycle === 'monthly' ? '/ MES' : '/ AÑO'}</span>
                     </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                   <BenefitItem>Auditoría IA de Sesión</BenefitItem>
                   <BenefitItem>Bio-Stop Pre-Entreno</BenefitItem>
                   <BenefitItem>Control de Nutrición PRO</BenefitItem>
                   <BenefitItem>Bóveda de Química Privada</BenefitItem>
                </CardContent>
                <CardFooter className="pt-4">
                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic tracking-widest h-12"
                        onClick={() => handleSubscribe('athlete')}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "ELEGIR ATLETA"}
                    </Button>
                </CardFooter>
             </Card>

             {/* PLAN COACH */}
             <Card className="relative overflow-hidden border-red-600/30 bg-black flex flex-col shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:border-red-500 transition-all scale-[1.02]">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-lg tracking-tighter">ELITE</div>
                <CardHeader>
                    <CardTitle className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Coach Hub</span>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-4xl font-black text-white">{billingCycle === 'monthly' ? '$29.900' : '$269.000'}</span>
                            <span className="text-zinc-500 text-xs font-bold uppercase">{billingCycle === 'monthly' ? '/ MES' : '/ AÑO'}</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    <BenefitItem icon={<Star className="h-3 w-3 text-yellow-500 fill-current"/>}>Incluye tu Atleta PRO</BenefitItem>
                    <BenefitItem icon={<Users className="h-3 w-3 text-red-500"/>}>Gestión de hasta 50 Alumnos</BenefitItem>
                    <BenefitItem icon={<Zap className="h-3 w-3 text-red-500"/>}>Business Hub & Analytics</BenefitItem>
                    <BenefitItem icon={<ShieldCheck className="h-3 w-3 text-red-500"/>}>Auditoría de Protocolos IA</BenefitItem>
                </CardContent>
                <CardFooter className="pt-4">
                    <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest h-12 shadow-xl shadow-red-900/20"
                        onClick={() => handleSubscribe('coach')}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "ELEGIR COACH HUB"}
                    </Button>
                </CardFooter>
             </Card>
          </div>

          {/* Cupón de Referido */}
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center gap-2 text-zinc-500">
                  <Ticket className="h-4 w-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">¿Tenés un código de descuento?</h4>
              </div>
              <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                      <Input 
                        value={referralCode} 
                        onChange={e => setReferralCode(e.target.value.toUpperCase())} 
                        placeholder="CÓDIGO DEL TEAM" 
                        className="bg-black border-zinc-800 h-10 pl-10 font-mono font-bold uppercase placeholder:text-zinc-800" 
                      />
                  </div>
              </div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase italic text-center">Aplica un 10% OFF extra en cualquier plan.</p>
          </div>
        </div>
      )}
    </div>
  );
}

const BenefitItem = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    {icon || <Check className="w-3.5 h-3.5 text-green-500" />}
    <span className="text-[11px] font-bold uppercase tracking-tight text-zinc-400">{children}</span>
  </div>
);