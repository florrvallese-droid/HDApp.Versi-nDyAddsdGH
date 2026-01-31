import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserCircle, CreditCard, LogOut, Database } from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { DataManagement } from "@/components/settings/DataManagement";

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ['profile', 'billing', 'data'].includes(tab)) {
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
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold uppercase tracking-wider">Ajustes</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-400 hover:bg-red-950/30">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full grid grid-cols-3 bg-zinc-900 border border-zinc-800 p-1 h-12">
          <TabsTrigger value="profile" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[10px] sm:text-xs tracking-wider h-full">
            <UserCircle className="mr-1 sm:mr-2 h-4 w-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[10px] sm:text-xs tracking-wider h-full">
            <CreditCard className="mr-1 sm:mr-2 h-4 w-4" /> Plan
          </TabsTrigger>
          <TabsTrigger value="data" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white font-bold uppercase text-[10px] sm:text-xs tracking-wider h-full">
            <Database className="mr-1 sm:mr-2 h-4 w-4" /> Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="billing" className="focus-visible:outline-none">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="data" className="focus-visible:outline-none">
          <DataManagement />
        </TabsContent>
      </Tabs>
      
      <div className="text-center pt-8 pb-4">
        <p className="text-[10px] text-zinc-700 font-mono">
           Heavy Duty Di Iorio v1.0.0
           <br/>
           UID: {supabase.auth.getUser().then(u => u.data.user?.id.substring(0,8))}
        </p>
      </div>

    </div>
  );
}