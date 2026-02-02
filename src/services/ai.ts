import { supabase } from "./supabase";

export interface BioStopResponse {
  status: 'GO' | 'CAUTION' | 'STOP';
  ui_color: 'green' | 'yellow' | 'red';
  short_message: string;
  rationale: string;
  modification: string | null;
}

export interface PostWorkoutJudgeResponse {
  verdict: 'PROGRESS' | 'STAGNATION' | 'REGRESSION';
  intensity_score: number;
  feedback_card: {
    title: string;
    body: string;
    action_item: string;
  };
  coach_alert: boolean;
  coach_quote?: string;
  highlights: string[];
  corrections: string[];
  judgment?: string;
}

// Alias para compatibilidad con páginas de resultados
export type PostWorkoutAIResponse = PostWorkoutJudgeResponse;

export const aiService = {
  // Módulo A: Bio-Stop Pre-Entreno
  async getPreWorkoutAudit(data: {
    sleep: number;
    stress: number;
    cycle_day?: number;
    pain_level: number;
    pain_location: string;
  }): Promise<BioStopResponse> {
    const { data: response, error } = await supabase.functions.invoke('ai-pre-workout', {
      body: data
    });
    if (error) throw error;
    return response;
  },

  // Módulo B: Juez Post-Entreno
  async getPostWorkoutAnalysis(tone: string, data: any): Promise<PostWorkoutAIResponse> {
    // Redirigimos a la función específica de post-workout siguiendo el nuevo modelo
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: 'postworkout', tone, data }
    });
    if (error) throw error;
    return response;
  },

  // Módulo C: Auditoría de Protocolos (Solo Coach)
  async auditPharmaProtocol(draftText: string) {
    const { data: response, error } = await supabase.functions.invoke('ai-audit-protocol', {
      body: { protocol_text_draft: draftText }
    });
    if (error) throw error;
    return response;
  },

  // Auditorías Generales y Marketing
  async getGlobalAnalysis(tone: string, data: any): Promise<any> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: data.type === 'marketing_generation' ? 'marketing_generation' : 'globalanalysis', tone, data }
    });
    if (error) throw error;
    return response;
  }
};