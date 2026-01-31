import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, ShieldAlert, Lock, Plus, Syringe, Pill, FileText, Trash2, Activity } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Compound, PharmaCycle } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Badge } from "@/components/ui/badge";

export default function Pharmacology() {
  const navigate = useNavigate();
  const { profile, hasProAccess, loading: profileLoading } = useProfile();
  
  // Disclaimer State
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Data State
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [cycleName, setCycleName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [compounds, setCompounds] = useState<Compound[]>([]);

  // Compound Input
  const [compName, setCompName] = useState("");
  const [compDosage, setCompDosage] = useState("");
  const [compType, setCompType] = useState<'injectable' | 'oral' | 'ancillary'>("injectable");

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
      type: compType
    };
    setCompounds([...compounds, newComp]);
    setCompName("");
    setCompDosage("");
  };

  const removeCompound = (id: string) => {
    setCompounds(compounds.filter(c => c.id !== id));
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
      compounds,
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
    if (!hasProAccess) {
      setShowUpgradeModal(true);
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este registro? Esta acción es irreversible.")) return;
    
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (error) toast.error("Error al eliminar");
    else {
      toast.success("Registro eliminado");
      fetchCycles();
    }
  };

  // Loading State
  if (profileLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 pb-20 max-w-md mx-auto space-y-6">
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        featureName="Farmacología"
      />
      
      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={(open) => { if(!open && !accepted) handleDecline(); }}>
        <DialogContent className="border-red-900/50 bg-zinc-900 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-900/20 p-3 rounded-full w-fit mb-2">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-500">AVISO DE SALUD Y LEGALIDAD</DialogTitle>
            <DialogDescription className="text-zinc-400 text-center">
              Esta sección es estrictamente para <strong>REGISTRO PERSONAL</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/30 text-sm space-y-3 text-left">
            <p className="flex gap-2"><span className="text-red-500 font-bold">1.</span> Heavy Duty NO recomienda, promueve ni vende sustancias controladas.</p>
            <p className="flex gap-2"><span className="text-red-500 font-bold">2.</span> El uso de sustancias exógenas conlleva riesgos graves para la salud.</p>
            <p className="flex gap-2 font-semibold text-red-200"><span className="text-red-500 font-bold">3.</span> Es OBLIGATORIO realizar controles médicos y analíticas de sangre periódicas bajo supervisión profesional.</p>
            <p className="flex gap-2"><span className="text-red-500 font-bold">4.</span> La información aquí guardada es privada y encriptada, pero tú eres el único responsable de tu salud y tus actos.</p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:gap-0 mt-2">
            <Button variant="destructive" className="w-full font-bold" onClick={handleAcceptDisclaimer}>
              Entiendo los riesgos y acepto
            </Button>
            <Button variant="ghost" className="w-full text-zinc-500 hover:text-white" onClick={handleDecline}>
              Cancelar y Salir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-red-500">
                <Syringe className="h-6 w-6" /> Farmacología
            </h1>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Bóveda Privada
            </p>
            </div>
        </div>
        {!hasProAccess && (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 gap-1">
            <Lock className="w-3 h-3" /> Vista Previa
          </Badge>
        )}
      </div>

      {/* Persistent Medical Alert */}
      {!showDisclaimer && (
        <Alert variant="destructive" className="bg-red-950/10 border-red-900/20 text-red-400/90">
          <Activity className="h-4 w-4" />
          <AlertTitle>Supervisión Médica Requerida</AlertTitle>
          <AlertDescription className="text-xs">
            Asegúrate de monitorear tu salud con analíticas de sangre frecuentes. Tu bienestar es lo más importante.
          </AlertDescription>
        </Alert>
      )}

      {isCreating ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Nuevo Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Ciclo / Fase</Label>
              <Input 
                placeholder="Ej: Volumen 2026" 
                className="bg-zinc-950 border-zinc-800"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input 
                  type="date" 
                  className="bg-zinc-950 border-zinc-800"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin (Est.)</Label>
                <Input 
                  type="date" 
                  className="bg-zinc-950 border-zinc-800"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Compounds Section */}
            <div className="space-y-3 pt-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Compuestos</Label>
              
              {compounds.map((c) => (
                <div key={c.id} className="flex justify-between items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {c.type === 'injectable' ? <Syringe className="h-3 w-3 text-red-400"/> : c.type === 'oral' ? <Pill className="h-3 w-3 text-blue-400"/> : <ShieldAlert className="h-3 w-3 text-yellow-400"/>}
                      {c.name}
                    </p>
                    <p className="text-xs text-zinc-500">{c.dosage}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCompound(c.id)} className="h-6 w-6">
                    <Trash2 className="h-3 w-3 text-zinc-500 hover:text-red-500"/>
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input 
                    placeholder="Compuesto" 
                    className="h-8 text-xs bg-zinc-950 border-zinc-800"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                  />
                  <Input 
                    placeholder="Dosis (ej: 500mg/sem)" 
                    className="h-8 text-xs bg-zinc-950 border-zinc-800"
                    value={compDosage}
                    onChange={(e) => setCompDosage(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 justify-between">
                   <Select value={compType} onValueChange={(v: any) => setCompType(v)}>
                    <SelectTrigger className="h-8 w-[100px] text-xs bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="injectable">Inject.</SelectItem>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="ancillary">Ancillary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={addCompound} className="h-8 w-full bg-zinc-800 hover:bg-zinc-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas Privadas</Label>
              <Textarea 
                placeholder="Protocolo, sensaciones, analíticas..." 
                className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 border-zinc-800 text-zinc-400" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white relative overflow-hidden" onClick={saveCycle} disabled={loading}>
                 {!hasProAccess && <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10"><Lock className="w-4 h-4 mr-2"/> PRO</div>}
                {loading ? "Guardando..." : "Guardar Registro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800" onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Registro
          </Button>

          {loading ? (
            <div className="text-center text-zinc-500 text-sm py-10">Cargando bóveda...</div>
          ) : cycles.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-10 border border-dashed border-zinc-800 rounded-lg">
              No hay registros activos.
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <Card key={cycle.id} className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">{cycle.data.name}</CardTitle>
                        <CardDescription className="text-zinc-500 text-xs">
                          {format(new Date(cycle.data.start_date), 'dd MMM yyyy')}
                          {cycle.data.end_date ? ` - ${format(new Date(cycle.data.end_date), 'dd MMM yyyy')}` : ' - En curso'}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-red-500" onClick={() => deleteCycle(cycle.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {cycle.data.compounds?.map((c: Compound, i: number) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-xs">
                           {c.type === 'injectable' ? <Syringe className="h-3 w-3 mr-1 text-red-500"/> : c.type === 'oral' ? <Pill className="h-3 w-3 mr-1 text-blue-500"/> : <ShieldAlert className="h-3 w-3 mr-1 text-yellow-500"/>}
                           {c.name} ({c.dosage})
                        </span>
                      ))}
                    </div>
                    {cycle.data.notes && (
                      <div className="bg-zinc-950/50 p-2 rounded text-xs text-zinc-400 italic">
                        "{cycle.data.notes}"
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}