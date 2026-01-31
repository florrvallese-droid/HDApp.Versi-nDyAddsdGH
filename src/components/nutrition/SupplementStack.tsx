import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import { Supplement } from "@/types";
import { SupplementSelector } from "./SupplementSelector";

interface SupplementStackProps {
  supplements: Supplement[];
  setSupplements: (supplements: Supplement[]) => void;
  visibleTimings: string[];
  setVisibleTimings: (timings: string[]) => void;
}

const timingLabels: { key: Supplement['timing'], label: string }[] = [
  { key: 'fasted', label: 'Ayunas' },
  { key: 'pre', label: 'Pre Entreno' },
  { key: 'intra', label: 'Intra Entreno' },
  { key: 'post', label: 'Post Entreno' },
  { key: 'night', label: 'Noche' },
  { key: 'meal', label: 'Con Comidas' },
];

export function SupplementStack({
  supplements,
  setSupplements,
  visibleTimings,
  setVisibleTimings
}: SupplementStackProps) {
  
  // Local state for inputs
  const [suppInputs, setSuppInputs] = useState<Record<string, { name: string; dosage: string }>>({});

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-yellow-500 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest">Timing de Suplementación</span>
      </div>

      <div className="grid gap-4">
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
                  <SupplementSelector 
                    value={inputState.name}
                    onSelect={(val) => handleSuppInputChange(timingKey, 'name', val)}
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
              <SelectTrigger className="w-full h-12 border border-dashed border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all flex flex-col items-center justify-center gap-2">
                <span className="text-yellow-500 font-black uppercase tracking-widest text-xs">
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
  );
}