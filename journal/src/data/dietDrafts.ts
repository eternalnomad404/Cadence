import type { DietDraft, DietEntry, MealSwap } from './foodMenu';
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
  const draft = buildDietDraft(
    diet.entries.filter((e) => {
      if (!e || typeof e.foodId !== 'string') return false;
      const q = typeof e.qty === 'number' ? e.qty : e.grams;
      return typeof q === 'number' && q > 0;
    })
  );
  const mealsDone = cleanMealsDone((raw.diet as { meals_done?: unknown }).meals_done);
  const mealSwaps = cleanMealSwaps((raw.diet as { meal_swaps?: unknown }).meal_swaps);
  return {
    ...draft,
    ...(mealsDone.length ? { mealsDone } : {}),
    ...(Object.keys(mealSwaps).length ? { mealSwaps } : {}),
  };
}

export function cleanMealsDone(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && /^meal\d(:[a-z0-9-]+)?$/.test(v)))];
}

export function cleanMealSwaps(value: unknown): Record<string, MealSwap> {
  const out: Record<string, MealSwap> = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
  for (const [slot, swap] of Object.entries(value as Record<string, unknown>)) {
    if (!/^meal\d:[a-z0-9-]+$/.test(slot) || !swap || typeof swap !== 'object') continue;
    const { foodId, qty } = swap as { foodId?: unknown; qty?: unknown };
    if (typeof foodId !== 'string' || !/^[a-z0-9-]+$/.test(foodId)) continue;
    if (typeof qty !== 'number' || !Number.isFinite(qty) || qty <= 0) continue;
    out[slot] = { foodId, qty };
  }
  return out;
}

/** True when a day has anything worth keeping: food logged or meal-plan ticks/swaps. */
export function hasDietContent(d: DietDraft): boolean {
  return (
    d.entries.length > 0 ||
    d.calories > 0 ||
    d.protein_g > 0 ||
    (d.mealsDone?.length ?? 0) > 0 ||
    Object.keys(d.mealSwaps ?? {}).length > 0
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
      if (draft && raw.date && hasDietContent(draft)) {
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
  entries: DietEntry[],
  mealsDone?: string[],
  mealSwaps?: Record<string, MealSwap>
): Promise<{ draft: DietDraft; persisted: 'file' | 'local' }> {
  // Keep the meal ticks and swaps when the diet card saves without knowing about them.
  const stored = readDietDraftsFromStorage()[date];
  const done = cleanMealsDone(mealsDone ?? stored?.mealsDone);
  const swaps = cleanMealSwaps(mealSwaps ?? stored?.mealSwaps);
  const draft: DietDraft = {
    ...buildDietDraft(entries),
    ...(done.length ? { mealsDone: done } : {}),
    ...(Object.keys(swaps).length ? { mealSwaps: swaps } : {}),
  };
  writeDietDraftToStorage(date, draft);

  try {
    const res = await fetch('/api/log-diet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        diet: {
          entries: draft.entries,
          calories: draft.calories,
          protein_g: draft.protein_g,
          ...(mealsDone !== undefined ? { meals_done: done } : {}),
          ...(mealSwaps !== undefined ? { meal_swaps: swaps } : {}),
        },
      }),
    });
    if (res.ok) return { draft, persisted: 'file' };
  } catch {
    // local only
  }

  return { draft, persisted: 'local' };
}
