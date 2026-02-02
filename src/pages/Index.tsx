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
    Gavel, Zap, BarChart3, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowRight, HelpCircle, ShieldCheck
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
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-green-500/30 font-sans overflow-x-hidden">
      
      {/* 1. HERO SECTION - HIGH TICKET ANCHOR */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full" />
        </div>

        <nav className="absolute top-0 w-full max-w-7xl mx-auto flex justify-between items-center p-6 z-50">
            <img src="/logo.png" className="h-8 md:h-10 w-auto brightness-0 invert" alt="Heavy Duty" />
            <div className="flex gap-4 items-center">
                <button 
                    onClick={() => navigate("/coach-landing")}
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
                >
                    ¿Sos Preparador?
                </button>
                <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-white font-bold uppercase text-[10px] tracking-widest border border-zinc-800 h-9"
                    onClick={() => navigate("/auth")}
                >
                    Entrar
                </Button>
            </div>
        </nav>

        <div className="relative z-10 max-w-5xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 text-green-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> INGENIERÍA BIOMÉTRICA DE ALTA PRECISIÓN
           </div>

           <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                ¿SEGUÍS PAGANDO <span className="text-zinc-800">$150.000</span> <br/>
                <span className="text-green-500">POR UN PDF?</span>
              </h1>
           </div>

           <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-zinc-200 font-bold uppercase italic tracking-tight">
                Tené un auditor técnico en tiempo real en cada serie. La misma ciencia, pero sin pagar la burocracia humana.
              </p>
           </div>

           <div className="pt-8 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="h-20 px-12 bg-green-600 hover:bg-green-700 text-black font-black uppercase italic text-2xl shadow-[0_0_50px_rgba(34,197,94,0.3)] border-2 border-green-400/20 rounded-xl group transition-all"
                onClick={() => navigate("/auth")}
              >
                PROBAR PRO (7 DÍAS GRATIS)
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">Inversión inteligente en rendimiento real</p>
           </div>
        </div>
      </section>

      {/* 2. VERSUS SECTION - VISUAL COMPARISON */}
      <section className="bg-zinc-950 py-24 md:py-32 px-6 border-y border-zinc-900">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">LA DIFERENCIA TECNOLÓGICA</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">EL JUICIO: HUMANO VS HEAVY DUTY IA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Coach */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8 opacity-60">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black uppercase italic text-zinc-500">COACH TRADICIONAL</h3>
                    <span className="text-xl font-mono text-zinc-600">$150.000/mes</span>
                </div>
                <ul className="space-y-6">
                    <VsItem icon={<XCircle className="text-red-600" />} text="Te corrige 1 vez por semana (con suerte)." />
                    <VsItem icon={<XCircle className="text-red-600" />} text="Se olvida de tus lesiones y fatiga." />
                    <VsItem icon={<XCircle className="text-red-600" />} text="Te manda excels incómodos por WhatsApp." />
                    <VsItem icon={<XCircle className="text-red-600" />} text="Cero análisis de datos real." />
                </ul>
            </div>

            {/* Heavy Duty App */}
            <div className="bg-black border-2 border-green-500/50 rounded-3xl p-8 space-y-8 shadow-[0_0_60px_rgba(34,197,94,0.1)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 blur-3xl rounded-full" />
                <div className="flex justify-between items-start relative z-10">
                    <h3 className="text-2xl font-black uppercase italic text-green-500">HEAVY DUTY APP</h3>
                    <span className="text-xl font-mono text-white">$28.500/mes</span>
                </div>
                <ul className="space-y-6 relative z-10">
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Auditoría técnica EN TIEMPO REAL." />
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Bloquea el entreno si el SNC está frito." />
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Informes detallados cada sesión." />
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Justicia absoluta basada en datos." />
                </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRICING TABLE - LUXURY STYLE */}
      <section className="py-24 md:py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">ELEGÍ TU NIVEL DE COMPROMISO</h2>
                <div className="h-1 w-24 bg-green-500 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* BASIC */}
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">BASIC</CardTitle>
                        <div className="pt-4">
                            <span className="text-5xl font-black text-white">$0</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mt-2">Bitácora Pasiva</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-8">
                        <PricingFeature text="Anotador Digital" active />
                        <PricingFeature text="Historial de Pesos" active />
                        <PricingFeature text="Auditoría IA Real-time" active={false} />
                        <PricingFeature text="Análisis Bio-Stop (SNC)" active={false} />
                        <PricingFeature text="Informes de Tendencias" active={false} />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button variant="outline" className="w-full h-14 border-zinc-800 text-zinc-500 hover:text-white font-black uppercase tracking-widest" onClick={() => navigate('/auth')}>DESCARGAR</Button>
                    </CardFooter>
                </Card>

                {/* PRO */}
                <Card className="bg-black border-2 border-yellow-600 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(202,138,4,0.15)]">
                    <div className="absolute top-0 right-0 bg-yellow-600 text-black text-[9px] font-black uppercase px-6 py-2 rounded-bl-xl tracking-[0.2em] z-10 shadow-xl">ESTRELLA</div>
                    <CardHeader className="text-center pb-8 border-b border-yellow-900/20 bg-yellow-600/5">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-yellow-600">HEAVY DUTY PRO</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-5xl font-black text-white">$28.500</span>
                            <span className="text-yellow-600/60 text-[10px] font-black uppercase">vs. $150.000 (Humano)</span>
                        </div>
                        <p className="text-[10px] font-bold text-yellow-600 uppercase mt-2 italic">Ingeniería Biométrica Aplicada</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-8">
                        <PricingFeature text="The Judge: Auditoría IA" active highlight color="text-yellow-500" />
                        <PricingFeature text="Bio-Stop: SNC Pre-flight" active highlight color="text-yellow-500" />
                        <PricingFeature text="Informes Markdown Detallados" active highlight color="text-yellow-500" />
                        <PricingFeature text="Modo Competidor Activado" active highlight color="text-yellow-500" />
                        <PricingFeature text="Soporte Técnico Prioritario" active highlight color="text-yellow-500" />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button className="w-full h-16 bg-yellow-600 hover:bg-yellow-700 text-black font-black uppercase italic tracking-widest shadow-2xl" onClick={() => navigate('/auth')}>EMPEZÁ TRANSFORMACIÓN</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      {/* 4. FAQ - HIGH TICKET QUESTIONS */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
                <HelpCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">PREGUNTAS CLAVE</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <FAQItem 
                    value="item-price"
                    question="¿Por qué cuesta $28.500?"
                    answer="Porque es un sistema de ingeniería biométrica, no un simple anotador. Reemplaza gran parte del trabajo técnico de un preparador humano que te cobraría 5 o 6 veces más. Estás pagando por tecnología que analiza cada kilo y cada segundo de tu entrenamiento para garantizar que no pierdas el tiempo."
                />
                <FAQItem 
                    value="item-1"
                    question="¿La IA realmente sabe si estoy entrenando intenso?"
                    answer="Sí. El sistema analiza la relación entre el peso utilizado, las repeticiones logradas y el historial previo. Si tus números se estancan o bajan, la IA lo detecta al instante y te emite un veredicto de 'REGRESIÓN', obligándote a ajustar la intensidad o el descanso."
                />
                <FAQItem 
                    value="item-2"
                    question="¿Puedo usar la app si ya tengo un preparador?"
                    answer="Es lo ideal. La app te sirve para darle a tu preparador datos reales y precisos. En lugar de decirle 'sentí que entrené bien', le podés mostrar el informe técnico de la IA. Tu preparador podrá tomar mejores decisiones basadas en ciencia, no en sensaciones."
                />
            </Accordion>
        </div>
      </section>

      <footer className="p-12 text-center border-t border-zinc-900 bg-black">
        <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-30 mx-auto mb-8" alt="Logo" />
        <p className="text-zinc-700 text-[10px] font-mono tracking-[0.3em] uppercase mb-4">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — High Performance Software
        </p>
      </footer>
    </div>
  );
};

const VsItem = ({ icon, text }: any) => (
    <li className="flex items-center gap-4">
        <div className="shrink-0">{icon}</div>
        <span className="text-zinc-300 font-bold uppercase text-xs tracking-wide">{text}</span>
    </li>
);

const PricingFeature = ({ text, active = true, highlight = false, color = "text-zinc-500" }: any) => (
    <div className={cn("flex items-center gap-3", !active && "opacity-20")}>
        {active ? <CheckCircle2 className={cn("h-4 w-4", highlight ? color : "text-zinc-500")} /> : <XCircle className="h-4 w-4 text-zinc-700" />}
        <span className={cn("text-xs font-black uppercase tracking-widest", active ? "text-zinc-200" : "text-zinc-700", highlight && color)}>{text}</span>
    </div>
);

const FAQItem = ({ value, question, answer }: any) => (
    <AccordionItem value={value} className="border-zinc-800 bg-zinc-900/30 rounded-2xl px-8 border transition-all hover:border-zinc-700">
        <AccordionTrigger className="text-left font-black uppercase tracking-wider text-zinc-100 hover:text-white hover:no-underline py-6 text-sm">
            {question}
        </AccordionTrigger>
        <AccordionContent className="text-zinc-500 text-sm leading-relaxed pb-6 italic">
            {answer}
        </AccordionContent>
    </AccordionItem>
);

const PainPoint = ({ icon, title, desc }: any) => (
    <div className="space-y-4 group text-center md:text-left">
        <div className="bg-zinc-800 p-5 rounded-2xl w-fit mx-auto md:mx-0 group-hover:bg-red-600/10 transition-colors">{icon}</div>
        <h4 className="text-xl font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const WeaponSection = ({ number, title, subtitle, desc, points, icon }: any) => (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="space-y-2">
            <span className="text-red-600 font-black italic text-5xl opacity-20">{number}</span>
            <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 shadow-lg">{icon}</div>
                <div>
                    <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-tight">{title}</h3>
                    <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">{subtitle}</p>
                </div>
            </div>
        </div>
        <p className="text-xl text-zinc-400 font-medium leading-relaxed italic">{desc}</p>
        <ul className="space-y-3">
            {points.map((p: any, i: number) => (
                <li key={i} className={cn("flex items-center gap-3 font-bold uppercase text-xs tracking-wide", p.color)}>
                    <ChevronRight className="h-4 w-4" /> {p.text}
                </li>
            ))}
        </ul>
    </div>
);

export default Index;