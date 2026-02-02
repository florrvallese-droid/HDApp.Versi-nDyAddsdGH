import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { 
    Utensils, Pill, Dumbbell, Save, Plus, Trash2, 
    Loader2, Zap, Syringe, ClipboardList, Target, ShieldAlert, History, Brain, ChevronRight, Sparkles, AlertTriangle
} from "lucide-react";
import { DietVariant, NutritionConfig, PhaseGoal, Supplement, Routine, Compound } from "@/types";
import { DietStrategy } from "@/components/nutrition/DietStrategy";
import { SupplementStack } from "@/components/nutrition/SupplementStack";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { aiService } from "@/services/ai";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";

interface CoachProtocolManagerProps {
  athleteId: string;
  athleteName: string;
}

export function CoachProtocolManager({ athleteId, athleteName }: CoachProtocolManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auditing, setAuditing] = useState(false);
  
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

  // IA Auditoría
  const [auditResult, setAuditResult] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

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
    }
    setLoading(false);
  };

  const fetchAthleteRoutines = async () => {
    const { data } = await supabase.from('routines').select('*').eq('user_id', athleteId);
    if (data) setRoutines(data);
  };

  const runPreSaveAudit = async () => {
    setAuditing(true);
    setAuditResult(null);
    setShowAuditModal(true);

    try {
        const { data: logs } = await supabase.from('logs').select('*').eq('user_id', athleteId).order('created_at', { ascending: false }).limit(15);
        
        const currentDraft = {
            type: 'pre_save_protocol_audit',
            athleteName,
            phase: phaseGoal,
            diet: { strategy: strategyType, variants },
            supplements: supplements,
            pharmacology: pharmaCompounds,
            athleteHistorySummary: logs?.map(l => ({ type: l.type, date: l.created_at, data: l.data }))
        };

        const result = await aiService.getGlobalAnalysis('analytical', currentDraft);
        setAuditResult(result);
    } catch (err) {
        toast.error("Error en la auditoría de IA");
        setShowAuditModal(false);
    } finally {
        setAuditing(false);
    }
  };

  const saveProtocol = async (type: 'bio' | 'chem') => {
    setSaving(true);
    try {
      const { data: current } = await supabase.from('profiles').select('settings').eq('user_id', athleteId).single();
      
      let updatedSettings = { ...current?.settings };
      let logType = "";

      if (type === 'bio') {
          logType = 'biological';
          updatedSettings.nutrition = {
            phase_goal: phaseGoal,
            strategy_type: strategyType,
            diet_variants: variants,
            supplements_stack: supplements,
            timing_order: visibleTimings
          };
      } else {
          logType = 'chemical';
          updatedSettings.pharmacology_protocol = {
            compounds: pharmaCompounds,
            notes: pharmaNotes
          };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
        .eq('user_id', athleteId);

      if (error) throw error;

      // Guardar en historial
      const { data: { user: coach } } = await supabase.auth.getUser();
      await supabase.from('protocol_history').insert({
          athlete_id: athleteId,
          coach_id: coach?.id,
          type: logType,
          phase: phaseGoal,
          data: type === 'bio' ? updatedSettings.nutrition : updatedSettings.pharmacology_protocol
      });

      // Notificar atleta
      await supabase.from('notifications').insert({
        user_id: athleteId,
        title: "Planificación Actualizada",
        message: `Tu coach ha ajustado tu protocolo ${type === 'bio' ? 'biológico' : 'químico'}.`,
        type: 'protocol_update'
      });

      toast.success("Protocolo guardado y enviado al atleta");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addCompound = () => {
    if (!newCompName || !newCompDosage) return;
    setPharmaCompounds([...pharmaCompounds, {
        id: crypto.randomUUID(),
        name: newCompName,
        dosage: newCompDosage,
        type: newCompType,
        timing: newCompTiming
    }]);
    setNewCompName(""); setNewCompDosage("");
  };

  const removeCompound = (id: string) => {
    setPharmaCompounds(pharmaCompounds.filter(c => c.id !== id));
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex gap-2">
         <Button 
            className="flex-1 bg-zinc-900 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-[0_0_15px_rgba(220,38,38,0.1)]"
            onClick={runPreSaveAudit}
            disabled={auditing}
         >
            {auditing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Auditar Plan Actual (IA)
         </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full bg-zinc-900 border border-zinc-800 h-12">
          <TabsTrigger value="bio" className="flex-1 text-[9px] font-black uppercase"><Utensils className="w-3 h-3 mr-1 text-green-500" /> Bio (Dieta)</TabsTrigger>
          <TabsTrigger value="chem" className="flex-1 text-[9px] font-black uppercase" onClick={() => !pharmaAccepted && setShowPharmaDisclaimer(true)}>
            <Syringe className="w-3 h-3 mr-1 text-red-500" /> Chem (Química)
          </TabsTrigger>
          <TabsTrigger value="train" className="flex-1 text-[9px] font-black uppercase"><Dumbbell className="w-3 h-3 mr-1 text-blue-500" /> Train</TabsTrigger>
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
           <Button onClick={() => saveProtocol('bio')} disabled={saving} className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase italic shadow-lg">
              {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
              GUARDAR Y ENVIAR DIETA
           </Button>
        </TabsContent>

        <TabsContent value="chem" className="space-y-6">
            <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-xl flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold">
                    Registro confidencial. Estas sustancias no son recomendadas por la app, solo se proporcionan para el seguimiento profesional del atleta.
                </p>
            </div>
            
            <div className="space-y-4">
                <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Estrategia Vigente</Label>
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
                
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Nombre Sustancia" className="h-10 text-xs bg-zinc-950 border-zinc-800" value={newCompName} onChange={e => setNewCompName(e.target.value)} />
                        <Input placeholder="Dosis (Ej: 250mg)" className="h-10 text-xs bg-zinc-950 border-zinc-800" value={newCompDosage} onChange={e => setNewCompDosage(e.target.value)} />
                    </div>
                    <Button className="w-full h-10 bg-zinc-800 text-[10px] font-black uppercase tracking-widest" onClick={addCompound}><Plus className="h-3 w-3 mr-2" /> Añadir Compuesto</Button>
                </div>
            </div>

            <Button onClick={() => saveProtocol('chem')} disabled={saving} className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic shadow-lg">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                GUARDAR Y ENVIAR QUÍMICA
            </Button>
        </TabsContent>
      </Tabs>

      {/* MODAL AUDITORÍA IA */}
      <Dialog open={showAuditModal} onOpenChange={setShowAuditModal}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0">
            <div className="p-6 bg-zinc-900/50 border-b border-zinc-900 flex items-center justify-between">
                <div>
                    <DialogTitle className="font-black uppercase italic text-xl flex items-center gap-2">
                        <Brain className="h-6 w-6 text-red-600" /> Technical Audit Report
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        Análisis Estratégico Di Iorio
                    </DialogDescription>
                </div>
                <Button variant="ghost" onClick={() => setShowAuditModal(false)} className="h-8 w-8 p-0 text-zinc-500"><Plus className="rotate-45" /></Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {auditing ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-600/20 blur-2xl animate-pulse rounded-full" />
                            <Loader2 className="h-12 w-12 animate-spin text-red-600 relative z-10" />
                        </div>
                        <p className="text-zinc-500 text-sm font-black uppercase tracking-widest animate-pulse">Cruzando Estrategia con Historial...</p>
                    </div>
                ) : auditResult ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        <div className="bg-red-600/5 border border-red-600/20 p-5 rounded-2xl">
                             <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Sparkles className="h-3 w-3" /> Veredicto Técnico
                             </h4>
                             <MarkdownRenderer content={auditResult.overall_assessment} className="text-zinc-200 text-base leading-relaxed" />
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Target className="h-3 w-3" /> Puntos de Atención
                            </h4>
                            {auditResult.top_patterns?.map((p: any, i: number) => (
                                <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-1">
                                    <p className="text-sm font-black text-white uppercase italic">{p.pattern}</p>
                                    <p className="text-xs text-zinc-500">{p.evidence}</p>
                                    <div className="mt-2 text-[10px] text-red-400 font-bold border-t border-zinc-800 pt-2 flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3" /> {p.action}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {auditResult.red_flags?.length > 0 && (
                             <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Riesgos / Incoherencias</h4>
                                <div className="grid gap-2">
                                    {auditResult.red_flags.map((flag: string, i: number) => (
                                        <div key={i} className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg flex items-center gap-3">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="text-xs text-red-200">{flag}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10"><p className="text-zinc-500 text-xs">No se pudo generar el reporte.</p></div>
                )}
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-900">
                <Button 
                    className="w-full h-14 bg-white text-black font-black uppercase italic tracking-widest text-sm"
                    onClick={() => setShowAuditModal(false)}
                >
                    Entendido, Volver al Editor
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}