import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeftRight, Check, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CheckinLog {
  id: string;
  created_at: string;
  data: {
    weight: number;
    photos?: string[];
    notes?: string;
  };
}

interface ComparisonGalleryProps {
  logs: CheckinLog[];
}

export function ComparisonGallery({ logs }: ComparisonGalleryProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter logs that actually have photos
  const photoLogs = logs.filter(log => log.data.photos && log.data.photos.length > 0);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // If 2 already selected, replace the oldest selection (first one)
        setSelectedIds([selectedIds[1], id]);
      }
    }
  };

  const selectedLogs = photoLogs
    .filter(log => selectedIds.includes(log.id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Sort chronological

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" /> Galería
        </h3>
        
        {selectedIds.length === 2 && (
          <Button 
            size="sm" 
            onClick={() => setShowComparison(true)}
            className="bg-primary hover:bg-primary/90 text-white animate-in zoom-in"
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" /> Comparar (2)
          </Button>
        )}
      </div>

      {photoLogs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-lg text-zinc-500">
           Sube fotos en tus check-ins para verlas aquí.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photoLogs.map((log) => {
            const isSelected = selectedIds.includes(log.id);
            const coverPhoto = log.data.photos?.[0]; // Assuming first photo is front/cover
            
            const photoUrl = coverPhoto?.startsWith('http') 
              ? coverPhoto 
              : `https://tpypdprmcodqyzrysvxi.supabase.co/storage/v1/object/public/checkin_photos/${coverPhoto}`;

            return (
              <div 
                key={log.id} 
                className={cn(
                  "relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all group",
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-zinc-700"
                )}
                onClick={() => toggleSelection(log.id)}
              >
                <img 
                  src={photoUrl} 
                  alt="Checkin" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 flex flex-col justify-end p-2">
                   <span className="text-xs font-bold text-white">
                      {format(new Date(log.created_at), "d MMM", { locale: es })}
                   </span>
                   <span className="text-[10px] text-zinc-400">
                      {log.data.weight} kg
                   </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl w-[95vw] h-[80vh] bg-zinc-950 border-zinc-800 p-0 overflow-hidden flex flex-col">
           <div className="p-4 bg-black/50 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white">Comparativa</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>Cerrar</Button>
           </div>
           
           <div className="flex-1 grid grid-cols-2 gap-px bg-zinc-800 overflow-y-auto">
              {selectedLogs.map((log, idx) => (
                <div key={log.id} className="bg-black flex flex-col p-2 gap-2">
                   <div className="text-center py-2 border-b border-zinc-900">
                      <p className="font-bold text-primary uppercase text-sm">
                         {idx === 0 ? "ANTES" : "DESPUÉS"}
                      </p>
                      <p className="text-xs text-zinc-400">
                         {format(new Date(log.created_at), "dd MMM yyyy", { locale: es })}
                      </p>
                      <p className="text-lg font-black text-white">
                         {log.data.weight} <span className="text-xs font-normal text-zinc-500">kg</span>
                      </p>
                   </div>
                   
                   <div className="flex-1 space-y-2 overflow-y-auto">
                      {log.data.photos?.map((photo, pIdx) => {
                         const url = photo.startsWith('http') 
                          ? photo 
                          : `https://tpypdprmcodqyzrysvxi.supabase.co/storage/v1/object/public/checkin_photos/${photo}`;
                         return (
                           <div key={pIdx} className="rounded-lg overflow-hidden border border-zinc-900">
                              <img src={url} className="w-full object-contain" />
                           </div>
                         );
                      })}
                   </div>
                   
                   {log.data.notes && (
                      <div className="p-3 bg-zinc-900/50 rounded text-xs text-zinc-400 italic">
                         "{log.data.notes}"
                      </div>
                   )}
                </div>
              ))}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}