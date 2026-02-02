import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/services/supabase";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export function CoachApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    instagram: "",
    student_count: "",
    current_system: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_count || !formData.current_system) {
      toast.error("Por favor completá todos los campos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('coach_applications').insert([formData]);
      if (error) throw error;
      setSubmitted(true);
      toast.success("Solicitud enviada correctamente");
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto bg-green-500/20 p-4 rounded-full w-fit">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-2xl font-black uppercase italic text-white">Solicitud Recibida</h3>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto">
          Analizaremos tu perfil y te contactaremos por Instagram si aplicás para las vacantes de fundadores.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Nombre Completo</Label>
        <Input 
          required
          value={formData.full_name}
          onChange={e => setFormData({...formData, full_name: e.target.value})}
          className="bg-zinc-900 border-zinc-800 h-12 text-white font-bold"
          placeholder="Tu nombre"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Usuario de Instagram</Label>
        <Input 
          required
          value={formData.instagram}
          onChange={e => setFormData({...formData, instagram: e.target.value})}
          className="bg-zinc-900 border-zinc-800 h-12 text-white font-bold"
          placeholder="@tu.perfil"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">¿Cuántos alumnos tenés hoy?</Label>
        <Select onValueChange={v => setFormData({...formData, student_count: v})}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 h-12 text-white font-bold">
            <SelectValue placeholder="Seleccionar cantidad" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            <SelectItem value="less_10">Menos de 10</SelectItem>
            <SelectItem value="10_30">Entre 10 y 30</SelectItem>
            <SelectItem value="plus_50">Más de 50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">¿Qué sistema usás actualmente?</Label>
        <Select onValueChange={v => setFormData({...formData, current_system: v})}>
          <SelectTrigger className="bg-zinc-900 border-zinc-800 h-12 text-white font-bold">
            <SelectValue placeholder="Seleccionar sistema" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
            <SelectItem value="excel">Excel / Google Sheets</SelectItem>
            <SelectItem value="app">Otra App</SelectItem>
            <SelectItem value="none">Papel / Nada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black uppercase italic tracking-widest shadow-xl shadow-yellow-900/20"
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "QUIERO APLICAR AL FOUNDERS CLUB"}
      </Button>
      
      <p className="text-[9px] text-zinc-600 text-center uppercase font-bold tracking-tighter">
        <ShieldCheck className="h-3 w-3 inline mr-1" /> Tu información está protegida bajo cifrado Heavy Duty
      </p>
    </form>
  );
}