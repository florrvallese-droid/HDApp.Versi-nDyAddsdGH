import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Loader2, Star, Tag, Link as LinkIcon } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";

export function CoachCollaborations() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [collabs, setCollabs] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.business_info?.collaborations) {
      setCollabs(profile.business_info.collaborations);
    }
  }, [profile]);

  const addCollab = () => {
    setCollabs([...collabs, { brand: "", code: "", description: "", link: "" }]);
  };

  const updateCollab = (index: number, field: string, value: string) => {
    const updated = [...collabs];
    updated[index][field] = value;
    setCollabs(updated);
  };

  const removeCollab = (index: number) => {
    setCollabs(collabs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const updatedBusiness = {
        ...(profile.business_info || {}),
        collaborations: collabs
      };

      const { error } = await supabase
        .from('profiles')
        .update({ business_info: updatedBusiness, updated_at: new Date().toISOString() })
        .eq('user_id', profile.user_id);

      if (error) throw error;
      toast.success("Colaboraciones actualizadas");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" /> Beneficios para Alumnos
          </h3>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Marcas y Descuentos exclusivos</p>
        </div>
        <Button size="sm" onClick={addCollab} className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 font-bold uppercase text-[10px]">
          <Plus className="h-3 w-3 mr-1" /> Añadir Marca
        </Button>
      </div>

      <div className="grid gap-4">
        {collabs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950 border border-dashed border-zinc-900 rounded-2xl">
            <Tag className="h-10 w-10 text-zinc-800 mx-auto mb-3" />
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest px-10">¿Trabajas con marcas de suplementos o ropa? Agrégalas aquí.</p>
          </div>
        ) : (
          collabs.map((c, i) => (
            <Card key={i} className="bg-zinc-950 border-zinc-900 overflow-hidden">
              <div className="bg-zinc-900/50 p-3 border-b border-zinc-900 flex justify-between items-center">
                <Input 
                  value={c.brand} 
                  onChange={e => updateCollab(i, 'brand', e.target.value)} 
                  placeholder="NOMBRE DE LA MARCA" 
                  className="bg-transparent border-none p-0 h-auto font-black uppercase text-sm text-white focus-visible:ring-0 w-2/3"
                />
                <Button variant="ghost" size="icon" onClick={() => removeCollab(i)} className="text-zinc-700 hover:text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Código de Descuento</Label>
                    <div className="relative">
                       <Tag className="absolute left-3 top-2.5 h-3.5 w-3.5 text-red-500" />
                       <Input value={c.code} onChange={e => updateCollab(i, 'code', e.target.value.toUpperCase())} placeholder="CÓDIGO" className="bg-black border-zinc-800 h-9 pl-9 font-mono font-bold text-xs" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Link (Opcional)</Label>
                    <div className="relative">
                       <LinkIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-500" />
                       <Input value={c.link} onChange={e => updateCollab(i, 'link', e.target.value)} placeholder="https://..." className="bg-black border-zinc-800 h-9 pl-9 text-xs" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Descripción del beneficio</Label>
                  <Input value={c.description} onChange={e => updateCollab(i, 'description', e.target.value)} placeholder="Ej: 15% OFF en toda la web de suplementos." className="bg-black border-zinc-800 h-9 text-xs" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black italic uppercase tracking-widest border border-zinc-200 mt-4">
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5 mr-2" />}
        GUARDAR COLABORACIONES
      </Button>
    </div>
  );
}