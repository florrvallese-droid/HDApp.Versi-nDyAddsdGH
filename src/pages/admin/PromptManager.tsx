"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { 
  Save, RefreshCw, PlusCircle, Database, FileUp, Loader2, FileText, Trash2, 
  Dumbbell, Briefcase, Brain, Info, Sparkles, Target, Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as pdfjsLib from "pdfjs-dist";
import { cn } from "@/lib/utils";

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type AIDomain = 'athlete' | 'coach' | 'global';

const ATHLETE_ACTIONS = [
    { id: 'preworkout', label: 'Evaluación Pre-Entreno', icon: Zap },
    { id: 'postworkout', label: 'Juicio Post-Entreno (Fase 3)', icon: Target },
    { id: 'globalanalysis', label: 'Auditoría del Atleta (30 días)', icon: History }
];

const COACH_ACTIONS = [
    { id: 'protocol_audit', label: 'Auditoría de Protocolos (Draft)', icon: ShieldCheck },
    { id: 'marketing_generation', label: 'Generador de Marketing', icon: Sparkles },
    { id: 'business_audit', label: 'Business Intelligence (Audit)', icon: Briefcase }
];

export default function PromptManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeDomain, setActiveDomain] = useState<AIDomain>('athlete');
  const [selectedAction, setSelectedAction] = useState<string>("preworkout");
  const [selectedTone, setSelectedTone] = useState<string>("strict");
  
  // Editor state
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const [editedInstruction, setEditedInstruction] = useState("");
  const [saving, setSaving] = useState(false);

  // Global Knowledge State
  const [knowledgeContent, setKnowledgeContent] = useState("");
  const [knowledgeId, setKnowledgeId] = useState<string | null>(null);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [processingPdf, setProcessingPdf] = useState(false);

  useEffect(() => {
    fetchPrompts();
    fetchKnowledgeBase();
  }, []);

  // Update selected action when domain changes
  useEffect(() => {
    if (activeDomain === 'athlete') {
        setSelectedAction('preworkout');
    } else if (activeDomain === 'coach') {
        setSelectedAction('protocol_audit');
    }
  }, [activeDomain]);

  useEffect(() => {
    const found = prompts.find(p => p.action === selectedAction && p.coach_tone === selectedTone);
    if (found) {
      setCurrentPrompt(found);
      setEditedInstruction(found.system_instruction || "");
    } else {
      setCurrentPrompt(null);
      setEditedInstruction("");
    }
  }, [selectedAction, selectedTone, prompts]);

  const fetchPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) toast.error("Error cargando prompts");
    else setPrompts(data || []);
    setLoading(false);
  };

  const fetchKnowledgeBase = async () => {
    setLoadingKnowledge(true);
    const { data } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      setKnowledgeContent(data.content || "");
      setKnowledgeId(data.id);
    }
    setLoadingKnowledge(false);
  };

  const handleSavePrompt = async () => {
    if (!currentPrompt) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_prompts')
        .update({ 
          system_instruction: editedInstruction,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPrompt.id);

      if (error) throw error;
      toast.success("Prompt actualizado");
      fetchPrompts();
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveKnowledge = async () => {
    setSaving(true);
    try {
      if (knowledgeId) {
        await supabase.from('ai_knowledge_base').update({ content: knowledgeContent, updated_at: new Date().toISOString() }).eq('id', knowledgeId);
      } else {
        const { data } = await supabase.from('ai_knowledge_base').insert({ content: knowledgeContent }).select().single();
        if (data) setKnowledgeId(data.id);
      }
      toast.success("Base de Conocimiento Global actualizada");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast.error("Sube un archivo PDF válido.");
      return;
    }

    setProcessingPdf(true);
    const toastId = toast.loading("Extrayendo conocimiento del libro...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += `[PÁGINA ${i}]\n${pageText}\n\n`;
      }

      setKnowledgeContent(prev => prev + (prev ? "\n\n" : "") + `--- INICIO DOCUMENTO: ${file.name} ---\n` + fullText + `--- FIN DOCUMENTO ---`);
      toast.success(`Conocimiento extraído con éxito`, { id: toastId });
    } catch (error: any) {
      toast.error("Error al procesar PDF", { id: toastId });
    } finally {
      setProcessingPdf(false);
    }
  };

  const handleCreatePrompt = async () => {
    setSaving(true);
    try {
      await supabase.from('ai_prompts').insert({
        action: selectedAction,
        coach_tone: selectedTone,
        system_instruction: "Escribe aquí las instrucciones del sistema...",
        version: "v1.0",
        is_active: true
      });
      toast.success("Estructura de prompt creada");
      fetchPrompts();
    } catch (err: any) {
      toast.error("Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const actionsToShow = activeDomain === 'athlete' ? ATHLETE_ACTIONS : COACH_ACTIONS;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Central de Inteligencia</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Cerebros y Conocimiento Global</p>
        </div>
        <Button variant="outline" className="bg-zinc-950 border-zinc-800" onClick={() => { fetchPrompts(); fetchKnowledgeBase(); }} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Sincronizar
        </Button>
      </div>

      <Tabs value={activeDomain} onValueChange={(v) => setActiveDomain(v as AIDomain)} className="space-y-6">
        <TabsList className="bg-zinc-950 border border-zinc-800 p-1 h-12 w-full lg:w-fit grid grid-cols-3">
          <TabsTrigger value="athlete" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
            <Dumbbell className="mr-2 h-3.5 w-3.5" /> Atleta
          </TabsTrigger>
          <TabsTrigger value="coach" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest">
            <Briefcase className="mr-2 h-3.5 w-3.5" /> Coach
          </TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-zinc-100 data-[state=active]:text-black font-black uppercase text-[10px] tracking-widest">
            <Database className="mr-2 h-3.5 w-3.5" /> Global
          </TabsTrigger>
        </TabsList>

        {/* DOMINIOS IA (ATLETA Y COACH) */}
        {(['athlete', 'coach'] as AIDomain[]).map(domain => (
            <TabsContent key={domain} value={domain} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Panel Izquierdo: Selectores */}
                    <div className="lg:col-span-4 space-y-4">
                        <Card className="bg-zinc-950 border-zinc-900 shadow-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500">Configuración del Cerebro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-600">Módulo de IA</Label>
                                    <div className="grid gap-2">
                                        {(domain === 'athlete' ? ATHLETE_ACTIONS : COACH_ACTIONS).map(action => (
                                            <button
                                                key={action.id}
                                                onClick={() => setSelectedAction(action.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                                    selectedAction === action.id 
                                                        ? domain === 'athlete' ? "bg-red-950/20 border-red-600 text-white" : "bg-blue-950/20 border-blue-600 text-white"
                                                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                                                )}
                                            >
                                                <action.icon className={cn("h-4 w-4", selectedAction === action.id ? domain === 'athlete' ? "text-red-500" : "text-blue-500" : "text-zinc-700")} />
                                                <span className="text-xs font-bold uppercase">{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-zinc-900">
                                    <Label className="text-[10px] font-black uppercase text-zinc-600">Personalidad (Coach Tone)</Label>
                                    <Select value={selectedTone} onValueChange={setSelectedTone}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11 font-bold uppercase text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <SelectItem value="strict" className="font-bold uppercase text-xs">Strict</SelectItem>
                                            <SelectItem value="analytical" className="font-bold uppercase text-xs">Analytical</SelectItem>
                                            <SelectItem value="motivational" className="font-bold uppercase text-xs">Motivational</SelectItem>
                                            <SelectItem value="friendly" className="font-bold uppercase text-xs">Friendly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 flex items-start gap-3">
                            <Info className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-bold">
                                Los cambios en esta sección afectan cómo la IA procesa la información y qué "personalidad" adopta. La base técnica siempre se inyecta desde la pestaña Global.
                            </p>
                        </div>
                    </div>

                    {/* Panel Derecho: Editor */}
                    <div className="lg:col-span-8">
                        <Card className="bg-zinc-950 border-zinc-900 h-full flex flex-col shadow-2xl overflow-hidden">
                            <CardHeader className="bg-zinc-900/50 border-b border-zinc-900 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                        <Brain className={cn("h-4 w-4", domain === 'athlete' ? "text-red-500" : "text-blue-500")} /> 
                                        Editor de Instrucciones del Sistema
                                    </CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-tighter mt-1">
                                        Definiendo comportamiento para: <span className="text-white">{selectedAction} ({selectedTone})</span>
                                    </CardDescription>
                                </div>
                                {currentPrompt && (
                                    <Badge variant="outline" className="bg-black/50 border-zinc-800 text-[10px] font-mono">
                                        {currentPrompt.version}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 p-0 relative">
                                {currentPrompt ? (
                                    <Textarea 
                                        className="h-full min-h-[500px] border-none focus-visible:ring-0 font-mono text-xs leading-relaxed bg-black/40 text-zinc-300 p-6 resize-none"
                                        value={editedInstruction}
                                        onChange={(e) => setEditedInstruction(e.target.value)}
                                        placeholder="Escribe las instrucciones aquí..."
                                    />
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center border-zinc-900 text-zinc-700 gap-4">
                                        <PlusCircle className="h-12 w-12 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No existe prompt configurado</p>
                                        <Button onClick={handleCreatePrompt} disabled={saving} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px]">
                                            Crear Estructura
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                            {currentPrompt && (
                                <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase">
                                        <FileText className="h-3.5 w-3.5" />
                                        {editedInstruction.length} Caracteres
                                    </div>
                                    <Button onClick={handleSavePrompt} disabled={saving} className={cn(
                                        "h-11 px-8 font-black uppercase italic tracking-widest transition-all",
                                        domain === 'athlete' ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                                    )}>
                                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Guardar Prompt
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </TabsContent>
        ))}

        {/* PESTAÑA: CONOCIMIENTO GLOBAL */}
        <TabsContent value="global" className="mt-6">
          <Card className="border-zinc-100 bg-zinc-100 shadow-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-zinc-200 flex flex-row items-center justify-between pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-zinc-950 rounded-lg shadow-lg">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-black">
                    Knowledge Base (HD)
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Este contexto es inyectado en CUALQUIER llamada a la IA de la aplicación.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                 <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handlePdfUpload} />
                 <Button 
                    variant="outline" 
                    className="border-zinc-300 bg-white text-zinc-800 font-black uppercase text-[10px] h-11 shadow-sm hover:bg-zinc-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingPdf}
                 >
                    {processingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" /> : <FileUp className="mr-2 h-4 w-4" />}
                    Cargar Libro (PDF)
                 </Button>
                 <Button variant="ghost" className="text-red-600 hover:bg-red-50 h-11 w-11 p-0" onClick={() => { if(confirm("¿Borrar todo?")) setKnowledgeContent(""); }}>
                    <Trash2 className="h-5 w-5" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              {loadingKnowledge ? (
                <div className="h-[600px] flex items-center justify-center bg-white"><Loader2 className="animate-spin h-8 w-8 text-black" /></div>
              ) : (
                <div className="relative">
                   <Textarea 
                    className="min-h-[600px] border-none focus-visible:ring-0 font-mono text-sm leading-relaxed bg-white text-zinc-900 p-8 resize-none"
                    value={knowledgeContent}
                    onChange={(e) => setKnowledgeContent(e.target.value)}
                    placeholder="Escribe la teoría Heavy Duty o carga un PDF con el sistema Mentzer..."
                   />
                   {processingPdf && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
                        <p className="text-black font-black uppercase italic text-xl animate-pulse tracking-tighter">Extrayendo conocimiento técnico...</p>
                     </div>
                   )}
                </div>
              )}
              <div className="p-6 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase">
                        <FileText className="h-4 w-4" />
                        <span>Chars: {knowledgeContent.length.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase">
                        <Zap className="h-4 w-4" />
                        <span>Tokens Est: {Math.ceil(knowledgeContent.length / 4).toLocaleString()}</span>
                    </div>
                </div>
                <Button onClick={handleSaveKnowledge} disabled={saving || processingPdf} className="bg-black hover:bg-zinc-800 text-white font-black uppercase italic tracking-widest h-14 px-10 shadow-xl">
                  {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                  GUARDAR NÚCLEO TÉCNICO
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components para evitar imports faltantes en el contexto visual
function History({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
}

function ShieldCheck({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
}