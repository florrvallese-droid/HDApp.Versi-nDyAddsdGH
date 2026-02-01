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
      // DEDUPLICACIÓN AGRESIVA: 
      // 1. Normalizamos nombres (quitamos símbolos de grado, extra espacios, minúsculas)
      // 2. Si hay duplicados, preferimos el que tenga user_id (creado por el usuario)
      const map = new Map<string, Exercise>();
      
      data?.forEach(ex => {
        const normalized = ex.name.toLowerCase()
          .replace(/[°º]/g, '') // Quita símbolos de grado
          .replace(/\s+/g, ' ') // Colapsa espacios
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
        toast.error("Este ejercicio ya existe en la lista.");
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
        toast.success(`Ejercicio "${data.name}" creado`);
      }
    } catch (error: any) {
      toast.error("Error creando ejercicio: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      toast.success("Ejercicio eliminado");
      setExercises(prev => prev.filter(ex => ex.id !== id));
    } catch (err: any) {
      toast.error("Error al eliminar: " + err.message);
    }
  };

  const sortedExercises = React.useMemo(() => {
    if (!targetMuscleGroup) return exercises;
    return [...exercises].sort((a, b) => {
      const aMatches = a.muscle_group?.toLowerCase().includes(targetMuscleGroup.toLowerCase());
      const bMatches = b.muscle_group?.toLowerCase().includes(targetMuscleGroup.toLowerCase());
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0; 
    });
  }, [exercises, targetMuscleGroup]);

  const recommendedExercises = targetMuscleGroup 
    ? sortedExercises.filter(e => e.muscle_group?.toLowerCase().includes(targetMuscleGroup.toLowerCase()))
    : [];
  
  const otherExercises = targetMuscleGroup
    ? sortedExercises.filter(e => !recommendedExercises.includes(e))
    : sortedExercises;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white h-12"
        >
          {value ? (
            <span className="font-medium truncate">{value}</span>
          ) : (
            <span className="text-zinc-500">Buscar o crear ejercicio...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[85vw] max-w-[400px] p-0 bg-zinc-950 border-zinc-800 text-white" align="start">
        <Command className="bg-zinc-950 text-white" shouldFilter={true}>
          <CommandInput 
            placeholder="Escribe para buscar..." 
            className="h-11 border-b border-zinc-800"
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[50vh] custom-scrollbar">
            <CommandEmpty className="py-2 px-2">
              {searchTerm && (
                <div className="flex flex-col items-center gap-2 p-2">
                  <p className="text-sm text-zinc-400 text-center">No encontrado.</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Crear "{searchTerm}"
                  </Button>
                </div>
              )}
            </CommandEmpty>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              </div>
            ) : (
              <>
                {recommendedExercises.length > 0 && (
                  <CommandGroup heading={`Sugeridos para ${targetMuscleGroup}`}>
                    {recommendedExercises.map((exercise) => (
                      <CommandItem
                        key={exercise.id}
                        value={exercise.name}
                        onSelect={() => { onSelect(exercise.name); setOpen(false); }}
                        className="data-[selected=true]:bg-zinc-800 cursor-pointer text-zinc-300 data-[selected=true]:text-white flex justify-between group"
                      >
                        <div className="flex items-center">
                          <Check className={cn("mr-2 h-4 w-4", value === exercise.name ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                            <span className="font-medium flex items-center gap-1">{exercise.name} <Star className="w-3 h-3 text-yellow-500 fill-current" /></span>
                            <span className="text-[10px] text-zinc-500 uppercase">{exercise.muscle_group}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {recommendedExercises.length > 0 && <CommandSeparator className="bg-zinc-800" />}
                <CommandGroup heading="Todos los Ejercicios">
                  {otherExercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      value={exercise.name}
                      onSelect={() => { onSelect(exercise.name); setOpen(false); }}
                      className="data-[selected=true]:bg-zinc-800 cursor-pointer text-zinc-300 data-[selected=true]:text-white flex justify-between"
                    >
                      <div className="flex items-center">
                        <Check className={cn("mr-2 h-4 w-4", value === exercise.name ? "opacity-100" : "opacity-0")} />
                        <span className="font-medium">{exercise.name}</span>
                      </div>
                      {exercise.user_id && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-500" onClick={(e) => handleDelete(exercise.id, exercise.name, e)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
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