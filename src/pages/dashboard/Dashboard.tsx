import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Camera, Brain, ChevronRight, LogOut, TrendingUp, Utensils, Syringe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/services/supabase";
import { PreWorkoutModal } from "@/components/dashboard/PreWorkoutModal";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const [showPreWorkout, setShowPreWorkout] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto min-h-screen space-y-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Hola, {profile?.display_name?.split(" ")[0] || "Atleta"}
            {profile?.is_premium && <Badge variant="secondary" className="text-[10px] bg-yellow-500/20 text-yellow-600">PRO</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.coach_tone === 'strict' ? "Sin excusas hoy." : 
             profile?.coach_tone === 'motivational' ? "¡Vamos a romperla!" :
             profile?.coach_tone === 'analytical' ? "Analizando métricas..." :
             "¿Listo para entrenar?"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold uppercase">
            {profile?.display_name ? profile.display_name.substring(0, 2) : "JD"}
          </div>
        </div>
      </header>

      {/* Pre-Workout IA Decision Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Brain className="w-24 h-24 rotate-12" />
        </div>
        <CardHeader className="pb-2 relative">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Coach IA
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm mb-4 text-muted-foreground">
            Analiza tu sueño, estrés y sensación física para decidir la intensidad de hoy.
          </p>
          <Button className="w-full" onClick={() => setShowPreWorkout(true)}>
            Consultar Coach
          </Button>
        </CardContent>
      </Card>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card 
          className="hover:bg-accent/50 cursor-pointer transition-all hover:scale-[1.02]" 
          onClick={() => navigate('/workout')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-semibold">Entrenar</span>
          </CardContent>
        </Card>

        <Card 
          className="hover:bg-accent/50 cursor-pointer transition-all hover:scale-[1.02]" 
          onClick={() => navigate('/checkin')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-semibold">Check-in</span>
          </CardContent>
        </Card>

        <Card 
          className="hover:bg-accent/50 cursor-pointer transition-all hover:scale-[1.02]" 
          onClick={() => navigate('/nutrition')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-semibold">Nutrición</span>
          </CardContent>
        </Card>

         <Card 
          className="hover:bg-accent/50 cursor-pointer transition-all hover:scale-[1.02]" 
          onClick={() => navigate('/analysis')}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-semibold">Auditoría</span>
          </CardContent>
        </Card>
      </div>

      {/* Pharmacology / Private Vault */}
      <Card 
        className="border-red-900/20 bg-gradient-to-r from-red-950/10 to-transparent cursor-pointer transition-all hover:border-red-900/50"
        onClick={() => navigate('/pharmacology')}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Syringe className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-700 dark:text-red-400">Farmacología</p>
              <p className="text-xs text-muted-foreground">Registro privado de ciclos</p>
            </div>
          </div>
          <ChevronRight className="text-muted-foreground h-5 w-5" />
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-semibold">Resumen Semanal</h2>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Sesiones completadas</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">0</p>
                <span className="text-xs text-muted-foreground">/ 5 objetivo</span>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <PreWorkoutModal 
        open={showPreWorkout} 
        onOpenChange={setShowPreWorkout} 
        coachTone={profile?.coach_tone || 'strict'}
      />
    </div>
  );
};

export default Dashboard;