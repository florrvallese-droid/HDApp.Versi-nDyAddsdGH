import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { 
    Brain, TrendingUp, ShieldCheck, Star, Lock, Users, Activity, 
    Gavel, Zap, BarChart3, ChevronRight, CheckCircle2, XCircle, AlertTriangle 
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
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-red-600/30 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 blur-[120px] rounded-full" />
        </div>

        <nav className="absolute top-0 w-full max-w-7xl mx-auto flex justify-between items-center p-6 z-50">
            <img src="/logo.png" className="h-12 w-auto brightness-0 invert" alt="Heavy Duty" />
            <div className="flex gap-6 items-center">
                <button 
                    onClick={() => navigate("/coach-landing")}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
                >
                    ¿Sos Preparador?
                </button>
                <Button 
                    variant="ghost" 
                    className="text-zinc-300 hover:text-white font-bold uppercase text-xs border border-zinc-800"
                    onClick={() => navigate("/auth")}
                >
                    Iniciar Sesión
                </Button>
            </div>
        </nav>

        <div className="relative z-10 max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-900/50 bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Star className="w-3 h-3 fill-current" /> EL SISTEMA DEFINITIVO PARA EL ALTO RENDIMIENTO
           </div>

           <div className="space-y-4">
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
                ¿VAS A ENTRENAR<br/>
                <span className="text-zinc-700">O A CUMPLIR HORARIO?</span>
              </h1>
              <h2 className="text-lg md:text-3xl font-bold tracking-[0.1em] text-red-500 uppercase max-w-3xl mx-auto">
                LA ÚNICA APP CON IA QUE TE PROHÍBE EL <span className="text-white underline decoration-red-600 decoration-4">VOLUMEN BASURA</span>
              </h2>
           </div>

           <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium italic">
             "Si no hubo sobrecarga, no cuenta. Si no descansaste, no entrenás. Bienvenido a la era de la Verdad Biológica."
           </p>

           <div className="pt-8 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="h-20 px-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] border-2 border-red-500/20 rounded-xl group transition-all"
                onClick={() => navigate("/auth")}
              >
                EMPEZAR MI TRANSFORMACIÓN
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Prueba Gratis — Sin Tarjeta de Crédito</p>
           </div>
        </div>

        {/* Visual Mockup - Judgment Card Concept */}
        <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <div className="bg-zinc-950 border-4 border-green-500/30 rounded-[2.5rem] p-8 w-72 md:w-80 shadow-[0_0_80px_rgba(34,197,94,0.15)] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16 text-green-500" /></div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center"><div className="h-2 w-12 bg-zinc-800 rounded-full" /><Badge className="bg-green-600 text-[10px] font-black italic">PROGRESS</Badge></div>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">SOBRECARGA<br/>CONFIRMADA</h3>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden"><div className="h-full w-4/5 bg-green-500" /></div>
                    <div className="flex gap-2"><div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center"><Zap className="w-4 h-4 text-yellow-500" /></div><div className="h-8 w-8 bg-zinc-900 rounded flex items-center justify-center"><Brain className="w-4 h-4 text-blue-500" /></div></div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. EL PROBLEMA */}
      <section className="bg-zinc-900 py-32 px-6 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">EL 90% DE LA GENTE EN EL GIMNASIO<br/><span className="text-red-600">ESTÁ PERDIENDO EL TIEMPO.</span></h2>
            <div className="h-1.5 w-24 bg-red-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <PainPoint 
              title="El Ojímetro"
              desc="Anotás en las notas del celular o en un cuaderno transpirado. Nunca sabés si realmente superaste la sesión anterior o si solo te bombeaste."
              icon={<XCircle className="h-10 w-10 text-red-600" />}
            />
            <PainPoint 
              title="El Ego-Lifting"
              desc="Subís el peso pero bajás la técnica. Te mentís a vos mismo. Creés que progresás, pero solo estás comprando una lesión."
              icon={<AlertTriangle className="h-10 w-10 text-red-600" />}
            />
            <PainPoint 
              title="Miedo al Descanso"
              desc="Entrenás 6 días porque 'más es mejor'. Tu SNC está frito y tus músculos no crecen porque no los dejás recuperarse."
              icon={<Users className="h-10 w-10 text-red-600" />}
            />
          </div>
        </div>
      </section>

      {/* 3. LA SOLUCIÓN - ARMAS */}
      <section className="py-32 px-6 bg-black relative">
         <div className="max-w-6xl mx-auto space-y-32">
            
            <WeaponSection 
                number="01"
                title="EL JUEZ"
                subtitle="AI SESSION AUDITOR"
                desc="Tu compañero de entreno que no te miente. Apenas terminás la serie, la IA compara tus cargas, reps y técnica con tu historial."
                points={[
                    { text: "LUZ VERDE: Sobrecarga real. Aprobado.", color: "text-green-500" },
                    { text: "LUZ ROJA: Estancamiento o Regresión.", color: "text-red-600" },
                    { text: "Sin aplausos falsos. Solo la verdad cruda.", color: "text-zinc-500" }
                ]}
                icon={<Gavel className="w-12 h-12 text-red-600" />}
                visual={<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 aspect-video flex items-center justify-center"><Gavel className="w-24 h-24 text-zinc-800" /></div>}
            />

            <WeaponSection 
                number="02"
                title="BIO-STOP"
                subtitle="SNC PRE-FLIGHT FILTER"
                desc="Entrenar cansado es cavar tu propia tumba. Antes de pisar el gimnasio, la IA analiza tu sueño y nivel de estrés."
                points={[
                    { text: "Si tu SNC no está al 100%, la App bloquea el entreno pesado.", color: "text-yellow-500" },
                    { text: "Aprendé a descansar para crecer.", color: "text-white" },
                    { text: "Evitá lesiones por fatiga acumulada.", color: "text-zinc-500" }
                ]}
                icon={<Activity className="w-12 h-12 text-blue-500" />}
                visual={<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 aspect-video flex items-center justify-center"><Activity className="w-24 h-24 text-zinc-800" /></div>}
                reverse
            />

            <WeaponSection 
                number="03"
                title="EL INFORME"
                subtitle="DATA SCIENCE APLICADA"
                desc="Dejá de adivinar. Empezá a saber. Recibí informes detallados de tu progreso real y patrones ocultos."
                points={[
                    { text: "Gráficos de Fuerza vs. Peso Corporal.", color: "text-red-500" },
                    { text: "Detección de patrones de estancamiento.", color: "text-white" },
                    { text: "Auditoría Global cada 30 días.", color: "text-zinc-500" }
                ]}
                icon={<BarChart3 className="w-12 h-12 text-green-500" />}
                visual={<div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 aspect-video flex items-center justify-center"><BarChart3 className="w-24 h-24 text-zinc-800" /></div>}
            />
         </div>
      </section>

      {/* 4. CONEXIÓN COACH */}
      <section className="bg-red-600 py-32 px-6 text-white text-center overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Users className="w-[800px] h-[800px] -rotate-12" />
         </div>
         <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">¿TENÉS COACH?<br/>POTENCIALO.</h2>
            <p className="text-xl md:text-2xl font-bold uppercase italic max-w-2xl mx-auto leading-relaxed">
                Heavy Duty App no reemplaza a tu entrenador, lo hace más letal. Si tu coach usa nuestra plataforma, él ve tus datos en tiempo real.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-8">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"><CheckCircle2 className="w-6 h-6 mb-3" /><p className="font-bold uppercase text-sm">Adiós a mandar Excels por mail.</p></div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"><CheckCircle2 className="w-6 h-6 mb-3" /><p className="font-bold uppercase text-sm">Tu coach recibe alertas si te estancás.</p></div>
            </div>
         </div>
      </section>

      {/* 5. PRICING */}
      <section className="py-32 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">ELIGE TU NIVEL DE COMPROMISO</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FREE */}
                <Card className="bg-zinc-900 border-zinc-800 flex flex-col p-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl font-black uppercase italic text-zinc-500">ATLETA FREE</CardTitle>
                        <div className="py-4">
                            <span className="text-4xl font-black">$0</span>
                            <span className="text-zinc-600 text-xs font-bold ml-1">/ MES</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4 py-6 px-8 border-t border-zinc-800/50">
                        <PricingItem text="Bitácora Digital Básica" />
                        <PricingItem text="Historial de Pesos" />
                        <PricingItem text="Sin Análisis de IA" disabled />
                        <PricingItem text="Sin Bio-Stop" disabled />
                    </CardContent>
                    <CardFooter className="pt-6">
                        <Button variant="outline" className="w-full h-14 border-zinc-800 text-zinc-400 hover:text-white uppercase font-black tracking-widest" onClick={() => navigate('/auth')}>EMPEZAR GRATIS</Button>
                    </CardFooter>
                </Card>

                {/* PRO */}
                <Card className="bg-black border-red-600/50 flex flex-col p-2 relative overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-lg tracking-widest z-10">RECOMENDADO</div>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl font-black uppercase italic text-white">ATLETA PRO</CardTitle>
                        <div className="py-4">
                            <span className="text-4xl font-black text-red-500">$6.800</span>
                            <span className="text-zinc-600 text-xs font-bold ml-1">ARS / MES</span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4 py-6 px-8 border-t border-red-900/20">
                        <PricingItem text="IA Ilimitada (The Judge)" highlight />
                        <PricingItem text="Bio-Stop (Análisis de SNC)" highlight />
                        <PricingItem text="Informes de Tendencias 📊" highlight />
                        <PricingItem text="Modo Competidor Activado" highlight />
                    </CardContent>
                    <CardFooter className="pt-6">
                        <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white uppercase font-black tracking-widest italic shadow-xl shadow-red-900/20 border border-red-500/20" onClick={() => navigate('/auth')}>PROBAR PRO GRATIS 7 DÍAS</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard 
                text="Pensé que entrenaba duro hasta que la IA me empezó a marcar 'Estancado' tres veces seguidas. Tuve que dejar el ego y empezar a entrenar de verdad. Subí 8kg en sentadilla en un mes."
                author="Julián, 28 años"
                role="Bodybuilder Amateur"
            />
            <TestimonialCard 
                text="Lo que más me gusta es que si duermo mal, la app me manda a descansar. Antes iba igual y me terminaba lesionando. Es como tener a Mike Mentzer cuidándote."
                author="Carla, Atleta Wellness"
                role="Competidora IFBB"
            />
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-40 px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">EL DOLOR DE LA DISCIPLINA<br/><span className="text-zinc-800">O EL DOLOR DEL ARREPENTIMIENTO.</span></h2>
            <p className="text-2xl font-bold uppercase text-red-500 italic">VOS ELEGÍS.</p>
          </div>
          <Button 
            size="lg" 
            className="h-24 px-16 bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-3xl shadow-2xl rounded-2xl"
            onClick={() => navigate("/auth")}
          >
            DESCARGAR APP
          </Button>
          <div className="flex justify-center gap-8 pt-10 grayscale opacity-40">
             <img src="/placeholder.svg" className="h-8" alt="iOS" /><img src="/placeholder.svg" className="h-8" alt="Android" />
          </div>
      </section>

      <footer className="p-8 text-center border-t border-zinc-900 relative z-10 bg-black/80 backdrop-blur-sm mt-20">
        <p className="text-zinc-600 text-[10px] font-mono mb-4 tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — Powered by Gemini AI
        </p>
        <div className="flex justify-center gap-6 text-[10px] text-zinc-700 uppercase font-black tracking-widest">
            <span className="hover:text-white cursor-pointer">Privacidad</span>
            <span className="hover:text-white cursor-pointer">Términos</span>
            <button onClick={() => navigate('/admin/login')} className="hover:text-red-500">Admin</button>
        </div>
      </footer>
    </div>
  );
};

const PainPoint = ({ icon, title, desc }: any) => (
    <div className="space-y-4 group">
        <div className="bg-zinc-800 p-5 rounded-2xl w-fit group-hover:bg-red-600/10 transition-colors">{icon}</div>
        <h4 className="text-xl font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const WeaponSection = ({ number, title, subtitle, desc, points, icon, visual, reverse = false }: any) => (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", reverse ? "lg:flex-row-reverse" : "")}>
        <div className={cn("space-y-8", reverse ? "lg:order-2" : "")}>
            <div className="space-y-2">
                <span className="text-red-600 font-black italic text-5xl opacity-20">{number}</span>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-xl">{icon}</div>
                    <div>
                        <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
                        <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">{subtitle}</p>
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
        <div className={cn("relative group", reverse ? "lg:order-1" : "")}>
            <div className="absolute -inset-4 bg-zinc-800 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10">{visual}</div>
        </div>
    </div>
);

const PricingItem = ({ text, highlight = false, disabled = false }: any) => (
    <div className={cn("flex items-center gap-3", disabled ? "opacity-30" : "opacity-100")}>
        {disabled ? <XCircle className="h-4 w-4 text-zinc-600" /> : <CheckCircle2 className={cn("h-4 w-4", highlight ? "text-red-500" : "text-zinc-500")} />}
        <span className={cn("text-xs font-bold uppercase tracking-wide", highlight ? "text-white" : "text-zinc-500")}>{text}</span>
    </div>
);

const TestimonialCard = ({ text, author, role }: any) => (
    <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl space-y-6 hover:border-zinc-700 transition-all group">
        <p className="text-lg md:text-xl font-bold text-zinc-300 italic leading-relaxed">
            "{text}"
        </p>
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-red-600 transition-colors" />
            <div>
                <p className="text-sm font-black uppercase italic text-white leading-none">{author}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{role}</p>
            </div>
        </div>
    </div>
);

function ArrowRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}

export default Index;