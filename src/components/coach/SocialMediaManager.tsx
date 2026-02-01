"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
    Instagram, Share2, Sparkles, Loader2, Camera, 
    ArrowRight, Trophy, Download, Copy, Check, MessageSquare
} from "lucide-react";
import { supabase } from "@/services/supabase";
import { aiService } from "@/services/ai";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import html2canvas from "html2canvas";

export function SocialMediaManager() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [content, setContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
        .from('coach_assignments')
        .select('athlete:athlete_id(user_id, display_name)')
        .eq('coach_id', user?.id)
        .eq('status', 'active');
    
    if (data) setAthletes(data.map(d => d.athlete));
    setLoading(false);
  };

  const generateMarketingContent = async (type: 'milestone' | 'before_after') => {
    if (!selectedAthleteId) {
        toast.error("Selecciona un alumno primero");
        return;
    }

    setGenerating(true);
    try {
        // 1. Obtener datos del alumno para la IA
        const { data: logs } = await supabase
            .from('logs')
            .select('*')
            .eq('user_id', selectedAthleteId)
            .order('created_at', { ascending: false })
            .limit(10);

        const athlete = athletes.find(a => a.user_id === selectedAthleteId);
        
        const summary = {
            type: 'marketing_generation',
            format: type,
            athleteName: athlete.display_name,
            recentActivity: logs?.map(l => ({ type: l.type, data: l.data }))
        };

        // 2. Llamada a IA (usando un prompt específico)
        const result = await aiService.getGlobalAnalysis('motivational', summary);
        setContent({
            ...result,
            type,
            athleteName: athlete.display_name,
            date: format(new Date(), "dd/MM/yyyy")
        });
        toast.success("Contenido generado con éxito");
    } catch (err) {
        toast.error("Error al generar contenido");
    } finally {
        setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!content?.overall_assessment) return;
    navigator.clipboard.writeText(content.overall_assessment);
    setCopied(true);
    toast.success("Texto copiado para Instagram");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#000' });
    const link = document.createElement('a');
    link.download = `HD-MARKETING-${content.athleteName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTOR DE SELECCIÓN */}
      <Card className="bg-zinc-950 border-zinc-900">
        <CardHeader className="pb-4">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" /> Creador de Casos de Éxito
            </CardTitle>
            <CardDescription className="text-xs">Usa la IA para transformar los datos de tus alumnos en contenido viral.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label className="text-[10px] text-zinc-500 uppercase font-bold">Seleccionar Atleta</Label>
                <Select value={selectedAthleteId} onValueChange={setSelectedAthleteId}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 h-11">
                        <SelectValue placeholder="Busca en tu equipo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        {athletes.map(a => (
                            <SelectItem key={a.user_id} value={a.user_id}>{a.display_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                    variant="outline" 
                    className="bg-zinc-900 border-zinc-800 h-14 font-bold uppercase text-[10px] flex flex-col gap-1 items-center justify-center hover:bg-zinc-800 hover:text-white"
                    onClick={() => generateMarketingContent('before_after')}
                    disabled={generating || !selectedAthleteId}
                >
                    <Camera className="h-4 w-4 text-red-500" />
                    Copy Antes y Después
                </Button>
                <Button 
                    variant="outline" 
                    className="bg-zinc-900 border-zinc-800 h-14 font-bold uppercase text-[10px] flex flex-col gap-1 items-center justify-center hover:bg-zinc-800 hover:text-white"
                    onClick={() => generateMarketingContent('milestone')}
                    disabled={generating || !selectedAthleteId}
                >
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Hito de Progreso
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* RESULTADO IA */}
      {generating && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-red-600" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500 animate-pulse">Analizando logros para el post...</p>
          </div>
      )}

      {content && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* Preview de Tarjeta Social */}
             <div className="flex flex-col items-center gap-4">
                <Label className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Vista Previa de la Placa</Label>
                
                <div 
                    ref={cardRef}
                    className="w-[320px] aspect-square bg-black border-4 border-zinc-900 p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 blur-[60px] rounded-full" />
                    
                    <div className="z-10">
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">HEAVY DUTY<br/>SYSTEM</h2>
                        <div className="h-1 w-12 bg-red-600 mt-2" />
                    </div>

                    <div className="z-10 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Logro del Atleta</p>
                        <h3 className="text-4xl font-black uppercase text-white leading-none tracking-tighter">{content.athleteName}</h3>
                        <p className="text-sm text-zinc-400 font-bold uppercase italic leading-tight">
                            {content.top_patterns?.[0]?.pattern || "Progreso real detectado en la bitácora."}
                        </p>
                    </div>

                    <div className="z-10 flex justify-between items-end border-t border-zinc-900 pt-4">
                        <div>
                            <p className="text-[8px] font-black uppercase text-zinc-600">Preparador</p>
                            <p className="text-[10px] font-bold text-white uppercase italic">DI IORIO HIGH PERFORMANCE</p>
                        </div>
                        <p className="text-[8px] font-mono text-zinc-700">{content.date}</p>
                    </div>
                </div>

                <Button onClick={downloadCard} size="sm" className="bg-zinc-900 border border-zinc-800 text-white font-bold text-[10px] uppercase">
                    <Download className="h-3 w-3 mr-2" /> Descargar para Story
                </Button>
             </div>

             {/* Copy para Instagram */}
             <Card className="bg-zinc-950 border-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" /> Copy Sugerido (Instagram)
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-zinc-600" />}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="bg-black/50 p-4 rounded-lg border border-zinc-900">
                        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {content.overall_assessment}
                        </p>
                        <div className="mt-4 pt-4 border-t border-zinc-900 flex flex-wrap gap-2">
                            <span className="text-xs text-blue-500 font-bold">#HeavyDutySystem</span>
                            <span className="text-xs text-blue-500 font-bold">#CulturismoInteligente</span>
                            <span className="text-xs text-blue-500 font-bold">#HighPerformance</span>
                        </div>
                    </div>
                </CardContent>
             </Card>

          </div>
      )}

    </div>
  );
}