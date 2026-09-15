import type { DayFile } from './loadDays';
import type { DayLog } from '../types';

const STORAGE_KEY = 'cadence_weight_drafts';
const LEGACY_STORAGE_KEYS = ['azimuth_weight_drafts', 'meridian_weight_drafts'] as const;

/** Used only when neither yesterday’s day log nor draft has a morning weight. */
export const FALLBACK_MORNING_KG = 80;

export type WeightDraft = {
  morning_kg: number;
};

export function previousCalendarDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Prefill for today’s weight stepper:
 * previous calendar day’s morning_kg (logged day or draft), else 80.
 */
export function resolveDefaultMorningKg(
  date: string,
  daysMap: Record<string, DayLog>,
  weightDrafts: Record<string, WeightDraft>
): { kg: number; fromPrevious: boolean } {
  const prev = previousCalendarDate(date);
  const fromLog = daysMap[prev]?.weight?.morning_kg;
  if (typeof fromLog === 'number' && Number.isFinite(fromLog) && fromLog > 0) {
    return { kg: Number(fromLog.toFixed(1)), fromPrevious: true };
  }
  const fromDraft = weightDrafts[prev]?.morning_kg;
  if (typeof fromDraft === 'number' && Number.isFinite(fromDraft) && fromDraft > 0) {
    return { kg: Number(fromDraft.toFixed(1)), fromPrevious: true };
  }
  return { kg: FALLBACK_MORNING_KG, fromPrevious: false };
}

export function extractWeightDraft(raw: DayFile): WeightDraft | null {
  if (!raw?.date) return null;
  const w = (raw as { weight?: { morning_kg?: number | null } }).weight;
  if (!w || typeof w.morning_kg !== 'number' || !Number.isFinite(w.morning_kg) || w.morning_kg <= 0) {
    return null;
  }
  return { morning_kg: Number(w.morning_kg.toFixed(1)) };
}

export function loadWeightDraftsFromFiles(): Record<string, WeightDraft> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const out: Record<string, WeightDraft> = {};
  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (raw.logged === true) continue;
      const draft = extractWeightDraft(raw);
      if (draft && raw.date) out[raw.date] = draft;
    }
  };
  ingest(planModules);
  ingest(journalModules);
  return out;
}

export function readWeightDraftsFromStorage(): Record<string, WeightDraft> {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_STORAGE_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ??
      null;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WeightDraft>;
  } catch {
    return {};
  }
}

export function writeWeightDraftToStorage(date: string, draft: WeightDraft) {
  const all = readWeightDraftsFromStorage();
  all[date] = draft;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function mergeWeightDrafts(
  fromFiles: Record<string, WeightDraft>,
  fromStorage: Record<string, WeightDraft>
): Record<string, WeightDraft> {
  return { ...fromFiles, ...fromStorage };
}

export async function saveWeightLog(
  date: string,
  morning_kg: number
): Promise<{ draft: WeightDraft; persisted: 'file' | 'local' }> {
  const draft: WeightDraft = { morning_kg: Number(morning_kg.toFixed(1)) };
  writeWeightDraftToStorage(date, draft);

  try {
    const res = await fetch('/api/log-weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, weight: draft }),
    });
    if (res.ok) return { draft, persisted: 'file' };
  } catch {
    // local only
  }

  return { draft, persisted: 'local' };
}
