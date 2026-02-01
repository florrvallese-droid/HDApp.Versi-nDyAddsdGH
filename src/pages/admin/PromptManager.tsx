import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Save, RefreshCw, PlusCircle, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PromptManager() {
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
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-500" />
                <CardTitle>Base de Conocimiento Heavy Duty</CardTitle>
              </div>
              <CardDescription>
                Este texto será inyectado en el contexto de la IA para TODAS las acciones y TODOS los tonos. 
                Pega aquí el libro, principios o reglas técnicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingKnowledge ? (
                <div className="h-[500px] flex items-center justify-center">Cargando...</div>
              ) : (
                <Textarea 
                  className="min-h-[500px] font-mono text-sm leading-relaxed bg-zinc-950/50 border-blue-500/20 focus:border-blue-500"
                  value={knowledgeContent}
                  onChange={(e) => setKnowledgeContent(e.target.value)}
                  placeholder="Pega aquí el contenido completo del libro o manual..."
                />
              )}
              <div className="flex justify-end">
                <Button onClick={handleSaveKnowledge} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
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