import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, X, Plus, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(90); // Default 90s
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      // Optional: Play sound here
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (seconds: number) => {
    const newTime = Math.max(0, timeLeft + seconds);
    setTimeLeft(newTime);
    // Also update initial time if we are not active, so reset goes to new time
    if (!isActive) setInitialTime(newTime);
  };

  const setPreset = (seconds: number) => {
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Minimized View (Floating Button)
  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-12 w-12 rounded-full shadow-lg border-2 transition-all",
            isActive && timeLeft > 0
              ? "bg-red-600 border-red-500 text-white animate-pulse" 
              : "bg-zinc-900 border-zinc-700 text-zinc-400"
          )}
          size="icon"
        >
          {isActive && timeLeft > 0 ? (
            <span className="text-xs font-bold">{formatTime(timeLeft)}</span>
          ) : (
            <Timer className="h-6 w-6" />
          )}
        </Button>
      </div>
    );
  }

  // Expanded View
  return (
    <div className="fixed bottom-24 right-4 z-40 w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
      {/* Header */}
      <div className="bg-zinc-900/50 p-3 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-400">
          <Timer className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Descanso</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Main Display */}
      <div className="p-4 flex flex-col items-center">
        <div className="text-5xl font-black font-mono text-white mb-4 tracking-tight">
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full border-zinc-700 hover:bg-zinc-800"
            onClick={() => adjustTime(-10)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Button 
            size="icon" 
            className={cn(
              "h-14 w-14 rounded-full shadow-lg",
              isActive ? "bg-zinc-800 hover:bg-zinc-700" : "bg-red-600 hover:bg-red-700"
            )}
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full border-zinc-700 hover:bg-zinc-800"
            onClick={() => adjustTime(10)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 w-full justify-center">
             <Button variant="ghost" size="sm" onClick={resetTimer} className="text-zinc-500 hover:text-white">
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
             </Button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-2 w-full mt-2 pt-4 border-t border-zinc-900">
          {[30, 60, 90, 120].map((sec) => (
            <button
              key={sec}
              onClick={() => setPreset(sec)}
              className="bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-400 py-2 rounded transition-colors"
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}