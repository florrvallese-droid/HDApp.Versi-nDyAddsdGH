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
    Gavel, Zap, BarChart3, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowRight, HelpCircle
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
            <img src="/logo.png" className="h-8 md:h-10 w-auto brightness-0 invert" alt="Heavy Duty" />
            
            <div className="flex gap-4 md:gap-8 items-center">
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
                    Iniciar Sesión
                </Button>
            </div>
        </nav>

        <div className="relative z-10 max-w-5xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-900/50 bg-red-900/10 text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Star className="w-3 h-3 fill-current" /> EL SISTEMA DEFINITIVO PARA CAMBIAR TU CUERPO
           </div>

           <div className="space-y-4">
              <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
                LA ÚNICA APP QUE TE ENSEÑA <br/>
                <span className="text-zinc-700">A ENTRENAR DE VERDAD</span>
              </h1>
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-sm md:text-xl font-black tracking-[0.3em] text-red-600 uppercase">
                    {" >> "} VERSIÓN 17.09 INTEGRADA CON IA
                </h2>
              </div>
           </div>

           <div className="space-y-2">
              <p className="text-lg md:text-xl text-white font-black uppercase italic tracking-tight">
                Hoy vas a dejar de perder tiempo en el gimnasio.
              </p>
              <p className="text-sm md:text-base text-zinc-500 font-medium italic">
                "Bienvenido a la era de la verdad fisiológica."
              </p>
           </div>

           <div className="pt-8 flex flex-col items-center gap-4">
              <Button 
                size="lg" 
                className="h-16 md:h-20 px-8 md:px-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-xl md:text-2xl shadow-[0_0_50px_rgba(220,38,38,0.3)] border-2 border-red-500/20 rounded-xl group transition-all"
                onClick={() => navigate("/auth")}
              >
                EMPEZAR MI TRANSFORMACIÓN
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Prueba Gratis — Sin Tarjeta de Crédito</p>
           </div>
        </div>

        {/* Visual Mockup - Judgment Card Concept */}
        <div className="mt-16 md:mt-20 relative animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
            <div className="bg-zinc-950 border-4 border-green-500/30 rounded-[2.5rem] p-6 md:p-8 w-64 md:w-80 shadow-[0_0_80px_rgba(34,197,94,0.15)] relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16 text-green-500" /></div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center"><div className="h-2 w-12 bg-zinc-800 rounded-full" /><Badge className="bg-green-600 text-[10px] font-black italic">PROGRESS</Badge></div>
                    <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none text-white">SOBRECARGA<br/>CONFIRMADA</h3>
                    <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden"><div className="h-full w-4/5 bg-green-500" /></div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. EL PROBLEMA */}
      <section className="bg-zinc-900 py-24 md:py-32 px-6 border-y border-zinc-800">
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
      <section className="py-24 md:py-32 px-6 bg-black relative">
         <div className="max-w-3xl mx-auto space-y-32">
            
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
                icon={<Gavel className="w-8 h-8 text-red-600" />}
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
                icon={<Activity className="w-8 h-8 text-blue-500" />}
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
                icon={<BarChart3 className="w-8 h-8 text-green-500" />}
            />
         </div>
      </section>

      {/* 4. CONEXIÓN COACH */}
      <section className="bg-red-600 py-24 md:py-32 px-6 text-white text-center overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Users className="w-[800px] h-[800px] -rotate-12" />
         </div>
         <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">¿TENÉS COACH?<br/>POTENCIALO.</h2>
            <p className="text-lg md:text-2xl font-bold uppercase italic max-w-2xl mx-auto leading-relaxed">
                Heavy Duty App no reemplaza a tu entrenador, lo hace más letal. Si tu coach usa nuestra plataforma, él ve tus datos en tiempo real.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-8">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"><CheckCircle2 className="w-6 h-6 mb-3" /><p className="font-bold uppercase text-sm">Adiós a mandar Excels por mail.</p></div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20"><CheckCircle2 className="w-6 h-6 mb-3" /><p className="font-bold uppercase text-sm">Tu coach recibe alertas si te estancás.</p></div>
            </div>
         </div>
      </section>

      {/* 5. PRICING */}
      <section className="py-24 md:py-32 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">ELIGE TU NIVEL DE COMPROMISO</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      {/* 6. FAQ SECTION (Acordeones) */}
      <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-red-600/10 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">PREGUNTAS FRECUENTES</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <FAQItem 
                    value="item-1"
                    question="Entreno solo/a y no tengo Coach. ¿Me sirve la App?"
                    answer="¡Por supuesto! De hecho, está diseñada para vos. Si no tenés un humano que te corrija, la IA ocupa ese lugar. El sistema actúa como tu auditor personal: analiza tu progreso, te frena si estás sobreentrenando y te felicita cuando rompés un récord. Vos ponés el cuerpo, la App pone la inteligencia."
                />
                <FAQItem 
                    value="item-2"
                    question="¿Es obligatorio entrenar con el sistema Heavy Duty?"
                    answer="La App respira la filosofía de Alta Intensidad, pero la física es universal. Si hacés PPL, Upper/Lower o Frecuencia 2, te va a servir igual para medir la Sobrecarga Progresiva. La IA siempre te va a empujar a que no desperdicies energía en 'series basura'."
                />
                <FAQItem 
                    value="item-3"
                    question="¿La IA es un chat tipo ChatGPT?"
                    answer="No. No venís a charlar, venís a entrenar. La IA es un Auditor Silencioso. Analiza tus datos automáticamente y te muestra 'Tarjetas de Juicio' (Verde/Rojo) al terminar cada ejercicio. Es mucho más rápido y directo que un chat."
                />
                <FAQItem 
                    value="item-4"
                    question="¿Qué pasa si el día de mañana contrato a un Coach?"
                    answer="Es lo ideal. Con un solo clic, vinculás tu cuenta a la de tu Coach. Él va a recibir acceso inmediato a todo tu historial, gráficos y métricas. Se terminaron los mails con Excels adjuntos o las fotos de cuadernos borrosos."
                />
                <FAQItem 
                    value="item-5"
                    question="¿El precio es en dólares o en pesos?"
                    answer="Estamos en Argentina. Cobramos en Pesos Argentinos a través de Mercado Pago. El precio que ves es final. Sin impuestos sorpresa en la tarjeta ni conversiones raras. Invertí en comida y suplementos, no en impuestos."
                />
                <FAQItem 
                    value="item-6"
                    question="Soy principiante, ¿esto es muy avanzado para mí?"
                    answer="Al contrario. El mejor momento para usar esto es ahora. La mayoría de los principiantes pierden sus primeros 2 años haciendo las cosas mal. Con Bio-Stop, la App te enseña a cuidar tu cuerpo desde el día 1, evitando que te quemes."
                />
            </Accordion>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-32 md:py-40 px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">EL DOLOR DE LA DISCIPLINA<br/><span className="text-zinc-800">O EL DOLOR DEL ARREPENTIMIENTO.</span></h2>
            <p className="text-xl md:text-2xl font-bold uppercase text-red-500 italic">VOS ELEGÍS.</p>
          </div>
          <Button 
            size="lg" 
            className="h-20 md:h-24 px-12 md:px-16 bg-white text-black hover:bg-zinc-200 font-black uppercase italic text-2xl md:text-3xl shadow-2xl rounded-2xl"
            onClick={() => navigate("/auth")}
          >
            DESCARGAR APP
          </Button>
          <div className="flex justify-center gap-8 pt-10 grayscale opacity-40">
             <img src="/placeholder.svg" className="h-6 md:h-8" alt="iOS" /><img src="/placeholder.svg" className="h-6 md:h-8" alt="Android" />
          </div>
      </section>

      <footer className="p-8 text-center border-t border-zinc-900 relative z-10 bg-black/80 backdrop-blur-sm mt-20">
        <img src="/logo.png" className="h-6 md:h-8 w-auto brightness-0 invert opacity-50 mx-auto mb-6" alt="Logo" />
        <p className="text-zinc-600 text-[10px] font-mono mb-4 tracking-[0.2em] uppercase">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio — Powered by Gemini AI
        </p>
        <div className="flex justify-center gap-6 text-[10px] text-zinc-700 uppercase font-black tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
            <button onClick={() => navigate('/admin/login')} className="hover:text-red-500 transition-colors">Admin</button>
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

const FAQItem = ({ value, question, answer }: any) => (
    <AccordionItem value={value} className="border-zinc-800 bg-zinc-950/50 rounded-xl px-6 border">
        <AccordionTrigger className="text-left font-bold uppercase tracking-wide text-zinc-200 hover:text-white hover:no-underline py-4 text-xs md:text-sm">
            {question}
        </AccordionTrigger>
        <AccordionContent className="text-zinc-500 text-xs md:text-sm leading-relaxed pb-4">
            {answer}
        </AccordionContent>
    </AccordionItem>
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

const PricingItem = ({ text, highlight = false, disabled = false }: any) => (
    <div className={cn("flex items-center gap-3", disabled ? "opacity-30" : "opacity-100")}>
        {disabled ? <XCircle className="h-4 w-4 text-zinc-600" /> : <CheckCircle2 className={cn("h-4 w-4", highlight ? "text-red-500" : "text-zinc-500")} />}
        <span className={cn("text-xs font-bold uppercase tracking-wide", highlight ? "text-white" : "text-zinc-500")}>{text}</span>
    </div>
);

export default Index;