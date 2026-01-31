import { supabase } from "./supabase";

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
    data: { sleep: number; stress: number; sensation: number; pain: boolean; painDescription?: string }
  ): Promise<AIResponse> {
    
    try {
      const { data: response, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'preworkout',
          tone: tone,
          data: data
        }
      });

      if (error) {
        console.error("AI Service Error:", error);
        throw error;
      }

      return response as AIResponse;
      
    } catch (err) {
      console.error("Failed to call AI Coach:", err);
      // Fallback logic if API fails or no key set
      return {
        decision: 'TRAIN_LIGHT',
        rationale: "No pude conectar con el cerebro digital (AI Error). Por seguridad, entrena ligero hoy.",
        recommendations: ["Escucha a tu cuerpo", "Prioriza la técnica"]
      };
    }
  },

  async getPostWorkoutAnalysis(
    tone: string,
    data: { current: any; previous: any; discipline: string; muscleGroup: string }
  ): Promise<PostWorkoutAIResponse> {
    try {
      const { data: response, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'postworkout',
          tone: tone,
          data: data
        }
      });

      if (error) {
        throw error;
      }

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
  }
};