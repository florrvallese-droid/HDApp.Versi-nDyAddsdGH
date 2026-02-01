import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, ShieldAlert, Lock, Plus, Syringe, Pill, FileText, Trash2, Activity, Clock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Compound, PharmaCycle } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";

const TIMING_ORDER = ['fasted', 'pre', 'intra', 'post', 'meal', 'night'];

const getTimingLabel = (t: string) => {
  switch (t) {
    case 'fasted': return 'Ayunas';
    case 'pre': return 'Pre Entreno';
    case 'intra': return 'Intra Entreno';
    case 'post': return 'Post Entreno';
    case 'night': return 'Noche';
    case 'meal': return 'Comidas';
    default: return 'Otros';
  }
};

export default function Pharmacology() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([]);

  const [compName, setCompName] = useState("");
  const [compDosage, setCompDosage] = useState("");
  const [compType, setCompType] = useState<'injectable' | 'oral' | 'ancillary'>("injectable");
  const [compTiming, setCompTiming] = useState<Compound['timing']>("fasted");

  useEffect(() => {
    if (accepted && profile) {
      fetchCycles();
    }
  }, [accepted, profile]);

  const fetchCycles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', profile!.user_id)
      .eq('type', 'pharmacology')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCycles(data);
    }
    setLoading(false);
  };

  const handleAcceptDisclaimer = () => {
    setAccepted(true);
    setShowDisclaimer(false);
  };

  const handleDecline = () => {
    navigate('/dashboard');
  };

  const addCompound = () => {
    if (!compName || !compDosage) return;
    const newComp: Compound = {
      id: crypto.randomUUID(),
      name: compName,
      dosage: compDosage,
      type: compType,
      timing: compTiming
    };
    setCompounds([...compounds, newComp]);
    setCompName("");
    setCompDosage("");
  };

  const removeCompound = (id: string) => {
    setCompounds(compounds.filter(c => c.id !== id));
  };

  const sortCompounds = (list: Compound[]) => {
    return [...list].sort((a, b) => {
      const idxA = TIMING_ORDER.indexOf(a.timing || 'meal');
      const idxB = TIMING_ORDER.indexOf(b.timing || 'meal');
      return idxA - idxB;
    });
  };

  const saveCycle = async () => {
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    if (!cycleName || !profile) return;
    
    setLoading(true);
    const cycleData: PharmaCycle = {
      name: cycleName,
      start_date: startDate,
      end_date: endDate,
      compounds: sortCompounds(compounds),
      notes
    };

    const { error } = await supabase.from('logs').insert({
      user_id: profile.user_id,
      type: 'pharmacology',
      data: cycleData,
      created_at: new Date().toISOString()
    });

    setLoading(false);
    if (error) {
      toast.error("Error al guardar ciclo");
    } else {
      toast.success("Ciclo registrado en bóveda privada");
      setIsCreating(false);
      resetForm();
      fetchCycles();
    }
  };

  const resetForm = () => {
    setCycleName("");
    setNotes("");
    setCompounds([]);
    setStartDate(format(new Date(), "yyyy-MM-dd"));
  };

  const deleteCycle = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro? Esta acción es irreversible.")) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Registro eliminado");
      fetchCycles();
    }
  };

  if (profileLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 pb-20 max-w-md mx-auto space-y-6">
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} featureName="Farmacología" />
      
      <Dialog open={showDisclaimer} onOpenChange={(open) => { if(!open && !accepted) handleDecline(); }}>
        <DialogContent className="border-red-900/50 bg-zinc-900 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-500">AVISO DE SALUD Y LEGALIDAD</DialogTitle>
          </DialogHeader>
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/30 text-sm space-y-3">
            <p>1. Esta sección es estrictamente para <strong>REGISTRO PERSONAL</strong>.</p>
            <p>2. Heavy Duty NO recomienda el uso de sustancias controladas.</p>
            <p>3. Es obligatorio realizar controles médicos frecuentes.</p>
          </div>
          <DialogFooter className="flex-col gap-2 mt-2">
            <Button variant="destructive" className="w-full font-bold" onClick={handleAcceptDisclaimer}>Entiendo y acepto</Button>
            <Button variant="ghost" className="w-full text-zinc-500" onClick={handleDecline}>Salir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
            <Syringe className="h-6 w-6" /> Farmacología
          </h1>
        </div>
      </div>

      {isCreating ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>Nuevo Registro</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Ciclo</Label>
              <Input placeholder="Ej: Volumen Invierno" className="bg-zinc-950 border-zinc-800" value={cycleName} onChange={(e) => setCycleName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input type="date" className="bg-zinc-950 border-zinc-800" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fin (Est.)</Label>
                <Input type="date" className="bg-zinc-950 border-zinc-800" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-zinc-400 text-xs uppercase font-bold">Compuestos</Label>
              
              {sortCompounds(compounds).map((c) => (
                <div key={c.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div className="flex gap-3 items-center">
                    <div className="bg-zinc-900 px-2 py-1 rounded text-[9px] font-black uppercase text-zinc-500 border border-zinc-800">
                        {getTimingLabel(c.timing || 'meal')}
                    </div>
                    <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                        {c.type === 'injectable' ? <Syringe className="h-3 w-3 text-red-400"/> : c.type === 'oral' ? <Pill className="h-3 w-3 text-blue-400"/> : <ShieldAlert className="h-3 w-3 text-yellow-400"/>}
                        {c.name}
                        </p>
                        <p className="text-xs text-zinc-500">{c.dosage}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCompound(c.id)} className="h-6 w-6"><Trash2 className="h-3 w-3 text-zinc-500 hover:text-red-500"/></Button>
                </div>
              ))}

              <div className="space-y-2 p-3 bg-zinc-950 rounded border border-zinc-800 border-dashed">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Compuesto" className="h-9 text-xs bg-zinc-900 border-zinc-800" value={compName} onChange={(e) => setCompName(e.target.value)} />
                  <Input placeholder="Dosis (ej: 250mg)" className="h-9 text-xs bg-zinc-900 border-zinc-800" value={compDosage} onChange={(e) => setCompDosage(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={compType} onValueChange={(v: any) => setCompType(v)}>
                    <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injectable">Inyectable</SelectItem>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="ancillary">Ancilar / PCT</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={compTiming} onValueChange={(v: any) => setCompTiming(v)}>
                    <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fasted">Ayunas</SelectItem>
                      <SelectItem value="pre">Pre Entreno</SelectItem>
                      <SelectItem value="intra">Intra Entreno</SelectItem>
                      <SelectItem value="post">Post Entreno</SelectItem>
                      <SelectItem value="meal">Comidas</SelectItem>
                      <SelectItem value="night">Noche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={addCompound} className="w-full h-8 bg-zinc-800 hover:bg-zinc-700"><Plus className="h-4 w-4 mr-2" /> Agregar al Ciclo</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas Privadas</Label>
              <Textarea placeholder="Analíticas, sensaciones..." className="bg-zinc-950 border-zinc-800" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={saveCycle} disabled={loading || compounds.length === 0}>
                {loading ? "Guardando..." : "Guardar Ciclo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button className="w-full bg-zinc-900 border border-zinc-800 py-6" onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Registro de Farmacología
          </Button>

          {cycles.map((cycle) => (
            <Card key={cycle.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardHeader className="bg-zinc-950/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">{cycle.data.name}</CardTitle>
                    <CardDescription className="text-zinc-500 text-xs">
                      {format(new Date(cycle.data.start_date), 'dd MMM yyyy')}
                      {cycle.data.end_date ? ` - ${format(new Date(cycle.data.end_date), 'dd MMM yyyy')}` : ' - En curso'}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600" onClick={() => deleteCycle(cycle.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid gap-2">
                    {cycle.data.compounds?.map((c: Compound, i: number) => (
                    <div key={i} className="flex items-center justify-between border-b border-zinc-800/50 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                            <span className="text-[8px] font-black uppercase text-red-500 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30 min-w-[70px] text-center">
                                {getTimingLabel(c.timing || 'meal')}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-200">{c.name}</span>
                                <span className="text-[10px] text-zinc-500">{c.dosage}</span>
                            </div>
                        </div>
                        {c.type === 'injectable' ? <Syringe className="h-3 w-3 text-red-500/50"/> : <Pill className="h-3 w-3 text-blue-500/50"/>}
                    </div>
                    ))}
                </div>
                {cycle.data.notes && <div className="bg-zinc-950/50 p-2 rounded text-[10px] text-zinc-500 italic">"{cycle.data.notes}"</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}