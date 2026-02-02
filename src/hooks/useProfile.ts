import { useProfileContext } from "@/contexts/ProfileContext";

/**
 * Hook centralizado para acceder a los perfiles de Atleta, Coach y Admin.
 */
export function useProfile() {
  return useProfileContext();
}