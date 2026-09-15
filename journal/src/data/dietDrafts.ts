import type { DietDraft, DietEntry } from './foodMenu';
import { buildDietDraft } from './foodMenu';
import type { DayFile } from './loadDays';

const STORAGE_KEY = 'cadence_diet_drafts';
const LEGACY_STORAGE_KEYS = ['azimuth_diet_drafts', 'meridian_diet_drafts'] as const;

export function extractDietDraft(raw: DayFile): DietDraft | null {
  if (!raw?.date || !raw.diet) return null;
  const diet = raw.diet as {
    calories?: number | null;
    protein_g?: number | null;
    entries?: DietEntry[] | null;
  };
  if (!Array.isArray(diet.entries)) {
    // Legacy: only totals, no menu entries
    if (typeof diet.calories === 'number' || typeof diet.protein_g === 'number') {
      return {
        entries: [],
        calories: typeof diet.calories === 'number' ? diet.calories : 0,
        protein_g: typeof diet.protein_g === 'number' ? diet.protein_g : 0,
      };
    }
    return null;
  }
  return buildDietDraft(
    diet.entries.filter((e) => {
      if (!e || typeof e.foodId !== 'string') return false;
      const q = typeof e.qty === 'number' ? e.qty : e.grams;
      return typeof q === 'number' && q > 0;
    })
  );
}

export function loadDietDraftsFromFiles(): Record<string, DietDraft> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const out: Record<string, DietDraft> = {};
  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (raw.logged === true) continue;
      const draft = extractDietDraft(raw);
      if (draft && raw.date && (draft.entries.length > 0 || draft.calories > 0 || draft.protein_g > 0)) {
        out[raw.date] = draft;
      }
    }
  };
  ingest(planModules);
  ingest(journalModules);
  return out;
}

export function readDietDraftsFromStorage(): Record<string, DietDraft> {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      LEGACY_STORAGE_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ??
      null;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DietDraft>;
  } catch {
    return {};
  }
}

export function writeDietDraftToStorage(date: string, draft: DietDraft) {
  const all = readDietDraftsFromStorage();
  all[date] = draft;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function mergeDietDrafts(
  fromFiles: Record<string, DietDraft>,
  fromStorage: Record<string, DietDraft>
): Record<string, DietDraft> {
  return { ...fromFiles, ...fromStorage };
}

export async function saveDietLog(
  date: string,
  entries: DietEntry[]
): Promise<{ draft: DietDraft; persisted: 'file' | 'local' }> {
  const draft = buildDietDraft(entries);
  writeDietDraftToStorage(date, draft);

  try {
    const res = await fetch('/api/log-diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, diet: draft }),
    });
    if (res.ok) return { draft, persisted: 'file' };
  } catch {
    // local only
  }

  return { draft, persisted: 'local' };
}
