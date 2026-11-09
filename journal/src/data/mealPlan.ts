import { macrosForEntry } from './foodMenu';

/**
 * Daily meal plan for the cut.
 *
 * Stored per weekday so each day can differ later. The UI never shows the
 * weekday; it just shows "Today's meal" for whatever day it is.
 *
 * Every day = 3 meals: Meal 1 (big), Meal 2 (light), Meal 3 (big).
 * No fixed times.
 */

export const MEAL_PLAN_TARGET = {
  calories: 1500,
  proteinMin: 140,
  proteinMax: 150,
};

export type PlannedItem = {
  foodId: string;
  qty: number;
  /** Optional label shown with the item, e.g. how it is cooked that day. */
  note?: string;
};

export type MealSize = 'big' | 'light';

export type PlannedMeal = {
  id: 'meal1' | 'meal2' | 'meal3';
  label: string;
  size: MealSize;
  items: PlannedItem[];
};

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Meal 2 (light) options that rotate through the week. */
const MEAL2_MAKHANA: PlannedItem[] = [{ foodId: 'makhana', qty: 50 }];
const MEAL2_MILK_MUESLI: PlannedItem[] = [
  { foodId: 'amul-tetra-pack', qty: 1 },
  { foodId: 'hp-muesli', qty: 20 },
];

/** Meal 1 main (with the salad + shake) that rotates with Meal 2. */
const MEAL1_PANEER_ROTI: PlannedItem[] = [
  { foodId: 'milky-mist-hp-paneer', qty: 100 },
  { foodId: 'roti-high-protein', qty: 2 },
];
/** Sunday: the same 100g HP paneer, cooked as palak paneer. */
const MEAL1_PALAK_PANEER_ROTI: PlannedItem[] = [
  { foodId: 'milky-mist-hp-paneer', qty: 100, note: 'with spinach (palak paneer)' },
  { foodId: 'roti-high-protein', qty: 2 },
];
const MEAL1_SOYA_ROTI: PlannedItem[] = [
  { foodId: 'soya-bean', qty: 50 },
  { foodId: 'roti-high-protein', qty: 2 },
];

/**
 * Fruit replaces makhana on Wed, Fri and Sun (~175 kcal each, same as 50g makhana).
 * Week A: kiwi, dragon fruit, pomegranate. Week B: amrud, apple, banana. Then repeat.
 * Strawberries, blueberries and avocado are never planned; they come out of the buffer.
 */
const FRUIT = {
  kiwi: [{ foodId: 'kiwi', qty: 4 }],
  dragonFruit: [{ foodId: 'dragon-fruit', qty: 290 }],
  pomegranate: [{ foodId: 'pomegranate', qty: 210 }],
  amrud: [{ foodId: 'amrud', qty: 250 }],
  apple: [{ foodId: 'apple', qty: 330 }],
  banana: [{ foodId: 'banana', qty: 1.5 }],
} satisfies Record<string, PlannedItem[]>;

/** Paneer days (Mon, Wed, Fri, Sun) pair with makhana or fruit; soya days pair with milk + muesli. */
const paneerDay = (meal2: PlannedItem[]) => ({ meal1: MEAL1_PANEER_ROTI, meal2 });
const sundayDay = (meal2: PlannedItem[]) => ({ meal1: MEAL1_PALAK_PANEER_ROTI, meal2 });
const MUESLI_DAY = { meal1: MEAL1_SOYA_ROTI, meal2: MEAL2_MILK_MUESLI };

/** Salad + shake in Meal 1 and all of Meal 3 are locked; the rest changes by weekday. */
function dayPlan({ meal1, meal2 }: { meal1: PlannedItem[]; meal2: PlannedItem[] }): PlannedMeal[] {
  return [
    {
      id: 'meal1',
      label: 'Meal 1',
      size: 'big',
      items: [
        { foodId: 'salad-chaat', qty: 1 },
        ...meal1,
        { foodId: 'superyou-protein', qty: 1 },
      ],
    },
    {
      id: 'meal2',
      label: 'Meal 2',
      size: 'light',
      items: meal2,
    },
    {
      id: 'meal3',
      label: 'Meal 3',
      size: 'big',
      // Lettuce sits inside the 100 kcal buffer, so it is not listed.
      items: [
        { foodId: 'bread-high-protein', qty: 4 },
        { foodId: 'hp-peanut-butter', qty: 20 },
        { foodId: 'cucumber', qty: 1 },
        { foodId: 'superyou-protein', qty: 1 },
        { foodId: 'creatine-shake', qty: 1 },
      ],
    },
  ];
}

export type PlanWeek = 'A' | 'B';

/** Monday that starts week A of the two-week cycle. */
export const PLAN_CYCLE_START = '2026-11-09';

export const MEAL_PLAN_WEEKS: Record<PlanWeek, Record<Weekday, PlannedMeal[]>> = {
  A: {
    mon: dayPlan(paneerDay(MEAL2_MAKHANA)),
    tue: dayPlan(MUESLI_DAY),
    wed: dayPlan(paneerDay(FRUIT.kiwi)),
    thu: dayPlan(MUESLI_DAY),
    fri: dayPlan(paneerDay(FRUIT.dragonFruit)),
    sat: dayPlan(MUESLI_DAY),
    sun: dayPlan(sundayDay(FRUIT.pomegranate)),
  },
  B: {
    mon: dayPlan(paneerDay(MEAL2_MAKHANA)),
    tue: dayPlan(MUESLI_DAY),
    wed: dayPlan(paneerDay(FRUIT.amrud)),
    thu: dayPlan(MUESLI_DAY),
    fri: dayPlan(paneerDay(FRUIT.apple)),
    sat: dayPlan(MUESLI_DAY),
    sun: dayPlan(sundayDay(FRUIT.banana)),
  },
};

function toLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map((p) => parseInt(p, 10));
  return new Date(y, m - 1, d);
}

export function weekdayOf(date: string): Weekday {
  return WEEKDAYS[toLocalDate(date).getDay()];
}

/** Which week of the two-week cycle a date falls in (weeks run Mon to Sun). */
export function planWeekOf(date: string): PlanWeek {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.round((toLocalDate(date).getTime() - toLocalDate(PLAN_CYCLE_START).getTime()) / dayMs);
  const week = Math.floor(days / 7);
  return ((week % 2) + 2) % 2 === 0 ? 'A' : 'B';
}

export function otherWeek(week: PlanWeek): PlanWeek {
  return week === 'A' ? 'B' : 'A';
}

export function getMealPlanForDate(date: string): PlannedMeal[] {
  return MEAL_PLAN_WEEKS[planWeekOf(date)][weekdayOf(date)];
}

export function mealTotals(items: PlannedItem[]): { calories: number; protein_g: number } {
  return items.reduce(
    (acc, item) => {
      const m = macrosForEntry({ foodId: item.foodId, qty: item.qty });
      return {
        calories: acc.calories + m.calories,
        protein_g: Number((acc.protein_g + m.protein_g).toFixed(1)),
      };
    },
    { calories: 0, protein_g: 0 }
  );
}

export function dayPlanTotals(plan: PlannedMeal[]): { calories: number; protein_g: number } {
  return mealTotals(plan.flatMap((meal) => meal.items));
}
