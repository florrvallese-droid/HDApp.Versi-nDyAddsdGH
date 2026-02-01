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
  judgment: string; // Informe detallado de la fase 3
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
        console.error("AI Service Network Error:", error);
        throw new Error(error.message || "Error de red al conectar con IA");
      }

      if (response && response.error) {
        throw new Error(response.message || "Error interno del servidor IA");
      }

      return response as AIResponse;
      
    } catch (err: any) {
      console.error("Failed to call AI Coach:", err);
      return {
        decision: 'TRAIN_LIGHT',
        rationale: `⚠️ Error: ${err.message}. Por seguridad, entrena ligero o descansa.`,
        recommendations: ["Verificar API Keys", "Revisar conexión a internet"]
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
      if (response && response.error) throw new Error(response.message);

      return response as PostWorkoutAIResponse;
    } catch (err) {
      console.error("Failed to call AI Coach (Post):", err);
      return {
        verdict: 'PLATEAU',
        highlights: ["Sesión completada"],
        corrections: ["Intenta aumentar peso la próxima"],
        coach_quote: "La consistencia es clave. Sigue así.",
        judgment: "No pudimos generar un juicio detallado debido a un error de conexión, pero tu esfuerzo ha sido registrado."
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
      if (response && response.error) throw new Error(response.message);

      return response as GlobalAnalysisResponse;
    } catch (err: any) {
      console.error("Failed to call AI Coach (Global):", err);
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
        overall_assessment: `Hubo un error al procesar tus datos: ${err.message}`
      };
    }
  }
};