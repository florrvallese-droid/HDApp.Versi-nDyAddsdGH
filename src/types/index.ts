export type CoachTone = 'strict' | 'motivational' | 'analytical' | 'friendly';
export type Discipline = 'bodybuilding' | 'crossfit' | 'powerlifting' | 'general';
export type UnitSystem = 'kg' | 'lb';
export type Sex = 'male' | 'female' | 'other';
export type LoggingPreference = 'effective_only' | 'full_routine';

export interface UserProfile {
  user_id: string;
  created_at: string;
  updated_at: string;
  email?: string;
  
  // Básico
  display_name?: string;
  sex: Sex;
  units: UnitSystem;
  avatar_url?: string;
  
  // Registro
  logging_preference: LoggingPreference;
  
  // Referidos y Negocio
  referral_code?: string;
  business_info?: {
    brand_name?: string;
    bio?: string;
    instagram?: string;
    whatsapp?: string;
    specialty?: string;
  };
  
  // Premium
  is_premium: boolean;
  is_admin: boolean;
  is_coach: boolean;
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
    age?: string;
    height?: string;
    current_weight?: string;
    objectives?: string;
  };
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  exercises: { name: string; sets_goal: number }[];
  created_at: string;
}

// ... (resto de interfaces se mantienen iguales)
export type PhaseGoal = 'volume' | 'definition' | 'maintenance';

export interface DietVariant {
  id: string;
  name: string; 
  calories: number;
  macros: { p: number; c: number; f: number };
}

export interface Supplement {
  id: string;
  name: string;
  timing: 'fasted' | 'pre' | 'intra' | 'post' | 'night' | 'meal';
  dosage: string;
}

export interface NutritionConfig {
  phase_goal: PhaseGoal;
  strategy_type?: 'single' | 'cycling';
  diet_variants: DietVariant[];
  supplements_stack: Supplement[];
}

export type LogType = 'preworkout' | 'workout' | 'nutrition' | 'checkin' | 'rest' | 'cardio' | 'pharmacology' | 'globalanalysis';

export interface Log {
  id: string;
  user_id: string;
  type: LogType;
  created_at: string;
  muscle_group?: string;
  workout_date?: string;
  cycle_day?: number;
  discipline?: string;
  data: Record<string, any>;
}

export interface Compound {
  id: string;
  name: string;
  dosage: string;
  type: 'injectable' | 'oral' | 'ancillary';
  timing?: 'fasted' | 'pre' | 'intra' | 'post' | 'night' | 'meal';
}

export interface PharmaCycle {
  name: string;
  start_date: string;
  end_date?: string;
  compounds: Compound[];
  notes?: string;
}

export interface PreWorkoutData {
  inputs: {
    sleep: number;
    stress: number;
    sensation: number | string;
    pain: boolean;
    painDescription?: string;
  };
  decision: 'TRAIN_HEAVY' | 'TRAIN_LIGHT' | 'REST';
  rationale: string;
  rules_triggered?: string[];
  recommendations: string[];
}

export interface SetExtension {
  type: 'rest_pause' | 'drop_set';
  reps: number;
  weight?: number;
  rest_time?: number;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  tempo?: string;
  rest_seconds?: number;
  rpe?: number;
  is_unilateral?: boolean; 
  techniques?: string[];
  technique_counts?: Record<string, number>;
  extensions?: SetExtension[];
  type?: 'warmup' | 'working' | 'failure';
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  previous?: { weight: number; reps: number };
  progress?: 'PROGRESS' | 'MANTUVO' | 'REGRESSION';
  notes?: string;
  is_superset?: boolean;
}

export interface WorkoutData {
  exercises: WorkoutExercise[];
  total_volume: number;
  duration_minutes: number;
  logging_mode?: LoggingPreference;
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