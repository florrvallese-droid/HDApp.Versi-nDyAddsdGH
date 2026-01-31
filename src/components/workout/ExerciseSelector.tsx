import * as React from "react";
import { Check, ChevronsUpDown, Plus, Dumbbell, Loader2, Star } from "lucide-react";
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
      toast.error("Error cargando ejercicios");
    } else {
      // Client-side deduplication just in case
      const uniqueExercises = data ? Array.from(new Map(data.map(item => [item.name, item])).values()) : [];
      setExercises(uniqueExercises);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!searchTerm) return;
    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      // Capitalize first letter
      const formattedName = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);

      // Check if it already exists locally to avoid DB duplicate error
      if (exercises.some(e => e.name.toLowerCase() === formattedName.toLowerCase())) {
        toast.error("Este ejercicio ya existe");
        setCreating(false);
        return;
      }

      const { data, error } = await supabase
        .from("exercises")
        .insert({
          name: formattedName,
          user_id: user.id,
          muscle_group: targetMuscleGroup || null // Auto-tag with current session muscle group
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setExercises((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        onSelect(data.name);
        setOpen(false);
        setSearchTerm(""); // Clear search
        toast.success(`Ejercicio "${data.name}" creado`);
      }
    } catch (error: any) {
      toast.error("Error creando ejercicio: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  // Sort exercises based on targetMuscleGroup match
  const sortedExercises = React.useMemo(() => {
    if (!targetMuscleGroup) return exercises;

    return [...exercises].sort((a, b) => {
      // Check if exercise muscle group includes or matches the target (case insensitive)
      // Note: This is a loose match. Ideally we'd have normalized tags.
      const aMatches = a.muscle_group && targetMuscleGroup.toLowerCase().includes(a.muscle_group.toLowerCase()) || 
                       (a.muscle_group && a.muscle_group.toLowerCase() === targetMuscleGroup.toLowerCase());
      
      const bMatches = b.muscle_group && targetMuscleGroup.toLowerCase().includes(b.muscle_group.toLowerCase()) || 
                       (b.muscle_group && b.muscle_group.toLowerCase() === targetMuscleGroup.toLowerCase());

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0; // Keep alphabetical order within groups (already sorted by fetch)
    });
  }, [exercises, targetMuscleGroup]);

  // Separate recommendations from the rest only if we have a target match
  const recommendedExercises = targetMuscleGroup 
    ? sortedExercises.filter(e => e.muscle_group && targetMuscleGroup.toLowerCase().includes(e.muscle_group.toLowerCase()))
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
      <PopoverContent className="w-[300px] p-0 bg-zinc-950 border-zinc-800 text-white" align="start">
        <Command className="bg-zinc-950 text-white" shouldFilter={true}>
          <CommandInput 
            placeholder="Escribe para buscar..." 
            className="h-11 border-b border-zinc-800"
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px] custom-scrollbar">
            <CommandEmpty className="py-2 px-2">
              {searchTerm && (
                <div className="flex flex-col items-center gap-2 p-2">
                  <p className="text-sm text-zinc-400">No encontrado.</p>
                  <Button 
                    size="sm" 
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
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
                {/* Recommended Group */}
                {recommendedExercises.length > 0 && (
                  <CommandGroup heading={`Sugeridos para ${targetMuscleGroup}`}>
                    {recommendedExercises.map((exercise) => (
                      <CommandItem
                        key={exercise.id}
                        value={exercise.name}
                        onSelect={() => {
                          onSelect(exercise.name);
                          setOpen(false);
                        }}
                        className="data-[selected=true]:bg-zinc-800 cursor-pointer text-zinc-300 data-[selected=true]:text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === exercise.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-1">
                            {exercise.name}
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase">{exercise.muscle_group}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {recommendedExercises.length > 0 && <CommandSeparator className="bg-zinc-800" />}

                {/* All Other Exercises */}
                <CommandGroup heading="Todos los Ejercicios">
                  {otherExercises.map((exercise) => (
                    <CommandItem
                      key={exercise.id}
                      value={exercise.name}
                      onSelect={() => {
                        onSelect(exercise.name);
                        setOpen(false);
                      }}
                      className="data-[selected=true]:bg-zinc-800 cursor-pointer text-zinc-300 data-[selected=true]:text-white"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === exercise.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.muscle_group && (
                          <span className="text-[10px] text-zinc-500 uppercase">{exercise.muscle_group}</span>
                        )}
                      </div>
                      {exercise.user_id && (
                        <span className="ml-auto text-[10px] bg-zinc-900 border border-zinc-700 px-1 rounded text-zinc-500">
                          Custom
                        </span>
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