import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabase";
import { Brain, TrendingUp, ShieldCheck, Star, Lock, Users, Activity, NotebookPen } from "lucide-react";

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
            <Star className="w-3 h-3 fill-current" /> EL SISTEMA DEFINITIVO PARA EL ALTO RENDIMIENTO
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]">
              HEAVY DUTY
            </h1>
            <h2 className="text-lg md:text-3xl font-bold tracking-[0.2em] text-red-500 uppercase">
              TU <span className="text-white">CUADERNO</span> DE ENTRENAMIENTO INTELIGENTE
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed pt-4 font-medium">
            Registrá tus entrenamientos, tu nutrición, tu cardio, tus descansos y todo tu progreso en tu bitácora digital. 
            Analizá tu progreso, medí tus sensaciones y llevá tu entrenamiento al siguiente nivel.
          </p>
        </div>

        {/* Differentiated CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 pt-2">
          <Button 
            size="lg" 
            className="flex-1 h-20 text-lg font-black italic uppercase bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-red-500/20 rounded-xl flex flex-col items-center justify-center gap-0"
            onClick={() => navigate("/auth")}
          >
            <span className="text-2xl">SOY ATLETA</span>
            <span className="text-[10px] font-bold tracking-widest opacity-70">LLEVAR MI REGISTRO</span>
          </Button>

          <Button 
            size="lg" 
            variant="outline"
            className="flex-1 h-20 text-lg font-black italic uppercase bg-zinc-950/50 hover:bg-zinc-900 border-zinc-800 text-zinc-100 rounded-xl flex flex-col items-center justify-center gap-0"
            onClick={() => navigate("/auth?role=coach")}
          >
            <span className="text-2xl">SOY COACH</span>
            <span className="text-[10px] font-bold tracking-widest text-red-500">GESTIÓN MULTI-ATLETA</span>
          </Button>
        </div>

        {/* Persona Comparison Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24 w-full text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            
            {/* For Athletes */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg"><Activity className="text-red-500 w-6 h-6"/></div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">PARA EL ATLETA</h3>
                </div>
                <ul className="space-y-4">
                    <BenefitItem 
                      icon={<NotebookPen className="w-4 h-4 text-red-500"/>} 
                      title="Bitácora de Alta Intensidad" 
                      desc="El cuaderno definitivo para registrar tu rutina, tus técnicas de intensidad, nutrición, descanso y todo tu progreso sin distracciones." 
                    />
                    <BenefitItem 
                      icon={<TrendingUp className="w-4 h-4 text-red-500"/>} 
                      title="Sobrecarga Progresiva" 
                      desc="Visualización directa de tu objetivo a batir en cada serie, basada en tu historial de entrenamiento." 
                    />
                    <BenefitItem 
                      icon={<Brain className="w-4 h-4 text-red-500"/>} 
                      title="Análisis Integrado" 
                      desc="Evaluación de SNC pre-entreno, juicio crítico post-sesión y auditoría general para validar tu progreso real y evitar estancamientos." 
                    />
                </ul>
            </div>

            {/* For Coaches */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg"><Users className="text-blue-500 w-6 h-6"/></div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">PARA EL COACH</h3>
                </div>
                <ul className="space-y-4">
                    <BenefitItem 
                      icon={<Users className="w-4 h-4 text-blue-500"/>} 
                      title="Panel de Alumnos" 
                      desc="Supervisa los cuadernos de tus atletas desde una sola interfaz centralizada. Cambiá las rutinas y los macros de su dieta." 
                    />
                    <BenefitItem 
                      icon={<Activity className="w-4 h-4 text-blue-500"/>} 
                      title="Auditoría de Carga" 
                      desc="Mira exactamente el progreso de cada alumno en tiempo real, sin pedir capturas de pantalla." 
                    />
                    <BenefitItem 
                      icon={<ShieldCheck className="w-4 h-4 text-blue-500"/>} 
                      title="Validación de Adherencia" 
                      desc="Monitoreá el cumplimiento de dieta, suplementación y check-ins físicos de todo tu equipo." 
                    />
                </ul>
            </div>

        </div>

      </div>

      <footer className="p-8 text-center border-t border-zinc-900 relative z-10 bg-black/80 backdrop-blur-sm mt-20">
        <p className="text-zinc-500 text-xs font-mono mb-4">
          &copy; {new Date().getFullYear()} Heavy Duty Di Iorio. 
        </p>
        <div className="flex justify-center gap-4 text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-8">
            <span>Privacidad</span>
            <span>Términos</span>
            <span>Soporte</span>
        </div>
        
        <div className="mt-8 border-t border-zinc-900 pt-4">
            <button 
                onClick={() => navigate('/admin/login')}
                className="text-[10px] text-zinc-600 hover:text-red-500 transition-colors font-mono uppercase tracking-widest flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded hover:bg-zinc-900/50"
            >
                <Lock className="w-3 h-3" /> Acceso Administrativo
            </button>
        </div>
      </footer>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <li className="flex gap-4">
        <div className="mt-1">{icon}</div>
        <div>
            <h4 className="font-bold text-zinc-100 text-sm uppercase tracking-wide">{title}</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
        </div>
    </li>
);

export default Index;