import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formats a date to a readable string (e.g., "31 de Enero, 2026")
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
};

/**
 * Formats a date relative to now (e.g., "hace 2 horas")
 */
export const formatTimeAgo = (date: string | Date | undefined): string => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
};

/**
 * Formats seconds into MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};