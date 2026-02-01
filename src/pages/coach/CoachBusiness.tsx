import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ChevronLeft, Briefcase, Plus, Trash2, Save, Loader2, 
    Instagram, MessageCircle, Globe, DollarSign, Award, Settings, Info, BookOpen, Brain, TrendingUp,
    Sparkles, Share2
} from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { SocialMediaManager } from "@/components/coach/SocialMediaManager";

export default function CoachBusiness() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'strategy');

  // Business State
  const [brandName, setBrandName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.business_info) {
        const info = profile.business_info;
        setBrandName(info.brand_name || "");
        setBio(info.bio || "");
        setInstagram(info.instagram || "");
        setWhatsapp(info.whatsapp || "");
        setSpecialty(info.specialty || "");
        setPlans(info.plans || []);
    }
  }, [profile]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const addPlan = () => {
    setPlans([...plans, { name: "Nuevo Plan", price: "", features: "" }]);
  };

  const updatePlan = (index: number, field: string, value: string) => {
    const updated = [...plans];
    updated[index][field] = value;
    setPlans(updated);
  };

  const removePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                business_info: {
                    ...profile.business_info,
                    brand_name: brandName,
                    bio,
                    instagram,
                    whatsapp,
                    specialty,
                    plans
                },
                updated_at: new Date().toISOString()
            })
            .eq('user_id', profile.user_id);

        if (error) throw error;
        toast.success("Configuración de negocio actualizada");
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-500"><ChevronLeft className="h-6 w-6" /></Button>
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tight">Business Hub</h1>
          <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Gestión de Marca y Marketing</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger value="strategy" className="flex-1 font-black uppercase text-[10px] tracking-widest">
                <Settings className="w-3.5 h-3.5 mr-2" /> Comercial
            </TabsTrigger>
            <TabsTrigger value="social" className="flex-1 font-black uppercase text-[10px] tracking-widest">
                <Share2 className="w-3.5 h-3.5 mr-2 text-red-500" /> Marketing
            </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-8 animate-in slide-in-from-left-2">
            {/* QUICK ACCESS TO AUDIT */}
            <Card className="bg-red-600/10 border-red-600/30 overflow-hidden group">
                <CardContent className="p-0">
                    <button 
                        onClick={() => navigate('/coach/business/audit')}
                        className="w-full p-5 flex items-center justify-between transition-all hover:bg-red-600/10 text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-600 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black uppercase italic text-sm text-white">Auditoría Estratégica (IA)</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Cruce de datos de rentabilidad y equipo</p>
                            </div>
                        </div>
                        <ChevronLeft className="h-5 w-5 text-red-600 rotate-180 transition-transform group-hover:translate-x-1" />
                    </button>
                </CardContent>
            </Card>

            {/* Marca y Redes */}
            <Card className="bg-zinc-950 border-zinc-900">
                <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-red-500" /> Identidad Visual
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Nombre de Marca / Team</Label>
                        <Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ej: Di Iorio High Performance" className="bg-zinc-900 border-zinc-800 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Bio Corta</Label>
                        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tu filosofía de entrenamiento..." className="bg-zinc-900 border-zinc-800 min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Instagram className="h-3 w-3" /> Instagram</Label>
                            <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@usuario" className="bg-zinc-900 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><MessageCircle className="h-3 w-3" /> WhatsApp</Label>
                            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Número con código" className="bg-zinc-900 border-zinc-800" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Oferta de Servicios */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Award className="h-3 w-3 text-yellow-500" /> Mis Planes y Precios
                    </h3>
                    <Button variant="ghost" size="sm" onClick={addPlan} className="text-[10px] uppercase font-bold text-red-500"><Plus className="h-3 w-3 mr-1" /> Nuevo Plan</Button>
                </div>

                <div className="grid gap-4">
                    {plans.map((plan, idx) => (
                        <Card key={idx} className="bg-zinc-950 border-zinc-900 overflow-hidden">
                            <div className="bg-zinc-900/50 p-4 border-b border-zinc-900 flex justify-between items-center">
                                <Input 
                                    value={plan.name} 
                                    onChange={e => updatePlan(idx, 'name', e.target.value)}
                                    className="bg-transparent border-none p-0 h-auto font-black uppercase italic text-sm text-white focus-visible:ring-0"
                                />
                                <Button variant="ghost" size="icon" onClick={() => removePlan(idx)} className="text-zinc-700 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-[9px] text-zinc-600 uppercase font-bold">Precio Mensual</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-green-500" />
                                            <Input type="number" value={plan.price} onChange={e => updatePlan(idx, 'price', e.target.value)} className="bg-zinc-900 border-zinc-800 pl-10" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] text-zinc-600 uppercase font-bold">¿Qué incluye?</Label>
                                    <Input value={plan.features} onChange={e => updatePlan(idx, 'features', e.target.value)} placeholder="Ej: Dieta, Rutina, Chat 24/7..." className="bg-zinc-900 border-zinc-800" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest border border-red-500 shadow-xl">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5 mr-2" />}
                GUARDAR ESTRATEGIA COMERCIAL
            </Button>
        </TabsContent>

        <TabsContent value="social" className="animate-in slide-in-from-right-2">
            <SocialMediaManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}