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
    Sparkles, Share2, Image as ImageIcon, Camera, Library
} from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { SocialMediaManager } from "@/components/coach/SocialMediaManager";
import { TemplateLibrary } from "@/components/coach/TemplateLibrary";
import { uploadBrandLogo } from "@/services/storage";

export default function CoachBusiness() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'strategy');

  // Business State
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.business_info) {
        const info = profile.business_info;
        setBrandName(info.brand_name || "");
        setBrandLogo(info.brand_logo_url || null);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !profile) return;
    setUploadingLogo(true);
    
    const { url, error } = await uploadBrandLogo(profile.user_id, e.target.files[0]);
    
    if (error) {
        toast.error("Error al subir el logo");
    } else {
        setBrandLogo(url);
        toast.success("Logo de marca actualizado");
    }
    setUploadingLogo(false);
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
                    brand_logo_url: brandLogo,
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
            <TabsTrigger value="library" className="flex-1 font-black uppercase text-[10px] tracking-widest">
                <Library className="w-3.5 h-3.5 mr-2" /> Plantillas
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

            <Card className="bg-zinc-950 border-zinc-900">
                <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-red-500" /> Identidad Visual
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-2">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-2xl bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-red-600/50">
                                {brandLogo ? (
                                    <img src={brandLogo} className="w-full h-full object-contain p-2" alt="Logo de Marca" />
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-zinc-600">
                                        <ImageIcon className="h-8 w-8" />
                                        <span className="text-[8px] font-black uppercase">Subir Logo</span>
                                    </div>
                                )}
                                {uploadingLogo && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    accept="image/*" 
                                    onChange={handleLogoUpload}
                                    disabled={uploadingLogo}
                                />
                            </div>
                            <Button size="icon" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 shadow-xl border-2 border-black">
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Logo de Marca (.PNG recomendado)</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Nombre de Marca / Team</Label>
                        <Input value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ej: Di Iorio High Performance" className="bg-zinc-900 border-zinc-800 h-12 font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Bio Corta</Label>
                        <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tu filosofía de entrenamiento..." className="bg-zinc-900 border-zinc-800 min-h-[100px]" />
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest border border-red-500 shadow-xl">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5 mr-2" />}
                GUARDAR ESTRATEGIA COMERCIAL
            </Button>
        </TabsContent>

        <TabsContent value="library" className="animate-in slide-in-from-right-2">
            <TemplateLibrary />
        </TabsContent>

        <TabsContent value="social" className="animate-in slide-in-from-right-2">
            <SocialMediaManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}