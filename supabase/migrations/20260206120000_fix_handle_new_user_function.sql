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
  -- Extraer solo los datos que estamos SEGUROS que se envían.
  role_input := COALESCE(new.raw_user_meta_data ->> 'role', 'athlete');
  display_name_input := COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));

  -- Insertar en la tabla de perfiles base con valores predeterminados seguros para todo lo demás.
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
    (role_input = 'coach'),
    'male', -- Valor predeterminado seguro
    'strict', -- Valor predeterminado seguro
    'general', -- Valor predeterminado seguro
    'kg', -- Valor predeterminado seguro
    NOW()
  );

  -- Insertar en la tabla específica del rol.
  IF role_input = 'athlete' THEN
    INSERT INTO public.athlete_profiles (user_id, tier, subscription_status)
    VALUES (new.id, 'free', 'active');
  ELSIF role_input = 'coach' THEN
    INSERT INTO public.coach_profiles (user_id, plan_type, business_name, student_limit)
    VALUES (
      new.id, 
      'starter', -- Valor predeterminado seguro
      display_name_input,
      15 -- Valor predeterminado seguro
    );
  END IF;

  RETURN new;
END;
$function$