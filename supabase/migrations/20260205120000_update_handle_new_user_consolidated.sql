CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  role_input TEXT;
  display_name_input TEXT;
  plan_type_input TEXT;
BEGIN
  -- Extraer datos de los metadatos enviados desde el frontend (Auth.tsx)
  role_input := COALESCE(new.raw_user_meta_data ->> 'role', 'athlete');
  display_name_input := COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  plan_type_input := COALESCE(new.raw_user_meta_data ->> 'plan_type', 'starter');

  -- Inserción única y consolidada en la tabla de perfiles
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name, 
    user_role,
    is_coach,
    coach_tone,
    discipline,
    units,
    trial_started_at,
    -- Campos específicos de atleta (condicional)
    tier,
    subscription_status,
    -- Campos específicos de coach (condicional)
    plan_type,
    business_name,
    student_limit
  )
  VALUES (
    new.id, 
    new.email, 
    display_name_input,
    role_input,
    (role_input = 'coach'),
    COALESCE(new.raw_user_meta_data ->> 'tone', 'strict'),
    'general',
    'kg',
    NOW(),
    -- Lógica condicional para campos de atleta
    CASE WHEN role_input = 'athlete' THEN 'free' ELSE NULL END,
    CASE WHEN role_input = 'athlete' THEN 'active' ELSE NULL END,
    -- Lógica condicional para campos de coach
    CASE WHEN role_input = 'coach' THEN plan_type_input ELSE NULL END,
    CASE WHEN role_input = 'coach' THEN display_name_input ELSE NULL END,
    CASE 
      WHEN role_input = 'coach' AND plan_type_input = 'hub' THEN 50
      WHEN role_input = 'coach' THEN 15
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$function$