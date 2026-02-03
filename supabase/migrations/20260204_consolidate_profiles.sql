-- Paso 1: Modificar el Esquema de la Base de Datos

-- Añadir columnas de athlete_profiles a profiles
ALTER TABLE public.profiles ADD COLUMN tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN subscription_status TEXT DEFAULT 'active';

-- Añadir columnas de coach_profiles a profiles
ALTER TABLE public.profiles ADD COLUMN plan_type TEXT DEFAULT 'starter';
ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
ALTER TABLE public.profiles ADD COLUMN student_limit INTEGER DEFAULT 15;

-- Eliminar Tablas Redundantes
DROP TABLE IF EXISTS public.athlete_profiles;
DROP TABLE IF EXISTS public.coach_profiles;


-- Paso 2: Actualizar la Lógica de Creación de Perfil (Función SQL handle_new_user)

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  role_input TEXT;
  display_name_input TEXT;
BEGIN
  -- Extraer datos de los metadatos enviados desde el frontend (Auth.tsx)
  role_input := COALESCE(new.raw_user_meta_data ->> 'role', 'athlete');
  display_name_input := COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));

  -- Realizar un único INSERT en la tabla consolidada de perfiles
  INSERT INTO public.profiles (
    user_id,
    email,
    display_name,
    user_role,
    coach_tone,
    discipline,
    units,
    trial_started_at,
    -- Campos de Atleta (condicional)
    tier,
    subscription_status,
    -- Campos de Coach (condicional)
    plan_type,
    business_name,
    student_limit
  )
  VALUES (
    new.id,
    new.email,
    display_name_input,
    role_input,
    COALESCE(new.raw_user_meta_data ->> 'tone', 'strict'),
    'general',
    'kg',
    NOW(),
    -- Valores condicionales para Atleta
    CASE WHEN role_input = 'athlete' THEN 'free' ELSE NULL END,
    CASE WHEN role_input = 'athlete' THEN 'active' ELSE NULL END,
    -- Valores condicionales para Coach
    CASE WHEN role_input = 'coach' THEN COALESCE(new.raw_user_meta_data ->> 'plan_type', 'starter') ELSE NULL END,
    CASE WHEN role_input = 'coach' THEN display_name_input ELSE NULL END,
    CASE WHEN role_input = 'coach' THEN
      CASE WHEN (new.raw_user_meta_data ->> 'plan_type' = 'hub') THEN 50 ELSE 15 END
    ELSE NULL END
  );

  RETURN new;
END;
$function$
;