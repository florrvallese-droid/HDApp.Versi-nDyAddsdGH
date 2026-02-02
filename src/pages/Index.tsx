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
    Gavel, Zap, BarChart3, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowRight, HelpCircle, ShieldCheck, Target, FileText, FlaskConical, Clock
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
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-zinc-800/10 blur-[150px] rounded-full" />
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
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-600/30 bg-red-600/5 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> INGENIERÍA BIOMÉTRICA DE ALTA PRECISIÓN
           </div>

           <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                MEDÍ TU PROGRESO <br/>
                <span className="text-red-600">REAL,</span> NO TUS <br/>
                <span className="text-zinc-800">SENSACIONES.</span>
              </h1>
           </div>

           <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-zinc-400 font-bold uppercase italic tracking-tight">
                La bitácora inteligente que audita tu sobrecarga progresiva y decide si hoy debés entrenar o descansar.
              </p>
           </div>

           <div className="pt-8 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="h-20 px-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] border-2 border-red-400/20 rounded-xl group transition-all"
                onClick={() => navigate("/auth")}
              >
                PROBAR PRO (7 DÍAS GRATIS)
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest italic">Cero burocracia. Ciencia pura.</p>
           </div>
        </div>
      </section>

      {/* CORE FEATURES DETAIL */}
      <section className="py-24 px-6 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
                icon={<Brain className="w-8 h-8 text-red-600" />}
                title="Bio-Stop SNC"
                desc="La IA analiza tu sueño, estrés y molestias pre-entreno para auditar tu Sistema Nervioso Central. Si no estás para tirar pesado, el sistema te lo impide."
            />
            <FeatureCard 
                icon={<Target className="w-8 h-8 text-red-600" />}
                title="Sobrecarga Forzada"
                desc="Al iniciar cada ejercicio, la app te muestra exactamente qué tenés que superar de la sesión anterior. No anotás por anotar, anotás para ganar."
            />
            <FeatureCard 
                icon={<TrendingUp className="w-8 h-8 text-red-600" />}
                title="El Juicio IA"
                desc="Al terminar, recibís un informe técnico detallado comparando deltas de peso, reps y volumen. Veredictos reales: Progreso, Meseta o Regresión."
            />
        </div>
      </section>

      {/* VERSUS SECTION */}
      <section className="py-24 md:py-32 px-6 bg-black">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">LA DIFERENCIA TECNOLÓGICA</h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">HUMANO VS HEAVY DUTY IA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-8 opacity-60">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black uppercase italic text-zinc-500">ASESORÍA TRADICIONAL</h3>
                    <span className="text-xl font-mono text-zinc-600">$150.000/mes</span>
                </div>
                <ul className="space-y-6">
                    <VsItem icon={<XCircle className="text-red-600" />} text="Te corrigen con suerte 1 vez por semana." />
                    <VsItem icon={<XCircle className="text-red-600" />} text="Dependen de 'cómo te sentís' subjetivamente." />
                    <VsItem icon={<XCircle className="text-red-600" />} text="Excels incómodos y PDFs que nadie lee." />
                </ul>
            </div>

            <div className="bg-black border-2 border-red-600 rounded-3xl p-8 space-y-8 shadow-[0_0_60px_rgba(220,38,38,0.1)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 blur-3xl rounded-full" />
                <div className="flex justify-between items-start relative z-10">
                    <h3 className="text-2xl font-black uppercase italic text-red-500">HEAVY DUTY PRO</h3>
                    <span className="text-xl font-mono text-white">$28.500/mes</span>
                </div>
                <ul className="space-y-6 relative z-10">
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Auditoría técnica EN TIEMPO REAL cada serie." />
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Análisis de correlación sueño/dieta vs rendimiento." />
                    <VsItem icon={<CheckCircle2 className="text-green-500" />} text="Ficha técnica digital compatible con tu Coach." />
                </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TABLE SECTION */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">ELEGÍ TU NIVEL DE COMPROMISO</h2>
                <div className="h-1 w-24 bg-red-600 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                <Card className="bg-zinc-950 border border-zinc-900 flex flex-col overflow-hidden">
                    <CardHeader className="text-center pb-8 border-b border-zinc-900 bg-zinc-900/20">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">BASIC</CardTitle>
                        <div className="pt-4">
                            <span className="text-5xl font-black text-white">$0</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mt-2">Bitácora Pasiva</p>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-8">
                        <PricingFeature text="Anotador Digital de Pesos" active />
                        <PricingFeature text="Historial de Sesiones" active />
                        <PricingFeature text="Calculadora 1RM" active />
                        <PricingFeature text="Auditoría IA Real-time" active={false} />
                        <PricingFeature text="Análisis Bio-Stop (SNC)" active={false} />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button variant="outline" className="w-full h-14 border-zinc-800 text-zinc-500 hover:text-white font-black uppercase tracking-widest" onClick={() => navigate('/auth')}>DESCARGAR</Button>
                    </CardFooter>
                </Card>

                <Card className="bg-black border-2 border-red-600 flex flex-col overflow-hidden relative shadow-[0_0_80px_rgba(220,38,38,0.15)]">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-6 py-2 rounded-bl-xl tracking-[0.2em] z-10 shadow-xl">RECOMENDADO</div>
                    <CardHeader className="text-center pb-8 border-b border-red-900/20 bg-red-600/5">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-red-500">HEAVY DUTY PRO</CardTitle>
                        <div className="pt-4 flex flex-col gap-1">
                            <span className="text-5xl font-black text-white">$28.500</span>
                            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">voseo argentino habilitado</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6 py-10 px-8">
                        <PricingFeature text="Auditoría IA: El Juez HD" active highlight color="text-red-500" />
                        <PricingFeature text="Bio-Stop: SNC Pre-flight" active highlight color="text-red-500" />
                        <PricingFeature text="Módulo de Nutrición y Química" active highlight color="text-red-500" />
                        <PricingFeature text="Check-in Físico con Galería" active highlight color="text-red-500" />
                        <PricingFeature text="Auditoría Global cada 30 días" active highlight color="text-red-500" />
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                        <Button className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic tracking-widest shadow-2xl" onClick={() => navigate('/auth')}>EMPEZÁ TRANSFORMACIÓN</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      <footer className="p-12 text-center border-t border-zinc-900 bg-black">
        <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-30 mx-auto mb-8" alt="Logo" />
        <p className="text-zinc-700 text-[10px] font-mono tracking-[0.3em] uppercase">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — High Performance Software
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="space-y-6 p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900 hover:border-red-600/30 transition-all group">
        <div className="p-3 bg-black rounded-xl border border-zinc-800 w-fit group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

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

export default Index;