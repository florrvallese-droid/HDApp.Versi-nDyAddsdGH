import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, Plus, Trash2, Utensils, Pill, PieChart } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { NutritionConfig, Supplement, DayType } from "@/types";
import { LockedFeature } from "@/components/shared/LockedFeature";
import { Skeleton } from "@/components/ui/skeleton";

export default function Nutrition() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);

  // Config State
  const [dietType, setDietType] = useState<"fixed" | "cycling">("fixed");
  const [calories, setCalories] = useState<number>(2500);
  const [macros, setMacros] = useState({ p: 200, c: 300, f: 80 });
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  
  // New Supplement Input
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppTiming, setNewSuppTiming] = useState<Supplement['timing']>("pre");
  const [newSuppDosage, setNewSuppDosage] = useState("");

  // Daily Log State
  const [dayType, setDayType] = useState<DayType>("medium");
  const [adherence, setAdherence] = useState(8);
  const [dailyCalories, setDailyCalories] = useState<string>("");
  const [suppsTaken, setSuppsTaken] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (profile?.settings?.nutrition) {
      const config = profile.settings.nutrition;
      setDietType(config.diet_type);
      setCalories(config.calories_target || 2500);
      setMacros(config.macros || { p: 200, c: 300, f: 80 });
      setSupplements(config.supplements_stack || []);
    }
  }, [profile]);

  const saveConfig = async () => {
    if (!profile) return;
    setLoading(true);
    
    const newConfig: NutritionConfig = {
      diet_type: dietType,
      calories_target: calories,
      macros,
      supplements_stack: supplements
    };

    const newSettings = {
      ...profile.settings,
      nutrition: newConfig
    };

    const { error } = await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('user_id', profile.user_id);

    setLoading(false);
    if (error) toast.error("Error guardando configuración");
    else toast.success("Estrategia actualizada");
  };

  const addSupplement = () => {
    if (!newSuppName) return;
    const newSupp: Supplement = {
      id: crypto.randomUUID(),
      name: newSuppName,
      timing: newSuppTiming,
      dosage: newSuppDosage
    };
    setSupplements([...supplements, newSupp]);
    setNewSuppName("");
    setNewSuppDosage("");
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
  };

  const logDay = async () => {
    if (!profile) return;
    setLoading(true);

    const logData = {
      day_type: dayType,
      adherence_score: adherence,
      calories_consumed: dailyCalories ? parseInt(dailyCalories) : undefined,
      supplements_taken: suppsTaken,
      notes
    };

    const { error } = await supabase.from('logs').insert({
      user_id: profile.user_id,
      type: 'nutrition',
      data: logData,
      created_at: new Date().toISOString()
    });

    setLoading(false);
    if (error) {
      toast.error("Error guardando registro");
    } else {
      toast.success("Día registrado correctamente");
      navigate('/dashboard');
    }
  };

  const toggleSuppTaken = (id: string) => {
    if (suppsTaken.includes(id)) {
      setSuppsTaken(suppsTaken.filter(s => s !== id));
    } else {
      setSuppsTaken([...suppsTaken, id]);
    }
  };

  // Loading State
  if (profileLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>;
  }

  // Premium Check
  if (profile && !profile.is_premium) {
    return (
      <div className="min-h-screen bg-background p-4 pb-20 max-w-md mx-auto relative">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="absolute top-4 left-4 z-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <LockedFeature 
          title="Módulo de Nutrición" 
          description="Planifica tu dieta, cicla calorías y trackea tu suplementación con precisión profesional." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20 max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Utensils className="text-primary" /> Nutrición
        </h1>
      </div>

      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">Log Diario</TabsTrigger>
          <TabsTrigger value="strategy">Estrategia</TabsTrigger>
        </TabsList>

        {/* --- DAILY LOG TAB --- */}
        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Hoy</CardTitle>
              <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Day Type */}
              <div className="space-y-2">
                <Label>Tipo de Día</Label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={dayType === t ? "default" : "outline"}
                      className="flex-1 capitalize"
                      onClick={() => setDayType(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Adherence */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Adherencia a la Dieta</Label>
                  <span className="font-bold">{adherence}/10</span>
                </div>
                <Slider 
                  value={[adherence]} 
                  min={1} max={10} step={1} 
                  onValueChange={(v) => setAdherence(v[0])} 
                />
              </div>

              {/* Calories */}
              <div className="space-y-2">
                <Label>Calorías Consumidas (Estimado)</Label>
                <Input 
                  type="number" 
                  placeholder={calories.toString()}
                  value={dailyCalories}
                  onChange={(e) => setDailyCalories(e.target.value)}
                />
              </div>

              {/* Supplements Checklist */}
              {supplements.length > 0 && (
                <div className="space-y-3">
                  <Label>Suplementación</Label>
                  <div className="grid gap-2">
                    {supplements.map((s) => (
                      <div key={s.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                        <Checkbox 
                          id={s.id} 
                          checked={suppsTaken.includes(s.id)}
                          onCheckedChange={() => toggleSuppTaken(s.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={s.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {s.name} <span className="text-xs text-muted-foreground">({s.timing})</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea 
                  placeholder="¿Hambre? ¿Digestión? ¿Antojos?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button className="w-full h-12" onClick={logDay} disabled={loading}>
                {loading ? "Guardando..." : "Registrar Día"}
              </Button>

            </CardContent>
          </Card>
        </TabsContent>

        {/* --- STRATEGY TAB --- */}
        <TabsContent value="strategy" className="space-y-4">
          
          {/* Diet Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="w-4 h-4"/> Estrategia Nutricional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Estrategia</Label>
                <Select value={dietType} onValueChange={(v: any) => setDietType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Dieta Fija (Lineal)</SelectItem>
                    <SelectItem value="cycling">Ciclado (Días Altos/Bajos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Objetivo Calórico Base</Label>
                <Input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Proteína (g)</Label>
                  <Input type="number" value={macros.p} onChange={(e) => setMacros({...macros, p: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Carbos (g)</Label>
                  <Input type="number" value={macros.c} onChange={(e) => setMacros({...macros, c: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Grasas (g)</Label>
                  <Input type="number" value={macros.f} onChange={(e) => setMacros({...macros, f: Number(e.target.value)})} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplement Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pill className="w-4 h-4"/> Stack de Suplementos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {supplements.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.dosage} • {s.timing.toUpperCase()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeSupplement(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                <Label>Agregar Suplemento</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Nombre (ej: Creatina)" value={newSuppName} onChange={(e) => setNewSuppName(e.target.value)} />
                  <Input placeholder="Dosis (ej: 5g)" value={newSuppDosage} onChange={(e) => setNewSuppDosage(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Select value={newSuppTiming} onValueChange={(v: any) => setNewSuppTiming(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fasted">Ayunas</SelectItem>
                      <SelectItem value="pre">Pre-Workout</SelectItem>
                      <SelectItem value="intra">Intra-Workout</SelectItem>
                      <SelectItem value="post">Post-Workout</SelectItem>
                      <SelectItem value="meal">Con Comidas</SelectItem>
                      <SelectItem value="night">Noche</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addSupplement} disabled={!newSuppName}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={saveConfig} disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> Guardar Estrategia
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}