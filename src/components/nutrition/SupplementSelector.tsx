import * as React from "react";
import { Check, ChevronsUpDown, Plus, Pill, Loader2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

interface Supplement {
  id: string;
  name: string;
  category: string | null;
}

interface SupplementSelectorProps {
  onSelect: (name: string) => void;
  value?: string;
}

export function SupplementSelector({ onSelect, value }: SupplementSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [supplements, setSupplements] = React.useState<Supplement[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supplements")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching supplements:", error);
    } else {
      setSupplements(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!searchTerm) return;
    setCreating(true);

    try {
      // Capitalize
      const formattedName = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);

      if (supplements.some(s => s.name.toLowerCase() === formattedName.toLowerCase())) {
        toast.error("Este suplemento ya existe");
        setCreating(false);
        return;
      }

      const { data, error } = await supabase
        .from("supplements")
        .insert({
          name: formattedName,
          category: 'user_added'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSupplements((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        onSelect(data.name);
        setOpen(false);
        setSearchTerm("");
        toast.success(`Agregado: ${data.name}`);
      }
    } catch (error: any) {
      toast.error("Error creando suplemento: " + error.message);
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
          className="w-full justify-between bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white h-8 text-xs"
        >
          {value ? (
            <span className="font-medium truncate">{value}</span>
          ) : (
            <span className="text-zinc-500">Buscar suplemento...</span>
          )}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-zinc-950 border-zinc-800 text-white" align="start">
        <Command className="bg-zinc-950 text-white" shouldFilter={true}>
          <CommandInput 
            placeholder="Escribe para buscar..." 
            className="h-9 border-b border-zinc-800 text-xs"
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[200px] custom-scrollbar">
            <CommandEmpty className="py-2 px-2">
              {searchTerm && (
                <div className="flex flex-col items-center gap-2 p-1">
                  <p className="text-[10px] text-zinc-400">No encontrado.</p>
                  <Button 
                    size="sm" 
                    className="w-full h-7 text-xs bg-zinc-800 hover:bg-zinc-700 text-white"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3 w-3 mr-1" />
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
              <CommandGroup>
                {supplements.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item.name);
                      setOpen(false);
                    }}
                    className="data-[selected=true]:bg-zinc-800 cursor-pointer text-zinc-300 data-[selected=true]:text-white text-xs py-1.5"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        value === item.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.category === 'health' && <span className="text-[8px] text-green-500 uppercase flex items-center gap-0.5"><Leaf className="h-2 w-2"/> Salud</span>}
                        {item.category === 'performance' && <span className="text-[8px] text-red-500 uppercase flex items-center gap-0.5"><Pill className="h-2 w-2"/> Rendimiento</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}