import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const INTENSITY_TECHNIQUES = [
  { id: "rest_pause", label: "Rest Pause", short: "RP", color: "text-blue-400 border-blue-400" },
  { id: "drop_set", label: "Drop Set", short: "DROP", color: "text-red-400 border-red-400" },
  { id: "forced_reps", label: "Forzadas", short: "FORCE", color: "text-orange-400 border-orange-400" },
  { id: "negatives", label: "Negativas", short: "NEG", color: "text-purple-400 border-purple-400" },
  { id: "static", label: "Isometría", short: "ISO", color: "text-yellow-400 border-yellow-400" },
  { id: "partial", label: "Parciales", short: "PART", color: "text-zinc-400 border-zinc-400" },
];

export const getTechLabel = (id: string) => INTENSITY_TECHNIQUES.find(t => t.id === id)?.short || id;
export const getTechColor = (id: string) => INTENSITY_TECHNIQUES.find(t => t.id === id)?.color || "text-zinc-400";

interface IntensitySelectorProps {
  selectedTechniques: string[];
  onChange: (techniques: string[]) => void;
}

export function IntensitySelector({ selectedTechniques, onChange }: IntensitySelectorProps) {
  const toggleTechnique = (id: string) => {
    if (selectedTechniques.includes(id)) {
      onChange(selectedTechniques.filter(t => t !== id));
    } else {
      onChange([...selectedTechniques, id]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "h-9 w-9 border-zinc-800 bg-zinc-900 hover:bg-zinc-800",
            selectedTechniques.length > 0 ? "border-yellow-500/50 text-yellow-500" : "text-zinc-500"
          )}
        >
          <Zap className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-zinc-950 border-zinc-800 text-white" align="end">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Técnicas de Intensidad</h4>
          <div className="grid grid-cols-2 gap-2">
            {INTENSITY_TECHNIQUES.map(tech => {
              const isSelected = selectedTechniques.includes(tech.id);
              return (
                <button
                  key={tech.id}
                  onClick={() => toggleTechnique(tech.id)}
                  className={cn(
                    "text-[10px] font-bold border rounded px-2 py-2 transition-all uppercase",
                    isSelected 
                      ? `bg-zinc-900 ${tech.color}` 
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  {tech.label}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}