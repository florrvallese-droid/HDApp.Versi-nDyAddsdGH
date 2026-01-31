import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { RefreshCw, Flag, Plus, Trash2, Save } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // New Flag Form
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      toast.error("Error cargando flags");
    } else {
      setFlags(data || []);
    }
    setLoading(false);
  };

  const toggleFlag = async (id: string, currentValue: boolean) => {
    // Optimistic update
    setFlags(flags.map(f => f.id === id ? { ...f, is_enabled: !currentValue } : f));

    const { error } = await supabase
      .from('feature_flags')
      .update({ is_enabled: !currentValue })
      .eq('id', id);

    if (error) {
      toast.error("Error al actualizar");
      fetchFlags(); // Revert
    }
  };

  const updateRollout = async (id: string, value: number) => {
    // Optimistic update handled by slider drag, commit on change end
    const { error } = await supabase
      .from('feature_flags')
      .update({ rollout_percentage: value })
      .eq('id', id);

    if (error) toast.error("Error actualizando rollout");
    else fetchFlags(); // Refresh to be sure
  };

  const createFlag = async () => {
    if (!newKey) return;

    const { error } = await supabase
      .from('feature_flags')
      .insert({
        key: newKey.toLowerCase().replace(/\s+/g, '_'),
        description: newDesc,
        is_enabled: false,
        rollout_percentage: 0
      });

    if (error) {
      toast.error("Error creando flag: " + error.message);
    } else {
      toast.success("Feature flag creada");
      setIsCreating(false);
      setNewKey("");
      setNewDesc("");
      fetchFlags();
    }
  };

  const deleteFlag = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta flag?")) return;

    const { error } = await supabase.from('feature_flags').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Flag eliminada");
      fetchFlags();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Feature Flags</h2>
        <div className="flex gap-2">
           <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Feature Flag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Key (ej: new_dashboard)</Label>
                  <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="feature_key" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descripción breve..." />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createFlag}>Crear</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchFlags} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-bold text-lg">{flag.key}</span>
                {flag.is_enabled ? (
                  <Badge className="bg-green-500 hover:bg-green-600">ON</Badge>
                ) : (
                  <Badge variant="secondary">OFF</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{flag.description}</p>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="space-y-2 w-full sm:w-32">
                <div className="flex justify-between text-xs">
                  <span>Rollout</span>
                  <span>{flag.rollout_percentage}%</span>
                </div>
                <Slider 
                  value={[flag.rollout_percentage]} 
                  min={0} max={100} step={5}
                  onValueCommit={(val) => updateRollout(flag.id, val[0])}
                  disabled={!flag.is_enabled}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Switch 
                  checked={flag.is_enabled} 
                  onCheckedChange={() => toggleFlag(flag.id, flag.is_enabled)} 
                />
                
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteFlag(flag.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {!loading && flags.length === 0 && (
          <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
            No hay feature flags configuradas.
          </div>
        )}
      </div>
    </div>
  );
}