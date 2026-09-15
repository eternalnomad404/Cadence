export interface GymLog {
  hit: boolean;
  score: number; // 1 to 5
  cardio?: boolean;
  workoutType?: string;
  note?: string;
}

export interface DietLog {
  score: number; // 1 to 5
  protein_g: number;
  calories?: number;
  deficit_ok: boolean;
  note?: string;
  /** maintenance (2400) - intake; positive = deficit */
  energy_delta?: number;
}

export interface WeightLog {
  morning_kg: number;
}

export interface SleepLog {
  asleep_at: string;
  woke_at: string;
  alarm_used: boolean;
  score: number; // 1 to 5
  note?: string;
}

export interface HabitLog {
  done: boolean;
  note?: string;
}

export interface WorkLane {
  score: number; // 1 to 5 (or 0 if starved)
  note: string;
}

export interface WorkLog {
  keepalive: WorkLane;
  leverage: WorkLane;
  future: WorkLane;
}

export interface AcademicsLog {
  active: boolean;
  score: number | null; // 1 to 5 when active
  note?: string;
}

export interface ReflectionLog {
  wins: string[];
  friction: string;
  tomorrow: string;
  voiceDumpSnippet?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  dayScore?: number;
  weight?: WeightLog | null;
  gym: GymLog;
  diet: DietLog;
  sleep: SleepLog;
  night_brush: HabitLog;
  work: WorkLog;
  academics: AcademicsLog;
  reflection: ReflectionLog;
}

export const CHALLENGE_START_DATE = '2026-09-05';
export const CHALLENGE_TOTAL_DAYS = 30;

/**
 * Calculates the Day Score as a simple equal-weighted average of all active scored items:
 * - Body: gym.score, diet.score
 * - Sleep: sleep.score
 * - Habits: night_brush (done ? 5 : 0)
 * - Work: keepalive.score, leverage.score, future.score
 * - Academics: academics.score (only included if active and non-null)
 */
export function calculateDayScore(log: DayLog): number {
  const scores: number[] = [
    log.gym.score,
    log.diet.score,
    log.sleep.score,
    log.night_brush.done ? 5 : 0,
    log.work.keepalive.score,
    log.work.leverage.score,
    log.work.future.score,
  ];

  if (log.academics.active && typeof log.academics.score === 'number') {
    scores.push(log.academics.score);
  }

  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / scores.length).toFixed(1));
}

/**
 * Computes rollups for category strips
 */
export function getCategoryRollups(log: DayLog) {
  const bodyAvg = Number(((log.gym.score + log.diet.score) / 2).toFixed(1));
  const workAvg = Number(
    ((log.work.keepalive.score + log.work.leverage.score + log.work.future.score) / 3).toFixed(1)
  );
  const habitsScore = log.night_brush.done ? 5 : 0;
  const sleepScore = log.sleep.score;
  const academicsScore = log.academics.active && log.academics.score !== null ? log.academics.score : null;

  const isFutureStarved = log.work.future.score <= 1;

  return {
    bodyAvg,
    workAvg,
    habitsScore,
    sleepScore,
    academicsScore,
    isFutureStarved,
  };
}
