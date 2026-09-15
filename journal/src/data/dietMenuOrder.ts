import type { DietDraft, DietEntry, FoodItem } from './foodMenu';
import { CUSTOM_FOOD_ID, FOOD_MENU, isCustomFoodId } from './foodMenu';
import { previousCalendarDate } from './weightDrafts';
import type { DayFile } from './loadDays';

/**
 * Food ids logged on a day, in the order they appear in `diet.entries`.
 * Used to pin “usual” items to the front of tomorrow’s menu.
 */
export function foodIdsFromDraft(draft: DietDraft | null | undefined): string[] {
  if (!draft?.entries?.length) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const e of draft.entries) {
    if (!e?.foodId || seen.has(e.foodId)) continue;
    // Custom stays pinned first via sortMenu — skip from “usual” reorder
    if (isCustomFoodId(e.foodId)) continue;
    seen.add(e.foodId);
    ids.push(e.foodId);
  }
  return ids;
}

/** Scan day JSON (logged or not) for diet.entries food-id order. */
export function loadDietFoodOrdersFromFiles(): Record<string, string[]> {
  const journalModules = import.meta.glob('../../data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;
  const planModules = import.meta.glob('../../../Plan/data/days/*.json', { eager: true }) as Record<
    string,
    { default: DayFile }
  >;

  const out: Record<string, string[]> = {};
  const ingest = (modules: Record<string, { default: DayFile }>) => {
    for (const [path, mod] of Object.entries(modules)) {
      if (path.includes('_template')) continue;
      const raw = mod.default;
      if (!raw?.date) continue;
      const entries = (raw.diet as { entries?: DietEntry[] } | undefined)?.entries;
      if (!Array.isArray(entries) || entries.length === 0) continue;
      const ids = foodIdsFromDraft({
        entries,
        calories: 0,
        protein_g: 0,
      });
      if (ids.length) out[raw.date] = ids;
    }
  };
  ingest(planModules);
  ingest(journalModules);
  return out;
}

/**
 * Previous calendar day’s selected foods (draft first, then day-file history).
 * Empty → caller keeps default FOOD_MENU order (Custom still first).
 */
export function resolvePreviousDayFoodIds(
  date: string,
  dietDrafts: Record<string, DietDraft>,
  fileOrders: Record<string, string[]> = {}
): string[] {
  const prev = previousCalendarDate(date);
  const fromDraft = foodIdsFromDraft(dietDrafts[prev]);
  if (fromDraft.length) return fromDraft;
  return fileOrders[prev] ?? [];
}

/** Custom always first; then yesterday’s picks; then the rest. */
export function sortMenuByPreviousDay(previousFoodIds: string[]): FoodItem[] {
  const custom = FOOD_MENU.find((f) => f.id === CUSTOM_FOOD_ID);
  const catalog = FOOD_MENU.filter((f) => f.id !== CUSTOM_FOOD_ID);
  const byId = new Map(catalog.map((f) => [f.id, f]));
  const seen = new Set<string>();
  const ordered: FoodItem[] = [];

  if (custom) ordered.push(custom);

  for (const id of previousFoodIds) {
    if (id === CUSTOM_FOOD_ID) continue;
    const food = byId.get(id);
    if (!food || seen.has(id)) continue;
    ordered.push(food);
    seen.add(id);
  }
  for (const food of catalog) {
    if (!seen.has(food.id)) ordered.push(food);
  }
  return ordered;
}
