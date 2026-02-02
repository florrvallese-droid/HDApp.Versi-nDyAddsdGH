import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { 
    Brain, Briefcase, Zap, 
    ArrowRight, MessageSquare, TrendingUp, Sparkles, 
    Star, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck, Lock, MessageCircle, DollarSign, Calculator, Users, Trophy, BarChart3, Image as ImageIcon
} from "lucide-react";
import { CoachApplicationForm } from "@/components/landing/CoachApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function CoachLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-yellow-500/30 relative overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black z-10" />
           <img 
             src="/coach-hero.jpg" 
             className="w-full h-full object-cover grayscale contrast-150 opacity-40 scale-105 transition-transform duration-[10000ms] hover:scale-110"
             alt="Coach Premium Management"
           />
        </div>

        <nav className="absolute top-0 w-full max-w-7xl mx-auto flex justify-between items-center p-6 z-50">
            <img src="/logo.png" className="h-8 md:h-10 w-auto brightness-0 invert" alt="Heavy Duty" />
            <div className="flex gap-4 items-center">
                <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-white font-bold uppercase text-[10px] tracking-widest border border-zinc-800 h-9"
                    onClick={() => navigate("/auth")}
                >
                    Entrar al Panel
                </Button>
            </div>
        </nav>

        <div className="relative z-20 max-w-5xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              <Star className="w-3.5 h-3.5 fill-current" /> SOFTWARE DE GESTIÓN PARA PREPARADORES ELITE
           </div>

           <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                SI COBRÁS COMO UN <span className="text-yellow-600">PRO</span>,<br/>
                <span className="text-zinc-700">GESTIONÁ COMO UN PRO.</span>
              </h1>
           </div>

           <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase italic leading-tight">
             App propia para tus alumnos, Auditoría Técnica con IA y Business Intelligence. Justificá tu tarifa con tecnología de vanguardia.
           </p>

           <div className="pt-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-24 px-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black uppercase italic text-2xl shadow-[0_0_60px_rgba(245,158,11,0.3)] border-2 border-yellow-400/20 rounded-2xl transition-all">
                     APLICAR AL FOUNDERS CLUB
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                   <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase italic text-yellow-500">Formulario de Aplicación</DialogTitle>
                      <DialogDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mt-1">Founders Club: Solo 50 Vacantes</DialogDescription>
                   </DialogHeader>
                   <CoachApplicationForm />
                </DialogContent>
              </Dialog>
           </div>
        </div>
      </section>

      {/* CORE BUSINESS TOOLS SECTION */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-32">
            
            {/* 1. Business Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 font-black uppercase px-3 py-1">Management Hub</Badge>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">TU PANEL DE<br/><span className="text-zinc-700">COMANDO CENTRAL</span></h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">Gestioná tus alumnos con precisión clínica. Control de pagos, vencimientos, modo competidor y ficha técnica biológica unificada.</p>
                    <ul className="space-y-4">
                        <FeatureItem text="Control de cobros y deudores en tiempo real." />
                        <FeatureItem text="Vínculo digital directo con la App del atleta." />
                        <FeatureItem text="Biblioteca de plantillas de protocolos (HIT/Heavy Duty)." />
                    </ul>
                </div>
                <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-2xl relative">
                    <Briefcase className="w-full h-auto text-zinc-800 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={200} />
                    <div className="relative z-10 space-y-6">
                        <div className="h-12 w-48 bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-zinc-950 rounded-xl border border-zinc-800" />
                            <div className="h-24 bg-zinc-950 rounded-xl border border-zinc-800" />
                        </div>
                        <div className="h-32 bg-red-600/10 rounded-xl border border-red-600/20" />
                    </div>
                </div>
            </div>

            {/* 2. Smart Briefing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center md:flex-row-reverse">
                <div className="md:order-2 space-y-8">
                    <Badge variant="outline" className="text-red-500 border-red-500/30 font-black uppercase px-3 py-1">Daily Briefing IA</Badge>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">NO PIERDAS TIEMPO<br/><span className="text-zinc-700">BUSCANDO DATOS</span></h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">Nuestra IA audita la actividad de todos tus alumnos y te resume lo importante cada mañana. Te avisa quién se estancó, quién batió un récord y quién reportó dolor.</p>
                    <ul className="space-y-4">
                        <FeatureItem text="Snapshot financiero: Quién debe pagar hoy." />
                        <FeatureItem text="Alertas de regresión: Detectamos mesetas antes que el atleta." />
                        <FeatureItem text="Briefing técnico: Resumen de carga del equipo." />
                    </ul>
                </div>
                <div className="md:order-1 bg-black rounded-3xl border-2 border-red-600/30 p-8 shadow-[0_0_50px_rgba(220,38,38,0.1)]">
                    <Brain className="w-12 h-12 text-red-600 mb-6" />
                    <div className="space-y-4">
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 border-l-4 border-l-red-500">
                            <p className="text-[10px] font-black uppercase text-zinc-500">Alerta de Salud</p>
                            <p className="text-sm font-bold text-white mt-1">Juan Perez reportó dolor lumbar agudo en Sentadilla.</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 border-l-4 border-l-green-500">
                            <p className="text-[10px] font-black uppercase text-zinc-500">Hito de Progreso</p>
                            <p className="text-sm font-bold text-white mt-1">Maria Lopez superó su 1RM en Prensa x 12%.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Marketing IA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <Badge variant="outline" className="text-blue-500 border-blue-500/30 font-black uppercase px-3 py-1">Marketing Generator</Badge>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">CONVERTÍ LOGROS<br/><span className="text-zinc-700">EN CLIENTES</span></h2>
                    <p className="text-zinc-400 text-lg leading-relaxed font-medium">Generador automático de casos de éxito. La IA toma los datos reales del entrenamiento del alumno y te crea el Copy para Instagram y la Placa Visual lista para compartir.</p>
                    <ul className="space-y-4">
                        <FeatureItem text="Diseño de placas Story-ready con tu logo." />
                        <FeatureItem text="Copies persuasivos basados en evidencia real." />
                        <FeatureItem text="Posicionamiento como autoridad técnica." />
                    </ul>
                </div>
                <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-8 flex flex-col items-center justify-center gap-6">
                    <ImageIcon className="w-12 h-12 text-zinc-700" />
                    <div className="w-48 aspect-[9/16] bg-black border-2 border-red-600 rounded-2xl p-4 flex flex-col justify-between">
                         <div className="h-4 w-12 bg-red-600 rounded" />
                         <div className="h-2 w-full bg-zinc-800 rounded" />
                         <div className="h-2 w-2/3 bg-zinc-800 rounded" />
                         <div className="h-10 w-full bg-red-600/20 rounded-lg" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Contenido generado en 2 segundos</p>
                </div>
            </div>

        </div>
      </section>

      {/* ROI CALCULATOR BLOCK */}
      <section className="py-24 md:py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto bg-zinc-950 border-2 border-yellow-600/30 rounded-[3rem] p-10 md:p-16 text-center space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Calculator className="w-40 h-40 text-yellow-500" /></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">LA MATEMÁTICA <br/><span className="text-yellow-600">DEL BUSINESS</span></h2>
            <div className="space-y-6 max-w-2xl mx-auto">
                <p className="text-lg md:text-xl text-zinc-400 font-bold leading-relaxed uppercase">
                    Si nuestra IA recupera a <span className="text-white">UN SOLO ALUMNO</span> que se iba a dar de baja, o el Generador de Marketing te consigue <span className="text-white">UN CLIENTE NUEVO</span>...
                </p>
                <div className="py-6 bg-yellow-600/10 rounded-2xl border border-yellow-600/20">
                    <p className="text-3xl md:text-4xl font-black uppercase italic text-yellow-500 tracking-tighter">
                        LA SUSCRIPCIÓN ANUAL YA SE PAGÓ SOLA.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* PRICING TABLE SECTION */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">FOUNDERS CLUB — PLANES</h2>
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.3em]">RESERVÁ TU LUGAR COMO FUNDADOR</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* STARTER */}
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden opacity-80">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">COACH STARTER</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-5xl font-black text-white">$95.000</span>
                            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">PAGO ÚNICO ANUAL</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-10">
                        <PricingFeature text="Hasta 15 Alumnos" active />
                        <PricingFeature text="Gestión de Pagos" active />
                        <PricingFeature text="Auditoría IA Básica" active />
                        <PricingFeature text="Marketing Generator" active={false} />
                        <PricingFeature text="Migración VIP" active={false} />
                    </CardContent>
                    <CardFooter className="p-10 pt-0">
                        <Button variant="outline" className="w-full h-16 border-zinc-800 text-zinc-500 hover:text-white font-black uppercase tracking-widest text-xs" onClick={() => navigate('/auth')}>ELEGIR STARTER</Button>
                    </CardFooter>
                </Card>

                {/* ELITE */}
                <Card className="bg-black border-2 border-yellow-600 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(202,138,4,0.2)]">
                    <div className="absolute top-0 right-0 bg-yellow-600 text-black text-[9px] font-black uppercase px-6 py-2 rounded-bl-xl tracking-[0.2em] z-10 shadow-xl">RECOMENDADO</div>
                    <CardHeader className="text-center pb-8 border-b border-yellow-900/20 bg-yellow-600/5">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-yellow-600">COACH ELITE</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-5xl font-black text-white">$180.000</span>
                            <span className="text-yellow-600/60 text-[10px] font-black uppercase tracking-widest mt-2">PAGO ÚNICO ANUAL</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-10">
                        <PricingFeature text="Alumnos ILIMITADOS" active highlight color="text-yellow-500" />
                        <PricingFeature text="Smart Briefing IA Diario" active highlight color="text-yellow-500" />
                        <PricingFeature text="Generador de Marketing Viral" active highlight color="text-yellow-500" />
                        <PricingFeature text="Radar de Churn (IA)" active highlight color="text-yellow-500" />
                        <PricingFeature text="Migración Asistida VIP" active highlight color="text-yellow-500" />
                    </CardContent>
                    <CardFooter className="p-10 pt-0">
                        <Button className="w-full h-16 bg-yellow-600 hover:bg-yellow-700 text-black font-black uppercase italic tracking-widest text-sm shadow-2xl" onClick={() => navigate('/auth')}>UNIRSE AL ELITE</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      <footer className="p-12 text-center border-t border-zinc-900 bg-black">
        <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-20 mx-auto mb-8" alt="Logo" />
        <p className="text-zinc-800 text-[10px] font-mono tracking-[0.4em] uppercase">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — Enterprise Edition v1.1
        </p>
      </footer>
    </div>
  );
}

const FeatureItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 shrink-0" />
        <span className="text-zinc-300 font-bold uppercase text-[10px] tracking-widest">{text}</span>
    </li>
);

const PricingFeature = ({ text, active = true, highlight = false, color = "text-zinc-500" }: any) => (
    <div className={cn("flex items-center gap-4", !active && "opacity-20")}>
        {active ? <CheckCircle2 className={cn("h-4 w-4", highlight ? color : "text-zinc-600")} /> : <XCircle className="h-4 w-4 text-zinc-800" />}
        <span className={cn("text-[11px] font-black uppercase tracking-widest", active ? "text-zinc-300" : "text-zinc-800", highlight && color)}>{text}</span>
    </div>
);

function XCircle({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
}