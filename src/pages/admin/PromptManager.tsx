import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Save, RefreshCw, PlusCircle, BookOpen } from "lucide-react";
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
  const [editedContext, setEditedContext] = useState(""); // New state for Book/Source
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (prompts.length >= 0) {
      const found = prompts.find(p => p.action === selectedAction && p.coach_tone === selectedTone);
      if (found) {
        setCurrentPrompt(found);
        setEditedInstruction(found.system_instruction || "");
        setEditedContext(found.knowledge_context || ""); // Load context
      } else {
        setCurrentPrompt(null);
        setEditedInstruction("");
        setEditedContext("");
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

    if (error) {
      toast.error("Error cargando prompts");
    } else {
      setPrompts(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!currentPrompt) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('ai_prompts')
        .update({ 
          system_instruction: editedInstruction,
          knowledge_context: editedContext, // Save context
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPrompt.id);

      if (error) throw error;

      toast.success("Prompt y Fuentes actualizados correctamente");
      fetchPrompts(); // Refresh to ensure sync
    } catch (err: any) {
      toast.error("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('ai_prompts').insert({
        action: selectedAction,
        coach_tone: selectedTone,
        system_instruction: "Escribe aquí las instrucciones del sistema...",
        knowledge_context: "", 
        version: "v1.0",
        is_active: true
      });

      if (error) throw error;

      toast.success("Prompt creado correctamente");
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
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Prompts</h2>
        <Button variant="outline" onClick={fetchPrompts} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar / Filters */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Selector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Acción</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>ID: {currentPrompt?.id || "N/A"}</p>
              <p>Version: {currentPrompt?.version || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configuración de IA</CardTitle>
            <CardDescription>
              Define el comportamiento y el conocimiento base para {selectedAction} ({selectedTone}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPrompt ? (
              <Tabs defaultValue="instruction" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="instruction">Instrucción (Rol)</TabsTrigger>
                  <TabsTrigger value="source">Fuente / Libro</TabsTrigger>
                </TabsList>
                
                <TabsContent value="instruction" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Instrucciones del Sistema</Label>
                    <p className="text-xs text-muted-foreground">Define CÓMO debe responder la IA (JSON structure, tono, reglas lógicas).</p>
                    <Textarea 
                      className="min-h-[400px] font-mono text-sm leading-relaxed"
                      value={editedInstruction}
                      onChange={(e) => setEditedInstruction(e.target.value)}
                      placeholder="Eres un entrenador experto..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="source" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Fuente de Conocimiento (RAG Simplificado)
                    </Label>
                    <p className="text-xs text-muted-foreground">Pega aquí el contenido del libro, principios o metodologías. La IA usará esto como su "cerebro".</p>
                    <Textarea 
                      className="min-h-[400px] font-mono text-sm leading-relaxed bg-muted/30"
                      value={editedContext}
                      onChange={(e) => setEditedContext(e.target.value)}
                      placeholder="Pegar aquí los capítulos clave de Heavy Duty..."
                    />
                  </div>
                </TabsContent>

                <div className="flex justify-end pt-4 border-t mt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg text-muted-foreground gap-4">
                <p>No existe prompt activo para esta combinación.</p>
                <Button onClick={handleCreate} disabled={saving}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Prompt v1.0
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}