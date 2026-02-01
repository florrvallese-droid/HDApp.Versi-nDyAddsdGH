import * as React from "react";
import { Check, ChevronsUpDown, Plus, Loader2, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string | null;
  user_id: string | null;
}

interface ExerciseSelectorProps {
  onSelect: (exerciseName: string) => void;
  value?: string;
  targetMuscleGroup?: string;
}

export function ExerciseSelector({ onSelect, value, targetMuscleGroup }: ExerciseSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching exercises:", error);
    } else {
      const map = new Map<string, Exercise>();
      
      data?.forEach(ex => {
        const normalized = ex.name.toLowerCase()
          .replace(/[°º]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
          
        const existing = map.get(normalized);
        if (!existing || (ex.user_id && !existing.user_id)) {
          map.set(normalized, ex);
        }
      });

      setExercises(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!searchTerm) return;
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const normalizedSearch = searchTerm.trim().toLowerCase().replace(/[°º]/g, '');
      
      if (exercises.some(e => e.name.toLowerCase().replace(/[°º]/g, '').trim() === normalizedSearch)) {
        toast.error("Este ejercicio ya existe");
        setCreating(false);
        return;
      }

      const formattedName = searchTerm.trim().charAt(0).toUpperCase() + searchTerm.trim().slice(1);

      const { data, error } = await supabase
        .from("exercises")
        .insert({
          name: formattedName,
          user_id: user.id,
          muscle_group: targetMuscleGroup || null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setExercises((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        onSelect(data.name);
        setOpen(false);
        setSearchTerm("");
        toast.success(`Ejercicio creado`);
      }
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-900 border-zinc-800 text-white h-12 px-4"
        >
          <span className="truncate">{value || "Seleccionar ejercicio..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 bg-zinc-950 border-zinc-800 text-white w-[calc(100vw-2rem)] md:w-[400px] z-[200]" 
        align="start"
        sideOffset={5}
      >
        <Command className="bg-zinc-950">
          <CommandInput 
            placeholder="Buscar..." 
            className="h-12 border-b border-zinc-800"
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="p-4 flex flex-col items-center gap-2">
              <span className="text-zinc-500 text-sm">No encontrado.</span>
              {searchTerm && (
                <Button 
                    size="sm" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleCreate}
                    disabled={creating}
                >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Crear "{searchTerm}"
                </Button>
              )}
            </CommandEmpty>
            
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>
            ) : (
              <>
                <CommandGroup heading="Ejercicios">
                  {exercises.map((ex) => (
                    <CommandItem
                      key={ex.id}
                      value={ex.name}
                      onSelect={() => { onSelect(ex.name); setOpen(false); }}
                      className="py-3 px-4 flex justify-between data-[selected=true]:bg-zinc-900 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Check className={cn("mr-2 h-4 w-4", value === ex.name ? "opacity-100" : "opacity-0")} />
                        <span>{ex.name}</span>
                      </div>
                      {ex.muscle_group && <span className="text-[10px] uppercase text-zinc-600 font-bold">{ex.muscle_group}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}