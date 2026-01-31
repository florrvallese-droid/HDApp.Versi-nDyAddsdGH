import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { Brain, TrendingUp, ShieldCheck, ChevronRight, Dumbbell, Star } from "lucide-react";

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
           <div className="h-8 w-8 bg-red-600 rounded flex items-center justify-center font-black italic">HD</div>
           <span className="font-bold tracking-tighter text-lg hidden sm:inline-block">DI IORIO GYM</span>
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
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 relative z-10 max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-900/50 bg-red-900/10 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Star className="w-3 h-3 fill-current" /> Versión 2.0 con IA
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
            Heavy Duty<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Protocol</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Deja de adivinar. Deja de perder el tiempo.<br/>
            Entrenamiento de alta intensidad asistido por <strong>Inteligencia Artificial</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 pt-4">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-black italic uppercase bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/20"
            onClick={() => navigate("/auth")}
          >
            Comenzar Ahora <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-red-500" />}
            title="Coach IA"
            desc="Analiza tu sueño y estrés para decidir la intensidad del día."
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            title="Sobrecarga"
            desc="El sistema te obliga a superar tus marcas en cada sesión."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-blue-500" />}
            title="Auditoría"
            desc="Detecta patrones ocultos y optimiza tu recuperación."
          />
        </div>

        {/* Social Proof / Stats */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-zinc-900/50 mt-12">
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
  <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all text-left group">
    <div className="mb-4 bg-zinc-950 w-fit p-3 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">{icon}</div>
    <h3 className="text-lg font-bold mb-2 text-zinc-200 uppercase tracking-wide">{title}</h3>
    <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ number, label }: { number: string, label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-black text-white italic">{number}</span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{label}</span>
    </div>
);

export default Index;