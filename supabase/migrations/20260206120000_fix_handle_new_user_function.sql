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
  -- Extraer rol. Default a 'athlete'.
  role_input := COALESCE(new.raw_user_meta_data ->> 'role', 'athlete');
  -- Generar display_name a partir del email.
  display_name_input := split_part(new.email, '@', 1);

  -- Insertar en la tabla principal de perfiles con todos los defaults explícitos.
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name, 
    user_role, 
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
    'strict',  -- Default explícito
    'general', -- Default explícito
    'kg',      -- Default explícito
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insertar en la tabla específica del rol.
  IF role_input = 'athlete' THEN
    INSERT INTO public.athlete_profiles (user_id, tier, subscription_status)
    VALUES (new.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF role_input = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, plan_type, business_name, student_limit)
    VALUES (new.id, 'starter', display_name_input, 15)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$function$