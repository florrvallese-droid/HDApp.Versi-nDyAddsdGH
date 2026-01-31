import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CheckinLog {
  id: string;
  created_at: string;
  data: {
    weight: number;
    photos: string[]; // Paths
  }
}

interface ComparisonGalleryProps {
  userId: string;
}

export function ComparisonGallery({ userId }: ComparisonGalleryProps) {
  const [logs, setLogs] = useState<CheckinLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [view, setView] = useState<'front' | 'side' | 'back'>('front');

  const [leftUrl, setLeftUrl] = useState<string | null>(null);
  const [rightUrl, setRightUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  useEffect(() => {
    if (leftId) loadPhotoUrl(leftId, view, setLeftUrl);
    else setLeftUrl(null);
  }, [leftId, view, logs]);

  useEffect(() => {
    if (rightId) loadPhotoUrl(rightId, view, setRightUrl);
    else setRightUrl(null);
  }, [rightId, view, logs]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'checkin')
      .order('created_at', { ascending: false }); // Newest first

    if (data) {
      setLogs(data);
      // Default selection: newest vs oldest (if enough data)
      if (data.length > 0) {
        setRightId(data[0].id); // Newest on right
        if (data.length > 1) {
            setLeftId(data[data.length - 1].id); // Oldest on left
        } else {
            setLeftId(data[0].id);
        }
      }
    }
    setLoading(false);
  };

  const loadPhotoUrl = async (logId: string, photoType: string, setUrl: (s: string | null) => void) => {
    const log = logs.find(l => l.id === logId);
    if (!log || !log.data.photos || log.data.photos.length === 0) {
        setUrl(null);
        return;
    }

    // Try to find a photo that matches the type (filename convention)
    const photoPath = log.data.photos.find((p: string) => p.includes(`_${photoType}.`));
    
    if (photoPath) {
        const { data } = await supabase.storage.from('checkin_photos').createSignedUrl(photoPath, 3600);
        setUrl(data?.signedUrl || null);
    } else {
        setUrl(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-zinc-500"/></div>;

  if (logs.length === 0) return <div className="text-center p-8 text-zinc-500 text-sm">No hay registros con fotos para comparar.</div>;

  return (
    <div className="space-y-4">
      
      {/* View Selector */}
      <div className="flex justify-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
         {(['front', 'side', 'back'] as const).map(v => (
            <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${view === v ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                {v === 'front' ? 'Frente' : v === 'side' ? 'Perfil' : 'Espalda'}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        
        {/* LEFT IMAGE */}
        <div className="space-y-2">
            <Select value={leftId} onValueChange={setLeftId}>
                <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Fecha A" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {logs.map(log => (
                        <SelectItem key={log.id} value={log.id}>
                            {format(new Date(log.created_at), "d MMM yy", { locale: es })} ({log.data.weight}kg)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Card className="aspect-[3/4] bg-zinc-950 border-zinc-800 overflow-hidden relative group">
                {leftUrl ? (
                    <img src={leftUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs uppercase font-bold">Sin foto</div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-zinc-300 backdrop-blur-sm">
                    ANTES
                </div>
            </Card>
        </div>

        {/* RIGHT IMAGE */}
        <div className="space-y-2">
            <Select value={rightId} onValueChange={setRightId}>
                <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Fecha B" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {logs.map(log => (
                        <SelectItem key={log.id} value={log.id}>
                            {format(new Date(log.created_at), "d MMM yy", { locale: es })} ({log.data.weight}kg)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Card className="aspect-[3/4] bg-zinc-950 border-zinc-800 overflow-hidden relative group">
                {rightUrl ? (
                    <img src={rightUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs uppercase font-bold">Sin foto</div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-green-400 backdrop-blur-sm">
                    DESPUÉS
                </div>
            </Card>
        </div>

      </div>

      {/* Delta Stats */}
      {leftId && rightId && (
        <div className="flex items-center justify-center gap-2 p-2 bg-zinc-900/50 rounded border border-zinc-800">
             <ArrowRightLeft className="w-3 h-3 text-zinc-500" />
             <span className="text-xs text-zinc-400 font-medium">
                Diferencia de peso: 
                <span className={`ml-1 font-bold ${(logs.find(l=>l.id===rightId)?.data.weight || 0) - (logs.find(l=>l.id===leftId)?.data.weight || 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {((logs.find(l=>l.id===rightId)?.data.weight || 0) - (logs.find(l=>l.id===leftId)?.data.weight || 0)).toFixed(1)}kg
                </span>
             </span>
        </div>
      )}

    </div>
  );
}