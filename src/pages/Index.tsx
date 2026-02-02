import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/services/supabase";
import { 
    Brain, TrendingUp, Star, Users, Activity, 
    Gavel, Zap, BarChart3, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowRight, HelpCircle, ShieldCheck, Target, FileText, FlaskConical, Clock, DollarSign, Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-red-500/30 font-sans overflow-x-hidden">
      
      {/* NAV FIX: Sticky or absolute with enough padding */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-zinc-900 z-[100]">
          <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:p-6">
            <img src="/logo.png" className="h-7 md:h-10 w-auto brightness-0 invert" alt="Heavy Duty" />
            <div className="flex gap-3 md:gap-4 items-center">
                <button 
                    onClick={() => navigate("/coach-landing")}
                    className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-r border-zinc-800 pr-4 mr-1"
                >
                    Soy Coach
                </button>
                <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-white font-bold uppercase text-[9px] md:text-[10px] tracking-widest border border-zinc-800 h-8 md:h-9"
                    onClick={() => navigate("/auth?tab=login")}
                >
                    Entrar
                </Button>
            </div>
          </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20 md:pt-0">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-zinc-800/10 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl text-center space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           
           {/* BADGE UPDATED */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/5 text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-4">
              <Star className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" /> EL SISTEMA DEFINITIVO PARA EL ALTO RENDIMIENTO
           </div>

           {/* TITLE UPDATED */}
           <div className="space-y-4">
              <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                HEAVY DUTY
              </h1>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-[0.15em] md:tracking-[0.3em] leading-tight">
                <span className="text-white">TU CUADERNO</span> <span className="text-red-600">DE ENTRENAMIENTO INTELIGENTE</span>
              </h2>
           </div>

           <div className="space-y-4 max-w-2xl mx-auto pt-4">
              <p className="text-base md:text-xl text-zinc-400 font-bold uppercase italic tracking-tight leading-relaxed px-4">
                Te matás entrenando, comés bien y descansás... pero el espejo te devuelve la misma imagen hace meses. 
                <span className="text-white"> Dejá de tirar tu tiempo a la basura persiguiendo sensaciones </span> 
                y empezá a construir un cuerpo real con la única verdad que no miente: los datos.
              </p>
           </div>

           <div className="pt-6 md:pt-8 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="h-16 md:h-20 px-8 md:px-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-xl md:text-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] border-2 border-red-400/20 rounded-xl group transition-all"
                onClick={() => navigate("/auth?tab=signup")}
              >
                PROBAR PRO (7 DÍAS GRATIS)
                <ArrowRight className="ml-3 h-5 md:h-6 w-5 md:w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[9px] md:text-[10px] text-zinc-600 uppercase font-black tracking-widest italic text-center">Inversión inteligente. Resultados tangibles.</p>
           </div>
        </div>
      </section>

      {/* CORE FEATURES DETAIL */}
      <section className="py-20 md:py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard 
                icon={<Brain className="w-8 h-8 text-red-600" />}
                title="Bio-Stop SNC"
                desc="La IA analiza tu sueño, estrés y molestias pre-entreno para auditar tu Sistema Nervioso Central. Si no estás para tirar pesado, el sistema te lo advierte técnicamente."
            />
            <FeatureCard 
                icon={<Target className="w-8 h-8 text-red-600" />}
                title="Sobrecarga Forzada"
                desc="Al iniciar cada ejercicio, la app te muestra exactamente qué tenés que superar de la sesión anterior. Dejá de adivinar y empezá a crecer."
            />
            <FeatureCard 
                icon={<TrendingUp className="w-8 h-8 text-red-600" />}
                title="El Juicio IA"
                desc="Veredictos reales en tiempo real: Progreso, Meseta o Regresión. Nuestra IA audita cada serie como un coach profesional 24/7."
            />
        </div>
      </section>

      {/* ROI / COMPARISON BLOCK */}
      <section className="py-20 md:py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">PONÉ TU DINERO DONDE <br/><span className="text-red-600">QUERÉS VER RESULTADOS</span></h2>
                <p className="text-zinc-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em]">COSTO DE OPORTUNIDAD VS. RESULTADOS REALES</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComparisonBox 
                    title="Un Pote de Proteína"
                    price="$90.000"
                    duration="Dura 1 mes"
                    outcome="Si entrenás mal, la tirás a la basura."
                    icon={<FlaskConical className="text-zinc-700" />}
                    negative
                />
                <ComparisonBox 
                    title="Una Cena Afuera"
                    price="$30.000"
                    duration="Dura 2 horas"
                    outcome="Te da placer momentáneo. Nada más."
                    icon={<Utensils className="text-zinc-700" />}
                    negative
                />
                <ComparisonBox 
                    title="Heavy Duty App"
                    price="$28.500"
                    duration="Dura 1 mes"
                    outcome="Te asegura que tu esfuerzo valga la pena."
                    icon={<Zap className="text-red-500" />}
                    highlight
                />
            </div>
        </div>
      </section>

      {/* PRICING TABLE SECTION */}
      <section id="pricing" className="py-20 md:py-32 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-12 md:space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">ELEGÍ TU NIVEL DE COMPROMISO</h2>
                <div className="h-1 w-20 md:w-24 bg-red-600 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-8 md:pt-0">
                
                {/* BASIC */}
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden opacity-80">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">BASIC</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-4xl font-black text-white">$0</span>
                            <span className="text-zinc-600 text-[9px] font-bold uppercase mt-2">CUADERNO DIGITAL</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-5 py-8 px-8">
                        <PricingFeature text="Anotador de Pesos" active />
                        <PricingFeature text="Historial de Sesiones" active />
                        <PricingFeature text="Conexión Coach (Pasiva)" active />
                        <PricingFeature text="Auditoría IA" active={false} />
                        <PricingFeature text="Bio-Stop SNC" active={false} />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button variant="outline" className="w-full h-12 border-zinc-800 text-zinc-500 hover:text-white font-black uppercase tracking-widest text-[10px]" onClick={() => navigate('/auth?tab=login')}>REGISTRARSE</Button>
                    </CardFooter>
                </Card>

                {/* HEAVY DUTY PRO */}
                <Card className="bg-black border-2 border-red-600 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(220,38,38,0.15)] md:scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-bl-lg tracking-[0.2em] z-20 shadow-xl">RECOMENDADO</div>
                    <CardHeader className="text-center pb-8 border-b border-red-900/20 bg-red-600/5">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-red-500">HEAVY DUTY PRO</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl font-black text-white">$28.500</span>
                                <span className="text-zinc-500 text-xs font-bold">/ mes</span>
                            </div>
                            <span className="text-red-500/80 text-[9px] font-black uppercase tracking-widest mt-2 italic">TU AUDITOR 24/7</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-5 py-8 px-8">
                        <PricingFeature text="Auditoría IA en Tiempo Real" active highlight color="text-red-500" />
                        <PricingFeature text="Bio-Stop: SNC Audit" active highlight color="text-red-500" />
                        <PricingFeature text="Nutrición & Química PRO" active highlight color="text-red-500" />
                        <PricingFeature text="Reportes Semanales IA" active highlight color="text-red-500" />
                        <PricingFeature text="Alertas a tu Coach (Activa)" active highlight color="text-red-500" />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest text-xs shadow-2xl" onClick={() => navigate('/auth?tab=signup')}>EMPEZÁ EL TRIAL</Button>
                    </CardFooter>
                </Card>

                {/* ANUAL */}
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden mt-4 md:mt-0">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">ANUAL</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-4xl font-black text-white">$285.000</span>
                            <span className="text-green-500 text-[9px] font-bold uppercase mt-2">2 MESES DE REGALO</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-5 py-8 px-8">
                        <PricingFeature text="Todo lo del Plan PRO" active />
                        <PricingFeature text="Compromiso de Hierro" active />
                        <PricingFeature text="Acceso prioritario a Beta" active />
                        <PricingFeature text="Congela precio por 1 año" active />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button variant="outline" className="w-full h-12 border-zinc-800 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[10px]" onClick={() => navigate('/auth?tab=login')}>SER SOCIO</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-32 px-6 bg-black border-t border-zinc-900">
        <div className="max-w-4xl mx-auto space-y-12 md:space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">PREGUNTAS <br/><span className="text-red-600">FRECUENTES</span></h2>
                <p className="text-zinc-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.3em]">DECISIONES BASADAS EN DATOS</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                
                <AccordionItem value="q1" className="border border-red-600/20 bg-red-600/5 rounded-2xl px-4 md:px-6">
                    <AccordionTrigger className="hover:no-underline font-black uppercase italic text-xs md:text-sm py-5 md:py-6 text-left leading-snug">
                        1. ¿Por qué cuesta $28.500? Me parece caro para una app.
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 leading-relaxed pb-6 text-[11px] md:text-xs font-medium border-t border-red-600/10 pt-4">
                        No estás pagando por una "app para anotar pesas". Estás pagando por un Motor de Inteligencia Artificial que hace el trabajo técnico de un entrenador humano. Un buen coach te cobra $150.000 al mes. Nosotros te damos la misma auditoría de sobrecarga y control de fatiga por el 20% de ese valor. Es una decisión de inteligencia financiera.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl px-4 md:px-6">
                    <AccordionTrigger className="hover:no-underline font-black uppercase italic text-xs md:text-sm py-5 md:py-6 text-left leading-snug">
                        2. No tengo Coach y entreno solo. ¿Esto me sirve?
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 leading-relaxed pb-6 text-[11px] md:text-xs font-medium pt-2">
                        Es exactamente para vos. El problema de entrenar solo es que nadie te dice "eso fue basura" o "hoy descansá". La IA ocupa ese lugar. Es tu Auditor Silencioso que te dice en tiempo real si tu serie fue efectiva o no.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl px-4 md:px-6">
                    <AccordionTrigger className="hover:no-underline font-black uppercase italic text-xs md:text-sm py-5 md:py-6 text-left leading-snug">
                        3. ¿Es obligatorio entrenar con el sistema Heavy Duty?
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-sm">
                        La filosofía es la Alta Intensidad, pero la física es universal. Si hacés PPL, Upper/Lower o Frecuencia 2, la herramienta te sirve igual porque lo que medimos es la Sobrecarga Progresiva. Si no estás su biendo cargas o repeticiones, no estás creciendo.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl px-4 md:px-6">
                    <AccordionTrigger className="hover:no-underline font-black uppercase italic text-xs md:text-sm py-5 md:py-6 text-left leading-snug">
                        4. ¿La IA es un chat? ¿Tengo que hablarle?
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-sm">
                        No. No venís al gimnasio a chatear. La IA es automática. Vos cargás tus datos y ella te devuelve Dictámenes. Es un semáforo de rendimiento visual y sin vueltas.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5" className="border border-zinc-900 bg-zinc-900/20 rounded-2xl px-4 md:px-6">
                    <AccordionTrigger className="hover:no-underline font-black uppercase italic text-xs md:text-sm py-5 md:py-6 text-left leading-snug">
                        5. ¿Qué es el "Bio-Stop" y por qué no me deja entrenar?
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400 leading-relaxed pb-8 text-sm">
                        Es nuestro sistema de seguridad biológica. Si tu Sistema Nervioso Central (SNC) está "frito" por falta de sueño o exceso de estrés, la App te bloquea el entrenamiento pesado para evitar lesiones y sobreentrenamiento. Te enseñamos a descansar para crecer.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      </section>

      <footer className="p-12 text-center border-t border-zinc-900 bg-black">
        <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-20 mx-auto mb-8" alt="Logo" />
        <p className="text-zinc-800 text-[9px] md:text-[10px] font-mono tracking-[0.4em] uppercase">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — High Performance Software v1.1
        </p>
      </footer>
    </div>
  );
};

const ComparisonBox = ({ icon, title, price, duration, outcome, highlight = false, negative = false }: any) => (
    <div className="p-6 md:p-8 rounded-3xl border flex flex-col items-center text-center gap-4 transition-all"
        style={{
            backgroundColor: highlight ? 'rgba(220,38,38,0.05)' : '#09090b',
            borderColor: highlight ? 'rgba(220,38,38,0.3)' : '#18181b',
            opacity: highlight ? 1 : 0.6,
            boxShadow: highlight ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none'
        }}
    >
        <div className="p-3 bg-zinc-900 rounded-xl mb-2">{icon}</div>
        <div className="space-y-1">
            <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-white">{title}</h4>
            <div className="flex items-center justify-center gap-2">
                <span className={cn("text-xl md:text-2xl font-black", negative ? "text-zinc-500" : "text-red-600")}>{price}</span>
                <span className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase">/ {duration}</span>
            </div>
        </div>
        <p className={cn("text-[11px] md:text-xs font-medium leading-relaxed uppercase tracking-tighter", highlight ? "text-zinc-300" : "text-zinc-600")}>
            {outcome}
        </p>
        {highlight && (
            <div className="mt-2 text-[9px] font-black uppercase text-red-500 tracking-widest animate-pulse">
                DECISIÓN INTELIGENTE
            </div>
        )}
    </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="space-y-4 md:space-y-6 p-6 md:p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900 hover:border-red-600/30 transition-all group">
        <div className="p-3 bg-black rounded-xl border border-zinc-800 w-fit group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tighter">{title}</h3>
        <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">{desc}</p>
    </div>
);

const PricingFeature = ({ text, active = true, highlight = false, color = "text-zinc-500" }: any) => (
    <div className={cn("flex items-center gap-3", !active && "opacity-20")}>
        {active ? <CheckCircle2 className={cn("h-3.5 md:h-4 w-3.5 md:w-4", highlight ? color : "text-zinc-600")} /> : <XCircle className="h-3.5 md:h-4 w-3.5 md:w-4 text-zinc-700" />}
        <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", active ? "text-zinc-200" : "text-zinc-700", highlight && color)}>{text}</span>
    </div>
);

export default Index;