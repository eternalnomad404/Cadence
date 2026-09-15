import { CUSTOM_FOOD_ID, FOOD_MENU } from './foodMenuCatalog';

export type FoodUnit = 'g' | 'spoon' | 'roti' | 'slice' | 'packet' | 'piece' | 'shake' | 'bowl';

export type FoodItem = {
  id: string;
  name: string;
  brand: string;
  image: string;
  unit: FoodUnit;
  /** Shown next to the qty control (e.g. g, spoon, roti, slice) */
  unitLabel: string;
  defaultQty: number;
  step: number;
  /**
   * Macros for one logging unit:
   * - unit g → per 1 gram (derived from /100g label)
   * - spoon / roti / slice → per 1 of that unit
   */
  caloriesPerUnit: number;
  proteinPerUnit: number;
  /** Small footnote under the card */
  detail?: string;
  /** Manual kcal / protein entry (no product photo) */
  isCustom?: boolean;
};

export { CUSTOM_FOOD_ID, FOOD_MENU };

export type DietEntry = {
  foodId: string;
  /** Amount in the food's logging unit (g / spoon / roti / slice / packet / piece / shake / bowl) */
  qty: number;
  /** @deprecated legacy paneer logs used grams — migrated on load */
  grams?: number;
  /** Manual macros for `custom` food */
  calories?: number;
  protein_g?: number;
  /** Optional label for custom (e.g. “mom’s pulao”) */
  note?: string;
};

export type DietDraft = {
  entries: DietEntry[];
  calories: number;
  protein_g: number;
};

export function getFoodById(id: string): FoodItem | undefined {
  return FOOD_MENU.find((f) => f.id === id);
}

export function isCustomFoodId(id: string): boolean {
  return id === CUSTOM_FOOD_ID;
}

/** Normalize legacy `{ grams }` entries to `{ qty }`. */
export function normalizeEntry(entry: DietEntry): DietEntry {
  const qty = typeof entry.qty === 'number' ? entry.qty : entry.grams;
  const out: DietEntry = {
    foodId: entry.foodId,
    qty: typeof qty === 'number' && Number.isFinite(qty) ? qty : 0,
  };
  if (isCustomFoodId(entry.foodId)) {
    if (typeof entry.calories === 'number' && Number.isFinite(entry.calories)) {
      out.calories = Math.max(0, Math.round(entry.calories));
    } else {
      out.calories = 0;
    }
    if (typeof entry.protein_g === 'number' && Number.isFinite(entry.protein_g)) {
      out.protein_g = Math.max(0, Number(entry.protein_g.toFixed(1)));
    } else {
      out.protein_g = 0;
    }
    if (typeof entry.note === 'string' && entry.note.trim()) {
      out.note = entry.note.trim().slice(0, 80);
    }
  }
  return out;
}

export function macrosForEntry(entry: DietEntry): { calories: number; protein_g: number } {
  const normalized = normalizeEntry(entry);
  if (normalized.qty <= 0) return { calories: 0, protein_g: 0 };

  if (isCustomFoodId(normalized.foodId)) {
    return {
      calories: Math.round(normalized.calories ?? 0),
      protein_g: Number((normalized.protein_g ?? 0).toFixed(1)),
    };
  }

  const food = getFoodById(normalized.foodId);
  if (!food) return { calories: 0, protein_g: 0 };
  return {
    calories: Math.round(food.caloriesPerUnit * normalized.qty),
    protein_g: Number((food.proteinPerUnit * normalized.qty).toFixed(1)),
  };
}

export function totalsFromEntries(entries: DietEntry[]): { calories: number; protein_g: number } {
  return entries.reduce(
    (acc, e) => {
      const m = macrosForEntry(e);
      return {
        calories: acc.calories + m.calories,
        protein_g: Number((acc.protein_g + m.protein_g).toFixed(1)),
      };
    },
    { calories: 0, protein_g: 0 }
  );
}

export function buildDietDraft(entries: DietEntry[]): DietDraft {
  const normalized = entries.map(normalizeEntry).filter((e) => e.qty > 0);
  const totals = totalsFromEntries(normalized);
  return {
    entries: normalized,
    calories: totals.calories,
    protein_g: totals.protein_g,
  };
}
