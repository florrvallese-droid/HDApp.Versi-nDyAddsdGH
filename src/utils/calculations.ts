import { WorkoutExercise } from "@/types";

/**
 * Calculates the total volume of a workout (weight * reps for all sets)
 */
export const calculateTotalVolume = (exercises: WorkoutExercise[]): number => {
  let totalVolume = 0;
  exercises.forEach(ex => {
    ex.sets.forEach(set => {
      totalVolume += (Number(set.weight || 0) * Number(set.reps || 0));
    });
  });
  return totalVolume;
};

/**
 * Estimates 1 Rep Max using the Epley formula
 */
export const calculateOneRM = (weight: number, reps: number): number => {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

/**
 * Calculates the percentage change between two numbers
 */
export const calculateDelta = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};