import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, Syringe } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// New Components
import { MacroStructure } from "@/components/nutrition/MacroStructure";
import { DietStrategy } from "@/components/nutrition/DietStrategy";
import { SupplementStack } from "@/components/nutrition/SupplementStack";

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
  const [visibleTimings, setVisibleTimings] = useState<string[]>([]);

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
      timing_order: visibleTimings
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

      <MacroStructure 
        currentDate={currentDate}
        weight={currentWeight}
        setWeight={setCurrentWeight}
        phaseGoal={phaseGoal}
        setPhaseGoal={setPhaseGoal}
      />

      <DietStrategy 
        strategyType={strategyType}
        setStrategyType={setStrategyType}
        variants={variants}
        setVariants={setVariants}
      />

      <SupplementStack 
        supplements={supplements}
        setSupplements={setSupplements}
        visibleTimings={visibleTimings}
        setVisibleTimings={setVisibleTimings}
      />

      {/* PHARMACOLOGY LINK */}
      <div className="space-y-4 pt-6 border-t border-zinc-900">
         <Button 
            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-wide flex items-center justify-between px-4 group"
            onClick={() => navigate('/pharmacology')}
         >
            <span className="flex items-center gap-2">
               <Syringe className="h-4 w-4 text-red-600 group-hover:text-red-500 transition-colors" />
               Farmacología (Privado)
            </span>
            <ChevronLeft className="h-4 w-4 rotate-180" />
         </Button>
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