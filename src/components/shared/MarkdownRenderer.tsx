import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  if (!content) return null;

  // Helper para parsear negritas (**texto**) dentro de una línea
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={i} className="font-black text-white">
            {part.slice(2, -2)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Dividir por líneas
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-3 text-sm text-zinc-400", className)}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return <div key={index} className="h-2" />; // Espacio para líneas vacías

        // 1. Títulos Pequeños (###) -> Rojo Marca, Mayúsculas
        if (trimmedLine.startsWith("### ")) {
          return (
            <h3 key={index} className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider mt-4 mb-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {trimmedLine.replace("### ", "")}
            </h3>
          );
        }

        // 2. Títulos Grandes (##) -> Blanco, Border Bottom
        if (trimmedLine.startsWith("## ")) {
          return (
            <h2 key={index} className="text-lg font-black text-white border-b border-zinc-800 pb-1 mt-6 mb-3 uppercase italic tracking-tight">
              {trimmedLine.replace("## ", "")}
            </h2>
          );
        }

        // 3. Listas / Viñetas (- o *)
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          return (
            <div key={index} className="flex items-start gap-2 pl-1">
              <span className="text-red-500 font-bold mt-1.5 text-[10px]">•</span>
              <p className="leading-relaxed">{parseBold(trimmedLine.substring(2))}</p>
            </div>
          );
        }

        // 4. Listas Numeradas (1.)
        if (/^\d+\.\s/.test(trimmedLine)) {
          const [number, ...rest] = trimmedLine.split(".");
          return (
            <div key={index} className="flex items-start gap-2 pl-1 mb-1">
              <span className="text-red-500 font-mono font-bold text-xs mt-0.5">{number}.</span>
              <p className="leading-relaxed">{parseBold(rest.join(".").trim())}</p>
            </div>
          );
        }

        // 5. Párrafo normal (con soporte de negritas)
        return (
          <p key={index} className="leading-relaxed">
            {parseBold(trimmedLine)}
          </p>
        );
      })}
    </div>
  );
};