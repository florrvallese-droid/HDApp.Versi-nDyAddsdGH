import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { Brain, TrendingUp, ShieldCheck, ChevronRight, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
           <img 
             src="/logo.png" 
             alt="Di Iorio Gym" 
             className="h-16 w-auto object-contain brightness-0 invert" 
           />
        </div>
        <Button 
            variant="ghost" 
            className="text-zinc-300 hover:text-white font-bold uppercase text-xs tracking-wider"
            onClick={() => navigate("/auth")}
        >
            Iniciar Sesión
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10 max-w-5xl mx-auto space-y-10">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-900/50 bg-red-900/10 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Star className="w-3 h-3 fill-current" /> Versión 17.09 integrada con IA
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
              HEAVY DUTY
            </h1>
            <h2 className="text-lg md:text-3xl font-bold tracking-[0.2em] text-red-500 uppercase">
              TU <span className="text-white">CUADERNO</span> DE ENTRENAMIENTO
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-4 font-medium">
            Dejá de adivinar y empezá a entrenar en serio.<br className="hidden md:block"/> 
            No podés saber si estás progresando si no medís lo que estás haciendo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 pt-2">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-black italic uppercase bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/20"
            onClick={() => navigate("/auth")}
          >
            Comenzar Ahora <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 text-left">
          
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-red-500" />}
            title="EVALUACIÓN SISTÉMICA"
            desc="Analizá tu descanso y estrés para decidir tu fase de entrenamiento. A veces, la decisión más anabólica no es hacer otra serie, sino dormir una hora más para equilibrar tu dopamina y bajar el cortisol."
          />
          
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="SOBRECARGA PROGRESIVA"
            desc="Tu guía. Abrís el cuaderno, mirás lo que hiciste la semana pasada y tu objetivo es simple: superarlo."
          />
          
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-500" />}
            title="AUDITORÍA"
            desc="Detecta patrones ocultos y optimiza tu recuperación basándose en tus datos históricos."
          />
        </div>

        {/* Social Proof / Stats */}
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-zinc-900/50 mt-12">
            <Stat number="+10k" label="Sesiones" />
            <Stat number="4.9/5" label="Rating IA" />
            <Stat number="100%" label="Ciencia" />
            <Stat number="0%" label="Excusas" />
        </div>

      </div>

      <footer className="p-8 text-center border-t border-zinc-900 relative z-10 bg-black/80 backdrop-blur-sm">
        <p className="text-zinc-600 text-xs font-mono mb-2">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio. 
        </p>
        <div className="flex justify-center gap-4 text-[10px] text-zinc-700 uppercase font-bold tracking-wider">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Soporte</span>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all group h-full">
    <div className="mb-4 bg-zinc-950 w-fit p-3 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">{icon}</div>
    <h3 className="text-lg font-black mb-3 text-zinc-100 uppercase tracking-wide">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const Stat = ({ number, label }: { number: string, label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-black text-white italic">{number}</span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{label}</span>
    </div>
);

export default Index;