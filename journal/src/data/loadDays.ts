import type { DayLog } from '../types';
import { calculateDayScore } from '../types';
import { SEED_DAYS_DATA } from './seedDays';

/** Shape written by Cursor/AI into journal/data/days/YYYY-MM-DD.json */
export interface DayFile extends Partial<DayLog> {
  date: string;
  logged?: boolean | null;
}

function isCompleteLog(raw: DayFile): raw is DayFile & DayLog {
  if (!raw?.date) return false;
  if (!raw.gym || !raw.diet || !raw.sleep || !raw.night_brush || !raw.work || !raw.academics) {
    return false;
  }
  // Full day: explicitly logged, or every core score present (not a gym-only draft)
  if (raw.logged === true) return true;
  const dietScore = (raw.diet as { score?: number | null }).score;
  const sleepScore = (raw.sleep as { score?: number | null }).score;
  const gymScore = (raw.gym as { score?: number | null }).score;
  return (
    typeof gymScore === 'number' &&
    gymScore !== null &&
    typeof dietScore === 'number' &&
    dietScore !== null &&
    typeof sleepScore === 'number' &&
    sleepScore !== null
  );
}

function normalizeLog(raw: DayFile & DayLog): DayLog {
  const log: DayLog = {
    date: raw.date,
    gym: raw.gym,
    diet: raw.diet,
    sleep: raw.sleep,
    night_brush: raw.night_brush,
    work: raw.work,
    academics: raw.academics,
    reflection: raw.reflection ?? { wins: [], friction: '', tomorrow: '' },
  };
  log.dayScore = raw.dayScore ?? calculateDayScore(log);
  return log;
}

/**
 * Load day JSON from `journal/data/days/` (GitHub source of truth for Netlify).
 * Also merges `Plan/data/days/` when present locally (Plan is not pushed to GitHub).
 * Logged files override seed demo data for the same date.
 */
export function loadDaysData(): Record<string, DayLog> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const fromFiles: Record<string, DayLog> = {};

  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (!isCompleteLog(raw)) continue;
      fromFiles[raw.date] = normalizeLog(raw);
    }
  };

  // Plan first (local), then journal overrides (what Netlify sees)
  ingest(planModules);
  ingest(journalModules);

  return { ...SEED_DAYS_DATA, ...fromFiles };
}

/** Local calendar date as YYYY-MM-DD */
export function getTodayDateString(now = new Date()): string {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDefaultSelectedDate(
  daysMap: Record<string, DayLog>,
  startDate: string,
  today = getTodayDateString()
): string {
  if (daysMap[today]) return today;
  if (today < startDate) return startDate;
  const keys = Object.keys(daysMap).sort();
  if (keys.length === 0) return startDate;
  // Show today (empty state) so the nightly dump target is obvious
  return today;
}
