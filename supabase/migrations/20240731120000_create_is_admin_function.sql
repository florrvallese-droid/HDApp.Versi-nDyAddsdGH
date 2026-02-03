CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
END;
$$;