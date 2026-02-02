import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/services/supabase";
import { 
    Plus, Trash2, BookOpen, Utensils, Syringe, Dumbbell, 
    Copy, Loader2, Save, Search, ChevronRight, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TemplateLibrary() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("routines");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTemplates();
    fetchRoutines();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('protocol_templates').select('*').eq('coach_id', user?.id).order('created_at', { ascending: false });
    if (data) setTemplates(data);
    setLoading(false);
  };

  const fetchRoutines = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('routines').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (data) setRoutines(data);
  };

  const deleteTemplate = async (id: string, table: 'protocol_templates' | 'routines') => {
    if (!confirm("¿Eliminar plantilla definitivamente?")) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
        toast.success("Plantilla eliminada");
        table === 'routines' ? fetchRoutines() : fetchTemplates();
    }
  };

  const filteredRoutines = routines.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProtocols = templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600" />
          <Input 
            placeholder="Buscar en mi biblioteca..." 
            className="bg-zinc-900 border-zinc-800 pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="routines" className="flex-1 font-black uppercase text-[10px] tracking-widest"><Dumbbell className="w-3 h-3 mr-2" /> Rutinas</TabsTrigger>
          <TabsTrigger value="protocols" className="flex-1 font-black uppercase text-[10px] tracking-widest"><Sparkles className="w-3 h-3 mr-2" /> Protocolos</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="space-y-4">
             <div className="grid gap-3">
                {filteredRoutines.map(r => (
                    <Card key={r.id} className="bg-zinc-950 border-zinc-900 group">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-600/10 rounded-lg"><Dumbbell className="w-5 h-5 text-blue-500" /></div>
                                <div>
                                    <h4 className="font-black uppercase italic text-sm text-white">{r.name}</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">{r.exercises?.length || 0} Ejercicios</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteTemplate(r.id, 'routines')} className="text-zinc-800 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ))}
                {filteredRoutines.length === 0 && (
                    <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-zinc-600 text-xs font-bold uppercase">No hay rutinas maestras</p>
                    </div>
                )}
             </div>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
            <div className="grid gap-3">
                {filteredProtocols.map(t => (
                    <Card key={t.id} className="bg-zinc-950 border-zinc-900">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-2 rounded-lg", t.type === 'nutrition' ? "bg-green-600/10" : "bg-red-600/10")}>
                                    {t.type === 'nutrition' ? <Utensils className="w-5 h-5 text-green-500" /> : <Syringe className="w-5 h-5 text-red-500" />}
                                </div>
                                <div>
                                    <h4 className="font-black uppercase italic text-sm text-white">{t.name}</h4>
                                    <Badge variant="outline" className="text-[8px] h-3.5 uppercase font-black border-zinc-800">{t.type}</Badge>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteTemplate(t.id, 'protocol_templates')} className="text-zinc-800 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ))}
                {filteredProtocols.length === 0 && (
                    <div className="py-10 text-center border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-zinc-600 text-xs font-bold uppercase">No hay protocolos maestros</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 bg-zinc-900/20 p-4 rounded-xl border border-zinc-900 border-dashed">
         <p className="text-[9px] text-zinc-500 uppercase font-bold text-center leading-relaxed">
            * Nota: Para crear nuevas plantillas de protocolos, arma uno en la ficha de un alumno y utiliza el botón "Guardar como Plantilla" que aparecerá próximamente.
         </p>
      </div>
    </div>
  );
}