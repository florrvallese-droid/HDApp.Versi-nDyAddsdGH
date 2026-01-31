import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, Play, Pause, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  initialSeconds: number;
  isOpen: boolean;
  onClose: () => void;
}

export function RestTimer({ initialSeconds, isOpen, onClose }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [totalTime, setTotalTime] = useState(initialSeconds);
  
  // Audio ref for beep sound (optional, browser policy might block autoplay)
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setTotalTime(initialSeconds);
      setIsActive(true);
    }
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      // Timer finished logic here
    }

    return () => clearInterval(interval);
  }, [isOpen, isActive, secondsLeft]);

  if (!isOpen) return null;

  const progress = ((totalTime - secondsLeft) / totalTime) * 100;
  
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const adjustTime = (amount: number) => {
    setSecondsLeft(prev => {
      const newVal = Math.max(0, prev + amount);
      setTotalTime(Math.max(totalTime, newVal)); // Adjust total if we add time beyond original
      return newVal;
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-50 safe-area-bottom shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-zinc-400 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")}></span>
            Descanso
          </h3>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => setIsActive(!isActive)}>
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500" onClick={onClose}>
                <X className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-between gap-4">
           <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400" onClick={() => adjustTime(-10)}>
              <Minus className="h-5 w-5" />
           </Button>
           
           <div className={cn(
             "text-5xl font-black font-mono tabular-nums transition-colors",
             secondsLeft === 0 ? "text-green-500" : "text-white"
           )}>
              {formatTime(secondsLeft)}
           </div>

           <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400" onClick={() => adjustTime(10)}>
              <Plus className="h-5 w-5" />
           </Button>
        </div>

        {/* Custom Progress Bar */}
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative">
           <div 
             className={cn("h-full transition-all duration-1000 ease-linear", secondsLeft === 0 ? "bg-green-500" : "bg-red-600")}
             style={{ width: `${progress}%` }}
           />
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-center">
           {secondsLeft === 0 ? (
             <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wide" onClick={onClose}>
               Continuar Entreno
             </Button>
           ) : (
             <Button variant="ghost" className="text-xs text-zinc-500 hover:text-white" onClick={onClose}>
               <SkipForward className="h-3 w-3 mr-1" /> Saltar Descanso
             </Button>
           )}
        </div>

      </div>
    </div>
  );
}