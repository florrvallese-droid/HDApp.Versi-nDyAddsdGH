import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Calendar, Plus, Trash2, MapPin, Loader2, Save, Flag, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Competition } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CompetitionManager({ athleteId }: { athleteId: string }) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCompetitions();
  }, [athleteId]);

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: true });
    
    if (data) setCompetitions(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name || !date) return;
    setSaving(true);
    try {
        const { data: { user: coach } } = await supabase.auth.getUser();
        const { error } = await supabase.from('competitions').insert({
            athlete_id: athleteId,
            coach_id: coach?.id,
            name,
            date,
            category,
            location,
            notes
        });
        if (error) throw error;
        toast.success("Torneo agendado");
        setIsAdding(false);
        resetForm();
        fetchCompetitions();
    } catch (err: any) {
        toast.error(err.message);
    } finally {
        setSaving(false);
    }
  };

  const resetForm = () => {
    setName(""); setDate(""); setCategory(""); setLocation(""); setNotes("");
  };

  const deleteComp = async (id: string) => {
    const { error } = await supabase.from('competitions').delete().eq('id', id);
    if (!error) fetchCompetitions();
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" /> Calendario de Tarima
        </h3>
        <Button size="sm" onClick={() => setIsAdding(true)} className="bg-zinc-900 border border-zinc-800 text-yellow-500 font-bold uppercase text-[10px]">
            <Plus className="h-3 w-3 mr-1" /> Nuevo Torneo
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Nombre del Torneo / Open</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Arnold Classic Brazil" className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Fecha del Evento</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Categoría</Label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Classic Physique" className="bg-zinc-900 border-zinc-800" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Ubicación / Ciudad</Label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 text-zinc-500" onClick={() => setIsAdding(false)}>Cancelar</Button>
                    <Button className="flex-[2] bg-yellow-600 hover:bg-yellow-700 font-bold" onClick={handleAdd} disabled={saving}>Confirmar Fecha</Button>
                </div>
            </CardContent>
        </Card>
      )}

      {competitions.length === 0 && !isAdding ? (
          <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl">
             <Trophy className="h-10 w-10 text-zinc-900 mx-auto mb-3" />
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Sin torneos programados</p>
          </div>
      ) : (
          <div className="grid gap-4">
            {competitions.map(comp => {
                const daysLeft = Math.ceil((new Date(comp.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                    <Card key={comp.id} className="bg-zinc-950 border-zinc-900 overflow-hidden group">
                        <CardContent className="p-0">
                            <div className="bg-zinc-900/50 p-4 border-b border-zinc-900 flex justify-between items-start">
                                <div>
                                    <h4 className="font-black uppercase italic text-white leading-tight">{comp.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={cn("text-[9px] h-4", daysLeft > 0 ? "bg-red-600" : "bg-zinc-700")}>
                                            {daysLeft > 0 ? `${daysLeft} DÍAS PARA EL SHOW` : 'FINALIZADO'}
                                        </Badge>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{comp.category}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteComp(comp.id)} className="text-zinc-800 hover:text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="p-4 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase font-bold">
                                    <MapPin className="h-3.5 w-3.5 text-zinc-600" /> {comp.location || 'S.D'}
                                    <span className="mx-2 opacity-30">|</span>
                                    <Calendar className="h-3.5 w-3.5 text-zinc-600" /> {format(new Date(comp.date), "dd MMM yyyy", { locale: es })}
                                </div>
                                
                                <Button variant="outline" className="w-full border-zinc-800 bg-black/40 text-yellow-500 hover:bg-yellow-950/20 text-[10px] font-black uppercase tracking-widest h-10">
                                    <Flag className="h-3.5 w-3.5 mr-2" /> Protocolo Peak Week
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
          </div>
      )}

    </div>
  );
}