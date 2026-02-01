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
    Loader2, Zap, Syringe, ClipboardList, Target, ShieldAlert, History, Brain, ChevronRight
} from "lucide-react";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement, Routine, Compound } from "@/types";
import { DietStrategy } from "@/components/nutrition/DietStrategy";
import { SupplementStack } from "@/components/nutrition/SupplementStack";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { aiService } from "@/services/ai";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface CoachProtocolManagerProps {
  athleteId: string;
  athleteName: string;
}

const TIMING_ORDER = ['fasted', 'pre', 'intra', 'post', 'meal', 'night'];

export function CoachProtocolManager({ athleteId, athleteName }: CoachProtocolManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditing, setAuditing] = useState(false);
  
  // Tabs: 'bio' | 'chem' | 'train' | 'history'
  const [activeTab, setActiveTab] = useState("bio");

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

  // Historial
  const [protocolHistory, setProtocolHistory] = useState<any[]>([]);
  const [auditResult, setAuditResult] = useState<any>(null);

  useEffect(() => {
    fetchAthleteSettings();
    fetchAthleteRoutines();
    fetchProtocolHistory();
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

  const fetchProtocolHistory = async () => {
      const { data } = await supabase
        .from('protocol_history')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('created_at', { ascending: false });
      if (data) setProtocolHistory(data);
  };

  const createProtocolSnapshot = async (type: string, payload: any) => {
      const { data: { user: coach } } = await supabase.auth.getUser();
      await supabase.from('protocol_history').insert({
          athlete_id: athleteId,
          coach_id: coach?.id,
          type,
          phase: phaseGoal,
          data: payload
      });
      fetchProtocolHistory();
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

      await createProtocolSnapshot('biological', nutritionConfig);
      await notifyAthlete("Protocolo Biológico Actualizado", "Tu coach ha realizado ajustes en tu nutrición y stack de suplementos.");
      toast.success("Protocolo biológico guardado e historizado");
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

      await createProtocolSnapshot('chemical', pharmaProtocol);
      await notifyAthlete("Protocolo Químico Actualizado", "Tu coach ha actualizado tu estrategia de farmacología.");
      toast.success("Estrategia química guardada e historizada");
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

  const runProtocolAudit = async () => {
      setAuditing(true);
      try {
          // Obtener los últimos logs del atleta para cruzar con protocolos
          const { data: logs } = await supabase.from('logs').select('*').eq('user_id', athleteId).limit(20);
          
          const auditSummary = {
              athleteName,
              currentPhase: phaseGoal,
              protocolHistory: protocolHistory.slice(0, 10),
              recentLogs: logs?.map(l => ({ type: l.type, data: l.data, date: l.created_at }))
          };

          const result = await aiService.getGlobalAnalysis('analytical', auditSummary);
          setAuditResult(result);
          toast.success("Auditoría de protocolos completada");
      } catch (err) {
          toast.error("Falla en auditoría IA");
      } finally {
          setAuditing(false);
      }
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
      setIsAddingRoutine(false);
      fetchAthleteRoutines();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from('routines').delete().eq('id', id);
    if (!error) fetchAthleteRoutines();
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <Dialog open={showPharmaDisclaimer} onOpenChange={setShowPharmaDisclaimer}>
        <DialogContent className="bg-zinc-900 border-red-900/50 text-white">
          <DialogHeader>
            <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-center font-black uppercase text-red-500">AVISO LEGAL Y DE SALUD</DialogTitle>
          </DialogHeader>
          <div className="bg-red-950/20 p-4 rounded-lg border border-red-900/30 text-xs space-y-2 text-zinc-300">
             <p>1. Heavy Duty es una herramienta de registro, no recomienda el uso de fármacos.</p>
             <p>2. Esta información es privada y solo visible para ti y tu alumno vinculado.</p>
          </div>
          <DialogFooter>
             <Button className="w-full bg-red-600 hover:bg-red-700 font-bold" onClick={() => { setPharmaAccepted(true); setShowPharmaDisclaimer(false); }}>
                Entiendo la responsabilidad
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-12 overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="bio" className="flex-1 text-[9px] font-black uppercase"><Utensils className="w-3 h-3 mr-1 text-green-500" /> Bio</TabsTrigger>
          <TabsTrigger value="chem" className="flex-1 text-[9px] font-black uppercase" onClick={() => !pharmaAccepted && setShowPharmaDisclaimer(true)}>
            <Syringe className="w-3 h-3 mr-1 text-red-500" /> Chem
          </TabsTrigger>
          <TabsTrigger value="train" className="flex-1 text-[9px] font-black uppercase"><Dumbbell className="w-3 h-3 mr-1 text-blue-500" /> Train</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-[9px] font-black uppercase"><History className="w-3 h-3 mr-1 text-zinc-500" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="bio" className="space-y-6">
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
           <SupplementStack supplements={supplements} setSupplements={setSupplements} visibleTimings={visibleTimings} setVisibleTimings={setVisibleTimings} />
           <Button onClick={saveBiologicalProtocol} disabled={saving} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Dieta y Suplementos
           </Button>
        </TabsContent>

        <TabsContent value="chem" className="space-y-6">
            {pharmaAccepted && (
                <div className="space-y-6 animate-in slide-in-from-right-2">
                    <div className="space-y-4">
                        <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Protocolo Vigente</Label>
                        <div className="grid gap-2">
                            {pharmaCompounds.map(c => (
                                <div key={c.id} className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-red-500 border border-red-900/30 w-16 text-center">{c.timing}</div>
                                        <div><p className="text-xs font-bold text-white">{c.name}</p><p className="text-[10px] text-zinc-500">{c.dosage}</p></div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeCompound(c.id)} className="h-8 w-8 text-zinc-700 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Nombre" className="h-9 text-xs bg-zinc-950 border-zinc-800" value={newCompName} onChange={e => setNewCompName(e.target.value)} />
                            <Input placeholder="Dosis" className="h-9 text-xs bg-zinc-950 border-zinc-800" value={newCompDosage} onChange={e => setNewCompDosage(e.target.value)} />
                        </div>
                        <Button className="w-full h-9 bg-zinc-800 text-xs font-bold" onClick={addCompound}><Plus className="h-4 w-4 mr-2" /> Añadir</Button>
                    </div>
                    <Button onClick={savePharmaProtocol} disabled={saving} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic">
                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                        Guardar Protocolo Químico
                    </Button>
                </div>
            )}
        </TabsContent>

        <TabsContent value="train" className="space-y-6">
           <Button className="w-full h-14 bg-zinc-900 border border-zinc-800 border-dashed text-zinc-400" onClick={() => setIsAddingRoutine(true)}>+ Rutina de Entrenamiento</Button>
           <div className="grid gap-3">
              {routines.map(r => (
                 <Card key={r.id} className="bg-zinc-950 border-zinc-900">
                    <CardContent className="p-4 flex justify-between items-center">
                       <div><h4 className="font-black uppercase italic text-sm text-white">{r.name}</h4><p className="text-[10px] text-zinc-600 font-bold uppercase">{r.exercises.length} ejercicios</p></div>
                       <Button variant="ghost" size="icon" onClick={() => deleteRoutine(r.id)}><Trash2 className="h-4 w-4"/></Button>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
            <Button onClick={runProtocolAudit} disabled={auditing} className="w-full h-14 bg-red-600/10 border border-red-600/30 text-red-500 font-black uppercase italic tracking-widest shadow-lg">
                {auditing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Brain className="mr-2 h-5 w-5" />}
                AUDITAR HISTORIAL CON IA
            </Button>

            {auditResult && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                     <Card className="border-l-4 border-l-red-600 bg-zinc-950/50">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase font-black text-zinc-500">Juicio de Eficacia IA</CardTitle></CardHeader>
                        <CardContent><MarkdownRenderer content={auditResult.overall_assessment} /></CardContent>
                    </Card>
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-1">Capturas de Estrategia</Label>
                {protocolHistory.map(item => (
                    <Card key={item.id} className="bg-zinc-950 border-zinc-900">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", item.type === 'biological' ? "bg-green-600/10 text-green-500" : "bg-red-600/10 text-red-500")}>
                                    {item.type === 'biological' ? <Utensils className="h-4 w-4" /> : <Syringe className="h-4 w-4" />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white capitalize">{item.type} Protocol</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase">{format(new Date(item.created_at), "dd MMM yyyy, HH:mm", { locale: es })}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-zinc-800" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}