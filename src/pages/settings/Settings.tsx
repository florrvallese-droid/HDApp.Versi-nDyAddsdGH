import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserCircle, CreditCard, LogOut, Database, Users, Star, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { DataManagement } from "@/components/settings/DataManagement";
import { CoachInfo } from "@/components/settings/CoachInfo";
import { CoachCollaborations } from "@/components/settings/CoachCollaborations";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-lg font-bold text-red-500">Error de Perfil</h2>
        <p className="text-zinc-400 text-sm">No se pudieron cargar tus datos. Intenta reingresar.</p>
        <Button onClick={handleLogout} className="mt-4">Volver a Ingresar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider text-zinc-500">Configuración</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:bg-red-950/30">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        <TabsList className="w-full grid grid-cols-3 bg-zinc-900/50 border border-zinc-800 p-1 h-14 rounded-lg">
          <TabsTrigger value="profile" className="font-bold uppercase text-[9px] tracking-widest">
            <UserCircle className="mr-1.5 h-3.5 w-3.5" /> Perfil
          </TabsTrigger>
          
          {!profile.is_coach ? (
            <TabsTrigger value="coach" className="font-bold uppercase text-[9px] tracking-widest">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Mi Coach
            </TabsTrigger>
          ) : (
            <TabsTrigger value="collabs" className="font-bold uppercase text-[9px] tracking-widest">
              <Star className="mr-1.5 h-3.5 w-3.5" /> Beneficios
            </TabsTrigger>
          )}

          <TabsTrigger value="data" className="font-bold uppercase text-[9px] tracking-widest">
            <Database className="mr-1.5 h-3.5 w-3.5" /> Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="coach" className="focus-visible:outline-none">
          {profile.user_id && <CoachInfo userId={profile.user_id} />}
        </TabsContent>

        <TabsContent value="collabs" className="focus-visible:outline-none">
          <CoachCollaborations />
        </TabsContent>

        <TabsContent value="data" className="focus-visible:outline-none">
          <DataManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}