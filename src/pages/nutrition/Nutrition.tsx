import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronLeft, Lock, Syringe, Calendar, Scale, Activity, X, ArrowUp, ArrowDown, ShieldAlert, Pill } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement, Compound } from "@/types";
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
  
  // State for inputs within each timing card
  const [suppInputs, setSuppInputs] = useState<Record<string, { name: string; dosage: string }>>({});
  const [visibleTimings, setVisibleTimings] = useState<string[]>([]);

  // Pharma State
  const [pharmaCycles, setPharmaCycles] = useState<any[]>([]);
  const [newCompName, setNewCompName] = useState("");
  const [newCompDosage, setNewCompDosage] = useState("");
  const [newCompDate, setNewCompDate] = useState("");
  const [newCompType, setNewCompType] = useState<'injectable'|'oral'|'ancillary'>('injectable');
  const [isPharmaLoading, setIsPharmaLoading] = useState(false);

  const timingLabels: { key: Supplement['timing'], label: string }[] = [
    { key: 'fasted', label: 'Ayunas' },
    { key: 'pre', label: 'Pre Entreno' },
    { key: 'intra', label: 'Intra Entreno' },
    { key: 'post', label: 'Post Entreno' },
    { key: 'night', label: 'Noche' },
    { key: 'meal', label: 'Con Comidas' },
  ];

  useEffect(() => {
    if (profile) {
      if (profile.settings?.current_weight) {
        setCurrentWeight(profile.settings.current_weight);
      }
      if (profile.settings?.nutrition) {
        const config = profile.settings.nutrition as NutritionConfig & { timing_order?: string[] };
        setPhaseGoal(config.phase_goal || "maintenance");
        setStrategyType(config.strategy_type || "single");
        
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
        
        const loadedSupps = config.supplements_stack || [];
        setSupplements(loadedSupps);

        // Load timing order preference if exists, otherwise default logic
        if (config.timing_order && config.timing_order.length > 0) {
            setVisibleTimings(config.timing_order);
        } else {
            const usedTimings = new Set(loadedSupps.map(s => s.timing));
            // Default Requested Order: Fasted, Pre, Intra, Post, Night
            const defaultOrder = ['fasted', 'pre', 'intra', 'post', 'night'];
            
            // If user has 'meal' or others not in default, append them
            const extraTimings = Array.from(usedTimings).filter(t => !defaultOrder.includes(t));
            
            setVisibleTimings([...defaultOrder, ...extraTimings]);
        }

      } else {
        setVariants([{
           id: crypto.randomUUID(),
           name: "Dieta Base",
           calories: 0,
           macros: { p: 0, c: 0, f: 0 }
        }]);
        setVisibleTimings(['fasted', 'pre', 'intra', 'post', 'night']);
      }

      fetchPharmaCycles();
    }
  }, [profile]);

  useEffect(() => {
    if (strategyType === 'single') {
        if (variants.length > 1) {
            // Keep data but UI only shows first
        } else if (variants.length === 0) {
            setVariants([{
                id: crypto.randomUUID(),
                name: "Dieta Base",
                calories: 0,
                macros: { p: 0, c: 0, f: 0 }
            }]);
        }
    }
  }, [strategyType]);

  const fetchPharmaCycles = async () => {
    if (!profile) return;
    setIsPharmaLoading(true);
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('type', 'pharmacology')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPharmaCycles(data);
    }
    setIsPharmaLoading(false);
  };

  const handleStrategyChange = (newType: 'single' | 'cycling') => {
    setStrategyType(newType);
    if (newType === 'cycling') {
        if (variants.length < 2) {
             const baseVariant = variants[0];
             const highDay: DietVariant = {
                 id: baseVariant?.id || crypto.randomUUID(),
                 name: "Día Alto (Carga)",
                 calories: baseVariant?.calories || 0,
                 macros: baseVariant?.macros || { p: 0, c: 0, f: 0 }
             };
             const lowDay: DietVariant = {
                 id: crypto.randomUUID(),
                 name: "Día Bajo (Descarga)",
                 calories: 0,
                 macros: { p: 0, c: 0, f: 0 }
             };
             setVariants([highDay, lowDay]);
        }
    }
  };

  const saveConfig = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }
    if (!profile) return;
    setLoading(true);

    let variantsToSave = [...variants];
    if (strategyType === 'single') {
        variantsToSave = [variants[0]];
        variantsToSave[0].name = "Dieta Única"; 
    }

    const newConfig: NutritionConfig & { timing_order?: string[] } = {
      phase_goal: phaseGoal,
      strategy_type: strategyType,
      diet_variants: variantsToSave,
      supplements_stack: supplements,
      timing_order: visibleTimings // Persist order
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

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field === 'name') updated[index].name = value;
    else if (field === 'calories') updated[index].calories = Number(value);
    else if (['p', 'c', 'f'].includes(field)) {
        updated[index].macros = { ...updated[index].macros, [field]: Number(value) };
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

  // --- Supplement Logic ---

  const handleSuppInputChange = (timing: string, field: 'name' | 'dosage', value: string) => {
    setSuppInputs(prev => ({
      ...prev,
      [timing]: {
        ...prev[timing],
        [field]: value
      }
    }));
  };

  const addSupplementToTiming = (timing: string) => {
    const input = suppInputs[timing];
    if (!input?.name) return;
    
    const newSupp: Supplement = {
      id: crypto.randomUUID(),
      name: input.name,
      timing: timing as Supplement['timing'],
      dosage: input.dosage || ""
    };
    
    setSupplements([...supplements, newSupp]);
    
    setSuppInputs(prev => ({
      ...prev,
      [timing]: { name: "", dosage: "" }
    }));
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
  };

  const getSupplementsByTiming = (timing: string) => {
    return supplements.filter(s => s.timing === timing);
  };

  const toggleTimingVisibility = (timingKey: string) => {
    if (visibleTimings.includes(timingKey)) {
        setVisibleTimings(visibleTimings.filter(t => t !== timingKey));
    } else {
        setVisibleTimings([...visibleTimings, timingKey]);
    }
  };

  const moveTiming = (index: number, direction: 'up' | 'down') => {
    const newTimings = [...visibleTimings];
    if (direction === 'up' && index > 0) {
      [newTimings[index], newTimings[index - 1]] = [newTimings[index - 1], newTimings[index]];
    } else if (direction === 'down' && index < newTimings.length - 1) {
      [newTimings[index], newTimings[index + 1]] = [newTimings[index + 1], newTimings[index]];
    }
    setVisibleTimings(newTimings);
  };

  const availableHiddenTimings = timingLabels.filter(t => !visibleTimings.includes(t.key));

  // --- Pharma Logic ---
  const addPharmaCompound = async (cycleId: string) => {
    if (!newCompName || !newCompDosage) {
        toast.error("Ingresa compuesto y dosis");
        return;
    }
    
    const cycle = pharmaCycles.find(c => c.id === cycleId);
    if (!cycle) return;

    const newCompound: Compound = {
        id: crypto.randomUUID(),
        name: newCompName,
        dosage: newCompDosage,
        type: newCompType
    };

    const compoundWithDate = { ...newCompound, date: newCompDate || format(new Date(), 'yyyy-MM-dd') };
    const updatedCompounds = [...(cycle.data.compounds || []), compoundWithDate];
    const updatedData = { ...cycle.data, compounds: updatedCompounds };

    const { error } = await supabase
        .from('logs')
        .update({ data: updatedData })
        .eq('id', cycleId);

    if (error) {
        toast.error("Error al actualizar ciclo");
    } else {
        toast.success("Compuesto agregado");
        setNewCompName("");
        setNewCompDosage("");
        fetchPharmaCycles();
    }
  };

  const createNewPharmaCycle = async () => {
    if (!hasProAccess) {
        setShowUpgradeModal(true);
        return;
    }
    const name = `Ciclo ${format(new Date(), 'MMM yyyy')}`;
    const { error } = await supabase.from('logs').insert({
        user_id: profile?.user_id,
        type: 'pharmacology',
        data: { name, start_date: new Date().toISOString(), compounds: [] }
    });
    if (error) toast.error("Error al crear ciclo");
    else {
        toast.success("Nuevo ciclo creado");
        fetchPharmaCycles();
    }
  };

  const removePharmaCompound = async (cycleId: string, compoundId: string) => {
      const cycle = pharmaCycles.find(c => c.id === cycleId);
      if (!cycle) return;
      const updatedCompounds = cycle.data.compounds.filter((c: any) => c.id !== compoundId);
      const updatedData = { ...cycle.data, compounds: updatedCompounds };
      const { error } = await supabase.from('logs').update({ data: updatedData }).eq('id', cycleId);
      if (error) toast.error("Error al eliminar");
      else fetchPharmaCycles();
  };
  
  const deleteCycle = async (cycleId: string) => {
      if(!confirm("¿Eliminar este ciclo completo?")) return;
      const { error } = await supabase.from('logs').delete().eq('id', cycleId);
      if (error) toast.error("Error eliminando ciclo");
      else fetchPharmaCycles();
  }

  if (profileLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;
  }

  const visibleVariantsList = strategyType === 'single' ? [variants[0] || { id: 'temp', name: 'Dieta Única', calories: 0, macros: {p:0,c:0,f:0} }] : variants;

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

        <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
                onClick={() => handleStrategyChange('single')}
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
                onClick={() => handleStrategyChange('cycling')}
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

        <div className="space-y-4">
            {visibleVariantsList.map((v, idx) => (
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
                            
                            {strategyType === 'cycling' && variants.length > 2 && (
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

      {/* TIMING DE SUPLEMENTACION - NEW DESIGN */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-yellow-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest">Timing de Suplementación</span>
        </div>

        <div className="grid gap-4">
            {/* Render Visible Timing Cards */}
            {visibleTimings.map((timingKey, idx) => {
                const timingLabel = timingLabels.find(t => t.key === timingKey)?.label || timingKey;
                const groupedSups = getSupplementsByTiming(timingKey);
                const inputState = suppInputs[timingKey] || { name: "", dosage: "" };

                return (
                    <Card key={timingKey} className="bg-zinc-950 border-zinc-800">
                        <CardContent className="p-0">
                            {/* Card Header */}
                            <div className="flex justify-between items-center p-3 border-b border-zinc-900 bg-zinc-900/50">
                                <div className="flex items-center gap-2">
                                    <span className="font-black uppercase text-xs tracking-wider text-white">
                                        {timingLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => moveTiming(idx, 'up')} disabled={idx === 0} className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-30">
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => moveTiming(idx, 'down')} disabled={idx === visibleTimings.length - 1} className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-30">
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="w-px h-3 bg-zinc-800 mx-1"></div>
                                    <button 
                                        onClick={() => toggleTimingVisibility(timingKey)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Supplements List */}
                            {groupedSups.length > 0 && (
                                <div className="divide-y divide-zinc-900">
                                    {groupedSups.map(s => (
                                        <div key={s.id} className="flex justify-between items-center px-4 py-2 hover:bg-zinc-900/30">
                                            <span className="text-sm font-medium text-zinc-300">{s.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-zinc-500 font-mono">{s.dosage}</span>
                                                <Trash2 
                                                    className="h-3.5 w-3.5 text-zinc-700 cursor-pointer hover:text-red-500" 
                                                    onClick={() => removeSupplement(s.id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Input Row */}
                            <div className="p-3 grid grid-cols-[1fr_80px_36px] gap-2 items-center bg-zinc-900/20">
                                <Input 
                                    placeholder="Suplemento" 
                                    className="h-8 text-xs bg-zinc-900 border-zinc-800 focus:border-zinc-700"
                                    value={inputState.name}
                                    onChange={(e) => handleSuppInputChange(timingKey, 'name', e.target.value)}
                                />
                                <Input 
                                    placeholder="Dosis" 
                                    className="h-8 text-xs bg-zinc-900 border-zinc-800 focus:border-zinc-700 text-center"
                                    value={inputState.dosage}
                                    onChange={(e) => handleSuppInputChange(timingKey, 'dosage', e.target.value)}
                                />
                                <Button 
                                    size="icon" 
                                    className="h-8 w-9 bg-zinc-800 hover:bg-zinc-700 text-green-500"
                                    disabled={!inputState.name}
                                    onClick={() => addSupplementToTiming(timingKey)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {/* Add Moment Placeholder */}
            {availableHiddenTimings.length > 0 && (
                <div className="relative group">
                    <Select onValueChange={(val) => toggleTimingVisibility(val)}>
                        <SelectTrigger className="w-full h-24 border-2 border-dashed border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all flex flex-col items-center justify-center gap-2">
                             <span className="text-yellow-500 font-black uppercase tracking-widest text-sm">
                                + Agregar Momento
                             </span>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            {availableHiddenTimings.map(t => (
                                <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
      </div>

      {/* PHARMACOLOGY SECTION - REDESIGNED */}
      <div className="space-y-4 pt-6 border-t border-zinc-900">
        <div className="flex items-center gap-2 mb-2">
           <h3 className="text-sm font-black uppercase tracking-tighter text-white">FARMACOLOGÍA / QUÍMICA</h3>
           <Badge variant="destructive" className="text-[9px] h-4 px-1 rounded-sm bg-red-900/50 text-red-500 hover:bg-red-900/50 border border-red-900">PRIVADO</Badge>
        </div>

        {isPharmaLoading ? (
            <Skeleton className="h-32 w-full bg-zinc-900" />
        ) : (
            <div className="space-y-4">
                {pharmaCycles.length > 0 ? (
                    <Card className="bg-zinc-950 border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.05)]">
                        <CardContent className="p-0">
                            {/* Card Header */}
                            <div className="flex justify-between items-center p-3 border-b border-zinc-900">
                                <span className="font-black uppercase text-xs tracking-wider text-white">
                                    {pharmaCycles[0].data.name || "CICLO ACTUAL"}
                                </span>
                                <button onClick={() => deleteCycle(pharmaCycles[0].id)} className="text-zinc-600 hover:text-red-500">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* List */}
                            <div className="p-4 space-y-2 min-h-[60px]">
                                {(!pharmaCycles[0].data.compounds || pharmaCycles[0].data.compounds.length === 0) ? (
                                    <p className="text-zinc-600 text-xs italic text-center py-2">Sin compuestos registrados.</p>
                                ) : (
                                    pharmaCycles[0].data.compounds.map((c: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm border-b border-zinc-900 last:border-0 pb-2 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-300 flex items-center gap-2">
                                                    {c.type === 'injectable' ? <Syringe className="h-3 w-3 text-red-500" /> : 
                                                     c.type === 'oral' ? <Pill className="h-3 w-3 text-blue-500" /> : 
                                                     <ShieldAlert className="h-3 w-3 text-yellow-500" />}
                                                    {c.name}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">{c.date ? format(new Date(c.date), 'dd/MM/yyyy') : '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-zinc-400 font-mono text-xs">{c.dosage}</span>
                                                <Trash2 className="h-3.5 w-3.5 text-zinc-700 hover:text-red-500 cursor-pointer" onClick={() => removePharmaCompound(pharmaCycles[0].id, c.id)} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Row */}
                            <div className="p-3 border-t border-zinc-900 grid grid-cols-[1.5fr_1fr_110px_60px_100px] gap-2 items-center bg-zinc-900/20">
                                <Input 
                                    placeholder="Compuesto" 
                                    className="h-9 text-xs bg-zinc-950 border-zinc-800 focus:border-red-900/50"
                                    value={newCompName}
                                    onChange={(e) => setNewCompName(e.target.value)}
                                />
                                <Input 
                                    placeholder="Dosis (ej. 500mg)" 
                                    className="h-9 text-xs bg-zinc-950 border-zinc-800 focus:border-red-900/50"
                                    value={newCompDosage}
                                    onChange={(e) => setNewCompDosage(e.target.value)}
                                />
                                <Input 
                                    type="date"
                                    className="h-9 text-xs bg-zinc-950 border-zinc-800 focus:border-red-900/50 px-2"
                                    value={newCompDate}
                                    onChange={(e) => setNewCompDate(e.target.value)}
                                />
                                <Select value={newCompType} onValueChange={(v: any) => setNewCompType(v)}>
                                    <SelectTrigger className="h-9 text-[10px] bg-zinc-950 border-zinc-800 px-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="injectable">Inj.</SelectItem>
                                        <SelectItem value="oral">Oral</SelectItem>
                                        <SelectItem value="ancillary">Anc.</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    className="h-9 bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/30 text-[10px] font-bold"
                                    onClick={() => addPharmaCompound(pharmaCycles[0].id)}
                                >
                                    + AGREGAR
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center p-6 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-xs">
                        No hay ciclos activos.
                    </div>
                )}

                <Button 
                    variant="outline"
                    className="w-full border-dashed border-zinc-800 text-red-800 hover:text-red-500 hover:bg-red-950/10 hover:border-red-900/30 uppercase font-bold text-xs h-10"
                    onClick={createNewPharmaCycle}
                >
                    + Nuevo Grupo / Fase
                </Button>
            </div>
        )}
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