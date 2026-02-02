import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
    Star, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck, Lock, MessageCircle, DollarSign, Calculator, XCircle
} from "lucide-react";
import { CoachApplicationForm } from "@/components/landing/CoachApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function CoachLanding() {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    window.open("https://wa.me/5491154821533?text=Hola!%20Tengo%20una%20duda%20específica%20sobre%20el%20Founders%20Club%20de%20Heavy%20Duty", "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-yellow-500/30 relative overflow-x-hidden">
      
      {/* 1. HERO SECTION - BUSINESS FOCUS */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black z-10" />
           <img 
             src="/coach-hero.jpg" 
             className="w-full h-full object-cover grayscale contrast-150 opacity-40 scale-105 transition-transform duration-[10s] hover:scale-110"
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
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Star className="w-3.5 h-3.5 fill-current" /> SOFTWARE DE GESTIÓN EMPRESARIAL HIGH-TICKET
           </div>

           <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                SI COBRÁS COMO UN <span className="text-yellow-600">PRO</span>,<br/>
                <span className="text-zinc-700">GESTIONÁ COMO UN PRO.</span>
              </h1>
           </div>

           <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase italic leading-tight">
             Tus alumnos pagan $150.000 por un servicio Premium. No podés seguir mandando un Excel. Dales App propia, Inteligencia Artificial y justificá tu tarifa.
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
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-6">Posicionate en la cima del mercado de asesorías</p>
           </div>
        </div>
      </section>

      {/* 2. BUSINESS CASE - ROI CALCULATOR BLOCK */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto bg-black border-2 border-yellow-600/30 rounded-[3rem] p-10 md:p-16 text-center space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Calculator className="w-40 h-40 text-yellow-500" /></div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">LA MATEMÁTICA ES SIMPLE</h2>
            <div className="space-y-6 max-w-2xl mx-auto">
                <p className="text-lg md:text-xl text-zinc-400 font-bold leading-relaxed uppercase">
                    Si nuestra IA recupera a <span className="text-white">UN SOLO ALUMNO</span> que se iba a dar de baja, o el Generador de Marketing te consigue <span className="text-white">UN CLIENTE NUEVO</span>...
                </p>
                <div className="py-6 bg-yellow-600/10 rounded-2xl border border-yellow-600/20">
                    <p className="text-3xl md:text-4xl font-black uppercase italic text-yellow-500 tracking-tighter">
                        LA SUSCRIPCIÓN ANUAL YA SE PAGÓ SOLA.
                    </p>
                </div>
                <p className="text-zinc-500 font-bold uppercase text-sm italic">
                    El resto de tus alumnos son ganancia limpia.
                </p>
            </div>
        </div>
      </section>

      {/* 3. PRICING TABLE - INVESTMENT LOGIC */}
      <section className="py-24 md:py-32 px-6 bg-black">
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">PLANES DE INVERSIÓN EMPRESARIAL</h2>
                <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.3em]">ESCALÁ TU MARCA PERSONAL</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* STARTER */}
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden opacity-80">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">COACH STARTER</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-5xl font-black text-white">$95.000</span>
                            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">Costo de {"<"} 1 Alumno</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-10">
                        <PricingFeature text="Hasta 15 Alumnos" active />
                        <PricingFeature text="IA Auditoría Estándar" active />
                        <PricingFeature text="Bitácora Atleta Incluida" active />
                        <PricingFeature text="Generador de Marketing" active={false} />
                        <PricingFeature text="Radar de Churn" active={false} />
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
                            <span className="text-yellow-600/60 text-[10px] font-black uppercase tracking-widest mt-2">Costo de ~1 Alumno High-Ticket</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-10">
                        <PricingFeature text="Hasta 60 Alumnos" active highlight color="text-yellow-500" />
                        <PricingFeature text="IA Auditoría Prioridad Alta" active highlight color="text-yellow-500" />
                        <PricingFeature text="Generador de Marketing Viral" active highlight color="text-yellow-500" />
                        <PricingFeature text="Radar de Churn (Anti-Fuga)" active highlight color="text-yellow-500" />
                        <PricingFeature text="Migración Asistida (VIP)" active highlight color="text-yellow-500" />
                    </CardContent>
                    <CardFooter className="p-10 pt-0">
                        <Button className="w-full h-16 bg-yellow-600 hover:bg-yellow-700 text-black font-black uppercase italic tracking-widest text-sm shadow-2xl" onClick={() => navigate('/auth')}>ELEGIR ELITE</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      {/* 4. FAQ - COACH BUSINESS QUESTIONS */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-600/10 rounded-lg">
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">FINANZAS & NEGOCIO</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <FAQItem 
                    value="item-price"
                    question="¿Es caro?"
                    answer="Representa un costo operativo aproximado del 4%. Si facturás 2 Millones de pesos (20 alumnos x $100k), pagar $95k por la herramienta que sostiene todo el negocio, audita a tus alumnos por vos y te consigue nuevos clientes con marketing IA, es la inversión más barata que vas a hacer en el año."
                />
                <FAQItem 
                    value="item-migration"
                    question="¿Qué es la Migración Asistida VIP?"
                    answer="Si elegís el Plan Elite, no tenés que cargar un solo dato. Nos pasás tus Excels o notas actuales y nuestro equipo técnico migra todo tu historial de alumnos a la app en menos de 48hs. Empezás a usar el sistema llave en mano."
                />
            </Accordion>
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

const PricingFeature = ({ text, active = true, highlight = false, color = "text-zinc-500" }: any) => (
    <div className={cn("flex items-center gap-4", !active && "opacity-20")}>
        {active ? <CheckCircle2 className={cn("h-4 w-4", highlight ? color : "text-zinc-600")} /> : <XCircle className="h-4 w-4 text-zinc-800" />}
        <span className={cn("text-[11px] font-black uppercase tracking-widest", active ? "text-zinc-300" : "text-zinc-800", highlight && color)}>{text}</span>
    </div>
);

const FAQItem = ({ value, question, answer }: any) => (
    <AccordionItem value={value} className="border-zinc-800 bg-zinc-900/40 rounded-3xl px-10 border transition-all hover:border-zinc-700">
        <AccordionTrigger className="text-left font-black uppercase tracking-widest text-zinc-100 hover:text-white hover:no-underline py-8 text-sm">
            {question}
        </AccordionTrigger>
        <AccordionContent className="text-zinc-400 text-sm leading-relaxed pb-8 italic font-medium">
            {answer}
        </AccordionContent>
    </AccordionItem>
);