import { supabase } from "./supabase";
import { GlobalAnalysisResponse } from "@/types";

export interface AIResponse {
  decision: 'TRAIN_HEAVY' | 'TRAIN_LIGHT' | 'REST';
  rationale: string;
  recommendations: string[];
}

export interface PostWorkoutAIResponse {
  verdict: 'PROGRESS' | 'PLATEAU' | 'REGRESSION';
  highlights: string[];
  corrections: string[];
  coach_quote: string;
}

export const aiService = {
  async getPreWorkoutAdvice(
    tone: string, 
    data: any
  ): Promise<AIResponse> {
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: response, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'preworkout',
          tone: tone,
          data: data,
          userId: user?.id
        }
      });

      if (error) {
        console.error("AI Service Error Details:", error);
        throw new Error(error.message || "Error conectando con IA");
      }

      if (!response) {
        throw new Error("Respuesta vacía del servidor");
      }

      return response as AIResponse;
      
    } catch (err: any) {
      console.error("Failed to call AI Coach:", err);
      // Fallback seguro
      return {
        decision: 'TRAIN_LIGHT',
        rationale: `Error de conexión (${err.message}). Por seguridad, entrena ligero o descansa.`,
        recommendations: ["Revisar conexión a internet", "Intentar nuevamente en unos minutos"]
      };
    }
  },

  async getPostWorkoutAnalysis(
    tone: string,
    data: any
  ): Promise<PostWorkoutAIResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: response, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'postworkout',
          tone: tone,
          data: data,
          userId: user?.id
        }
      });

      if (error) throw error;

      return response as PostWorkoutAIResponse;
    } catch (err) {
      console.error("Failed to call AI Coach (Post):", err);
      return {
        verdict: 'PLATEAU',
        highlights: ["Sesión completada"],
        corrections: ["Intenta aumentar peso la próxima"],
        coach_quote: "La consistencia es clave. Sigue así."
      };
    }
  },

  async getGlobalAnalysis(
    tone: string,
    summaryData: any
  ): Promise<GlobalAnalysisResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: response, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'globalanalysis',
          tone: tone,
          data: summaryData,
          userId: user?.id
        }
      });

      if (error) throw error;
      return response as GlobalAnalysisResponse;
    } catch (err) {
      console.error("Failed to call AI Coach (Global):", err);
      // Fallback
      return {
        top_patterns: [
          { pattern: "Error de análisis", evidence: "N/A", action: "Intenta más tarde" }
        ],
        performance_insights: {
          best_performing_conditions: "Desconocido",
          worst_performing_conditions: "Desconocido",
          optimal_frequency: "Desconocido"
        },
        next_14_days_plan: ["Continuar rutina actual", "Priorizar sueño"],
        red_flags: [],
        overall_assessment: "Hubo un error al procesar tus datos con la IA. Asegúrate de tener conexión estable."
      };
    }
  }
};