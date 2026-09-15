import type { GymLog } from '../types';
import type { DayFile } from './loadDays';
import { scoreGymFromAnswers } from '../lib/gymScore';

const STORAGE_KEY = 'cadence_gym_drafts';
const LEGACY_STORAGE_KEYS = ['azimuth_gym_drafts', 'meridian_gym_drafts'] as const;

/** Day JSON that has gym scored but is not a full voice-dump log yet */
export function extractGymDraft(raw: DayFile): GymLog | null {
  if (!raw?.date || !raw.gym) return null;
  const g = raw.gym as Partial<GymLog> & { hit?: boolean | null; score?: number | null };
  if (typeof g.hit !== 'boolean') return null;
  if (typeof g.score !== 'number' || g.score === null) return null;
  return {
    hit: g.hit,
    score: g.score,
    cardio: Boolean(g.cardio),
    note: g.note ?? '',
    workoutType: g.workoutType,
  };
}

/** Load gym-only drafts from day JSON files (partial logs). */
export function loadGymDraftsFromFiles(): Record<string, GymLog> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const out: Record<string, GymLog> = {};
  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (raw.logged === true) continue; // full day lives in days map
      const gym = extractGymDraft(raw);
      if (gym && raw.date) out[raw.date] = gym;
    }
  };
  ingest(planModules);
  ingest(journalModules);
  return out;
}

export function readGymDraftsFromStorage(): Record<string, GymLog> {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_STORAGE_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ??
      null;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, GymLog>;
  } catch {
    return {};
  }
}

export function writeGymDraftToStorage(date: string, gym: GymLog) {
  const all = readGymDraftsFromStorage();
  all[date] = gym;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function mergeGymDrafts(
  fromFiles: Record<string, GymLog>,
  fromStorage: Record<string, GymLog>
): Record<string, GymLog> {
  return { ...fromFiles, ...fromStorage };
}

export async function saveGymLog(
  date: string,
  hit: boolean,
  cardio: boolean
): Promise<{ gym: GymLog; persisted: 'file' | 'local' }> {
  const gym = scoreGymFromAnswers(hit, Boolean(hit && cardio));

  writeGymDraftToStorage(date, gym);

  try {
    const res = await fetch('/api/log-gym', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, gym }),
    });
    if (res.ok) {
      return { gym, persisted: 'file' };
    }
  } catch {
    // Netlify / no dev API — localStorage still holds the draft
  }

  return { gym, persisted: 'local' };
}
