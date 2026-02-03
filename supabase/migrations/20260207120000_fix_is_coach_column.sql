-- Eliminamos la columna `is_coach` por completo para evitar redundancia.
-- La única fuente de verdad para el rol del usuario será la columna `user_role`.
-- Usamos `IF EXISTS` para evitar errores si la columna ya fue eliminada.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_coach;