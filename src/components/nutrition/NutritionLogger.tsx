import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { NutritionConfig, Supplement } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export function NutritionLogger() {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Config from Profile
  const [config, setConfig] = useState<NutritionConfig | null>(null);
  
  // Form State
  const [logId, setLogId] = useState<string | null>(null);
  const [selectedDayVariantId, setSelectedDayVariantId] = useState<string>("");
  const [adherence, setAdherence] = useState<number>(100);
  const [takenSupplements, setTakenSupplements] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    if (profile?.settings?.nutrition) {
      const nutConfig = profile.settings.nutrition as NutritionConfig;
      setConfig(nutConfig);
      
      // Default day variant
      if (nutConfig.diet_variants?.length > 0 && !selectedDayVariantId) {
        setSelectedDayVariantId(nutConfig.diet_variants[0].id);
      }
    }
    fetchTodayLog();
  }, [profile]);

  const fetchTodayLog = async () => {
    if (!profile) return;
    setLoading(true);
    
    // We search for a log created today (ignoring time for simplicity, or using date column logic)
    // Since we store exact ISO timestamps, we filter by range
    const start = new Date(todayStr + 'T00:00:00').toISOString();
    const end = new Date(todayStr + 'T23:59:59').toISOString();

    const { data } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('type', 'nutrition')
      .gte('created_at', start)
      .lte('created_at', end)
      .maybeSingle();

    if (data) {
      setLogId(data.id);
      const logData = data.data;
      if (logData.day_variant_id) setSelectedDayVariantId(logData.day_variant_id);
      if (logData.adherence) setAdherence(logData.adherence);
      if (logData.supplements_taken) setTakenSupplements(logData.supplements_taken);
      if (logData.notes) setNotes(logData.notes);
    }
    setLoading(false);
  };

  const toggleSupplement = (suppId: string) => {
    if (takenSupplements.includes(suppId)) {
      setTakenSupplements(takenSupplements.filter(id => id !== suppId));
    } else {
      setTakenSupplements([...takenSupplements, suppId]);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const logData = {
      day_variant_id: selectedDayVariantId,
      adherence,
      supplements_taken: takenSupplements,
      notes
    };

    try {
      if (logId) {
        // Update
        const { error } = await supabase
          .from('logs')
          .update({ data: logData })
          .eq('id', logId);
        if (error) throw error;
      } else {
        // Insert
        const { error, data } = await supabase
          .from('logs')
          .insert({
            user_id: profile.user_id,
            type: 'nutrition',
            created_at: new Date().toISOString(), // Use current time
            data: logData
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) setLogId(data.id);
      }
      toast.success("Registro diario actualizado");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <div className="text-center text-zinc-500 py-8">Configura tu estrategia primero.</div>;
  }

  // Safe access to variants
  const variants = config.diet_variants || [];
  const currentVariant = variants.find(v => v.id === selectedDayVariantId);
  
  const groupedSupplements = (config.supplements_stack || []).reduce((acc, supp) => {
    const timing = supp.timing || 'other';
    if (!acc[timing]) acc[timing] = [];
    acc[timing].push(supp);
    return acc;
  }, {} as Record<string, Supplement[]>);

  // Order for display
  const timingOrder = ['fasted', 'pre', 'intra', 'post', 'meal', 'night'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* HEADER: Date & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold capitalize text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            {displayDate}
          </h2>
          <p className="text-xs text-zinc-500">Registro Diario</p>
        </div>
        <div className="text-right">
           <span className={`text-xs font-bold px-2 py-1 rounded ${logId ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
             {logId ? "GUARDADO" : "SIN REGISTRO"}
           </span>
        </div>
      </div>

      {/* 1. DAY TYPE SELECTOR */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-zinc-500">Tipo de Día</Label>
            <Select value={selectedDayVariantId} onValueChange={setSelectedDayVariantId}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11 text-white font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {variants.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentVariant && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase font-bold">Kcal</div>
                <div className="text-white font-black">{currentVariant.calories}</div>
              </div>
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase font-bold">P</div>
                <div className="text-blue-400 font-bold">{currentVariant.macros.p}</div>
              </div>
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase font-bold">C</div>
                <div className="text-green-400 font-bold">{currentVariant.macros.c}</div>
              </div>
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase font-bold">G</div>
                <div className="text-yellow-400 font-bold">{currentVariant.macros.f}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. ADHERENCE */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-xs uppercase font-bold text-zinc-500">Adherencia a la Dieta</Label>
          <span className={`font-bold ${adherence >= 90 ? 'text-green-500' : adherence >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
            {adherence}%
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 25, 50, 75, 90, 100].map((val) => (
            <button
              key={val}
              onClick={() => setAdherence(val)}
              className={`flex-1 h-2 rounded-full transition-all ${adherence >= val ? (val >= 90 ? 'bg-green-600' : val >= 50 ? 'bg-yellow-600' : 'bg-red-600') : 'bg-zinc-800'}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-zinc-500 text-right pt-1">
          {adherence === 100 ? "Perfecto" : adherence >= 90 ? "Casi perfecto" : adherence >= 70 ? "Aceptable" : "Mal día"}
        </p>
      </div>

      {/* 3. SUPPLEMENT CHECKLIST */}
      {config.supplements_stack && config.supplements_stack.length > 0 && (
        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400">Stack Diario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {timingOrder.map(timing => {
              const sups = groupedSupplements[timing];
              if (!sups || sups.length === 0) return null;

              return (
                <div key={timing} className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-yellow-600 bg-yellow-900/10 px-2 py-1 rounded w-fit">
                    {timing === 'fasted' ? 'Ayunas' : timing === 'pre' ? 'Pre-Entreno' : timing === 'intra' ? 'Intra-Entreno' : timing === 'post' ? 'Post-Entreno' : timing === 'night' ? 'Noche' : 'Comidas'}
                  </h4>
                  <div className="grid gap-2">
                    {sups.map(s => (
                      <div 
                        key={s.id} 
                        className={`flex items-center space-x-3 p-2 rounded border transition-all cursor-pointer ${takenSupplements.includes(s.id) ? 'bg-zinc-900 border-green-900/30' : 'border-zinc-800 hover:bg-zinc-900'}`}
                        onClick={() => toggleSupplement(s.id)}
                      >
                        <Checkbox 
                          checked={takenSupplements.includes(s.id)} 
                          className="data-[state=checked]:bg-green-600 border-zinc-600"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${takenSupplements.includes(s.id) ? 'text-zinc-300' : 'text-white'}`}>{s.name}</p>
                          <p className="text-xs text-zinc-500">{s.dosage}</p>
                        </div>
                        {takenSupplements.includes(s.id) && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 4. NOTES */}
      <div className="space-y-2">
        <Label className="text-xs uppercase font-bold text-zinc-500">Notas Digestivas / Energía</Label>
        <Textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digestión pesada? Mucha hambre?..."
          className="bg-zinc-900 border-zinc-800 text-white min-h-[80px]"
        />
      </div>

      <Button 
        className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold uppercase tracking-wider"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4" />}
        {logId ? "Actualizar Registro" : "Guardar Día"}
      </Button>

    </div>
  );
}