import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Save, RefreshCw, PlusCircle } from "lucide-react";

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

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (prompts.length >= 0) {
      const found = prompts.find(p => p.action === selectedAction && p.coach_tone === selectedTone);
      if (found) {
        setCurrentPrompt(found);
        setEditedInstruction(found.system_instruction);
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
          updated_at: new Date().toISOString()
        })
        .eq('id', currentPrompt.id);

      if (error) throw error;

      toast.success("Prompt actualizado correctamente");
      fetchPrompts();
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
            <CardTitle>Editor de Instrucciones del Sistema</CardTitle>
            <CardDescription>
              Define cómo debe comportarse la IA para {selectedAction} ({selectedTone}).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPrompt ? (
              <>
                <Textarea 
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  value={editedInstruction}
                  onChange={(e) => setEditedInstruction(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </>
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