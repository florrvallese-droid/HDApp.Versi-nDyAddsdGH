import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { DietVariant } from "@/types";
import { cn } from "@/lib/utils";

interface DietStrategyProps {
  strategyType: 'single' | 'cycling';
  setStrategyType: (val: 'single' | 'cycling') => void;
  variants: DietVariant[];
  setVariants: (variants: DietVariant[]) => void;
}

export function DietStrategy({
  strategyType,
  setStrategyType,
  variants,
  setVariants
}: DietStrategyProps) {

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

  const visibleVariantsList = strategyType === 'single' 
    ? [variants[0] || { id: 'temp', name: 'Dieta Única', calories: 0, macros: {p:0,c:0,f:0} }] 
    : variants;

  return (
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
  );
}