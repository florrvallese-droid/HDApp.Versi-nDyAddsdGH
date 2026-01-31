import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Utensils, Pill, ChevronLeft, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { NutritionConfig, Supplement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Config State
  const [dietType, setDietType] = useState<"fixed" | "cycling">("fixed");
  const [calories, setCalories] = useState<number>(2500);
  const [macros, setMacros] = useState({ p: 200, c: 300, f: 80 });
  const [supplements, setSupplements] = useState<Supplement[]>([]);

  // New Supplement Input
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppTiming, setNewSuppTiming] = useState<Supplement['timing']>("pre");
  const [newSuppDosage, setNewSuppDosage] = useState("");

  useEffect(() => {
    if (profile?.settings?.nutrition) {
      const config = profile.settings.nutrition;
      setDietType(config.diet_type);
      setCalories(config.calories_target || 2500);
      setMacros(config.macros || { p: 200, c: 300, f: 80 });
      setSupplements(config.supplements_stack || []);
    }
  }, [profile]);

  const saveConfig = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (!profile) return;
    setLoading(true);

    const newConfig: NutritionConfig = {
      diet_type: dietType,
      calories_target: calories,
      macros,
      supplements_stack: supplements
    };

    const newSettings = {
      ...profile.settings,
      nutrition: newConfig
    };

    const { error } = await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('user_id', profile.user_id);

    setLoading(false);
    if (error) toast.error("Error guardando configuración");
    else toast.success("Protocolo actualizado");
  };

  const addSupplement = () => {
    if (!newSuppName) return;
    const newSupp: Supplement = {
      id: crypto.randomUUID(),
      name: newSuppName,
      timing: newSuppTiming,
      dosage: newSuppDosage
    };
    setSupplements([...supplements, newSupp]);
    setNewSuppName("");
    setNewSuppDosage("");
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
  };

  if (profileLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20 max-w-md mx-auto space-y-6">
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureName="Estrategia Nutricional"
      />

      {/* Header matching other pages */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
             <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Protocolo</h1>
             <p className="text-xs text-red-600 font-bold tracking-widest uppercase">Nutrición & Suplementación</p>
          </div>
        </div>
        {!hasProAccess && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1 bg-yellow-950/10">
            <Lock className="w-3 h-3" /> PRO
          </Badge>
        )}
      </div>

      {/* Diet Config Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Utensils className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Macro-Estructura</span>
        </div>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs text-zinc-500 uppercase font-bold">Tipo de Dieta</Label>
                    <Select value={dietType} onValueChange={(v: any) => setDietType(v)}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white font-bold h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="fixed">Dieta Fija (Lineal)</SelectItem>
                            <SelectItem value="cycling">Ciclado (Altos/Bajos)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-zinc-500 uppercase font-bold">Objetivo Calórico</Label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            className="bg-zinc-900 border-zinc-800 text-white font-black text-lg h-12 pl-4"
                            value={calories} 
                            onChange={(e) => setCalories(Number(e.target.value))} 
                        />
                        <span className="absolute right-4 top-3 text-xs text-zinc-500 font-bold">KCAL</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold text-center block">Proteína</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                className="bg-zinc-900 border-zinc-800 text-white font-bold text-center h-10"
                                value={macros.p} 
                                onChange={(e) => setMacros({...macros, p: Number(e.target.value)})} 
                            />
                            <span className="absolute right-2 top-2.5 text-[10px] text-zinc-600">g</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold text-center block">Carbos</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                className="bg-zinc-900 border-zinc-800 text-white font-bold text-center h-10"
                                value={macros.c} 
                                onChange={(e) => setMacros({...macros, c: Number(e.target.value)})} 
                            />
                             <span className="absolute right-2 top-2.5 text-[10px] text-zinc-600">g</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold text-center block">Grasas</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                className="bg-zinc-900 border-zinc-800 text-white font-bold text-center h-10"
                                value={macros.f} 
                                onChange={(e) => setMacros({...macros, f: Number(e.target.value)})} 
                            />
                             <span className="absolute right-2 top-2.5 text-[10px] text-zinc-600">g</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Supplement Stack Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Pill className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Stack de Suplementos</span>
        </div>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    {supplements.length === 0 && (
                        <p className="text-sm text-zinc-600 text-center py-4 border border-dashed border-zinc-800 rounded">Sin suplementos asignados</p>
                    )}
                    {supplements.map((s) => (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded border border-zinc-800">
                            <div>
                                <p className="font-bold text-sm text-white">{s.name}</p>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <span className="text-red-500 font-bold">{s.timing.toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{s.dosage}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeSupplement(s.id)} className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-transparent">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Add New Supplement Form */}
                <div className="pt-4 border-t border-zinc-900 space-y-3">
                    <div className="grid grid-cols-[1fr_80px] gap-2">
                        <Input 
                            placeholder="Nombre (ej: Creatina)" 
                            value={newSuppName} 
                            onChange={(e) => setNewSuppName(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-white h-9 text-xs"
                        />
                        <Input 
                            placeholder="Dosis" 
                            value={newSuppDosage} 
                            onChange={(e) => setNewSuppDosage(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-white h-9 text-xs"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={newSuppTiming} onValueChange={(v: any) => setNewSuppTiming(v)}>
                            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs">
                                <SelectValue placeholder="Timing" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectItem value="fasted">Ayunas</SelectItem>
                                <SelectItem value="pre">Pre-Workout</SelectItem>
                                <SelectItem value="intra">Intra-Workout</SelectItem>
                                <SelectItem value="post">Post-Workout</SelectItem>
                                <SelectItem value="meal">Con Comidas</SelectItem>
                                <SelectItem value="night">Noche</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={addSupplement} disabled={!newSuppName} className="bg-zinc-800 hover:bg-zinc-700 h-9 w-12">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Button 
        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] relative overflow-hidden" 
        onClick={saveConfig} 
        disabled={loading}
      >
        {!hasProAccess && <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-4 h-4 mr-2"/> PRO</div>}
        {loading ? "Guardando..." : "Guardar Protocolo"}
      </Button>
    </div>
  );
}