import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { Dumbbell, Brain, TrendingUp, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-4xl mx-auto">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
            Heavy Duty<br />Di Iorio
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Entrenamiento de alta intensidad asistido por Inteligencia Artificial.
            Mide tu progreso real, no tus sensaciones.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          <Button 
            size="lg" 
            className="w-full text-lg font-bold bg-white text-black hover:bg-gray-200"
            onClick={() => navigate("/auth")}
          >
            Comenzar Ahora
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full text-lg font-bold border-zinc-800 text-white hover:bg-zinc-900"
            onClick={() => navigate("/auth")}
          >
            Iniciar Sesión
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <FeatureCard 
            icon={<Brain className="w-8 h-8 text-red-500" />}
            title="Coach IA"
            desc="Analiza tu sueño y estrés para decidir si entrenas pesado o descansas."
          />
          <FeatureCard 
            icon={<TrendingUp className="w-8 h-8 text-blue-500" />}
            title="Progreso Real"
            desc="Sobrecarga progresiva forzada. Supera tus marcas en cada sesión."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-yellow-500" />}
            title="Auditoría"
            desc="Detección de patrones ocultos en tu rendimiento y nutrición."
          />
        </div>
      </div>

      <footer className="p-6 text-center text-zinc-600 text-sm">
        &copy; {new Date().getFullYear()} Heavy Duty Di Iorio. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{desc}</p>
  </div>
);

export default Index;