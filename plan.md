# PRD — Heavy Duty Di Iorio
**Progressive Web App + AI Coach**

**Versión:** 2.0 Final  
**Fecha:** 31 Enero 2026  
**Stack:** React + Vite + TypeScript + Tailwind + Supabase + Gemini 3 Pro  
**Deploy:** Dyad → GitHub → Vercel

---

## 🎯 VISIÓN EJECUTIVA

**Heavy Duty Di Iorio** transforma el tracking fitness tradicional en un **sistema inteligente de toma de decisiones** que calma la ansiedad del atleta mediante feedback basado en datos.

### Propuesta de Valor
> "Medí tu progreso real, no tus sensaciones"

- **Coach IA personalizado** que decide si entrenar o descansar
- **Sobrecarga progresiva forzada** (siempre muestra qué superar)
- **Análisis de correlaciones** (sueño/estrés vs rendimiento)
- **Multi-disciplina** (Bodybuilding, CrossFit, Powerlifting)
- **Panel de Admin** para control total de IA y negocio

---

## 📚 TABLA DE CONTENIDOS

1. [Setup Técnico Inicial](#1-setup-técnico-inicial)
2. [Arquitectura y Stack](#2-arquitectura-y-stack)
3. [Roadmap de Releases](#3-roadmap-de-releases)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Requerimientos Funcionales](#5-requerimientos-funcionales)
6. [Panel de Administrador](#6-panel-de-administrador)
7. [Diseño de Prompts IA](#7-diseño-de-prompts-ia)
8. [UX/UI Guidelines](#8-ux-ui-guidelines)
9. [Monetización](#9-monetización)
10. [Métricas y KPIs](#10-métricas-y-kpis)
11. [Riesgos y Mitigaciones](#11-riesgos-y-mitigaciones)
12. [Checklist de Aceptación](#12-checklist-de-aceptación)

---

## 1) SETUP TÉCNICO INICIAL

### 1.1 Prerequisitos

**Cuentas necesarias:**
- Supabase (https://supabase.com)
- Google AI Studio (https://aistudio.google.com)
- Dyad (https://dyad.sh)
- GitHub (deploy)
- Vercel (hosting)

**Variables de entorno:**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Solo servidor
VITE_GEMINI_API_KEY=AIza... # O Edge Function (recomendado)
```

### 1.2 Configuración de Supabase

**Auth (Email + Password):**
1. Dashboard → Authentication → Providers → Enable Email
2. Settings → Password requirements (min 8 chars)
3. Email Templates → Personalizar confirmación y reset
4. URL Configuration → Agregar dominios permitidos

**Base de Datos:** Ver archivo `schema.sql` completo en Anexo A

**Storage Buckets:**
- `avatars` (5MB, privado)
- `checkin_photos` (5MB, privado)
- `pharmacology` (10MB, MÁXIMA seguridad)

### 1.3 Integración con Dyad

1. Crear proyecto en Dyad con template React + Vite + TS
2. Integrations → Supabase → Conectar proyecto
3. Verificar que env vars estén disponibles
4. Configurar GitHub repository
5. Deploy automático a Vercel

---

## 2) ARQUITECTURA Y STACK

### 2.1 Frontend
```
src/
├── components/
│   ├── auth/          # Login, Signup, Verify
│   ├── dashboard/     # Home, Stats, Charts
│   ├── workout/       # Logger, Analysis, PreWorkout
│   ├── nutrition/     # Strategy, Timing, Logs
│   ├── checkin/       # Photos, Weight, Gallery
│   ├── admin/         # Dashboard, Users, AI Control
│   └── shared/        # Button, Input, Modal, etc
├── hooks/
│   ├── useAuth.ts     # Supabase auth state
│   ├── useProfile.ts  # User profile & premium status
│   └── useAI.ts       # Edge Function calls
├── services/
│   ├── supabase.ts    # Client configuration
│   ├── ai.ts          # Gemini API wrapper
│   └── storage.ts     # File uploads
├── types/
│   └── index.ts       # TypeScript interfaces
└── utils/
    ├── calculations.ts # Volume, progress, etc
    └── formatting.ts   # Dates, numbers, units
```

### 2.2 Backend (Supabase)

**Edge Functions:**
```
supabase/functions/
├── ai-coach/          # Gemini API proxy
│   ├── index.ts
│   └── prompts.ts
├── stripe-webhook/    # Payment events (V1)
└── analytics/         # Background jobs (V1)
```

**Características:**
- **RLS (Row Level Security)** en todas las tablas
- **Políticas** estrictas por `auth.uid()`
- **Triggers** para auto-crear perfiles
- **Índices** optimizados para queries frecuentes

### 2.3 IA (Gemini 3 Pro)

**Acciones:**
1. **Pre-Workout**: Decidir si entrenar (go/no-go)
2. **Post-Workout**: Evaluar progreso vs sesión anterior
3. **Global Analysis**: Detectar patrones en historial completo

**Control:**
- Prompts versionados en base de datos
- A/B testing de variantes
- Fallback a reglas determinísticas
- Rate limiting por usuario
- Logging completo para analytics

---

## 3) ROADMAP DE RELEASES

### MVP (Semanas 1-6) ✅ MÍNIMO VIABLE

**Auth & Onboarding:**
- [x] Registro email+password con verificación
- [x] Login/Logout
- [x] Reset password
- [x] Onboarding de 7 pasos
- [x] Trial gratuito de 7 días (automático)

**Core Features:**
- [x] Dashboard con estado y navegación
- [x] Pre-Workout IA (go/no-go decision)
- [x] Workout Logger con autocomplete
- [x] Análisis Post-Sesión con Story Card
- [x] Check-in físico (peso + 3 fotos)
- [x] Personalización del tono del Coach (4 opciones)
- [x] Bloqueo de features PRO (Locked View)

**Infraestructura:**
- [x] PWA installable
- [x] Offline fallback básico
- [x] Deploy a Vercel vía GitHub

**OUT OF MVP:**
- Nutrición completa (solo placeholder)
- Farmacología (solo placeholder)
- Auditoría Global IA
- Panel de Admin
- Stripe real (trial es flag manual)

---

### V1 (Semanas 7-12) 🚀 PLATAFORMA COMPLETA

**Features Usuario:**
- [x] Nutrición: Estrategias + Timing + Logs
- [x] Farmacología privada (disclaimers + seguridad)
- [x] Auditoría Global IA (patrones + recomendaciones)
- [x] Sincronización offline robusta
- [x] Export completo (CSV + JSON + PDF)

**Panel de Administrador (NUEVO):**
- [x] Dashboard de métricas (DAU, MRR, conversiones, etc)
- [x] Gestión de usuarios (buscar, ver, editar, eliminar)
- [x] **Control de Prompts IA:**
  - Editor de system instructions
  - Versionado de prompts
  - A/B testing (asignar % de usuarios)
  - Métricas por versión
- [x] Logs de IA (input/output, tokens, latencia, errores)
- [x] Configuración de disciplinas
- [x] Feature flags
- [x] Alertas y notificaciones

**Monetización:**
- [x] Integración Stripe (subscripciones reales)
- [x] Webhooks para sincronizar estado premium
- [x] Customer portal (self-service)

**Infraestructura:**
- [x] Monitoring (Sentry)
- [x] Analytics (PostHog/Mixpanel)
- [x] CI/CD completo

---

### V2 (Futuro) 🔮 EXPANSIÓN

- Multi-atleta (Coach dashboard)
- Wearables (Oura, Whoop, Apple Health)
- Modelos predictivos ML
- Social sharing avanzado
- Templates por disciplina
- Gemini Multimodal (análisis de fotos/videos)
- API pública

---

## 4) MODELO DE DATOS

### 4.1 Esquema Principal

```typescript
// profiles - Extiende auth.users
interface UserProfile {
  user_id: string              // PK, FK to auth.users
  created_at: Date
  updated_at: Date
  
  // Básico
  display_name?: string
  sex: 'male' | 'female' | 'other'
  units: 'kg' | 'lb'
  avatar_url?: string
  
  // Premium
  is_premium: boolean          // Controla acceso a features PRO
  is_admin: boolean            // Acceso al panel de admin
  premium_expires_at?: Date
  trial_started_at?: Date
  
  // Personalización
  coach_tone: 'strict' | 'motivational' | 'analytical' | 'friendly'
  discipline: 'bodybuilding' | 'crossfit' | 'powerlifting' | 'general'
  
  // Flexible
  settings: {
    notifications_enabled?: boolean
    menstrual_cycle_tracking?: boolean
    last_cycle_start?: Date
    language?: 'es' | 'en'
    theme?: 'dark' | 'light'
  }
}

// logs - Tabla polimórfica con JSONB
interface Log {
  id: string                   // UUID
  user_id: string              // FK to profiles
  type: 'preworkout' | 'workout' | 'nutrition' | 'checkin' | 'rest' | 'cardio' | 'pharmacology'
  created_at: Date
  
  // Indexables (para queries rápidas)
  muscle_group?: string
  workout_date?: Date
  cycle_day?: number
  discipline?: string
  
  // Payload (estructura varía según type)
  data: Record<string, any>
}

// Ejemplos de data por tipo:

// type: 'preworkout'
data: {
  inputs: { sleep: 7, stress: 4, sensation: 8, pain: false },
  decision: 'TRAIN_HEAVY',
  rationale: '...',
  recommendations: [...]
}

// type: 'workout'
data: {
  exercises: [{
    name: 'Press Inclinado',
    sets: [{ weight: 80, reps: 9, tempo: '3-1-4', rest_seconds: 120 }],
    previous: { weight: 80, reps: 8 },
    progress: 'PROGRESS'
  }],
  total_volume: 720,
  duration_minutes: 18
}

// type: 'checkin'
data: {
  weight: 82.5,
  weight_delta: 0.3,
  photos: ['frontal.jpg', 'profile.jpg', 'back.jpg'],
  notes: 'Más vascular...'
}

// ai_logs - Para analytics de admin
interface AILog {
  id: string
  user_id: string
  created_at: Date
  
  action: 'preworkout' | 'postworkout' | 'globalanalysis'
  coach_tone: string
  model: string                // 'gemini-3-pro'
  
  input_data: Record<string, any>
  output_data: Record<string, any>
  
  tokens_used: number
  latency_ms: number
  error?: string
  
  prompt_version: string       // Para tracking de A/B tests
}

// ai_prompts - Control de prompts desde admin
interface AIPrompt {
  id: string
  created_at: Date
  updated_at: Date
  
  action: 'preworkout' | 'postworkout' | 'globalanalysis'
  coach_tone: 'strict' | 'motivational' | 'analytical' | 'friendly'
  
  system_instruction: string   // El prompt completo
  version: string              // ej: 'v1.2'
  is_active: boolean           // Solo una versión activa por acción+tono
  
  created_by: string           // Admin que lo creó
}
```

### 4.2 Índices Clave

```sql
-- Profiles
CREATE INDEX idx_profiles_premium ON profiles(is_premium);
CREATE INDEX idx_profiles_admin ON profiles(is_admin);

-- Logs (críticos para performance)
CREATE INDEX idx_logs_user_type ON logs(user_id, type);
CREATE INDEX idx_logs_user_date ON logs(user_id, workout_date DESC);
CREATE INDEX idx_logs_user_muscle ON logs(user_id, muscle_group);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);

-- AI Logs
CREATE INDEX idx_ai_logs_user ON ai_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_logs_action ON ai_logs(action);
CREATE INDEX idx_ai_logs_version ON ai_logs(prompt_version);
```

---

## 5) REQUERIMIENTOS FUNCIONALES

### FR-1: Autenticación

**Registro:**
- Email + password (min 8 chars, 1 mayúscula, 1 número)
- Envío automático de email de verificación
- Usuario no puede acceder hasta confirmar email
- Auto-creación de perfil con trial de 7 días

**Login:**
- Email + password
- Verificar si email está confirmado
- Mensaje claro si falta confirmar + botón reenviar

**Recuperación:**
- Forgot password → envía email con link
- Reset password → nueva contraseña (2 veces para confirmar)

**Onboarding (post-confirmación):**
1. Display name (opcional)
2. Sex (para features específicas)
3. Peso inicial + unidad (kg/lb)
4. Foto de perfil (opcional)
5. **Tono del Coach** (Strict/Motivational/Analytical/Friendly) con preview
6. Disciplina (Bodybuilding/CrossFit/Powerlifting/General)
7. Disclaimers + "Comenzar Trial Gratis"

---

### FR-2: Pre-Workout IA (Go/No-Go)

**Inputs:**
- Sueño (slider 1-10)
- Estrés (slider 1-10)
- Sensación general (slider 1-10)
- Dolor/molestias (toggle + descripción)
- Día del ciclo menstrual (auto-calculado si aplica)

**Procesamiento:**

*Si PRO:*
1. Enviar datos a Edge Function `/functions/ai-coach`
2. Gemini analiza con prompt según `coach_tone`
3. Retorna JSON estructurado:
```json
{
  "decision": "TRAIN_HEAVY | TRAIN_LIGHT | REST",
  "rationale": "explicación breve",
  "rules_triggered": ["sleep<5"],
  "recommendation": ["acción 1", "acción 2"]
}
```

*Si FREE (fallback):*
- Reglas determinísticas:
  - sleep < 5 → REST
  - stress > 8 → TRAIN_LIGHT o REST
  - sensation < 4 → REST
  - pain = true → TRAIN_LIGHT
- Mensaje básico sin análisis profundo

**Output:**
- Badge grande con decision (ENTRENAR PESADO / LIVIANO / DESCANSAR)
- Rationale del coach
- Recommendations listadas
- Botón CTA según decisión (Iniciar Workout / Registrar Descanso)

---

### FR-3: Workout Logger

**Inicio:**
- Input: Grupo muscular (autocomplete)
- Al seleccionar, buscar última sesión de ese músculo
- Si existe: autocompletar ejercicios con datos previos
- Mostrar **"OBJETIVO A SUPERAR"** por cada ejercicio

**Registro:**
```
Ejercicio: Press Inclinado
┌─────────────────────────┐
│ OBJETIVO: 80kg × 8 reps │
└─────────────────────────┘

Set 1:
Peso: [80] kg
Reps (al fallo): [9] ✅ (+1 rep)
Tempo: [3-1-4] (excéntrico-pausa-concéntrico)
Descanso: [120] segundos
Notas: [mejor control]

[+ Agregar Set]
[✓ Ejercicio Completo]
```

**Validaciones:**
- Peso > 0
- Reps 1-50
- Tempo formato `\d-\d-\d`
- Descanso 0-600 segundos

**Indicador de progreso:**
Al completar ejercicio, comparar con objetivo:
- ✅ PROGRESO (subió peso o reps)
- ➡️ MANTUVO (iguales números)
- ⚠️ REGRESIÓN (bajó peso o reps)

**Finalizar:**
- Mínimo 1 ejercicio completo
- Guardar en `logs` con type='workout'
- Calcular volumen total (suma peso × reps)
- Redirect a Análisis

---

### FR-4: Análisis Post-Sesión + Story Card

**Análisis:**

*Si PRO:*
1. Comparar sesión actual vs anterior (mismo músculo)
2. Enviar ambas a Gemini vía Edge Function
3. Recibir veredicto:
```json
{
  "verdict": "PROGRESS | PLATEAU | REGRESSION",
  "highlights": ["Press +1 rep", "Tempo mejorado"],
  "corrections": ["Aumentá descanso a 180s"],
  "coach_quote": "Progreso real. Ahora recuperá como profesional."
}
```

*Si FREE:*
- Comparación numérica simple
- Mensaje básico: "Subiste peso en 2 de 4 ejercicios"

**Story Card:**
- Canvas 9:16 (1080×1920px)
- Logo en top-right
- Muscle group + fecha
- Veredicto (badge)
- Ejercicio destacado con delta
- Coach quote
- Generación client-side (html2canvas)
- Share nativo (Instagram, WhatsApp, download)

---

### FR-5: Check-in Físico

**Inputs:**
- Peso actual (muestra delta vs anterior)
- Hasta 3 fotos (frontal, perfil, espalda)
- Notas (retención, vascular, etc)

**Upload:**
- Compresión client-side (max 1MB por foto)
- Storage: `checkin_photos/{user_id}/{checkin_id}/frontal.jpg`

**Gallery:**
- Vista cronológica de check-ins
- Comparador lado a lado (seleccionar 2 fechas)
- Peso en gráfico de línea

**Reminder:**
Si >15 días sin check-in → modal al abrir app:
```
⚠️ Hace 16 días sin check-in
¿Hacerlo ahora?
[Hacer Check-in] [Mañana] [Desactivar]
```

---

### FR-6: Nutrición (V1)

**Estrategia:**
- Tipo: Dieta única / Ciclado (días altos/bajos)
- Calendario: marcar días altos/bajos
- Target macros (opcional): P/C/F por día

**Timing de Suplementos:**
Organizar por momentos:
- Ayunas: Cafeína, L-carnitina
- Pre (30min): Creatina, Citrulina
- Intra: EAAs
- Post (30min): Whey, Dextrosa
- Noche: Magnesio, Glicina

**Log Diario:**
- Tipo de día (alto/bajo)
- Adherencia (100% / ~80% / No)
- Checklist de supls tomados
- Notas breves

**Correlación:**
En Auditoría Global:
- "Rendimiento +12% mejor en días altos de carbos"
- "Sueño mejoró 1.6 puntos cuando tomás magnesio"

---

### FR-7: Farmacología (V1) - PRIVADO

**Disclaimer obligatorio:**
```
⚠️ AVISO IMPORTANTE

Esta sección es para REGISTRO PERSONAL.
Heavy Duty NO recomienda ni promueve el uso de PEDs.
Información privada y encriptada. Solo TÚ puedes accederla.
No sustituye asesoramiento médico.

[✓] Entiendo y acepto
[Continuar]
```

**Form:**
- Nombre del ciclo
- Fecha inicio + duración
- Compuestos (nombre, dosis/semana)
- Ancilares (AIs, SERMs, etc)
- Notas privadas

**Seguridad:**
- Bucket dedicado: `pharmacology`
- RLS MUY estricto (solo owner)
- NO se envía a IA sin opt-in explícito
- Export/Delete on-demand (GDPR)

---

### FR-8: Auditoría Global IA (V1)

**Trigger:**
- Dashboard → "🧠 Auditoría Global IA" (solo PRO)
- Modal: "Este análisis consume ~2000 tokens. ¿Continuar?"

**Proceso:**
1. Agregar últimos 90 días de datos:
   - Workouts (por músculo, progreso, volumen)
   - Nutrición (adherencia, días altos/bajos)
   - Sleep/stress promedios
   - Check-ins (peso, delta)
2. Resumir en JSON compacto (<3000 tokens)
3. Enviar a Gemini con prompt `globalanalysis`
4. Recibir:
```json
{
  "top_patterns": [{
    "pattern": "Pierna rinde 15% mejor en días altos",
    "evidence": "9 de 11 sesiones",
    "action": "Programa pierna en días altos"
  }],
  "performance_insights": {...},
  "next_14_days_plan": ["acción 1", "acción 2"],
  "red_flags": ["Volumen en espalda estancado 3 semanas"],
  "overall_assessment": "párrafo de conclusión"
}
```

**Rate Limit:**
- Máximo 1 auditoría cada 7 días por usuario
- Mostrar "próxima disponible en X días"

**Output:**
- Vista estructurada con secciones
- Export como PDF
- Guardar en `logs` type='globalanalysis'

---

## 6) PANEL DE ADMINISTRADOR (NUEVO)

### 6.1 Dashboard Principal

**URL:** `/admin/dashboard`  
**Auth:** Solo `is_admin=true`

**Métricas (última semana):**
```
┌─────────────────────────────────┐
│ DAU / WAU / MAU                 │
│ 342 / 1,247 / 4,890 (+8.2%)    │
├─────────────────────────────────┤
│ MRR                Churn        │
│ $12,384 (+12%)     4.2%         │
├─────────────────────────────────┤
│ Nuevos Registros   Conversiones │
│ 87 usuarios        18 paid      │
├─────────────────────────────────┤
│ Requests IA        Costo IA     │
│ 8,420 (+15%)       $84.20       │
└─────────────────────────────────┘

📈 GRÁFICOS:
- LineChart: DAU/WAU/MAU (30 días)
- BarChart: Conversiones free→trial→paid
- PieChart: Uso de features PRO

🚨 ALERTAS (2):
⚠️ Error rate 2.1% (threshold: 1%)
⚠️ Costo IA excedió budget semanal
```

### 6.2 Gestión de Usuarios

**URL:** `/admin/users`

**Tabla:**
- Búsqueda: email, nombre
- Filtros: Todos / Premium / Trial / Free
- Columnas: Email, Status, Joined, Last Login
- Acciones: [Ver] [Edit] [Delete]

**Vista de Usuario:**
```
Usuario: john@doe.com
ID: abc-123
Registrado: 15 Ene 2026
Último login: Hace 2 horas

Status: 🟢 PRO (expira 15 Feb)
[✓] Activar Premium manualmente
[✓] Extender trial 7 días

Actividad (últimos 7 días):
• Workouts: 5
• Check-ins: 1
• Requests IA: 12 ($0.48)

[Ver Logs de IA]
[Export Datos del Usuario]
[🗑️ Eliminar Usuario (GDPR)]
```

### 6.3 Control de Prompts de IA ⭐ FEATURE CLAVE

**URL:** `/admin/ai-prompts`

**Editor:**
```
Acción: [Pre-Workout ▼]
Tono: [Strict ▼]
Versión actual activa: v1.2

┌─────────────────────────────────┐
│ System Instruction (editable):  │
│                                 │
│ Sos un entrenador experto...    │
│ [textarea grande con sintaxis]  │
│                                 │
│ Variables disponibles:          │
│ {sleep}, {stress}, {sensation}, │
│ {pain}, {cycleDay}              │
└─────────────────────────────────┘

Nueva versión: [v1.3]
[💾 Guardar como Draft]
[✅ Activar en Producción]
[🔄 Rollback a v1.2]

📊 MÉTRICAS DE ESTA VERSIÓN:
- Requests: 1,245
- Avg tokens: 287
- User rating: 82% 👍
- Avg latency: 1.8s
```

**A/B Testing:**
```
Split Test: Pre-Workout Strict
v1.2 (control): 50% tráfico → 78% 👍
v1.3 (variant): 50% tráfico → 85% 👍

Duración: 7 días
Métrica clave: User thumbs up/down

[Declarar Ganador] [Extender Test]
```

**Historial:**
- Tabla de todas las versiones
- Quién creó, cuándo
- Cuánto tiempo estuvo activa
- Métricas finales

### 6.4 Logs de IA

**URL:** `/admin/ai-logs`

**Filtros:**
- Usuario (search)
- Acción (pre/post/global)
- Fecha (rango)
- Versión de prompt
- Solo errores

**Tabla:**
```
Timestamp           User        Action      Tokens  Latency  Status
2026-01-31 14:23   john@...    preworkout  245     1.8s     ✅
2026-01-31 14:18   jane@...    postworkout 412     2.1s     ✅
2026-01-31 14:05   bob@...     preworkout  198     0.9s     ❌ timeout
```

**Vista Detalle:**
```
AI Log Detail - ID: xyz-789

User: john@doe.com
Action: preworkout
Timestamp: 2026-01-31 14:23:15
Prompt Version: v1.2
Model: gemini-3-pro
Coach Tone: strict

INPUT:
{
  "sleep": 7,
  "stress": 4,
  "sensation": 8,
  "pain": false
}

OUTPUT:
{
  "decision": "TRAIN_HEAVY",
  "rationale": "Dormiste bien...",
  ...
}

METADATA:
Tokens: 245 (input: 89, output: 156)
Latency: 1,821ms
Cost: $0.00122

User Feedback: 👍 (Helpful)

[Export JSON] [Replay Request]
```

### 6.5 Configuración de Disciplinas

**URL:** `/admin/disciplines`

**CRUD:**
- Bodybuilding (activa)
- CrossFit (activa)
- Powerlifting (activa)
- General (activa)
- [+ Agregar Nueva]

**Por disciplina:**
```
Bodybuilding

Métricas específicas:
• Volumen (peso × reps)
• Sobrecarga progresiva
• Tempo de ejecución
• Tiempo bajo tensión

Prompts custom:
[✓] Usar prompts específicos para esta disciplina
[Editar Prompts]

Usuarios activos: 3,420 (70%)
```

### 6.6 Feature Flags

**URL:** `/admin/feature-flags`

**Tabla:**
```
Feature                  Status   Rollout   Updated
─────────────────────────────────────────────────────
Global Analysis IA       🟢 ON    100%      Hace 2d
Pharmacology Module      🟢 ON    100%      Hace 5d
Story Card Generator     🟢 ON    100%      Hace 1w
New Chart Library        🟡 TEST  25%       Hace 1h
Gemini 4 Pro (beta)      🔴 OFF   0%        -

[+ Nuevo Feature Flag]
```

**Edición:**
```
Feature: New Chart Library
Status: 🟡 Testing
Rollout: [25%] slider (0-100%)
Target: [All Users ▼] o [Premium Only ▼]

Descripción:
Nueva librería de gráficos con mejor performance

[Activar para 50%]
[Activar para 100%]
[🛑 Kill Switch (desactivar inmediatamente)]
```

### 6.7 Alertas y Notificaciones

**Configuración:**
```
Alertas Automáticas:

[✓] Error rate > 1% → Email a admin@heavyduty.app
[✓] Costo IA/día > $50 → Email + Slack
[✓] New user signup → Slack #growth
[✓] Churn > 5% → Email (diario)
[✓] Server down → SMS + Email + Slack

Integraciones:
• Email: SendGrid ✅
• Slack: #alerts ✅
• SMS: Twilio (pending)
```

---

## 7) DISEÑO DE PROMPTS IA

### 7.1 Estructura Base

Todos los prompts siguen este formato:

```
[TONO_DESCRIPTION]

[CONTEXTO_DE_LA_ACCIÓN]

Datos del usuario:
{variables_dinámicas}

Criterios:
[REGLAS_ESPECÍFICAS]

Responde SOLO en formato JSON:
{
  "campo1": "tipo",
  "campo2": ["array"],
  ...
}
```

### 7.2 Tonos del Coach

**Strict (Estricto):**
> "Sos un entrenador experto y ESTRICTO. Calidad sobre cantidad. No tolerás excusas ni mediocridad. Tus respuestas son directas, exigentes y sin rodeos. El atleta necesita disciplina férrea."

**Motivational (Motivador):**
> "Sos un coach MOTIVADOR y entusiasta. Celebrás los logros pero mantenés estándares altos. Usás energía positiva para impulsar al atleta. Tus respuestas son energéticas, optimistas pero honestas."

**Analytical (Analítico):**
> "Sos un analista de rendimiento basado en DATOS. Tus respuestas son objetivas, precisas y fundamentadas en métricas. Sin emoción, solo hechos y correlaciones. El atleta valora análisis técnico."

**Friendly (Amigable):**
> "Sos un entrenador cercano y comprensivo pero profesional. Equilibrás empatía con honestidad constructiva. Firme pero amable. El atleta necesita apoyo emocional además de técnico."

### 7.3 Prompts por Acción

#### Pre-Workout (v1.2 - Ejemplo completo)

```
{TONE_DESCRIPTION}

Analiza los siguientes datos del atleta y decide si debe entrenar pesado, liviano o descansar HOY.

Disciplina: {discipline}
Datos:
- Sueño: {sleep}/10 (calidad autorreportada)
- Estrés: {stress}/10 (nivel percibido)
- Sensación: {sensation}/10 (energía general)
- Dolor: {pain} {painDescription}
- Día del ciclo menstrual: {cycleDay} (solo si aplica)

Criterios ESTRICTOS para {discipline}:

TRAIN_HEAVY (entrenar con intensidad máxima):
✅ Sueño ≥ 7
✅ Estrés ≤ 5
✅ Sensación ≥ 7
✅ Sin dolor crítico
✅ Si cycleDay, que NO esté en días 1-3 con síntomas severos

TRAIN_LIGHT (entrenar con volumen reducido):
⚠️ Sueño 5-6
⚠️ Estrés 6-7
⚠️ Sensación 5-6
⚠️ Dolor leve o molestia moderada
⚠️ Días 1-3 del ciclo con síntomas leves

REST (descansar completamente):
🛑 Sueño < 5
🛑 Estrés > 8
🛑 Sensación < 4
🛑 Dolor agudo o lesión
🛑 Días 1-2 del ciclo con síntomas severos
🛑 Múltiples señales rojas combinadas

Responde SOLO en formato JSON válido:
{
  "decision": "TRAIN_HEAVY" | "TRAIN_LIGHT" | "REST",
  "rationale": "explicación breve (max 2 oraciones)",
  "rules_triggered": ["lista de reglas que aplicaste"],
  "recommendation": [
    "acción concreta 1",
    "acción concreta 2",
    "acción concreta 3"
  ]
}

IMPORTANTE:
- Sé consistente: mismos inputs → misma decisión
- Prioriza SEGURIDAD sobre ambición
- Si hay duda entre dos opciones, elegí la más conservadora
- Las recomendaciones deben ser ACCIONABLES
```

#### Post-Workout (v1.1)

```
{TONE_DESCRIPTION}

Compara la sesión ACTUAL con la sesión ANTERIOR del mismo grupo muscular y determina si hubo PROGRESO real.

Disciplina: {discipline}
Grupo muscular: {muscleGroup}

Sesión ANTERIOR ({previousDate}):
{previousSession}

Sesión ACTUAL (HOY):
{currentSession}

Criterios para evaluar PROGRESO en {discipline}:

✅ PROGRESS (progreso confirmado):
- MÁS peso con mismas reps
- MÁS reps con mismo peso
- MEJOR técnica (tempo más controlado, ROM completo)
- MISMO rendimiento pero con MENOS descanso
- Volumen total aumentó ≥5%

➡️ PLATEAU (estancamiento):
- EXACTAMENTE los mismos números
- Sin mejora en técnica
- Volumen total similar (±2%)

⚠️ REGRESSION (regresión):
- MENOS peso o MENOS reps
- Técnica empeorada
- Volumen total bajó >5%
- MÁS descanso necesario para mismos números

Responde SOLO en formato JSON válido:
{
  "verdict": "PROGRESS" | "PLATEAU" | "REGRESSION",
  "highlights": [
    "logro específico 1 (ej: Press +2kg)",
    "logro específico 2"
  ],
  "corrections": [
    "corrección 1 (si aplica)",
    "corrección 2"
  ],
  "coach_quote": "frase memorable y motivacional (MAX 120 caracteres)"
}

IMPORTANTE:
- Sé HONESTO: si no hubo progreso, decilo
- Los highlights deben ser ESPECÍFICOS (ejercicio + delta)
- Las corrections deben ser ACCIONABLES
- El coach_quote debe reflejar el {tone} elegido
```

#### Global Analysis (v1.0)

```
{TONE_DESCRIPTION}

Sos un analista experto de rendimiento deportivo en {discipline}.

Analiza el siguiente resumen de 90 días de entrenamiento y DETECTA PATRONES y CORRELACIONES significativas.

Objetivos del atleta: {userGoals}
Disciplina: {discipline}

Resumen de datos (últimos 90 días):
{dataTypeSummary}

Busca ESPECÍFICAMENTE:

1️⃣ CORRELACIONES entre variables:
   - Sueño/estrés vs rendimiento por grupo muscular
   - Días altos/bajos de carbos vs volumen/fuerza
   - Día de la semana vs performance
   - Timing de entreno vs resultados

2️⃣ TENDENCIAS significativas:
   - Grupos musculares con progreso sostenido
   - Grupos musculares estancados (>3 semanas sin mejora)
   - Cambios en peso corporal vs composición percibida
   - Adherencia a nutrición vs resultados

3️⃣ SEÑALES DE ALERTA:
   - Sobreentrenamiento (regresión en múltiples grupos)
   - Subentrenamiento (frecuencia muy baja)
   - Desequilibrios (un grupo muy atrasado respecto a otros)

4️⃣ OPORTUNIDADES de optimización:
   - Mejor timing/frecuencia por músculo
   - Ajustes en estrategia nutricional
   - Cambios en gestión de fatiga

Responde SOLO en formato JSON válido:
{
  "top_patterns": [
    {
      "pattern": "descripción del patrón detectado",
      "evidence": "datos concretos que lo soportan",
      "action": "qué hacer al respecto"
    }
  ],
  "performance_insights": {
    "best_performing_conditions": "cuándo rinde mejor",
    "worst_performing_conditions": "cuándo rinde peor",
    "optimal_frequency": "frecuencia ideal detectada"
  },
  "next_14_days_plan": [
    "acción táctica 1",
    "acción táctica 2",
    "acción táctica 3"
  ],
  "red_flags": [
    "bandera roja 1 (si existe)",
    "bandera roja 2"
  ],
  "overall_assessment": "párrafo de conclusión general (max 200 palabras)"
}

IMPORTANTE:
- Solo reporta patrones con evidencia SÓLIDA (mín 5 ocurrencias)
- Sé CONSERVADOR: mejor no reportar que dar falso positivo
- Las acciones deben ser ESPECÍFICAS y ACCIONABLES
- El overall_assessment debe ser motivador pero realista
```

### 7.4 Versionado y Testing

**Naming:**
- `v1.0` = Primera versión estable
- `v1.1` = Mejora menor (tweaks de copy)
- `v2.0` = Cambio mayor (nueva estructura o criterios)

**Changelog (ejemplo):**
```
v1.2 (2026-01-28) - Actual
- Agregado criterio de "mismo peso con menos descanso" como progreso
- Ajustado threshold de volumen de ±2% a ±5%
- Mejorado tono "strict" para ser firme pero no desmotivante

v1.1 (2026-01-20)
- Agregado contexto de disciplina
- Especificado formato de highlights más específico

v1.0 (2026-01-15)
- Versión inicial en producción
```

---

## 8) UX/UI GUIDELINES

### 8.1 Design System

**Tema "Dark Gym":**
```css
/* Colores */
--bg-primary: #0a0a0a         /* Negro absoluto */
--bg-secondary: #1a1a1a       /* Gris muy oscuro */
--bg-elevated: #2a2a2a        /* Gris hierro */

--text-primary: #ffffff       /* Blanco puro */
--text-secondary: #a0a0a0     /* Gris claro */
--text-muted: #666666         /* Gris medio */

--accent-primary: #dc2626     /* Rojo sangre */
--accent-hover: #b91c1c       /* Rojo oscuro */
--accent-light: #fca5a5       /* Rojo claro */

--success: #10b981            /* Verde */
--warning: #f59e0b            /* Naranja */
--error: #ef4444              /* Rojo */
--info: #3b82f6               /* Azul */

/* Espaciado */
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px

/* Tipografía */
--font-family: 'Inter', system-ui, sans-serif
--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 24px
--font-size-2xl: 32px
--font-size-3xl: 48px

/* Border radius */
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-full: 9999px
```

**Componentes Clave:**

```typescript
// Button
<Button 
  variant="primary" | "secondary" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
>
  {children}
</Button>

// Card
<Card 
  padding="sm" | "md" | "lg"
  elevated?: boolean
>
  <CardHeader>...</CardHeader>
  <CardBody>...</CardBody>
  <CardFooter>...</CardFooter>
</Card>

// Input
<Input
  type="text" | "number" | "email" | "password"
  label="Label"
  placeholder="..."
  error="Error message"
  icon={<IconComponent />}
  onChange={handler}
/>

// Slider (para escalas 1-10)
<Slider
  min={1}
  max={10}
  value={value}
  onChange={handler}
  showValue
  showLabels  // "Muy mal" ... "Excelente"
/>

// Badge
<Badge 
  variant="success" | "warning" | "error" | "info" | "premium"
  size="sm" | "md"
>
  PRO
</Badge>

// Modal
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Título"
  size="sm" | "md" | "lg" | "xl"
>
  {children}
  <ModalFooter>
    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
    <Button variant="primary" onClick={onConfirm}>Confirmar</Button>
  </ModalFooter>
</Modal>
```

### 8.2 Mobile-First Principles

**Touch Targets:**
- Mínimo 44×44px (preferir 48×48px)
- Spacing entre targets: min 8px

**Typography Mobile:**
- Base size: 16px (evita zoom en iOS)
- Line height: 1.5 para lectura
- Max width párrafos: 65 caracteres

**Forms:**
- Inputs grandes (min-height: 48px)
- Labels arriba del input (no flotantes)
- Error messages debajo, en rojo
- Auto-focus en primer campo relevante
- Keyboard type correcto (email, number, tel)

**Navigation:**
- Bottom tab bar (alcanzable con pulgar)
- Swipe gestures para volver
- Confirmación antes de acciones destructivas

### 8.3 Estados y Feedback

**Loading:**
```typescript
// Skeleton screens (preferido sobre spinners)
<SkeletonCard />
<SkeletonText lines={3} />
<SkeletonCircle />

// Spinner cuando skeleton no aplica
<Spinner size="sm" | "md" | "lg" />
```

**Empty States:**
```typescript
<EmptyState
  icon={<IconDumbbell />}
  title="No hay entrenamientos aún"
  description="Comienza tu primer sesión para ver el análisis"
  action={
    <Button onClick={startWorkout}>
      Iniciar Entrenamiento
    </Button>
  }
/>
```

**Toast Notifications:**
```typescript
toast.success("Check-in guardado ✅")
toast.error("Error al subir foto")
toast.info("Trial expira en 3 días")
toast.warning("Hace 16 días sin check-in")
```

### 8.4 Accessibility

**Mínimos:**
- Contraste WCAG AA (4.5:1 para texto)
- Focus indicators visibles
- Labels en todos los inputs
- Alt text en imágenes
- Keyboard navigation funcional
- Screen reader friendly (ARIA labels donde aplica)

---

## 9) MONETIZACIÓN

### 9.1 Modelo Freemium

**Free (siempre gratis):**
- ✅ Registro y perfil básico
- ✅ Workout logger limitado (max 3 ejercicios/sesión)
- ✅ Check-in básico (1 foto)
- ✅ Dashboard resumido
- ✅ Export limitado (último mes, CSV)
- ❌ Pre-workout IA (solo reglas manuales)
- ❌ Post-workout IA (solo resumen numérico)
- ❌ Gráficos avanzados
- ❌ Nutrición completa
- ❌ Farmacología
- ❌ Auditoría global IA
- ❌ Personalización de coach tone (solo strict)

**Trial (7 días gratis, automático):**
- ✅ TODO desbloqueado
- ✅ Sin tarjeta de crédito requerida
- ✅ Banner: "Trial - Quedan X días"
- ✅ Emails recordatorios (día 5, día 6)
- ➡️ Al expirar: downgrade a Free

**Pro (pago):**
- ✅ TODO desbloqueado permanentemente
- ✅ Precios:
  - **Mensual**: $9.99/mes
  - **Anual**: $89.99/año (ahorra 25% = $7.49/mes)
- ✅ Cancelación en cualquier momento
- ✅ Garantía de 14 días (reembolso si no satisface)

### 9.2 Locked View (Conversion Funnel)

**Trigger:**
Usuario Free intenta acceder a feature Pro

**Contenido:**
```
🔒 DESBLOQUEA TU POTENCIAL COMPLETO

Heavy Duty PRO incluye:
✅ Coach IA personalizado (4 tonos)
✅ Análisis post-sesión con Story Cards
✅ Auditoría global con detección de patrones
✅ Gráficos de progreso avanzados
✅ Módulo de nutrición completo
✅ Registro de farmacología (privado)
✅ Workout logger ilimitado
✅ Check-ins con 3 fotos

💰 PRECIOS:
[Tab: Mensual] [Tab: Anual ⭐ AHORRA 25%]

$9.99/mes              $89.99/año
Facturado mensual      Facturado anual
= $9.99/mes            = $7.49/mes

🎉 PRUEBA GRATIS 7 DÍAS
Sin tarjeta • Cancela cuando quieras

[COMENZAR TRIAL GRATIS] ← CTA primario

[Ver comparación detallada] ← Link secundario

---

❤️ TESTIMONIOS:
"Finalmente entiendo mi progreso real" - Juan P.
"El coach IA es increíble" - María G.
"Vale cada centavo" - Carlos D.

🔒 Garantía: Cancela en 14 días, reembolso completo
```

### 9.3 Integración Stripe (V1)

**Setup:**
1. Crear cuenta Stripe
2. Crear 2 productos:
   - "Heavy Duty Pro - Mensual" ($9.99, recurring monthly)
   - "Heavy Duty Pro - Anual" ($89.99, recurring yearly)
3. Configurar webhooks en Vercel Edge Function
4. Customer Portal para auto-gestión

**Checkout Flow:**
```typescript
// Frontend
import { loadStripe } from '@stripe/stripe-js'

const handleSubscribe = async (priceId: string) => {
  const stripe = await loadStripe(STRIPE_PUBLIC_KEY)
  
  // Crear checkout session vía Edge Function
  const { sessionId } = await fetch('/api/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId })
  }).then(r => r.json())
  
  // Redirect a Stripe Checkout
  await stripe.redirectToCheckout({ sessionId })
}
```

**Webhooks (Edge Function):**
```typescript
// /api/stripe-webhook
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  
  switch (event.type) {
    case 'checkout.session.completed':
      // User completó pago
      const session = event.data.object
      await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_expires_at: new Date(session.subscription.current_period_end)
        })
        .eq('user_id', session.metadata.userId)
      break
      
    case 'customer.subscription.updated':
      // Subscription renovada
      // Actualizar premium_expires_at
      break
      
    case 'customer.subscription.deleted':
      // Subscription cancelada
      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('stripe_customer_id', event.data.object.customer)
      break
  }
  
  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
```

**Customer Portal:**
```typescript
const openCustomerPortal = async () => {
  const { url } = await fetch('/api/create-portal-session', {
    method: 'POST',
    body: JSON.stringify({ userId })
  }).then(r => r.json())
  
  window.location.href = url
}
```

---

## 10) MÉTRICAS Y KPIs

### 10.1 North Star Metric
**Usuarios activos semanales (WAU) que completan el flujo completo** (Pre → Workout → Analysis) **al menos 1 vez por semana**

**Target:** 60% de usuarios Pro

### 10.2 Métricas de Producto

**Engagement:**
- DAU / WAU / MAU
- D1 / D7 / D30 Retention
- Avg sessions per user/week
- Avg time in app
- % users completing full flow (Pre→Log→Analysis)
- % users doing check-in every ≤15 days

**Feature Adoption (Pro users):**
- % using Pre-Workout IA
- % using Post-Workout IA
- % using Global Analysis
- % using Nutrition module
- % using Pharmacology module
- % generating Story Cards

### 10.3 Métricas de Negocio

**Conversión:**
- Signup → Trial start rate (target: 100% automático)
- Trial → Paid conversion (target: 40%)
- Free → Paid conversion (target: 15%)

**Revenue:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value) - target: $120
- CAC (Customer Acquisition Cost) - target: <$40
- LTV:CAC ratio - target: >3:1

**Churn:**
- Monthly churn rate (target: <7%)
- Reasons for cancellation (survey)
- Win-back rate

### 10.4 Métricas de IA

**Usage:**
- Total AI requests/day
- Requests por usuario Pro/día
- Breakdown por acción (pre/post/global)

**Quality:**
- User rating (thumbs up/down) - target: >75% 👍
- Avg tokens per request
- Latency p50 / p95 / p99
- Error rate (target: <2%)
- Fallback rate (target: <5%)

**Cost:**
- Total AI cost/day
- Cost per AI request
- Cost per active user/month - target: <$1
- % of revenue spent on AI - target: <10%

### 10.5 Métricas Técnicas

**Performance:**
- TTI (Time to Interactive) - target: <2.5s mobile
- LCP (Largest Contentful Paint) - target: <2s
- FID (First Input Delay) - target: <100ms
- CLS (Cumulative Layout Shift) - target: <0.1

**Reliability:**
- Uptime - target: >99.5%
- Error rate - target: <1%
- API response time p95 - target: <500ms
- DB query time p95 - target: <100ms

**Offline:**
- % sessions with offline usage
- Sync success rate - target: >95%
- Avg sync time

### 10.6 Dashboard para Admin

**Vista principal:**
```
┌─────────────────────────────────────┐
│ HEAVY DUTY ADMIN DASHBOARD          │
│ Última actualización: Hace 5 min    │
├─────────────────────────────────────┤
│ 📊 MÉTRICAS CLAVE (Últimos 7 días)  │
│                                     │
│ WAU: 1,247 (+8.2% vs semana ant)   │
│ MRR: $12,384 (+12%)                 │
│ Trial→Paid: 42% (target: 40%) ✅   │
│ Churn: 4.2% (target: <7%) ✅        │
│                                     │
│ Requests IA: 8,420 (+15%)           │
│ Costo IA: $84.20                    │
│ AI User Rating: 82% 👍              │
│                                     │
│ Uptime: 99.8% ✅                    │
│ Error rate: 0.8% ✅                 │
├─────────────────────────────────────┤
│ 📈 GRÁFICOS                         │
│ [LineChart: WAU últimos 90 días]   │
│ [BarChart: Conversiones por día]   │
│ [PieChart: Uso de features Pro]    │
│ [LineChart: Costo IA vs Revenue]   │
└─────────────────────────────────────┘
```

---

## 11) RIESGOS Y MITIGACIONES

### 11.1 Técnicos

**Riesgo 1: RLS mal configurada → fuga de datos**  
**Severidad:** CRÍTICA  
**Mitigación:**
- Tests automáticos de políticas RLS
- Checklist de seguridad pre-deploy
- Auditoría manual de SQL cada release
- Penetration testing trimestral

**Riesgo 2: Offline sync conflicts → datos duplicados o perdidos**  
**Severidad:** ALTA  
**Mitigación:**
- Outbox pattern con IDs determinísticos (UUIDv7)
- Last-write-wins con timestamps
- UI clara de estado de sync
- Logs detallados de conflictos
- Manual override para resolver manualmente

**Riesgo 3: Latencia/costo de IA excesivo**  
**Severidad:** MEDIA  
**Mitigación:**
- Rate limiting estricto (max 10 requests/día por user free, 50 para pro)
- Caché de respuestas comunes
- Timeout de 10s con fallback
- Alertas cuando costo/día > $50
- Compresión de payloads antes de enviar

**Riesgo 4: Dependencia de Gemini API (vendor lock-in)**  
**Severidad:** MEDIA  
**Mitigación:**
- Abstracción del provider (interface `AIProvider`)
- Fallback a reglas deterministicas siempre disponible
- Considerar OpenAI/Claude como backup (V2)
- Monitorear status.google.com

### 11.2 Negocio

**Riesgo 5: Baja conversión Trial→Paid**  
**Severidad:** ALTA  
**Mitigación:**
- Emails de onboarding personalizados
- In-app tips para features clave
- Caso de uso obligatorio en trial (completar 1 flujo completo)
- Survey de por qué no convirtieron
- Oferta especial día 6 del trial

**Riesgo 6: Alto churn**  
**Severidad:** ALTA  
**Mitigación:**
- Exit survey obligatorio
- Email de win-back a los 7 días
- Analizar patrones (¿cancelan después de X días?)
- Mejorar features más usadas
- "Pause subscription" en vez de cancel

**Riesgo 7: Competencia (apps genéricas o nicho similar)**  
**Severidad:** MEDIA  
**Mitigación:**
- Diferenciación clara: IA + sobrecarga progresiva
- Nicho específico (HIT, no fitness general)
- Calidad sobre cantidad de features
- Community building (Discord, testimonials)
- Roadmap público para mostrar innovación

### 11.3 Legal/Privacidad

**Riesgo 8: Farmacología - responsabilidad legal**  
**Severidad:** CRÍTICA  
**Mitigación:**
- Disclaimers prominentes y obligatorios
- Opt-in explícito separado
- NO hacer recomendaciones de compuestos o dosis
- Bucket ultra-privado (solo owner, encriptado)
- Export y delete inmediatos (GDPR)
- Consulta legal pre-launch de esta feature
- Geofencing si es necesario (no disponible en ciertos países)

**Riesgo 9: GDPR/Privacy - mal manejo de datos personales**  
**Severidad:** ALTA  
**Mitigación:**
- Privacy policy clara y accesible
- Cookie consent (si aplica)
- Export de datos completo on-demand
- Delete account completo (hard delete en 30 días)
- No compartir datos con terceros (salvo processors: Stripe, Supabase)
- Anonimización en analytics
- DPO designado (Data Protection Officer) si >10K users EU

### 11.4 Operacionales

**Riesgo 10: Admin panel accesible por no-admins**  
**Severidad:** CRÍTICA  
**Mitigación:**
- Verificación de `is_admin` en TODOS los endpoints
- RLS en tablas admin (ai_logs, ai_prompts)
- 2FA obligatorio para admins (V1)
- Logs de acciones admin (audit trail)
- Review access cada 90 días

**Riesgo 11: Prompts editados que rompen JSON output**  
**Severidad:** MEDIA  
**Mitigación:**
- Validación de JSON schema antes de activar prompt
- Sandbox para testear prompt antes de prod
- Rollback automático si error rate >10% post-deploy
- Notification a admin si prompt falla >5 veces
- Versioning claro + changelog

---

## 12) CHECKLIST DE ACEPTACIÓN

### MVP (Marcar cuando esté completo)

**Auth:**
- [ ] Signup con email+password funciona
- [ ] Email de verificación se envía y el link funciona
- [ ] Login solo permite acceso con email verificado
- [ ] Forgot password funciona end-to-end
- [ ] Onboarding de 7 pasos se completa
- [ ] Trial de 7 días se activa automáticamente

**Perfil:**
- [ ] Usuario puede editar perfil básico
- [ ] Avatar se sube a Storage correctamente
- [ ] Coach tone se puede cambiar
- [ ] Discipline se puede seleccionar
- [ ] Units (kg/lb) afectan toda la app

**Dashboard:**
- [ ] Muestra estado PRO/FREE/TRIAL correctamente
- [ ] Resumen semanal calcula bien
- [ ] Alertas aparecen cuando aplican
- [ ] Navegación a features funciona

**Pre-Workout:**
- [ ] Form captura todos los inputs
- [ ] Gemini retorna decisión coherente (PRO)
- [ ] Fallback funciona si IA falla
- [ ] FREE users ven solo reglas manuales
- [ ] Decision se guarda en logs

**Workout Logger:**
- [ ] Autocomplete de músculo funciona
- [ ] Autocarga sesión previa del mismo músculo
- [ ] "Objetivo a superar" se muestra
- [ ] Se pueden agregar múltiples ejercicios y sets
- [ ] Progreso se calcula correctamente (PROGRESS/PLATEAU/REGRESSION)
- [ ] Sesión se guarda con estructura correcta

**Post-Workout Analysis:**
- [ ] Compara correctamente con sesión anterior
- [ ] Gemini retorna veredicto coherente (PRO)
- [ ] Story Card se genera con buena calidad
- [ ] Sharing funciona en mobile
- [ ] FREE users ven solo resumen numérico

**Check-in:**
- [ ] Peso se guarda y muestra delta
- [ ] 3 fotos se suben correctamente
- [ ] Reminder aparece si >15 días sin check-in
- [ ] Gallery muestra check-ins ordenados

**Paywall:**
- [ ] Locked View se muestra para features PRO
- [ ] Copy es convincente y claro
- [ ] Features FREE funcionan sin bloqueo
- [ ] Trial countdown se muestra

**Infraestructura:**
- [ ] RLS aplicado y validado en todas las tablas
- [ ] Storage policies funcionan correctamente
- [ ] PWA instalable en móvil
- [ ] Service Worker cachea assets
- [ ] Deploy a Vercel funciona automáticamente

**Performance:**
- [ ] TTI en móvil <3s
- [ ] Gemini responde en <5s p95
- [ ] No hay errores en consola
- [ ] App funciona en offline mode básico

---

### V1 (Checklist adicional)

**Nutrición:**
- [ ] Estrategia (única/ciclado) se guarda
- [ ] Timing de suplementos es editable
- [ ] Log diario es rápido (<1min)
- [ ] Se correlaciona en auditoría global

**Farmacología:**
- [ ] Disclaimer se muestra y bloquea
- [ ] Ciclos se guardan en bucket privado
- [ ] Solo owner puede acceder (RLS validado)
- [ ] NUNCA se envía a IA sin opt-in
- [ ] Export y delete funcionan

**Auditoría Global IA:**
- [ ] Solo ejecutable cada 7 días
- [ ] Agrega y resume datos correctamente
- [ ] Gemini detecta patrones coherentes
- [ ] Plan de 14 días es accionable
- [ ] Reporte exportable como PDF

**Admin Panel:**
- [ ] Solo accesible por `is_admin=true`
- [ ] Dashboard muestra métricas correctas
- [ ] Búsqueda de usuarios funciona
- [ ] Editor de prompts guarda versiones
- [ ] A/B testing asigna tráfico correctamente
- [ ] Logs de IA son completos y buscables
- [ ] Feature flags activar/desactivar funciona
- [ ] Alertas se envían cuando aplican

**Stripe:**
- [ ] Checkout crea subscripción
- [ ] Webhooks sincronizan `is_premium`
- [ ] Customer Portal funciona (cambiar plan, cancelar)
- [ ] Trial se cancela automáticamente si no paga
- [ ] Refund funciona (14 días)

---

## 🎉 RESUMEN EJECUTIVO

Heavy Duty Di Iorio es una **PWA de coaching fitness asistido por IA** que resuelve la ansiedad del atleta mediante:

1. **Toma de decisiones inteligente**: IA decide si entrenar o descansar
2. **Sobrecarga progresiva forzada**: Siempre muestra qué superar
3. **Análisis de correlaciones**: Detecta patrones ocultos en el historial
4. **Personalización**: 4 tonos de coach + multi-disciplina
5. **Panel de admin robusto**: Control total de prompts, métricas y costos

**Stack:**
- Frontend: React 18 + Vite + TypeScript + Tailwind
- Backend: Supabase (Auth + Postgres + Storage + Edge Functions)
- IA: Gemini 3 Pro con prompts versionados
- Deploy: Dyad → GitHub → Vercel

**Monetización:**
- Freemium: Trial 7 días gratis → $9.99/mes o $89.99/año
- Target: 40% trial→paid, <7% churn, LTV:CAC >3:1

**Diferenciador clave:**
No competimos por cantidad de features genéricas.  
Competimos por **calidad de insights** y **relevancia del feedback**.

**Timeline:**
- MVP (6 semanas): Core features + Auth + Paywall
- V1 (6 semanas): Nutrición + Farmacología + Admin Panel + Stripe
- V2 (futuro): Multi-atleta + Wearables + ML + API pública

---

**¿Listo para construir?**  
Este PRD es tu guía completa. Ahora es momento de ejecutar. 💪

