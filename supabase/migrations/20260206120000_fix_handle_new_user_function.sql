CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  role_input TEXT;
  display_name_input TEXT;
  sex_input TEXT;
BEGIN
  -- Extraer datos de los metadatos enviados desde el frontend (Auth.tsx)
  role_input := new.raw_user_meta_data ->> 'role';
  display_name_input := COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  sex_input := new.raw_user_meta_data ->> 'sex';

  -- 1. Insertar en la tabla base de perfiles
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name, 
    user_role,
    is_coach,
    sex,
    coach_tone,
    discipline,
    units,
    trial_started_at
  )
  VALUES (
    new.id, 
    new.email, 
    display_name_input,
    role_input,
    (role_input = 'coach'), -- Establecer el booleano is_coach
    CASE WHEN sex_input = 'Femenino' THEN 'female' ELSE 'male' END, -- Mapear valor
    'strict', -- Valor predeterminado seguro
    'general',
    'kg',
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Insertar en la tabla específica según el rol
  IF role_input = 'athlete' THEN
    INSERT INTO public.athlete_profiles (user_id, tier, subscription_status)
    VALUES (new.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF role_input = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, plan_type, business_name, student_limit)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'plan_type', 'starter'), 
      display_name_input,
      CASE 
        WHEN (new.raw_user_meta_data ->> 'plan_type' = 'hub') THEN 50 
        WHEN (new.raw_user_meta_data ->> 'plan_type' = 'agency') THEN 999
        ELSE 15 
      END
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$