-- Primero, eliminamos la columna existente que permite inconsistencias.
ALTER TABLE public.profiles DROP COLUMN is_coach;

-- Luego, la volvemos a agregar como una columna GENERADA.
-- Su valor ahora se calculará AUTOMÁTICAMENTE a partir de `user_role`.
-- Esto garantiza que `is_coach` siempre será `true` si `user_role` es 'coach', y `false` en caso contrario.
ALTER TABLE public.profiles
ADD COLUMN is_coach BOOLEAN GENERATED ALWAYS AS (user_role = 'coach') STORED;