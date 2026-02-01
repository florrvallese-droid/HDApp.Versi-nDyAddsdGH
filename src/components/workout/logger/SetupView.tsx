import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";

interface SetupViewProps {
  muscleGroup: string;
  setMuscleGroup: (val: string) => void;
  onStart: () => void;
  onCancel: () => void;
}

export function SetupView({ muscleGroup, setMuscleGroup, onStart, onCancel }: SetupViewProps) {
  return (
    <div className="p-4 max-w-md mx-auto min-h-screen bg-black text-white space-y-6">
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-500">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter">
            Fase 2: Registro
          </h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono">SNC STATUS</div>
      </div>
      <p className="text-red-600 font-bold text-xs tracking-widest uppercase">
        Solo series efectivas al fallo.
      </p>
      <div className="h-[1px] bg-zinc-900 w-full" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-red-500 font-bold text-xs uppercase">Fecha de Sesión</Label>
          <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-3 text-sm font-bold text-zinc-300">
            {new Date().toLocaleDateString()}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-red-500 font-bold text-xs uppercase">Grupo Muscular</Label>
          <Input 
            placeholder="EJ: PECTORAL..." 
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 font-bold uppercase"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-8 space-y-3">
        <Button 
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-wide border border-red-500/20"
          onClick={onStart}
        >
          Iniciar Registro
        </Button>
      </div>
    </div>
  );
}