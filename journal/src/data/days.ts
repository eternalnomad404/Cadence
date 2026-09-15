import {
  DayLog,
  CHALLENGE_START_DATE,
  CHALLENGE_TOTAL_DAYS,
  calculateDayScore,
} from '../types';
import { loadDaysData, getTodayDateString, getDefaultSelectedDate } from './loadDays';

export { CHALLENGE_START_DATE, CHALLENGE_TOTAL_DAYS, loadDaysData, getTodayDateString, getDefaultSelectedDate };

/** Merged seed + logged JSON from ../Plan/data/days */
export const INITIAL_DAYS_DATA: Record<string, DayLog> = loadDaysData();

/**
 * Returns formatted date string like "Sat 22 Aug 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Computes day number in 30-day challenge relative to CHALLENGE_START_DATE
 */
export function getChallengeDayNumber(dateStr: string): {
  dayNumber: number;
  isBefore: boolean;
  isAfter: boolean;
} {
  const startParts = CHALLENGE_START_DATE.split('-');
  const start = new Date(
    parseInt(startParts[0], 10),
    parseInt(startParts[1], 10) - 1,
    parseInt(startParts[2], 10)
  );
  const parts = dateStr.split('-');
  const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return {
    dayNumber: diffDays,
    isBefore: diffDays < 1,
    isAfter: diffDays > CHALLENGE_TOTAL_DAYS,
  };
}

/**
 * Compute overall 30-day body commit stats from all logged days
 */
export function get30DayBodyStats(daysMap: Record<string, DayLog>) {
  const sortedDates = Object.keys(daysMap).sort();
  const logs = sortedDates.map((d) => daysMap[d]);

  const loggedCount = logs.length;
  const gymHits = logs.filter((l) => l.gym.hit).length;
  const gymHitRate = loggedCount > 0 ? Math.round((gymHits / loggedCount) * 100) : 0;

  const totalDietScore = logs.reduce((acc, l) => acc + l.diet.score, 0);
  const avgDietScore = loggedCount > 0 ? (totalDietScore / loggedCount).toFixed(1) : '0.0';

  const deficitHits = logs.filter((l) => l.diet.deficit_ok).length;
  const deficitRate = loggedCount > 0 ? Math.round((deficitHits / loggedCount) * 100) : 0;

  const avgProtein =
    loggedCount > 0 ? Math.round(logs.reduce((acc, l) => acc + l.diet.protein_g, 0) / loggedCount) : 0;

  const brushHits = logs.filter((l) => l.night_brush.done).length;
  const brushRate = loggedCount > 0 ? Math.round((brushHits / loggedCount) * 100) : 0;

  const noAlarmHits = logs.filter((l) => !l.sleep.alarm_used).length;
  const naturalWakeRate = loggedCount > 0 ? Math.round((noAlarmHits / loggedCount) * 100) : 0;

  return {
    loggedCount,
    gymHits,
    gymHitRate,
    avgDietScore,
    deficitHits,
    deficitRate,
    avgProtein,
    brushRate,
    naturalWakeRate,
  };
}

/**
 * Returns the list of last 7 calendar days ending on current selected date
 */
export function getSurroundingDays(currentDateStr: string, daysMap: Record<string, DayLog>) {
  const parts = currentDateStr.split('-');
  const curr = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(curr);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const log = daysMap[dateKey] || null;
    const score = log ? (log.dayScore ?? calculateDayScore(log)) : null;

    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

    result.push({
      date: dateKey,
      dayName,
      dayOfMonth: d.getDate(),
      hasLog: !!log,
      score,
      log,
      isCurrent: dateKey === currentDateStr,
    });
  }

  return result;
}
