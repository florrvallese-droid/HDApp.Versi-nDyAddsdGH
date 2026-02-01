import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Save, RefreshCw, PlusCircle, Database, FileUp, Loader2, FileText, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as pdfjsLib from "pdfjs-dist";

// Configurar el worker de PDF.js (usando CDN para evitar problemas de assets locales)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PromptManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
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

  useEffect(() => {
    if (prompts.length >= 0) {
      const found = prompts.find(p => p.action === selectedAction && p.coach_tone === selectedTone);
      if (found) {
        setCurrentPrompt(found);
        setEditedInstruction(found.system_instruction || "");
      } else {
        setCurrentPrompt(null);
        setEditedInstruction("");
      }
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
    const { data, error } = await supabase
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
        const { error } = await supabase
          .from('ai_knowledge_base')
          .update({ 
            content: knowledgeContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', knowledgeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .insert({ content: knowledgeContent });
        if (error) throw error;
        fetchKnowledgeBase();
      }
      toast.success("Base de Conocimiento Global actualizada");
    } catch (err: any) {
      toast.error("Error guardando conocimiento: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, sube un archivo PDF válido.");
      return;
    }

    setProcessingPdf(true);
    const toastId = toast.loading("Extrayendo conocimiento del PDF...");

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
      toast.success(`Se extrajeron ${pdf.numPages} páginas de conocimiento.`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Error al procesar el PDF: " + error.message, { id: toastId });
    } finally {
      setProcessingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreatePrompt = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('ai_prompts').insert({
        action: selectedAction,
        coach_tone: selectedTone,
        system_instruction: "Escribe aquí las instrucciones del sistema...",
        version: "v1.0",
        is_active: true
      });

      if (error) throw error;
      toast.success("Prompt creado");
      fetchPrompts();
    } catch (err: any) {
      toast.error("Error al crear: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de IA</h2>
        <Button variant="outline" onClick={() => { fetchPrompts(); fetchKnowledgeBase(); }} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      <Tabs defaultValue="prompts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="prompts">Prompts por Personalidad</TabsTrigger>
          <TabsTrigger value="knowledge">Conocimiento Global</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Selector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Acción</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preworkout">Pre-Workout</SelectItem>
                      <SelectItem value="postworkout">Post-Workout</SelectItem>
                      <SelectItem value="globalanalysis">Global Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tono del Coach</Label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict</SelectItem>
                      <SelectItem value="motivational">Motivational</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Editor de Personalidad</CardTitle>
                <CardDescription>Define CÓMO habla el coach. El conocimiento técnico (Heavy Duty) viene de la pestaña Global.</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPrompt ? (
                  <div className="space-y-4">
                    <Textarea 
                      className="min-h-[400px] font-mono text-sm leading-relaxed"
                      value={editedInstruction}
                      onChange={(e) => setEditedInstruction(e.target.value)}
                      placeholder="Instrucciones del sistema..."
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSavePrompt} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" /> Guardar Prompt
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg text-muted-foreground gap-4">
                    <p>No existe prompt activo.</p>
                    <Button onClick={handleCreatePrompt} disabled={saving}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Crear Prompt
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-500" />
                  <CardTitle>Base de Conocimiento Heavy Duty</CardTitle>
                </div>
                <CardDescription>
                  Este texto será inyectado en el contexto de la IA. Puedes escribirlo o subir libros en PDF.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                 <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handlePdfUpload}
                 />
                 <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingPdf}
                 >
                    {processingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                    Cargar PDF (Libro)
                 </Button>
                 <Button 
                    variant="ghost" 
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => { if(confirm("¿Borrar todo el conocimiento?")) setKnowledgeContent(""); }}
                 >
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKnowledge ? (
                <div className="h-[500px] flex items-center justify-center">Cargando...</div>
              ) : (
                <div className="relative">
                   <Textarea 
                    className="min-h-[500px] font-mono text-sm leading-relaxed bg-zinc-950/50 border-blue-500/20 focus:border-blue-500"
                    value={knowledgeContent}
                    onChange={(e) => setKnowledgeContent(e.target.value)}
                    placeholder="Pega aquí el contenido o sube un PDF..."
                   />
                   {processingPdf && (
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-md">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-white font-bold animate-pulse text-lg uppercase tracking-widest">Extrayendo texto del libro...</p>
                     </div>
                   )}
                </div>
              )}
              <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-blue-500/10">
                <div className="flex items-center gap-2 text-zinc-400 text-xs">
                   <FileText className="h-4 w-4" />
                   <span>Carcacteres actuales: <strong>{knowledgeContent.length.toLocaleString()}</strong></span>
                   <span className="opacity-30">|</span>
                   <span>Tokens estimados: <strong>{Math.ceil(knowledgeContent.length / 4).toLocaleString()}</strong></span>
                </div>
                <Button onClick={handleSaveKnowledge} disabled={saving || processingPdf} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="mr-2 h-4 w-4" /> Guardar Conocimiento Global
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}