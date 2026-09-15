import type { GymLog } from '../types';

/**
 * Gym quick-log scoring (Cadence v1):
 * - Missed gym → 1
 * - Gym, no cardio → 4
 * - Gym + cardio → 5
 */
export function scoreGymFromAnswers(hit: boolean, cardio: boolean): GymLog {
  if (!hit) {
    return { hit: false, score: 1, cardio: false, note: '' };
  }
  return {
    hit: true,
    score: cardio ? 5 : 4,
    cardio,
    note: '',
  };
}
