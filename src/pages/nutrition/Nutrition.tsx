import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronLeft, Lock, Syringe, Calendar, Scale, Activity } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Macro Structure State
  const [currentDate] = useState(format(new Date(), "dd/MM/yyyy"));
  const [phaseGoal, setPhaseGoal] = useState<PhaseGoal>("maintenance");
  const [currentWeight, setCurrentWeight] = useState("");

  // Strategy State (Variants)
  const [variants, setVariants] = useState<DietVariant[]>([]);
  
  // New Variant Input
  const [newVariantName, setNewVariantName] = useState("");
  const [newCals, setNewCals] = useState<number>(0);
  const [newP, setNewP] = useState<number>(0);
  const [newC, setNewC] = useState<number>(0);
  const [newF, setNewF] = useState<number>(0);

  // Supplement State
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppTiming, setNewSuppTiming] = useState<Supplement['timing']>("pre");
  const [newSuppDosage, setNewSuppDosage] = useState("");

  useEffect(() => {
    if (profile) {
      // Load current weight
      if (profile.settings?.current_weight) {
        setCurrentWeight(profile.settings.current_weight);
      }
      // Load Nutrition Config
      if (profile.settings?.nutrition) {
        const config = profile.settings.nutrition;
        setPhaseGoal(config.phase_goal || "maintenance");
        setVariants(config.diet_variants || []);
        setSupplements(config.supplements_stack || []);
      }
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
      phase_goal: phaseGoal,
      diet_variants: variants,
      supplements_stack: supplements
    };

    const newSettings = {
      ...profile.settings,
      current_weight: currentWeight, // Update weight in profile settings too
      nutrition: newConfig
    };

    const { error } = await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('user_id', profile.user_id);

    setLoading(false);
    if (error) toast.error("Error guardando protocolo");
    else toast.success("Protocolo actualizado");
  };

  // Variant Handlers
  const addVariant = () => {
    if (!newVariantName) return;
    const variant: DietVariant = {
      id: crypto.randomUUID(),
      name: newVariantName,
      calories: newCals || (newP * 4 + newC * 4 + newF * 9),
      macros: { p: newP, c: newC, f: newF }
    };
    setVariants([...variants, variant]);
    setNewVariantName("");
    setNewCals(0);
    setNewP(0);
    setNewC(0);
    setNewF(0);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  // Supplement Handlers
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

  // Helper to Group Supplements by Timing
  const getSupplementsByTiming = (timing: string) => {
    return supplements.filter(s => s.timing === timing);
  };

  const timingLabels = [
    { key: 'fasted', label: 'Ayunas' },
    { key: 'meal', label: 'Con Comidas' },
    { key: 'pre', label: 'Pre-Entreno' },
    { key: 'intra', label: 'Intra-Entreno' },
    { key: 'post', label: 'Post-Entreno' },
    { key: 'night', label: 'Noche' },
  ];

  if (profileLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto space-y-8">
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureName="Estrategia Nutricional"
      />

      {/* Header */}
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

      {/* 1. ACCESS TO PHARMACOLOGY */}
      <Button 
        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-wide flex items-center justify-between px-4 group"
        onClick={() => navigate('/pharmacology')}
      >
        <span className="flex items-center gap-2">
           <Syringe className="h-4 w-4 text-red-600 group-hover:text-red-500 transition-colors" />
           Ir a Bóveda de Farmacología
        </span>
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </Button>

      {/* 2. MACRO STRUCTURE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Macro-Estructura</span>
        </div>

        <Card className="bg-zinc-950 border-zinc-800 text-white">
            <CardContent className="p-4 grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Fecha</Label>
                        <div className="flex items-center h-10 px-3 rounded bg-zinc-900 border border-zinc-800 text-sm font-bold text-zinc-300">
                           <Calendar className="mr-2 h-3 w-3 text-zinc-500" /> {currentDate}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] text-zinc-500 uppercase font-bold">Peso Hoy (Kg)</Label>
                        <div className="relative">
                            <Input 
                                type="number"
                                className="bg-zinc-900 border-zinc-800 text-white font-bold h-10 pl-8"
                                value={currentWeight}
                                onChange={(e) => setCurrentWeight(e.target.value)}
                            />
                            <Scale className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="text-[10px] text-zinc-500 uppercase font-bold">Fase Objetivo</Label>
                    <Select value={phaseGoal} onValueChange={(v: any) => setPhaseGoal(v)}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white font-bold h-11 uppercase">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="volume">Volumen</SelectItem>
                            <SelectItem value="definition">Definición</SelectItem>
                            <SelectItem value="maintenance">Mantenimiento</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 3. NUTRITIONAL STRATEGY (VARIANTS) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Estrategia Nutricional</span>
        </div>

        {/* Existing Variants List */}
        <div className="space-y-3">
            {variants.map((v) => (
                <Card key={v.id} className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-3 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="font-black italic uppercase text-white">{v.name}</p>
                            <div className="flex gap-3 text-xs text-zinc-400 font-mono">
                                <span className="text-white font-bold">{v.calories} kcal</span>
                                <span>P:{v.macros.p}</span>
                                <span>C:{v.macros.c}</span>
                                <span>G:{v.macros.f}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeVariant(v.id)} className="h-8 w-8 text-zinc-600 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Add New Variant Form */}
        <Card className="bg-zinc-950 border-zinc-800 text-white border-dashed">
             <CardContent className="p-4 space-y-3">
                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Agregar Variante de Día</Label>
                <Input 
                    placeholder="Nombre (Ej: Día Alto Carbos)" 
                    className="bg-zinc-900 border-zinc-800 h-9 text-xs"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                />
                
                <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                        <Label className="text-[9px] text-zinc-500 uppercase">Kcal</Label>
                        <Input type="number" placeholder="0" className="bg-zinc-900 border-zinc-800 h-8 text-xs text-center px-1" value={newCals || ''} onChange={(e) => setNewCals(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] text-zinc-500 uppercase">Prot</Label>
                        <Input type="number" placeholder="0" className="bg-zinc-900 border-zinc-800 h-8 text-xs text-center px-1" value={newP || ''} onChange={(e) => setNewP(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] text-zinc-500 uppercase">Carb</Label>
                        <Input type="number" placeholder="0" className="bg-zinc-900 border-zinc-800 h-8 text-xs text-center px-1" value={newC || ''} onChange={(e) => setNewC(Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] text-zinc-500 uppercase">Gras</Label>
                        <Input type="number" placeholder="0" className="bg-zinc-900 border-zinc-800 h-8 text-xs text-center px-1" value={newF || ''} onChange={(e) => setNewF(Number(e.target.value))} />
                    </div>
                </div>

                <Button 
                    size="sm" 
                    className="w-full bg-zinc-800 hover:bg-zinc-700 h-8 text-xs uppercase font-bold"
                    onClick={addVariant}
                    disabled={!newVariantName}
                >
                    <Plus className="h-3 w-3 mr-1" /> Agregar Variante
                </Button>
             </CardContent>
        </Card>
      </div>

      {/* 4. SUPPLEMENT STACK */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Stack de Suplementos</span>
        </div>

        {/* Timing Boxes */}
        <div className="grid gap-3">
            {timingLabels.map((time) => {
                const groupedSups = getSupplementsByTiming(time.key);
                // Always show the box if it has supplements, or if we are in "edit mode" (implied by presence of form below)
                // Actually, let's just show boxes that have items, or a placeholder if empty
                if (groupedSups.length === 0) return null;

                return (
                    <div key={time.key} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-red-600 tracking-wider">{time.label}</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {groupedSups.map(s => (
                                <div key={s.id} className="flex justify-between items-center px-2 py-1.5 hover:bg-zinc-800/50 rounded text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-white font-medium">{s.name}</span>
                                        <span className="text-zinc-500 text-xs mt-0.5">{s.dosage}</span>
                                    </div>
                                    <Trash2 className="h-3 w-3 text-zinc-600 cursor-pointer hover:text-red-500" onClick={() => removeSupplement(s.id)} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
             {supplements.length === 0 && (
                 <p className="text-xs text-zinc-600 text-center py-4 italic">No hay suplementos configurados</p>
             )}
        </div>

        {/* Add Supplement Form */}
        <Card className="bg-zinc-950 border-zinc-800 text-white border-dashed">
            <CardContent className="p-4 space-y-3">
                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Agregar al Stack</Label>
                <div className="grid grid-cols-[1fr_80px] gap-2">
                    <Input 
                        placeholder="Nombre (ej: Creatina)" 
                        value={newSuppName} 
                        onChange={(e) => setNewSuppName(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 h-9 text-xs"
                    />
                    <Input 
                        placeholder="Dosis" 
                        value={newSuppDosage} 
                        onChange={(e) => setNewSuppDosage(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 h-9 text-xs"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={newSuppTiming} onValueChange={(v: any) => setNewSuppTiming(v)}>
                        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-400 h-9 text-xs">
                            <SelectValue placeholder="Timing" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            {timingLabels.map(t => (
                                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={addSupplement} disabled={!newSuppName} className="bg-zinc-800 hover:bg-zinc-700 h-9 w-12">
                        <Plus className="h-4 w-4" />
                    </Button>
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
        {loading ? "Guardando..." : "GUARDAR PROTOCOLO"}
      </Button>
    </div>
  );
}