import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { 
    Utensils, Pill, Dumbbell, Save, Plus, Trash2, 
    Loader2, Zap, Syringe, ClipboardList, Target, ShieldAlert
} from "lucide-react";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement, Routine, Compound } from "@/types";
import { DietStrategy } from "@/components/nutrition/DietStrategy";
import { SupplementStack } from "@/components/nutrition/SupplementStack";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { cn } from "@/lib/utils";

interface CoachProtocolManagerProps {
  athleteId: string;
  athleteName: string;
}

const TIMING_ORDER = ['fasted', 'pre', 'intra', 'post', 'meal', 'night'];

export function CoachProtocolManager({ athleteId, athleteName }: CoachProtocolManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Nutrición & Supl
  const [phaseGoal, setPhaseGoal] = useState<PhaseGoal>("maintenance");
  const [strategyType, setStrategyType] = useState<'single' | 'cycling'>('single');
  const [variants, setVariants] = useState<DietVariant[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [visibleTimings, setVisibleTimings] = useState<string[]>(['fasted', 'pre', 'intra', 'post', 'night']);

  // Farmacología
  const [showPharmaDisclaimer, setShowPharmaDisclaimer] = useState(false);
  const [pharmaAccepted, setPharmaAccepted] = useState(false);
  const [pharmaCompounds, setPharmaCompounds] = useState<Compound[]>([]);
  const [pharmaNotes, setPharmaNotes] = useState("");
  const [newCompName, setNewCompName] = useState("");
  const [newCompDosage, setNewCompDosage] = useState("");
  const [newCompType, setNewCompType] = useState<'injectable' | 'oral' | 'ancillary'>('injectable');
  const [newCompTiming, setNewCompTiming] = useState<Compound['timing']>('fasted');

  // Rutinas
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineExercises, setNewRoutineExercises] = useState<{ name: string; sets_goal: number }[]>([]);

  useEffect(() => {
    fetchAthleteSettings();
    fetchAthleteRoutines();
  }, [athleteId]);

  const fetchAthleteSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
    if (data?.settings) {
      const s = data.settings;
      if (s.nutrition) {
        const config = s.nutrition as NutritionConfig & { timing_order?: string[] };
        setPhaseGoal(config.phase_goal);
        setStrategyType(config.strategy_type || "single");
        setVariants(config.diet_variants || []);
        setSupplements(config.supplements_stack || []);
        if (config.timing_order) setVisibleTimings(config.timing_order);
      }
      
      if (s.pharmacology_protocol) {
          setPharmaCompounds(s.pharmacology_protocol.compounds || []);
          setPharmaNotes(s.pharmacology_protocol.notes || "");
      }
    } else {
        setVariants([{ id: crypto.randomUUID(), name: "Dieta Base", calories: 0, macros: { p: 0, c: 0, f: 0 } }]);
    }
    setLoading(false);
  };

  const fetchAthleteRoutines = async () => {
    const { data } = await supabase.from('routines').select('*').eq('user_id', athleteId);
    if (data) setRoutines(data);
  };

  const saveBiologicalProtocol = async () => {
    setSaving(true);
    try {
      const { data: current } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
      
      const nutritionConfig: NutritionConfig & { timing_order?: string[] } = {
        phase_goal: phaseGoal,
        strategy_type: strategyType,
        diet_variants: variants,
        supplements_stack: supplements,
        timing_order: visibleTimings
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
            settings: { ...current?.settings, nutrition: nutritionConfig },
            updated_at: new Date().toISOString()
        })
        .eq('user_id', athleteId);

      if (error) throw error;

      await notifyAthlete("Protocolo Biológico Actualizado", "Tu coach ha realizado ajustes en tu nutrición y stack de suplementos.");
      toast.success("Protocolo biológico guardado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePharmaProtocol = async () => {
    setSaving(true);
    try {
      const { data: current } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
      
      const pharmaProtocol = {
        compounds: pharmaCompounds,
        notes: pharmaNotes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update({ 
            settings: { ...current?.settings, pharmacology_protocol: pharmaProtocol },
            updated_at: new Date().toISOString()
        })
        .eq('user_id', athleteId);

      if (error) throw error;

      await notifyAthlete("Protocolo Químico Actualizado", "Tu coach ha actualizado tu estrategia de farmacología en la bóveda privada.");
      toast.success("Estrategia química guardada");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const notifyAthlete = async (title: string, message: string) => {
      await supabase.from('notifications').insert({
        user_id: athleteId,
        title,
        message,
        type: 'protocol_update'
      });
  };

  const addCompound = () => {
    if (!newCompName || !newCompDosage) return;
    const newComp: Compound = {
        id: crypto.randomUUID(),
        name: newCompName,
        dosage: newCompDosage,
        type: newCompType,
        timing: newCompTiming
    };
    setPharmaCompounds([...pharmaCompounds, newComp]);
    setNewCompName("");
    setNewCompDosage("");
  };

  const removeCompound = (id: string) => {
    setPharmaCompounds(pharmaCompounds.filter(c => c.id !== id));
  };

  const addRoutine = async () => {
    if (!newRoutineName || newRoutineExercises.length === 0) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('routines').insert({
        user_id: athleteId,
        name: newRoutineName,
        exercises: newRoutineExercises
      });
      if (error) throw error;

      toast.success("Rutina asignada");
      setNewRoutineName("");
      setNewRoutineExercises([]);
      setIsAddingRoutine(false);
      fetchAthleteRoutines();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (!error) fetchAthleteRoutines();
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Pharma Disclaimer Modal */}
      <Dialog open={showPharmaDisclaimer} onOpenChange={setShowPharmaDisclaimer}>
        <DialogContent className="bg-zinc-900 border-red-900/50 text-white">
          <DialogHeader>
            <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-red-500">AVISO LEGAL Y DE SALUD</DialogTitle>
            <DialogDescription className="text-zinc-400 text-center text-xs">
              Como preparador, eres responsable de la integridad del atleta.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-950/20 p-4 rounded-lg border border-red-900/30 text-xs space-y-2 text-zinc-300">
             <p>1. Heavy Duty es una herramienta de registro, no recomienda el uso de fármacos.</p>
             <p>2. Esta información es privada y solo visible para ti y tu alumno vinculado.</p>
             <p>3. Asegúrate de que el atleta realice analíticas clínicas periódicas.</p>
          </div>
          <DialogFooter>
             <Button className="w-full bg-red-600 hover:bg-red-700 font-bold" onClick={() => { setPharmaAccepted(true); setShowPharmaDisclaimer(false); }}>
                Entiendo y acepto la responsabilidad
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="nutricion" className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-12">
          <TabsTrigger value="nutricion" className="flex-1 text-[9px] font-black uppercase"><Utensils className="w-3 h-3 mr-1 text-green-500" /> Dieta</TabsTrigger>
          <TabsTrigger value="suplementacion" className="flex-1 text-[9px] font-black uppercase"><Zap className="w-3 h-3 mr-1 text-yellow-500" /> Stack</TabsTrigger>
          <TabsTrigger value="farmacologia" className="flex-1 text-[9px] font-black uppercase" onClick={() => !pharmaAccepted && setShowPharmaDisclaimer(true)}>
            <Syringe className="w-3 h-3 mr-1 text-red-500" /> Química
          </TabsTrigger>
          <TabsTrigger value="entrenamiento" className="flex-1 text-[9px] font-black uppercase"><Dumbbell className="w-3 h-3 mr-1 text-blue-500" /> Rutinas</TabsTrigger>
        </TabsList>

        {/* --- NUTRITION --- */}
        <TabsContent value="nutricion" className="space-y-6">
           <div className="space-y-4">
              <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Fase del Mesociclo</Label>
              <div className="grid grid-cols-3 gap-2">
                 {(['volume', 'definition', 'maintenance'] as const).map(goal => (
                    <Button 
                        key={goal}
                        variant="outline" 
                        onClick={() => setPhaseGoal(goal)}
                        className={cn("text-[10px] font-bold uppercase h-10 border-zinc-800", phaseGoal === goal ? "bg-green-600 border-green-500 text-white" : "bg-zinc-900 text-zinc-500")}
                    >
                        {goal === 'volume' ? 'Volumen' : goal === 'definition' ? 'Definición' : 'Mant.'}
                    </Button>
                 ))}
              </div>
           </div>
           <DietStrategy strategyType={strategyType} setStrategyType={setStrategyType} variants={variants} setVariants={setVariants} />
           <Button onClick={saveBiologicalProtocol} disabled={saving} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Dieta
           </Button>
        </TabsContent>

        {/* --- SUPPLEMENTS --- */}
        <TabsContent value="suplementacion" className="space-y-6">
           <SupplementStack supplements={supplements} setSupplements={setSupplements} visibleTimings={visibleTimings} setVisibleTimings={setVisibleTimings} />
           <Button onClick={saveBiologicalProtocol} disabled={saving} className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase italic">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Stack
           </Button>
        </TabsContent>

        {/* --- PHARMACOLOGY --- */}
        <TabsContent value="farmacologia" className="space-y-6">
            {!pharmaAccepted ? (
                <div className="text-center py-10 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center gap-4">
                    <ShieldAlert className="h-8 w-8 text-zinc-800" />
                    <p className="text-zinc-600 text-xs font-bold uppercase">Requiere aceptación del disclaimer</p>
                    <Button variant="outline" size="sm" onClick={() => setShowPharmaDisclaimer(true)} className="border-zinc-800 text-zinc-500">Ver Aviso</Button>
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-right-2">
                    <div className="space-y-4">
                        <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Protocolo de Sustancias</Label>
                        <div className="grid gap-2">
                            {pharmaCompounds.map(c => (
                                <div key={c.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-red-500 border border-red-900/30 w-16 text-center">
                                            {c.timing}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{c.name}</p>
                                            <p className="text-[10px] text-zinc-500">{c.dosage}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeCompound(c.id)} className="h-8 w-8 text-zinc-700 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Añadir Compuesto</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Nombre" className="h-9 text-xs bg-zinc-950 border-zinc-800" value={newCompName} onChange={e => setNewCompName(e.target.value)} />
                            <Input placeholder="Dosis (ej: 250mg)" className="h-9 text-xs bg-zinc-950 border-zinc-800" value={newCompDosage} onChange={e => setNewCompDosage(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Select value={newCompType} onValueChange={(v: any) => setNewCompType(v)}>
                                <SelectTrigger className="h-9 text-xs bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="injectable">Inyectable</SelectItem>
                                    <SelectItem value="oral">Oral</SelectItem>
                                    <SelectItem value="ancillary">Ancilar</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={newCompTiming} onValueChange={(v: any) => setNewCompTiming(v)}>
                                <SelectTrigger className="h-9 text-xs bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TIMING_ORDER.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full h-9 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold" onClick={addCompound}>
                            <Plus className="h-4 w-4 mr-2" /> Agregar al protocolo
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Notas de Ciclo</Label>
                        <Textarea placeholder="Observaciones, duración estimada..." className="bg-zinc-950 border-zinc-800 min-h-[80px]" value={pharmaNotes} onChange={e => setPharmaNotes(e.target.value)} />
                    </div>

                    <Button onClick={savePharmaProtocol} disabled={saving} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar Estrategia Química
                    </Button>
                </div>
            )}
        </TabsContent>

        {/* --- TRAINING --- */}
        <TabsContent value="entrenamiento" className="space-y-6">
           {isAddingRoutine ? (
              <Card className="bg-zinc-950 border-zinc-800">
                 <CardHeader><CardTitle className="text-sm font-black uppercase italic">Nueva Rutina para {athleteName}</CardTitle></CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-zinc-500">Nombre (Ej: Empuje A)</Label>
                       <Input value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] uppercase font-bold text-zinc-500">Ejercicios Seleccionados</Label>
                       <div className="space-y-2">
                          {newRoutineExercises.map((ex, i) => (
                             <div key={i} className="flex gap-2 items-center bg-zinc-900 p-2 rounded border border-zinc-800">
                                <span className="flex-1 text-xs font-bold truncate">{ex.name}</span>
                                <Input type="number" className="w-16 h-8 text-center bg-zinc-950 border-zinc-800" value={ex.sets_goal} onChange={e => {
                                      const updated = [...newRoutineExercises];
                                      updated[i].sets_goal = parseInt(e.target.value) || 1;
                                      setNewRoutineExercises(updated);
                                   }}
                                />
                                <Button variant="ghost" size="icon" onClick={() => setNewRoutineExercises(newRoutineExercises.filter((_, idx) => idx !== i))} className="h-8 w-8 text-zinc-600 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                             </div>
                          ))}
                       </div>
                       <ExerciseSelector onSelect={name => setNewRoutineExercises([...newRoutineExercises, { name, sets_goal: 1 }])} />
                    </div>
                 </CardContent>
                 <CardFooter className="gap-2">
                    <Button variant="ghost" className="flex-1 text-zinc-500" onClick={() => setIsAddingRoutine(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={addRoutine} disabled={saving}>Asignar</Button>
                 </CardFooter>
              </Card>
           ) : (
              <div className="space-y-4">
                 <Button className="w-full h-14 bg-zinc-900 border border-zinc-800 border-dashed text-zinc-400 hover:text-white" onClick={() => setIsAddingRoutine(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Rutina de Entrenamiento
                 </Button>
                 <div className="grid gap-3">
                    {routines.map(r => (
                       <Card key={r.id} className="bg-zinc-950 border-zinc-900">
                          <CardContent className="p-4 flex justify-between items-center">
                             <div>
                                <h4 className="font-black uppercase italic text-sm text-white">{r.name}</h4>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase">{r.exercises.length} ejercicios planificados</p>
                             </div>
                             <Button variant="ghost" size="icon" onClick={() => deleteRoutine(r.id)} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4"/></Button>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              </div>
           )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
         <Target className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
         <p className="text-xs text-zinc-400 leading-relaxed">
            Como coach, tus cambios impactan directamente en el cuaderno de <strong>{athleteName}</strong>. El atleta recibirá una notificación push-app para que revise su nueva estrategia.
         </p>
      </div>
    </div>
  );
}