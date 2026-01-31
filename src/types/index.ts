export type CoachTone = 'strict' | 'motivational' | 'analytical' | 'friendly';
export type Discipline = 'bodybuilding' | 'crossfit' | 'powerlifting' | 'general';
export type UnitSystem = 'kg' | 'lb';
export type Sex = 'male' | 'female' | 'other';

export interface UserProfile {
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Básico
  display_name?: string;
  sex: Sex;
  units: UnitSystem;
  avatar_url?: string;
  
  // Premium
  is_premium: boolean;
  is_admin: boolean;
  premium_expires_at?: string;
  trial_started_at?: string;
  
  // Personalización
  coach_tone: CoachTone;
  discipline: Discipline;
  
  // Flexible
  settings: {
    notifications_enabled?: boolean;
    menstrual_cycle_tracking?: boolean;
    last_cycle_start?: string;
    language?: 'es' | 'en';
    theme?: 'dark' | 'light';
    nutrition?: NutritionConfig;
  };
}

// Nutrition Specifics
export type DietType = 'fixed' | 'cycling';
export type DayType = 'high' | 'low' | 'medium' | 'refeed';

export interface Supplement {
  id: string;
  name: string;
  timing: 'fasted' | 'pre' | 'intra' | 'post' | 'night' | 'meal';
  dosage: string;
}

export interface NutritionConfig {
  diet_type: DietType;
  calories_target?: number;
  macros?: { p: number; c: number; f: number };
  supplements_stack: Supplement[];
}

export type LogType = 'preworkout' | 'workout' | 'nutrition' | 'checkin' | 'rest' | 'cardio' | 'pharmacology' | 'globalanalysis';

export interface Log {
  id: string;
  user_id: string;
  type: LogType;
  created_at: string;
  
  // Indexables
  muscle_group?: string;
  workout_date?: string;
  cycle_day?: number;
  discipline?: string;
  
  // Payload (estructura varía según type)
  data: Record<string, any>;
}

// Pharmacology Specifics
export interface Compound {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg/week"
  type: 'injectable' | 'oral' | 'ancillary';
}

export interface PharmaCycle {
  name: string;
  start_date: string;
  end_date?: string;
  compounds: Compound[];
  notes?: string;
}

// Interfaces específicas para la data de los logs
export interface PreWorkoutData {
  inputs: {
    sleep: number;
    stress: number;
    sensation: number;
    pain: boolean;
    painDescription?: string;
  };
  decision: 'TRAIN_HEAVY' | 'TRAIN_LIGHT' | 'REST';
  rationale: string;
  rules_triggered?: string[];
  recommendations: string[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  tempo?: string;
  rest_seconds?: number;
  rpe?: number;
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  previous?: { weight: number; reps: number };
  progress?: 'PROGRESS' | 'MANTUVO' | 'REGRESSION';
  notes?: string;
}

export interface WorkoutData {
  exercises: WorkoutExercise[];
  total_volume: number;
  duration_minutes: number;
}

export interface CheckinData {
  weight: number;
  weight_delta: number;
  photos: string[];
  notes?: string;
}

export interface NutritionLogData {
  day_type: DayType;
  adherence_score: number; // 1-10
  calories_consumed?: number;
  supplements_taken: string[]; // IDs of taken supplements
  notes?: string;
}

export interface GlobalAnalysisResponse {
  top_patterns: {
    pattern: string;
    evidence: string;
    action: string;
  }[];
  performance_insights: {
    best_performing_conditions: string;
    worst_performing_conditions: string;
    optimal_frequency: string;
  };
  next_14_days_plan: string[];
  red_flags: string[];
  overall_assessment: string;
}