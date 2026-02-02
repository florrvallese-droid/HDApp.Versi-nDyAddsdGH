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
  coach_quote?: string;
  highlights?: string[];
  corrections?: string[];
}

export const aiService = {
  async getPreWorkoutAudit(data: any, tone: string = 'strict'): Promise<BioStopResponse> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: 'preworkout', tone, data }
    });
    if (error) throw error;
    return response;
  },

  async getPostWorkoutAnalysis(tone: string, data: any): Promise<PostWorkoutAIResponse> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: 'postworkout', tone, data }
    });
    if (error) throw error;
    return response;
  },

  async getDashboardBriefing(coachName: string, stats: any): Promise<any> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach-dashboard-brief', {
      body: { coachName, stats }
    });
    if (error) throw error;
    return response;
  },

  async getGlobalAnalysis(tone: string, data: any): Promise<any> {
    const { data: response, error } = await supabase.functions.invoke('ai-coach', {
      body: { action: data.type === 'marketing_generation' ? 'marketing_generation' : 'globalanalysis', tone, data }
    });
    if (error) throw error;
    return response;
  }
};