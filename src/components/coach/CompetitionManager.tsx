import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Calendar, Plus, Trash2, MapPin, Loader2, Save, Flag, ChevronRight, ClipboardList, Target, Award, Star } from "lucide-react";
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

  // Peak Week Editor State
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
  const [carbLoad, setCarbLoad] = useState("");
  const [waterDepletion, setWaterDepletion] = useState("");
  const [sodiumProtocol, setSodiumProtocol] = useState("");
  const [finalAdjustment, setFinalAdjustment] = useState("");

  // Results Editor State
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [rank, setRank] = useState("");
  const [conditionScore, setConditionScore] = useState(5);
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [feedback, setFeedback] = useState("");

  // Form State para nueva competencia
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

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
            status: 'scheduled'
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

  const openProtocolEditor = (comp: Competition) => {
    setEditingProtocolId(comp.id);
    setCarbLoad(comp.peak_week_protocol?.carb_load || "");
    setWaterDepletion(comp.peak_week_protocol?.water_depletion || "");
    setSodiumProtocol(comp.peak_week_protocol?.sodium_protocol || "");
    setFinalAdjustment(comp.peak_week_protocol?.final_adjustment || "");
  };

  const saveProtocol = async () => {
    if (!editingProtocolId) return;
    setSaving(true);
    try {
        const protocol = { carb_load: carbLoad, water_depletion: waterDepletion, sodium_protocol: sodiumProtocol, final_adjustment: finalAdjustment };
        const { error } = await supabase.from('competitions').update({ peak_week_protocol: protocol }).eq('id', editingProtocolId);
        if (error) throw error;
        
        // Registrar en historial para auditoría
        const { data: { user: coach } } = await supabase.auth.getUser();
        await supabase.from('protocol_history').insert({
            athlete_id: athleteId,
            coach_id: coach?.id,
            type: 'peak_week',
            data: protocol
        });

        toast.success("Estrategia de Peak Week guardada");
        setEditingProtocolId(null);
        fetchCompetitions();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const openResultEditor = (comp: Competition) => {
    setEditingResultId(comp.id);
    setRank(comp.results?.rank || "");
    setConditionScore(comp.results?.condition_score || 5);
    setStrengths(comp.results?.strengths || "");
    setWeaknesses(comp.results?.weaknesses || "");
    setFeedback(comp.results?.coach_feedback || "");
  };

  const saveResults = async () => {
    if (!editingResultId) return;
    setSaving(true);
    try {
        const results = { rank, condition_score: conditionScore, strengths, weaknesses, coach_feedback: feedback };
        const { error } = await supabase.from('competitions').update({ results, status: 'completed' }).eq('id', editingResultId);
        if (error) throw error;
        toast.success("Resultados y devolución guardados");
        setEditingResultId(null);
        fetchCompetitions();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const resetForm = () => {
    setName(""); setDate(""); setCategory(""); setLocation("");
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
        <Card className="bg-zinc-950 border-zinc-800 animate-in slide-in-from-top-2">
            <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Nombre del Torneo</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Arnold Classic" className="bg-zinc-900 border-zinc-800 h-11" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Fecha</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-zinc-900 border-zinc-800 h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-500">Categoría</Label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Classic..." className="bg-zinc-900 border-zinc-800 h-11" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1 text-zinc-500 font-bold uppercase text-xs" onClick={() => setIsAdding(false)}>Cancelar</Button>
                    <Button className="flex-[2] bg-yellow-600 hover:bg-yellow-700 font-black uppercase italic" onClick={handleAdd} disabled={saving}>Agendar Fecha</Button>
                </div>
            </CardContent>
        </Card>
      )}

      {competitions.length === 0 && !isAdding ? (
          <div className="text-center py-16 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl">
             <Trophy className="h-10 w-10 text-zinc-900 mx-auto mb-3" />
             <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-10">Define las fechas de competencia para habilitar estrategias de puesta a punto.</p>
          </div>
      ) : (
          <div className="grid gap-4">
            {competitions.map(comp => {
                const eventDate = new Date(comp.date);
                const daysLeft = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isPast = daysLeft < 0;

                return (
                    <Card key={comp.id} className={cn("bg-zinc-950 border-zinc-900 overflow-hidden", isPast && "opacity-70 grayscale-[0.5]")}>
                        <CardContent className="p-0">
                            <div className="bg-zinc-900/50 p-4 border-b border-zinc-900 flex justify-between items-start">
                                <div>
                                    <h4 className="font-black uppercase italic text-white leading-tight">{comp.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={cn("text-[9px] h-4 font-black uppercase", daysLeft > 0 ? "bg-red-600" : "bg-zinc-700")}>
                                            {daysLeft > 0 ? `${daysLeft} DÍAS` : 'SHOW FINALIZADO'}
                                        </Badge>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{comp.category}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteComp(comp.id)} className="text-zinc-800 hover:text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            
                            {/* ACTIONS FOR COMPETITION */}
                            <div className="p-4 grid grid-cols-2 gap-2">
                                <Button 
                                    variant="outline" 
                                    className="border-zinc-800 bg-black/40 text-yellow-500 hover:bg-yellow-950/20 text-[9px] font-black uppercase tracking-widest h-10"
                                    onClick={() => openProtocolEditor(comp)}
                                >
                                    <ClipboardList className="h-3.5 w-3.5 mr-2" /> Estrategia Peak Week
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="border-zinc-800 bg-black/40 text-blue-500 hover:bg-blue-950/20 text-[9px] font-black uppercase tracking-widest h-10"
                                    onClick={() => openResultEditor(comp)}
                                >
                                    <Award className="h-3.5 w-3.5 mr-2" /> Veredicto Técnico
                                </Button>
                            </div>

                            {comp.results && (
                                <div className="px-4 pb-4">
                                    <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                            <span className="text-[10px] font-black uppercase text-zinc-300">Puesto: {comp.results.rank || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase">Condición:</span>
                                            <span className="text-xs font-black text-red-500">{comp.results.condition_score}/10</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
          </div>
      )}

      {/* --- MODAL: PROTOCOLO PEAK WEEK --- */}
      <Dialog open={!!editingProtocolId} onOpenChange={(open) => !open && setEditingProtocolId(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="font-black uppercase italic text-xl flex items-center gap-2">
                    <Flag className="h-5 w-5 text-red-600" /> Peak Week Protocol
                </DialogTitle>
                <DialogDescription className="text-zinc-500 uppercase text-[10px] font-bold">Ajustes finales de puesta a punto</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Cargas de Hidratos (Días 7-1)</Label>
                    <Textarea value={carbLoad} onChange={e => setCarbLoad(e.target.value)} placeholder="Estrategia de carga de glucógeno..." className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Protocolo de Agua y Sodio</Label>
                    <Textarea value={waterDepletion} onChange={e => setWaterDepletion(e.target.value)} placeholder="Manipulación de líquidos y electrolitos..." className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Ajuste Final (Día del Show)</Label>
                    <Textarea value={finalAdjustment} onChange={e => setFinalAdjustment(e.target.value)} placeholder="Comidas pre-tarima, bombeo, etc..." className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={saveProtocol} disabled={saving} className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase italic h-12 shadow-lg shadow-red-900/20">
                   {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                   Guardar Estrategia
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: REGISTRO DE RESULTADOS --- */}
      <Dialog open={!!editingResultId} onOpenChange={(open) => !open && setEditingResultId(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="font-black uppercase italic text-xl flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" /> Resultados del Show
                </DialogTitle>
                <DialogDescription className="text-zinc-500 uppercase text-[10px] font-bold">Auditoría técnica post-competencia</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-zinc-400">Puesto Final</Label>
                        <Input value={rank} onChange={e => setRank(e.target.value)} placeholder="Ej: 1° Medalla de Oro" className="bg-zinc-900 border-zinc-800 h-11" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <Label className="text-xs font-black uppercase text-zinc-400">Condición</Label>
                            <span className="text-xs font-black text-red-500">{conditionScore}/10</span>
                        </div>
                        <input type="range" min="1" max="10" step="1" value={conditionScore} onChange={e => setConditionScore(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 accent-red-600 rounded-lg cursor-pointer" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Puntos Fuertes (Highlights)</Label>
                    <Textarea value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Qué destacamos de esta versión..." className="bg-zinc-900 border-zinc-800 min-h-[60px]" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Puntos a Mejorar</Label>
                    <Textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} placeholder="Qué faltó para el siguiente nivel..." className="bg-zinc-900 border-zinc-800 min-h-[60px]" />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-zinc-400">Devolución Final del Preparador</Label>
                    <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Balance general de la preparación..." className="bg-zinc-900 border-zinc-800 min-h-[80px]" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={saveResults} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase italic h-12">
                   {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                   Cerrar y Guardar Resultados
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}