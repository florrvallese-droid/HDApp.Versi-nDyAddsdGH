-- Desactivar temporalmente para poder modificar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar la política problemática existente si existe
DROP POLICY IF EXISTS "Superadmin can view all" ON public.profiles;

-- Crear la nueva política segura que usa la función
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (get_is_admin());

-- Reactivar la seguridad a nivel de fila
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;