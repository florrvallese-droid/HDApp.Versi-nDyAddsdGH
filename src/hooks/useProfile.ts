import { useProfileContext } from "@/contexts/ProfileContext";

/**
 * Hook para acceder al perfil del usuario y estado de sesión.
 * Ahora centralizado a través de ProfileContext.
 */
export function useProfile() {
  return useProfileContext();
}