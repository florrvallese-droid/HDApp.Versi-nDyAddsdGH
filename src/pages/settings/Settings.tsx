import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserCircle, CreditCard, LogOut, Database, Users, Star } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { DataManagement } from "@/components/settings/DataManagement";
import { CoachInfo } from "@/components/settings/CoachInfo";
import { CoachCollaborations } from "@/components/settings/CoachCollaborations";
import { useProfile } from "@/hooks/useProfile";

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ['profile', 'billing', 'data', 'coach', 'collabs'].includes(tab)) {
      setActiveTab(tab);
    }
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

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider text-zinc-500">Ajustes de Cuenta</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:bg-red-950/30">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        <TabsList className={cn(
            "w-full grid bg-zinc-900/50 border border-zinc-800 p-1 h-14 rounded-lg",
            profile?.is_coach ? "grid-cols-4" : "grid-cols-4"
        )}>
          <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[9px] tracking-widest h-full rounded-md transition-all">
            <UserCircle className="mr-1.5 h-3.5 w-3.5" /> Perfil
          </TabsTrigger>
          {!profile?.is_coach ? (
            <TabsTrigger value="coach" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[9px] tracking-widest h-full rounded-md transition-all">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Mi Coach
            </TabsTrigger>
          ) : (
            <TabsTrigger value="collabs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[9px] tracking-widest h-full rounded-md transition-all">
              <Star className="mr-1.5 h-3.5 w-3.5" /> Marcas
            </TabsTrigger>
          )}
          <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[9px] tracking-widest h-full rounded-md transition-all">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Plan
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[9px] tracking-widest h-full rounded-md transition-all">
            <Database className="mr-1.5 h-3.5 w-3.5" /> Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="coach" className="focus-visible:outline-none max-w-2xl mx-auto">
          {profile?.user_id && <CoachInfo userId={profile.user_id} />}
        </TabsContent>

        <TabsContent value="collabs" className="focus-visible:outline-none max-w-2xl mx-auto">
          <CoachCollaborations />
        </TabsContent>

        <TabsContent value="billing" className="focus-visible:outline-none max-w-2xl mx-auto">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="data" className="focus-visible:outline-none max-w-2xl mx-auto">
          <DataManagement />
        </TabsContent>
      </Tabs>
      
      <div className="text-center pt-10 pb-4 border-t border-zinc-900 mt-10">
        <p className="text-[10px] text-zinc-700 font-mono">
           HEAVY DUTY SYSTEM v1.1
        </p>
      </div>

    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}