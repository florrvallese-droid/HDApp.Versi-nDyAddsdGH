import { supabase } from "./supabase";

export interface BioStopResponse {
  card_data: {
    status: 'GO' | 'CAUTION' | 'STOP';
    ui_title: string;
    ui_color: 'green' | 'yellow' | 'red';
  };
  detailed_report: string;
}

export interface PostWorkoutAIResponse {
  card_data: {
    verdict: 'PROGRESS' | 'STAGNATION' | 'REGRESSION';
    score: number;
    ui_title: string;
  };
  detailed_report: string;
  // Mantenemos campos legacy por compatibilidad de tipos en componentes antiguos si hiciera falta
  coach_quote?: string;
  highlights?: string[];
  corrections?: string[];
}

export const aiService = {
  // Módulo A: Bio-Stop Pre-Entreno
  async getPreWorkoutAudit(data: {
    sleep: number;
    stress: number;
    cycle_day?: number;
    pain_level: number;
    pain_location: string;
  }, tone: string = 'strict'): Promise<BioStopResponse> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: 'preworkout', tone, data }
    });
    if (error) throw error;
    return response;
  },

  // Módulo B: Juez Post-Entreno
  async getPostWorkoutAnalysis(tone: string, data: any): Promise<PostWorkoutAIResponse> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: 'postworkout', tone, data }
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