"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { 
    Briefcase, DollarSign, Activity, TrendingUp, 
    ArrowRight, Clock, ShieldAlert, Sparkles, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface BriefCard {
  type: 'FINANCIAL' | 'RETENTION' | 'GROWTH';
  title: string;
  body_markdown: string;
  action_label: string;
  action_link: string;
}

interface SmartBriefingProps {
  data: {
    greeting_title: string;
    estimated_time_to_clear: string;
    cards: BriefCard[];
  } | null;
  loading: boolean;
}

export function SmartBriefing({ data, loading }: SmartBriefingProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-6 w-64 bg-zinc-900 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-950 border border-zinc-900 rounded-2xl" />)}
            </div>
        </div>
    );
  }

  if (!data || !data.cards.length) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl font-black italic uppercase tracking-tight text-white">
            {data.greeting_title}
        </h2>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-500 font-bold py-1 px-3">
            <Clock className="w-3 h-3 mr-1.5" /> Tiempo Est: {data.estimated_time_to_clear}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.cards.map((card, idx) => (
          <Card 
            key={idx} 
            className={cn(
                "bg-zinc-950 border-zinc-900 overflow-hidden flex flex-col transition-all hover:border-zinc-800 shadow-xl",
                card.type === 'FINANCIAL' ? "border-l-4 border-l-red-500" :
                card.type === 'RETENTION' ? "border-l-4 border-l-yellow-500" :
                "border-l-4 border-l-green-500"
            )}
          >
            <CardHeader className="pb-2 bg-zinc-900/30">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    {card.type === 'FINANCIAL' && <DollarSign className="w-3 h-3 text-red-500" />}
                    {card.type === 'RETENTION' && <ShieldAlert className="w-3 h-3 text-yellow-500" />}
                    {card.type === 'GROWTH' && <Sparkles className="w-3 h-3 text-green-500" />}
                    {card.title}
               </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-5 flex flex-col justify-between gap-6">
                <MarkdownRenderer content={card.body_markdown} className="text-xs text-zinc-400 leading-relaxed" />
                <Button 
                    variant="ghost" 
                    className="w-full justify-between h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-white group"
                    onClick={() => navigate(card.action_link)}
                >
                    {card.action_label}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}