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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    Brain, Briefcase, Zap, 
    ArrowRight, TrendingUp, Sparkles, 
    Star, CheckCircle2, ChevronRight, ShieldCheck, DollarSign, Calculator, Users, Trophy, 
    Diamond, MessageCircle, AlertTriangle
} from "lucide-react";
import { CoachApplicationForm } from "@/components/landing/CoachApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function CoachLanding() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white flex flex-col selection:bg-yellow-500/30 relative overflow-x-hidden">
        
        {/* NAV FIX: Fixed top bar for business landing */}
        <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-zinc-900 z-[100]">
            <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
              <img src="/logo.png" className="h-7 md:h-10 w-auto brightness-0 invert" alt="Heavy Duty" />
              <div className="flex gap-4 items-center">
                <button 
                    onClick={() => navigate("/")}
                    className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors border-r border-zinc-800 pr-4 mr-1"
                >
                    Soy Atleta
                </button>
                <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-white font-bold uppercase text-[9px] md:text-[10px] tracking-widest border border-zinc-800 h-8 md:h-9"
                    onClick={() => navigate("/auth?role=coach")}
                >
                    Entrar
                </Button>
              </div>
            </div>
        </nav>

        {/* HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black z-10" />
            <img 
              src="/coach-hero.jpg" 
              className="w-full h-full object-cover grayscale contrast-150 opacity-40 scale-105"
              alt="Coach Premium Management"
            />
          </div>

          <div className="relative z-20 max-w-5xl text-center space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 md:mb-4">
                <Star className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" /> SOFTWARE DE GESTIÓN PARA PREPARADORES ELITE
            </div>

            <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                  SI COBRÁS COMO UN <span className="text-yellow-600">PRO</span>,<br/>
                  <span className="text-zinc-700">GESTIONÁ COMO UN PRO.</span>
                </h1>
            </div>

            <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase italic leading-tight px-4">
              App propia para tus alumnos, Auditoría Técnica con IA y Business Intelligence. Justificá tu tarifa con tecnología de vanguardia.
            </p>

            <div className="pt-6 md:pt-8">
                <Button 
                  className="h-20 md:h-24 px-8 md:px-12 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black uppercase italic text-xl md:text-2xl shadow-[0_0_60px_rgba(245,158,11,0.3)] border-2 border-yellow-400/20 rounded-2xl transition-all"
                  onClick={() => {
                      const el = document.getElementById('pricing-plans');
                      el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  VER PLANES Y PRECIOS
                </Button>
            </div>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section id="pricing-plans" className="py-20 md:py-32 px-6 bg-zinc-950 border-y border-zinc-900 scroll-mt-20">
          <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
              <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter">GRILLA DE PRECIOS</h2>
                  <p className="text-zinc-500 font-bold uppercase text-[10px] md:text-xs tracking-[0.3em]">INVERSIÓN MENSUAL EN TU NEGOCIO</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8 md:pt-0">
                  
                  {/* STARTER */}
                  <Card className="bg-zinc-900/50 border border-zinc-800 flex flex-col overflow-hidden transition-all hover:border-zinc-700">
                      <CardHeader className="text-center pb-8 border-b border-zinc-800">
                          <div className="flex justify-center mb-4"><Users className="h-8 w-8 text-zinc-600" /></div>
                          <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">COACH STARTER</CardTitle>
                          <div className="pt-6">
                              <span className="text-4xl md:text-5xl font-black text-white">$48.000</span>
                              <span className="text-zinc-600 text-xs font-bold uppercase ml-2">ARS / mes</span>
                          </div>
                          <p className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase mt-4 italic">"Dejá el Excel."</p>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-5 py-8 md:py-10 px-8">
                          <PlanFeature text="Hasta 15 Alumnos" active />
                          <PlanFeature text="IA Auditoría Estándar" active />
                          <PlanFeature text="Migración Manual" active />
                          <PlanFeature text="Marketing Generator" active={false} />
                          <PlanFeature text="Business Audit" active={false} />
                          <PlanFeature text="Roadmap Estándar" active />
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                          <Button variant="outline" className="w-full h-14 border-zinc-800 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[10px]" onClick={() => navigate('/auth?role=coach')}>EMPE ZAR PRUEBA</Button>
                      </CardFooter>
                  </Card>

                  {/* PRO (RECOMENDADO) */}
                  <Card className="bg-black border-2 border-red-600 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(220,38,38,0.15)] z-10 md:scale-105 mt-4 md:mt-0">
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-6 py-2 rounded-bl-xl tracking-[0.2em] z-20 shadow-xl">MÁS ELEGIDO</div>
                      <CardHeader className="text-center pb-8 border-b border-red-900/20 bg-red-600/5">
                          <div className="flex justify-center mb-4"><Zap className="h-8 w-8 text-red-500 fill-current" /></div>
                          <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-red-500">COACH HUB</CardTitle>
                          <div className="pt-6">
                              <span className="text-4xl md:text-5xl font-black text-white">$85.000</span>
                              <span className="text-zinc-600 text-xs font-bold uppercase ml-2">ARS / mes</span>
                          </div>
                          <p className="text-[10px] md:text-[11px] font-black text-red-500 uppercase mt-4 italic">"Escalá tu Negocio."</p>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-5 py-8 md:py-10 px-8">
                          <PlanFeature text="Hasta 50 Alumnos" active highlight />
                          <PlanFeature text="🔥 IA Auditoría Prioridad Alta" active highlight />
                          <PlanFeature text="✅ Marketing Generator" active highlight />
                          <PlanFeature text="✅ Business Audit" active highlight />
                          <PlanFeature text="Migración Asistida" active highlight />
                          <PlanFeature text="Roadmap Estándar" active />
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                          <Button className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-[11px] md:text-sm shadow-2xl" onClick={() => navigate('/auth?role=coach')}>OBTENER PLAN HUB</Button>
                      </CardFooter>
                  </Card>

                  {/* AGENCY (ELITE) */}
                  <Card className="bg-zinc-900/50 border border-zinc-800 flex flex-col overflow-hidden transition-all hover:border-zinc-700 mt-4 md:mt-0">
                      <CardHeader className="text-center pb-8 border-b border-zinc-800">
                          <div className="flex justify-center mb-4"><Diamond className="h-8 w-8 text-blue-500" /></div>
                          <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">COACH AGENCY</CardTitle>
                          <div className="pt-6">
                              <span className="text-4xl md:text-5xl font-black text-white">$150.000</span>
                              <span className="text-zinc-600 text-xs font-bold uppercase ml-2">ARS / mes</span>
                          </div>
                          <p className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase mt-4 italic">"Dominá el Mercado."</p>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-5 py-8 md:py-10 px-8">
                          <PlanFeature text="Ilimitado / Multi-cuenta" active />
                          <PlanFeature text="🔥 IA Auditoría Prioridad Alta" active />
                          <PlanFeature text="Marketing Generator" active />
                          <PlanFeature text="Business Audit" active />
                          <PlanFeature text="Asistida + Personal" active />
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <div className="flex items-center gap-3 cursor-help group">
                                      <CheckCircle2 className="h-3.5 md:h-4 w-3.5 md:w-4 text-blue-500" />
                                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500 border-b border-dashed border-blue-500/50 pb-0.5">💎 Solicitud de Funciones</span>
                                  </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-blue-600 text-white border-none p-4 max-w-xs shadow-2xl">
                                  <p className="font-bold text-xs leading-relaxed">
                                      ¿Te falta una herramienta específica? Como cliente Agency, tenés línea directa con nuestro equipo de desarrollo. Vos pedís, nosotros lo construimos. Convertite en co-creador de la plataforma.
                                  </p>
                              </TooltipContent>
                          </Tooltip>
                      </CardContent>
                      <CardFooter className="p-8 pt-0">
                          <Dialog>
                              <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full h-14 border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white font-black uppercase tracking-widest text-[10px]">APLICAR AHORA</Button>
                              </DialogTrigger>
                              <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                                  <DialogHeader>
                                      <DialogTitle className="text-2xl font-black uppercase italic text-blue-500">Contacto VIP Agency</DialogTitle>
                                      <DialogDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Atención directa con el equipo de desarrollo</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-8 text-center space-y-6">
                                      <div className="mx-auto bg-blue-500/10 p-4 rounded-full w-fit">
                                          <MessageCircle className="h-12 w-12 text-blue-500" />
                                      </div>
                                      <p className="text-sm text-zinc-400">Las cuentas Agency requieren una entrevista técnica inicial para entender tus necesidades de desarrollo a medida.</p>
                                      <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black uppercase italic" onClick={() => window.open('https://wa.me/5491112345678?text=Hola!%20Quiero%20aplicar%20al%20Plan%20Agency', '_blank')}>
                                          HABLAR CON UN ASESOR
                                      </Button>
                                  </div>
                              </DialogContent>
                          </Dialog>
                      </CardFooter>
                  </Card>
              </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 md:py-32 px-6 bg-black border-t border-zinc-900">
          <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
              <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">PREGUNTAS FRECUENTES</h2>
                  <p className="text-zinc-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em]">VISIÓN EMPRESARIAL PARA COACHES</p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                  
                  <AccordionItem value="item-1" className="border border-zinc-900 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-white text-left leading-snug">
                          1. ¿$85.000 no es caro para una App?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Miralo como empresario: Si cobrás una cuota promedio de $50.000 - $80.000, con un solo alumno y medio ya pagaste todo el sistema. El plan PRO te permite gestionar hasta 50 alumnos. Básicamente, usás el ingreso de 1 alumno para pagar la herramienta y los otros 49 son ganancia limpia. No es un gasto, es el costo operativo más bajo de tu negocio (apenas el 4% de tu facturación potencial).
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border border-zinc-900 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-white text-left leading-snug">
                          2. ¿Qué significa que puedo "Pedir Funciones" en el Plan Agency?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Es nuestro servicio más exclusivo. Entendemos que los grandes equipos tienen necesidades únicas. Si sos Plan Agency ($150.000), tenés línea directa con nuestro equipo de desarrollo. ¿Necesitás un reporte específico para tu centro? ¿Una integración especial? Lo pedís y lo ponemos en nuestro mapa de desarrollo. Es lo más parecido a tener tu propio equipo de programadores, sin gastar millones.
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border border-zinc-900 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-white text-left leading-snug">
                          3. Tengo 40 alumnos en Excel. ¿Es muy difícil pasarlos a la App?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Sabemos que migrar da pereza, por eso lo hacemos nosotros. Si entrás al plan PRO o AGENCY, tenés incluido el servicio de Migración Asistida. Nos pasás tus planillas y nosotros te entregamos la cuenta con todos tus alumnos cargados y listos para empezar. Vos no perdés ni una hora cargando datos.
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border border-zinc-900 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-white text-left leading-snug">
                          4. ¿La IA va a reemplazar mi trabajo?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Absolutamente no. La IA es tu Secretario, no el Jefe. El sistema se encarga de lo operativo: auditar series, detectar quién se está por bajar y avisarte si alguien no pagó. La Estrategia y la Relación Humana siguen siendo 100% tuyas. La app hace que tu servicio se vea Premium, lo que te permite cobrar más caro.
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5" className="border border-zinc-900 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-white text-left leading-snug">
                          5. ¿Es obligatorio usar el sistema "Heavy Duty" con todos?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        La app prioriza la Alta Intensidad, pero la física es universal. El motor de IA audita la Sobrecarga Progresiva (subir peso, reps o mejorar técnica). Si usás otros sistemas (PPL, Upper/Lower), la herramienta te sirve igual para demostrarle a tu alumno con datos duros que está progresando (o estancado).
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6" className="border border-zinc-800 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-zinc-400 text-left leading-snug">
                          6. ¿Cómo se cobra? ¿Dólares o Pesos?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Estamos en Argentina. **Cobramos en Pesos Argentinos** a través de Mercado Pago (Débito Automático). El precio es final y te damos factura para que puedas deducirlo como gasto de tu negocio.
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7" className="border border-zinc-800 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-zinc-400 text-left leading-snug">
                          7. ¿Qué pasa si mis alumnos no quieren pagar la versión PRO?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Como Coach, vos tenés acceso total a tu Dashboard. Tus alumnos pueden usar la versión GRATUITA de la app (Bitácora básica) y vos igual ves sus datos. Sin embargo, recomendamos que el alumno tenga la versión PRO para recibir el feedback de la IA en tiempo real, lo que te ahorra a vos tener que corregir cada serie manualmente. Muchos coaches incluyen el costo de la app dentro de su cuota mensual para simplificar.
                      </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8" className="border border-zinc-800 bg-zinc-900/20 rounded-3xl px-6 md:px-8">
                      <AccordionTrigger className="hover:no-underline font-black uppercase italic text-sm md:text-base py-6 md:py-8 text-zinc-400 text-left leading-snug">
                          8. ¿La IA habla con mis alumnos? ¿Qué tono usa?
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-xs md:text-sm font-medium border-t border-zinc-800/50 pt-6">
                        Sí, y vos lo controlás. Desde tu panel, configurás la personalidad del "Auditor IA". Podés elegir entre un "Sargento Estricto", un "Motivador Eufórico" o un "Analista Frío". El alumno siente que sos vos (o tu equipo) quien le está marcando el ritmo, manteniendo tu identidad de marca.
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          </div>
        </section>

        <footer className="p-12 text-center border-t border-zinc-900 bg-black">
          <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-20 mx-auto mb-8" alt="Logo" />
          <div className="space-y-4">
              <p className="text-zinc-800 text-[9px] md:text-[10px] font-mono tracking-[0.4em] uppercase">
                &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — Enterprise Edition v17.09
              </p>
              <button 
                onClick={() => navigate("/admin/login")}
                className="text-zinc-900 hover:text-zinc-700 text-[8px] font-black uppercase tracking-widest transition-colors"
              >
                  Acceso Administración
              </button>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}

const PlanFeature = ({ text, active = true, highlight = false }: any) => (
    <div className={cn("flex items-center gap-4", !active && "opacity-20")}>
        {active ? <CheckCircle2 className={cn("h-3.5 md:h-4 w-3.5 md:w-4", highlight ? "text-red-500" : "text-zinc-600")} /> : <XCircle className="h-3.5 md:h-4 w-3.5 md:w-4 text-zinc-800" />}
        <span className={cn("text-[10px] md:text-[11px] font-black uppercase tracking-widest", active ? "text-zinc-300" : "text-zinc-800", highlight && "text-white")}>{text}</span>
    </div>
);

function XCircle({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
}