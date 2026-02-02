import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { 
    Brain, Briefcase, Zap, 
    ArrowRight, MessageSquare, TrendingUp, Sparkles, 
    Star, CheckCircle2, ChevronRight, HelpCircle, ShieldCheck, Lock, MessageCircle
} from "lucide-react";
import { CoachApplicationForm } from "@/components/landing/CoachApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

export default function CoachLanding() {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    window.open("https://wa.me/5491154821533?text=Hola!%20Tengo%20una%20duda%20específica%20sobre%20el%20Founders%20Club%20de%20Heavy%20Duty", "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-yellow-500/30 relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10" />
           <img 
             src="/coach-hero.jpg" 
             className="w-full h-full object-cover grayscale contrast-125 opacity-50 scale-105 transition-transform duration-[10s] hover:scale-110"
             alt="Coach Command Center"
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

        <div className="relative z-20 max-w-5xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              <Star className="w-3 h-3 fill-current" /> Coach Command Center
           </div>

           <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
                DEJÁ DE SER UN<br/>
                <span className="text-zinc-600">SECRETARIO DE EXCEL</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                EMPEZÁ A SER EL <span className="text-red-500">CEO</span> DE TU NEGOCIO.
              </h2>
           </div>

           <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
             La primera plataforma de Gestión High-Performance con Inteligencia Artificial. Auditá entrenamientos, detectá fugas de clientes y generá tu marketing.
           </p>

           <div className="pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-20 px-10 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black uppercase italic text-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] border-2 border-yellow-400/20 rounded-xl">
                     SOLICITÁ ACCESO FUNDADOR
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
              <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mt-4">Cupo limitado a los primeros 50 Coaches</p>
           </div>
        </div>
      </section>

      {/* 2. EL PROBLEMA */}
      <section className="bg-zinc-100 py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter leading-none">¿TE SUENA ESTA HISTORIA?</h2>
            <div className="h-1.5 w-24 bg-red-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <PainPoint 
              title="La Planilla Infinita"
              desc="Llega el domingo a la noche y tenés que actualizar 30 excels diferentes. Copiar, pegar, revisar fórmulas rotas. Te sentís un administrativo, no un entrenador."
              icon={<TrendingUp className="h-10 w-10 text-red-600" />}
            />
            <PainPoint 
              title="El Caos de WhatsApp"
              desc="Tu celular explota. Consultas de técnica, audios de 2 minutos, fotos de comprobantes... Tu vida personal desapareció entre audios."
              icon={<MessageSquare className="h-10 w-10 text-red-600" />}
            />
            <PainPoint 
              title="La Fuga Silenciosa"
              desc="Alumnos que dejan de pagar y ni te enterás por qué. Te das cuenta tarde, cuando ya se fueron con otro que les presta más atención."
              icon={<Briefcase className="h-10 w-10 text-red-600" />}
            />
          </div>
        </div>
      </section>

      {/* 3. LA SOLUCIÓN */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="space-y-3 text-center lg:text-left">
                  <h3 className="text-red-500 font-black uppercase tracking-widest text-sm">TU CENTRO DE COMANDO</h3>
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.9]">NO ES OTRA "APP DE RUTINAS".</h2>
                  <p className="text-2xl text-zinc-500 font-bold uppercase italic">ES TU SOCIO DE NEGOCIOS INTELIGENTE.</p>
               </div>
               
               <div className="space-y-6">
                  <p className="text-zinc-400 text-lg leading-relaxed">Imaginate empezar el día y que la IA ya haya trabajado por vos:</p>
                  <ul className="space-y-4">
                     <CheckItem text="Ya revisó las 200 series que hicieron tus alumnos ayer." />
                     <CheckItem text="Ya detectó quién rompió un récord y quién se lesionó." />
                     <CheckItem text="Ya te armó la lista de a quién cobrarle hoy." />
                  </ul>
                  <p className="text-white font-black uppercase tracking-widest italic pt-4">VOS SOLO TOMÁS DECISIONES. LA APP HACE EL TRABAJO SUCIO.</p>
               </div>
            </div>

            <div className="relative group mx-auto w-full max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-red-600/20 blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity" />
                <Card className="bg-zinc-950 border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl relative z-10">
                    <CardContent className="p-0">
                      <img 
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
                          className="w-full h-auto opacity-80"
                          alt="Smart Briefing Dashboard"
                      />
                    </CardContent>
                </Card>
            </div>
         </div>
      </section>

      {/* 4. FEATURES */}
      <section className="bg-zinc-900/30 py-24 md:py-32 px-6 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">LOS SUPERPODERES DEL COACH</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    icon={<Brain className="text-red-500" />}
                    title="El Juez de IA"
                    desc="Auditoría técnica de cada sesión. Si el alumno no entrena intenso, la IA se lo dice. Vos solo intervenís en los casos graves."
                />
                <FeatureCard 
                    icon={<Zap className="text-yellow-500" />}
                    title="Radar de Retención"
                    desc="Detectá patrones de abandono antes de que sucedan. Salvá al cliente antes de que deje de pagar."
                />
                <FeatureCard 
                    icon={<Sparkles className="text-blue-500" />}
                    title="Marketing Viral"
                    desc="Generá automáticamente posteos basados en los récords reales de tus alumnos. Convertí resultados en ventas."
                />
                <FeatureCard 
                    icon={<Lock className="text-green-500" />}
                    title="Bóveda de Protocolos"
                    desc="Guardá tus esquemas maestros. La IA auditá los borradores para evitar errores de seguridad o dosis ilógicas."
                />
            </div>
        </div>
      </section>

      {/* 5. FAQ (OBJETION HANDLING) */}
      <section className="py-24 md:py-32 px-6 bg-black border-b border-zinc-900">
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">PREGUNTAS FRECUENTES (SIN VUELTAS)</h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <FAQItem 
                    value="item-1"
                    question="¿La IA va a reemplazar mi trabajo o 'robarme' alumnos?"
                    answer="Absolutamente no. La IA es tu Secretario, no el Jefe. El sistema se encarga de lo operativo: contar repeticiones, detectar estancamientos y avisarte si alguien no pagó. La Estrategia y la Relación Humana siguen siendo 100% tuyas. La app hace que tu servicio se vea más Premium, lo que fideliza al alumno con tu marca, no con la app."
                />
                <FAQItem 
                    value="item-2"
                    question="Tengo 30 alumnos en Excel y WhatsApp. ¿Es muy difícil pasarlos?"
                    answer="Sabemos que migrar da pereza, por eso lo resolvemos nosotros. Si entrás al 'Founders Club' (cupo limitado), tenés incluido el servicio de Migración Asistida. Nos pasás tus planillas y nosotros te entregamos la cuenta con todos tus alumnos cargados y listos para empezar. Vos no perdés tiempo cargando datos."
                />
                <FAQItem 
                    value="item-3"
                    question="No uso 'Heavy Duty' estricto con todos. ¿Me sirve igual?"
                    answer="Sí. Aunque la app prioriza la Alta Intensidad, la base es la Sobrecarga Progresiva, que aplica a cualquier sistema (PPL, Upper/Lower, Frecuencia 2). Lo que la IA va a auditar es que el alumno mejore (suba peso, reps o mejore técnica). Si tus alumnos progresan, la app te va a servir para demostrarlo con datos."
                />
                <FAQItem 
                    value="item-4"
                    question="¿La IA habla con mis alumnos? ¿Qué tono usa?"
                    answer="La IA no chatea libremente (no es un ChatGPT suelto). Emite dictámenes técnicos post-entreno. Y lo mejor: Vos elegís la personalidad. Desde tu panel, configurás si querés que la IA sea un 'Sargento Estricto', un 'Motivador Eufórico' o un 'Analista Frío'. El alumno siente que sos vos quien le está hablando."
                />
                <FAQItem 
                    value="item-5"
                    question="¿Cómo se manejan los pagos? ¿Dólares o Pesos?"
                    answer="Estamos en Argentina y entendemos el contexto. La suscripción del Coach se cobra en Pesos Argentinos vía Mercado Pago (Débito Automático). El precio se ajusta trimestralmente por índice oficial para que no pierdas previsibilidad. Nada de gastos sorpresa en dólares en la tarjeta."
                />
                <FAQItem 
                    value="item-6"
                    question="¿Puedo cargar mis propios planes de Farmacología y Nutrición?"
                    answer="Sí. Tenés una Bóveda Privada. Podés cargar tus protocolos y asignarlos. Nuestra IA actúa como un 'Auditor de Seguridad': antes de enviar un plan, el sistema revisa (si se lo pedís) que no haya errores de tipeo o inconsistencias graves. Es un seguro de calidad para tu trabajo."
                />
                <FAQItem 
                    value="item-7"
                    question="¿Qué pasa si un alumno deja de pagar?"
                    answer="El sistema tiene un Radar de Retención. Si detectamos que un alumno dejó de cargar datos o se le venció el plan, te aparece una 'Alerta Roja' en tu Dashboard de inmediato. La idea es que te enteres antes de que el alumno se enfríe y se vaya, para que puedas reactivarlo a tiempo."
                />
            </Accordion>

            {/* WHATSAPP CTA UNDER FAQ */}
            <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4 italic">¿Tenés una duda más específica sobre tu negocio?</p>
                <Button 
                    onClick={openWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white font-black uppercase italic tracking-widest h-14 px-8 rounded-xl shadow-lg shadow-green-900/20 group"
                >
                    <MessageCircle className="mr-2 h-5 w-5 fill-current" /> HABLEMOS POR WHATSAPP
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
      </section>

      {/* 6. LA OFERTA */}
      <section className="py-24 md:py-32 px-6">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-black border-2 border-yellow-500/20 overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.1)]">
            <CardContent className="p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-yellow-500">OPERACIÓN: 50 FUNDADORES</h2>
                        <p className="text-zinc-400 font-bold">Buscamos a los 50 entrenadores más serios para moldear el futuro de esta herramienta.</p>
                    </div>

                    <div className="grid gap-4">
                        <Benefit text="Precio Congelado de por Vida" sub="Blindate contra la inflación de la app." />
                        <Benefit text="Migración Asistida" sub="Nos das tus Excels, nosotros cargamos a tus alumnos." />
                        <Benefit text="Insignia 'Coach Verificado'" sub="Distintivo exclusivo de autoridad." />
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-fit h-16 px-12 bg-white text-black font-black uppercase italic tracking-widest text-lg hover:bg-zinc-200">
                                QUIERO APLICAR AHORA
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

                <div className="flex flex-col items-center gap-4">
                    <div className="text-7xl font-black italic text-zinc-800">50</div>
                    <div className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Vacantes Beta</div>
                </div>
            </CardContent>
        </Card>
      </section>

      {/* 7. FOOTER */}
      <footer className="p-12 text-center border-t border-zinc-900">
         <p className="text-xl font-bold uppercase italic text-zinc-400 max-w-xl mx-auto mb-10 leading-snug">
            ESCALAR TU NEGOCIO NO SIGNIFICA TRABAJAR MÁS HORAS. SIGNIFICA TENER MEJORES HERRAMIENTAS.
         </p>
         <div className="flex flex-col items-center gap-4">
            <img src="/logo.png" className="h-8 w-auto brightness-0 invert opacity-50" alt="Logo" />
            <p className="text-[10px] text-zinc-700 font-mono tracking-widest">
                POTENCIADO POR GOOGLE GEMINI AI • HEAVY DUTY DI IORIO 
            </p>
         </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON (FOR INSTANT SUPPORT) */}
      <div className="fixed bottom-6 right-6 z-[100] animate-bounce-slow">
         <Button 
            onClick={openWhatsApp}
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl shadow-green-900/40 p-0 border-4 border-black group"
         >
            <MessageCircle className="h-8 w-8 fill-current group-hover:scale-110 transition-transform" />
         </Button>
      </div>

    </div>
  );
}

const PainPoint = ({ icon, title, desc }: any) => (
    <div className="space-y-4 group text-center md:text-left">
        <div className="bg-white shadow-xl p-4 rounded-2xl w-fit mx-auto md:mx-0 group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-xl font-black text-black uppercase italic leading-none">{title}</h4>
        <p className="text-zinc-600 text-sm leading-relaxed">{desc}</p>
    </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
    <Card className="bg-zinc-950 border-zinc-900 p-6 space-y-4 hover:border-zinc-800 transition-all group">
        <CardContent className="p-0 space-y-4">
          <div className="p-2 bg-zinc-900 rounded-lg w-fit group-hover:scale-110 transition-transform">{icon}</div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h4>
          <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">{desc}</p>
        </CardContent>
    </Card>
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

const CheckItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-red-600" />
        <span className="text-sm font-bold text-zinc-300 uppercase italic tracking-wide">{text}</span>
    </li>
);

const Benefit = ({ text, sub }: any) => (
    <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="text-left">
            <p className="text-sm font-black uppercase text-white italic">{text}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">{sub}</p>
        </div>
    </div>
);