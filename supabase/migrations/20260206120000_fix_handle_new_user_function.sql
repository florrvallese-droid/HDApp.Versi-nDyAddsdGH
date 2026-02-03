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
  -- Extraer datos de los metadatos. Usar 'athlete' como fallback si no viene nada.
  role_input := COALESCE(new.raw_user_meta_data ->> 'role', 'athlete');
  display_name_input := COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));

  -- Insertar en la tabla principal de perfiles.
  -- La columna `is_coach` ya no se inserta manualmente, se genera automáticamente.
  INSERT INTO public.profiles (user_id, email, display_name, user_role, trial_started_at)
  VALUES (new.id, new.email, display_name_input, role_input, NOW())
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