export type CoachTone = 'strict' | 'motivational' | 'analytical' | 'friendly' | 'business_analytical';
export type Discipline = 'bodybuilding' | 'crossfit' | 'powerlifting' | 'general';
export type UnitSystem = 'kg' | 'lb';
export type Sex = 'male' | 'female' | 'other';
export type LoggingPreference = 'effective_only' | 'full_routine';
export type UserRole = 'athlete' | 'coach' | 'admin';

export interface UserProfile {
  user_id: string;
  created_at: string;
  updated_at: string;
  email?: string;
  display_name?: string;
  sex: Sex;
  units: UnitSystem;
  avatar_url?: string;
  birth_date?: string;
  user_role: UserRole;
  coach_tone: CoachTone;
  discipline: Discipline;
  settings: any;
  // Campos extendidos para la UI
  is_admin?: boolean;
  is_premium?: boolean;
  is_competitor?: boolean;
  trial_started_at?: string;
  premium_expires_at?: string;
  business_info?: any;
  logging_preference?: LoggingPreference;
  // Campos consolidados
  tier?: 'free' | 'pro';
  subscription_status?: string;
  plan_type?: 'starter' | 'hub' | 'agency';
  business_name?: string;
  student_limit?: number;
}

export interface SetExtension {
  type: 'rest_pause' | 'drop_set';
  rest_time?: number;
  weight?: number;
  reps: number;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: string;
  is_unilateral?: boolean;
  is_failure?: boolean;
  rest_seconds?: number;
  techniques?: string[];
  technique_counts?: Record<string, number>;
  extensions?: SetExtension[];
}

export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
  is_superset?: boolean;
  previous?: { weight: number; reps: number };
}

export interface WorkoutData {
  exercises: WorkoutExercise[];
  total_volume?: number;
  duration_minutes?: number;
}

export interface Competition {
    id: string;
    athlete_id: string;
    name: string;
    date: string;
    category?: string;
    location?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    peak_week_protocol?: any;
    results?: any;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  exercises: { name: string; sets_goal: number }[];
}

export type PhaseGoal = 'volume' | 'definition' | 'maintenance';

export interface DietVariant {
  id: string;
  name: string; 
  calories: number;
  macros: { p: number; c: number; f: number };
}

export interface Compound {
  id: string;
  name: string;
  dosage: string;
  type: 'injectable' | 'oral' | 'ancillary';
  timing: 'fasted' | 'pre' | 'intra' | 'post' | 'night' | 'meal';
}

export interface PharmaCycle {
  name: string;
  start_date: string;
  end_date?: string;
  compounds: Compound[];
  notes?: string;
}

export interface NutritionConfig {
  phase_goal: PhaseGoal;
  strategy_type?: 'single' | 'cycling';
  diet_variants: DietVariant[];
  supplements_stack: Supplement[];
}

export interface Supplement {
  id: string;
  name: string;
  timing: 'fasted' | 'pre' | 'intra' | 'post' | 'night' | 'meal';
  dosage: string;
}

export interface GlobalAnalysisResponse {
  top_patterns: {
    pattern: string;
    evidence: string;
    action: string;
  }[];
  overall_assessment: string;
}