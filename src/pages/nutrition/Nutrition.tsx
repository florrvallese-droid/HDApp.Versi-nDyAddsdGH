import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronLeft, Lock, Syringe, Calendar, Scale, Activity, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Macro Structure State
  const [currentDate] = useState(format(new Date(), "dd/MM/yyyy"));
  const [phaseGoal, setPhaseGoal] = useState<PhaseGoal>("maintenance");
  const [currentWeight, setCurrentWeight] = useState("");

  // Strategy State
  const [strategyType, setStrategyType] = useState<'single' | 'cycling'>('single');
  const [variants, setVariants] = useState<DietVariant[]>([]);

  // Supplement State
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppTiming, setNewSuppTiming] = useState<Supplement['timing']>("pre");
  const [newSuppDosage, setNewSuppDosage] = useState("");

  useEffect(() => {
    if (profile) {
      if (profile.settings?.current_weight) {
        setCurrentWeight(profile.settings.current_weight);
      }
      if (profile.settings?.nutrition) {
        const config = profile.settings.nutrition;
        setPhaseGoal(config.phase_goal || "maintenance");
        setStrategyType(config.strategy_type || "single");
        
        // Ensure at least one variant exists if empty
        if (!config.diet_variants || config.diet_variants.length === 0) {
           setVariants([{
             id: crypto.randomUUID(),
             name: "Dieta Base",
             calories: 0,
             macros: { p: 0, c: 0, f: 0 }
           }]);
        } else {
           setVariants(config.diet_variants);
        }
        
        setSupplements(config.supplements_stack || []);
      } else {
        // Init default if no config
        setVariants([{
           id: crypto.randomUUID(),
           name: "Dieta Base",
           calories: 0,
           macros: { p: 0, c: 0, f: 0 }
        }]);
      }
    }
  }, [profile]);

  // Ensure correct variants structure when switching strategy
  useEffect(() => {
    if (strategyType === 'single') {
        // If switching to single, strictly keep only the first variant or create one
        if (variants.length > 1) {
            // We won't delete data automatically here to be safe, but UI will only show first
        } else if (variants.length === 0) {
            setVariants([{
                id: crypto.randomUUID(),
                name: "Dieta Base",
                calories: 0,
                macros: { p: 0, c: 0, f: 0 }
            }]);
        }
    } else {
        // Switching to cycling: ensure we have at least High/Low if empty?
        // Let's leave it as is, user can add.
    }
  }, [strategyType]);

  const saveConfig = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (!profile) return;
    setLoading(true);

    // Filter variants based on strategy before saving
    let variantsToSave = [...variants];
    if (strategyType === 'single') {
        variantsToSave = [variants[0]]; // Only save the first one
        // Ensure name is appropriate
        variantsToSave[0].name = "Dieta Única"; 
    }

    const newConfig: NutritionConfig = {
      phase_goal: phaseGoal,
      strategy_type: strategyType,
      diet_variants: variantsToSave,
      supplements_stack: supplements
    };

    const newSettings = {
      ...profile.settings,
      current_weight: currentWeight,
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

  // Helper to update specific fields in variants
  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field === 'name') updated[index].name = value;
    else if (field === 'calories') updated[index].calories = Number(value);
    else if (['p', 'c', 'f'].includes(field)) {
        updated[index].macros = { ...updated[index].macros, [field]: Number(value) };
        // Auto-calc calories if they are 0 or user wants? simplified:
        // updated[index].calories = (updated[index].macros.p * 4) + (updated[index].macros.c * 4) + (updated[index].macros.f * 9);
    }
    setVariants(updated);
  };

  const addVariant = () => {
    const variant: DietVariant = {
      id: crypto.randomUUID(),
      name: "Nueva Variante",
      calories: 0,
      macros: { p: 0, c: 0, f: 0 }
    };
    setVariants([...variants, variant]);
  };

  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
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

  // Determine which variants to show
  const visibleVariants = strategyType === 'single' ? [variants[0] || { id: 'temp', name: 'Dieta Única', calories: 0, macros: {p:0,c:0,f:0} }] : variants;

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

      {/* MACRO STRUCTURE */}
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

      {/* STRATEGY SELECTOR & VARIANTS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Estrategia Nutricional</span>
        </div>

        {/* Custom Segmented Control */}
        <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
                onClick={() => setStrategyType('single')}
                className={cn(
                    "text-xs font-black uppercase tracking-wider py-2.5 rounded-md transition-all",
                    strategyType === 'single' 
                        ? "bg-green-700 text-white shadow-md" 
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                Dieta Única
            </button>
            <button
                onClick={() => setStrategyType('cycling')}
                className={cn(
                    "text-xs font-black uppercase tracking-wider py-2.5 rounded-md transition-all",
                    strategyType === 'cycling' 
                        ? "bg-green-700 text-white shadow-md" 
                        : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                Carga / Descarga
            </button>
        </div>

        {/* Editable Variants List */}
        <div className="space-y-4">
            {visibleVariants.map((v, idx) => (
                <Card key={v.id || idx} className="bg-zinc-950 border-zinc-800">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                            {strategyType === 'cycling' ? (
                                <Input 
                                    value={v.name}
                                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                    className="bg-transparent border-none h-auto p-0 text-green-500 font-bold uppercase text-sm focus-visible:ring-0 placeholder:text-green-500/50"
                                    placeholder="NOMBRE DE VARIANTE"
                                />
                            ) : (
                                <span className="text-green-500 font-bold uppercase text-sm">
                                    DIETA ÚNICA (BASE)
                                </span>
                            )}
                            
                            {strategyType === 'cycling' && (
                                <button onClick={() => removeVariant(idx)} className="text-zinc-600 hover:text-red-500">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                             <div className="space-y-1">
                                <Label className="text-[9px] text-zinc-500 uppercase font-bold">Kcal Totales</Label>
                                <Input 
                                    type="number"
                                    value={v.calories || ''}
                                    onChange={(e) => updateVariant(idx, 'calories', e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 text-center font-bold text-white"
                                    placeholder="0"
                                />
                             </div>
                             
                             <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[9px] text-zinc-500 uppercase font-bold">Proteína (g)</Label>
                                    <Input 
                                        type="number"
                                        value={v.macros.p || ''}
                                        onChange={(e) => updateVariant(idx, 'p', e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 text-center text-zinc-300"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] text-zinc-500 uppercase font-bold">Carbos (g)</Label>
                                    <Input 
                                        type="number"
                                        value={v.macros.c || ''}
                                        onChange={(e) => updateVariant(idx, 'c', e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 text-center text-zinc-300"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] text-zinc-500 uppercase font-bold">Grasas (g)</Label>
                                    <Input 
                                        type="number"
                                        value={v.macros.f || ''}
                                        onChange={(e) => updateVariant(idx, 'f', e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 text-center text-zinc-300"
                                        placeholder="0"
                                    />
                                </div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {strategyType === 'cycling' && (
                <Button 
                    variant="outline" 
                    className="w-full border-dashed border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 uppercase font-bold text-xs"
                    onClick={addVariant}
                >
                    + Agregar Variante
                </Button>
            )}
        </div>
      </div>

      {/* SUPPLEMENT STACK */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Stack de Suplementos</span>
        </div>

        <div className="grid gap-3">
            {timingLabels.map((time) => {
                const groupedSups = getSupplementsByTiming(time.key);
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