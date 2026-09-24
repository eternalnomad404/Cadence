import type { DayFile } from './loadDays';

export type HabitTimeKind = 'learning' | 'outreach';

export type HabitTimeDraft = {
  hours: number;
  minutes: number;
};

const STORAGE_KEYS: Record<HabitTimeKind, string> = {
  learning: 'cadence_learning_drafts',
  outreach: 'cadence_outreach_drafts',
};

export function normalizeHabitTime(hours: number, minutes: number): HabitTimeDraft {
  const h = Number.isFinite(hours) ? Math.min(12, Math.max(0, Math.round(hours))) : 0;
  const rawM = Number.isFinite(minutes) ? Math.round(minutes / 15) * 15 : 0;
  const m = Math.min(45, Math.max(0, rawM));
  return { hours: h, minutes: m };
}

export function formatHabitTime(draft: HabitTimeDraft): string {
  const mm = String(draft.minutes).padStart(2, '0');
  return `${draft.hours}h ${mm}m`;
}

function extractKind(raw: DayFile, kind: HabitTimeKind): HabitTimeDraft | null {
  if (!raw?.date) return null;
  const block = (raw as unknown as Record<string, unknown>)[kind];
  if (!block || typeof block !== 'object') return null;
  const hours = (block as { hours?: unknown }).hours;
  const minutes = (block as { minutes?: unknown }).minutes;
  if (typeof hours !== 'number' || typeof minutes !== 'number') return null;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return normalizeHabitTime(hours, minutes);
}

export function loadHabitTimeDraftsFromFiles(kind: HabitTimeKind): Record<string, HabitTimeDraft> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const out: Record<string, HabitTimeDraft> = {};
  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (raw.logged === true) continue;
      const draft = extractKind(raw, kind);
      if (draft && raw.date) out[raw.date] = draft;
    }
  };
  ingest(planModules);
  ingest(journalModules);
  return out;
}

export function readHabitTimeDraftsFromStorage(kind: HabitTimeKind): Record<string, HabitTimeDraft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[kind]);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, HabitTimeDraft>;
  } catch {
    return {};
  }
}

export function writeHabitTimeDraftToStorage(kind: HabitTimeKind, date: string, draft: HabitTimeDraft) {
  const all = readHabitTimeDraftsFromStorage(kind);
  all[date] = draft;
  localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(all));
}

export function mergeHabitTimeDrafts(
  fromFiles: Record<string, HabitTimeDraft>,
  fromStorage: Record<string, HabitTimeDraft>
): Record<string, HabitTimeDraft> {
  return { ...fromFiles, ...fromStorage };
}

export async function saveHabitTimeLog(
  kind: HabitTimeKind,
  date: string,
  hours: number,
  minutes: number
): Promise<{ draft: HabitTimeDraft; persisted: 'file' | 'local' }> {
  const draft = normalizeHabitTime(hours, minutes);
  writeHabitTimeDraftToStorage(kind, date, draft);

  try {
    const res = await fetch('/api/log-habit-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, kind, time: draft }),
    });
    if (res.ok) return { draft, persisted: 'file' };
  } catch {
    // local only
  }

  return { draft, persisted: 'local' };
}
