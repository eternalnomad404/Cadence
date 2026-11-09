import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Check, ClipboardList, RotateCcw, X } from 'lucide-react';
import {
  getFoodById,
  macrosForEntry,
  type DietDraft,
  type DietEntry,
  type MealSwap,
} from '../data/foodMenu';
import { saveDietLog } from '../data/dietDrafts';
import {
  MEAL_PLAN_TARGET,
  MEAL_PLAN_WEEKS,
  dayPlanTotals,
  getMealPlanForDate,
  mealTotals,
  otherWeek,
  planWeekOf,
  weekdayOf,
  weeklyFoodOptions,
  type PlanWeek,
  type PlannedItem,
  type PlannedMeal,
  type Weekday,
} from '../data/mealPlan';

interface MealPlanViewProps {
  date: string;
  /** Today's diet log; ticking an item adds its food here. */
  dietDraft?: DietDraft | null;
  onDietSaved?: (draft: DietDraft) => void;
}

/** One row on a meal card: the food shown (planned or swapped in) plus the plan slot it fills. */
type SlotItem = PlannedItem & {
  /** Stable key for the planned slot, e.g. "meal1:salad-chaat". Ticks and swaps use it. */
  slot: string;
  /** The originally planned item when this slot was swapped today. */
  planned?: PlannedItem;
};

type SlotMeal = Omit<PlannedMeal, 'items'> & { items: SlotItem[] };

const round1 = (n: number) => Number(n.toFixed(1));

const slotKey = (mealId: string, foodId: string) => `${mealId}:${foodId}`;

/** Add (or remove) one item to the day's diet entries, merging by food. */
function applyItem(entries: DietEntry[], item: PlannedItem, adding: boolean): DietEntry[] {
  const next = entries.map((e) => ({ ...e }));
  const idx = next.findIndex((e) => e.foodId === item.foodId);
  if (adding) {
    if (idx >= 0) next[idx].qty = round1((next[idx].qty ?? 0) + item.qty);
    else next.push({ foodId: item.foodId, qty: item.qty });
  } else if (idx >= 0) {
    const q = round1((next[idx].qty ?? 0) - item.qty);
    if (q <= 0) next.splice(idx, 1);
    else next[idx].qty = q;
  }
  return next;
}

/** Apply the day's swaps to the plan. Without swaps every slot shows its planned food. */
function withSwaps(plan: PlannedMeal[], swaps: Record<string, MealSwap>): SlotMeal[] {
  return plan.map((meal) => ({
    ...meal,
    items: meal.items.map((item) => {
      const slot = slotKey(meal.id, item.foodId);
      const swap = swaps[slot];
      if (!swap || !getFoodById(swap.foodId)) return { ...item, slot };
      return { foodId: swap.foodId, qty: swap.qty, slot, planned: item };
    }),
  }));
}

function qtyLabel(qty: number, unitLabel: string, unit: string): string {
  if (unit === 'g') return `${qty}${unitLabel}`;
  return `${qty} ${unitLabel}${qty === 1 ? '' : 's'}`;
}

const FoodThumb: React.FC<{ image?: string; alt: string }> = ({ image, alt }) => (
  <div className="w-16 h-12 rounded-xl overflow-hidden food-menu-plate shrink-0">
    {image ? <img src={image} alt={alt} className="w-full h-full object-contain p-1" loading="lazy" /> : null}
  </div>
);

const MealCard: React.FC<{
  meal: SlotMeal;
  isDone?: (item: SlotItem) => boolean;
  busyKey?: string | null;
  onToggleItem?: (item: SlotItem) => void;
  onPickSwap?: (item: SlotItem) => void;
}> = ({ meal, isDone, busyKey = null, onToggleItem, onPickSwap }) => {
  const totals = mealTotals(meal.items);
  const doneCount = isDone ? meal.items.filter((item) => isDone(item)).length : 0;
  const done = meal.items.length > 0 && doneCount === meal.items.length;

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: done ? 'var(--accent)' : 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between gap-3 border-b"
        style={{ borderColor: 'var(--border)', background: 'linear-gradient(160deg, var(--accent-wash) 0%, var(--surface) 70%)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <h4 className="font-semibold font-serif-display text-lg" style={{ color: 'var(--ink)' }}>
            {meal.label}
          </h4>
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-mono-code uppercase tracking-wide border"
            style={{
              color: meal.size === 'big' ? 'var(--accent)' : 'var(--muted)',
              borderColor: meal.size === 'big' ? 'var(--accent)' : 'var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            {meal.size === 'big' ? 'Big' : 'Light'}
          </span>
          {onToggleItem && meal.items.length > 0 && (
            <span className="text-[11px] font-mono-code tabular-nums" style={{ color: done ? 'var(--accent)' : 'var(--faint)' }}>
              {doneCount}/{meal.items.length} eaten
            </span>
          )}
        </div>
        <p className="text-xs font-mono-code tabular-nums shrink-0" style={{ color: 'var(--muted)' }}>
          {totals.calories} kcal · <span style={{ color: 'var(--accent)' }}>{totals.protein_g}g P</span>
        </p>
      </div>

      {meal.items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-center" style={{ color: 'var(--faint)' }}>
          Not planned yet
        </p>
      ) : (
        <ul>
          {meal.items.map((item) => {
            const food = getFoodById(item.foodId);
            if (!food) return null;
            const macros = macrosForEntry({ foodId: item.foodId, qty: item.qty });
            const eaten = isDone ? isDone(item) : false;
            const busy = busyKey === item.slot;
            const plannedFood = item.planned ? getFoodById(item.planned.foodId) : undefined;

            const details = (
              <>
                <FoodThumb image={food.image} alt={food.brand} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
                    <span className="truncate">{food.name}</span>
                    {onPickSwap && <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--faint)' }} />}
                  </p>
                  {plannedFood ? (
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--accent)' }}>
                      Instead of {plannedFood.name}
                    </p>
                  ) : (
                    item.note && (
                      <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                        {item.note}
                      </p>
                    )
                  )}
                  <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                    {qtyLabel(item.qty, food.unitLabel, food.unit)} · {food.brand}
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono-code tabular-nums shrink-0">
                  <p style={{ color: 'var(--ink)' }}>{macros.calories} kcal</p>
                  <p style={{ color: 'var(--accent)' }}>{macros.protein_g}g P</p>
                </div>
              </>
            );

            return (
              <li
                key={item.slot}
                className="flex items-center gap-3 px-4 py-3 border-t first:border-t-0 transition-colors"
                style={{ borderColor: 'var(--border)', backgroundColor: eaten ? 'var(--accent-wash)' : undefined }}
              >
                {onPickSwap ? (
                  <button
                    type="button"
                    onClick={() => onPickSwap(item)}
                    disabled={busyKey !== null}
                    title="Ate something else? Tap to swap"
                    className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer rounded-xl -m-1 p-1 transition-colors hover:bg-[var(--sidebar)] disabled:cursor-wait"
                  >
                    {details}
                  </button>
                ) : (
                  <div className="flex-1 min-w-0 flex items-center gap-3">{details}</div>
                )}
                {onToggleItem && (
                  <button
                    type="button"
                    onClick={() => onToggleItem(item)}
                    disabled={busyKey !== null}
                    aria-pressed={eaten}
                    aria-label={eaten ? `Undo ${food.name} eaten` : `Mark ${food.name} as eaten`}
                    title={eaten ? 'Eaten (tap to undo)' : 'Mark as eaten'}
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors disabled:cursor-wait"
                    style={{
                      backgroundColor: eaten ? 'var(--accent)' : 'transparent',
                      borderColor: eaten ? 'var(--accent)' : 'var(--border)',
                      color: eaten ? '#fff' : 'var(--faint)',
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/** Pick another food from the weekly plan to stand in for one item today. */
const SwapPicker: React.FC<{
  mealLabel: string;
  item: SlotItem;
  onPick: (choice: PlannedItem) => void;
  onClose: () => void;
}> = ({ mealLabel, item, onPick, onClose }) => {
  const current = getFoodById(item.foodId);
  const planned = item.planned;
  const plannedFood = planned ? getFoodById(planned.foodId) : undefined;
  const options = useMemo(
    () => weeklyFoodOptions().filter((o) => o.foodId !== item.foodId && o.foodId !== planned?.foodId),
    [item.foodId, planned?.foodId]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const row = (choice: PlannedItem, key: string, label?: React.ReactNode) => {
    const food = getFoodById(choice.foodId);
    if (!food) return null;
    const macros = macrosForEntry(choice);
    return (
      <li key={key}>
        <button
          type="button"
          onClick={() => onPick(choice)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors hover:bg-[var(--sidebar)]"
        >
          <FoodThumb image={food.image} alt={food.brand} />
          <div className="flex-1 min-w-0">
            {label}
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {food.name}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
              {qtyLabel(choice.qty, food.unitLabel, food.unit)} · {food.brand}
            </p>
          </div>
          <div className="text-right text-[11px] font-mono-code tabular-nums shrink-0">
            <p style={{ color: 'var(--ink)' }}>{macros.calories} kcal</p>
            <p style={{ color: 'var(--accent)' }}>{macros.protein_g}g P</p>
          </div>
        </button>
      </li>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Swap food"
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="min-w-0">
            <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {mealLabel} · swap
            </p>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              Ate something instead of {current?.name ?? 'this'}?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ul className="overflow-y-auto py-1">
          {planned &&
            plannedFood &&
            row(
              planned,
              'back-to-plan',
              <p className="text-[11px] font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                <RotateCcw className="w-3 h-3" /> Back to plan
              </p>
            )}
          {options.map((o) => row(o, o.foodId))}
        </ul>
      </div>
    </div>
  );
};

/** Temporary: lets Aman preview each weekday's plan. Set to false to hide the picker. */
const SHOW_DAY_PICKER = true;

const DAY_PICKER: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export const MealPlanView: React.FC<MealPlanViewProps> = ({ date, dietDraft, onDietSaved }) => {
  const todayKey = useMemo(() => weekdayOf(date), [date]);
  const thisWeek = useMemo(() => planWeekOf(date), [date]);
  const [day, setDay] = useState<Weekday>(todayKey);
  const [week, setWeek] = useState<PlanWeek>(thisWeek);
  const basePlan = useMemo(
    () => (SHOW_DAY_PICKER ? MEAL_PLAN_WEEKS[week][day] : getMealPlanForDate(date)),
    [week, day, date]
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState<{ meal: SlotMeal; item: SlotItem } | null>(null);

  // Ticks and swaps only apply to the real today, not a previewed day.
  const viewingToday = !SHOW_DAY_PICKER || (week === thisWeek && day === todayKey);
  const canEdit = viewingToday && !!onDietSaved;
  const mealsDone = useMemo(() => new Set(dietDraft?.mealsDone ?? []), [dietDraft]);
  const mealSwaps = useMemo(() => dietDraft?.mealSwaps ?? {}, [dietDraft]);
  const plan = useMemo(() => withSwaps(basePlan, viewingToday ? mealSwaps : {}), [basePlan, viewingToday, mealSwaps]);
  const totals = useMemo(() => dayPlanTotals(plan), [plan]);
  const eaten = { calories: dietDraft?.calories ?? 0, protein_g: dietDraft?.protein_g ?? 0 };
  const eatenKcalPct = Math.min(100, Math.round((eaten.calories / MEAL_PLAN_TARGET.calories) * 100));
  const eatenOver = eaten.calories > MEAL_PLAN_TARGET.calories;

  // A bare "meal1" is an older whole-meal tick: every item in that meal counts as eaten.
  const isItemDone = (meal: SlotMeal, item: SlotItem) => mealsDone.has(meal.id) || mealsDone.has(item.slot);

  /** Copy of the ticks with any old whole-meal tick expanded into per-item ticks. */
  const expandedDone = (meal: SlotMeal) => {
    const done = new Set(mealsDone);
    if (done.has(meal.id)) {
      done.delete(meal.id);
      for (const it of meal.items) done.add(it.slot);
    }
    return done;
  };

  const persist = async (busy: string, entries: DietEntry[], done: Set<string>, swaps: Record<string, MealSwap>) => {
    if (!onDietSaved) return;
    setBusyKey(busy);
    setSaveError(null);
    try {
      const { draft } = await saveDietLog(date, entries, [...done], swaps);
      onDietSaved(draft);
    } catch {
      setSaveError('Could not save. Try again.');
    } finally {
      setBusyKey(null);
    }
  };

  const toggleItem = async (meal: SlotMeal, item: SlotItem) => {
    if (busyKey || !canEdit) return;
    const adding = !isItemDone(meal, item);
    const entries = applyItem(dietDraft?.entries ?? [], item, adding);
    const done = expandedDone(meal);
    if (adding) done.add(item.slot);
    else done.delete(item.slot);
    await persist(item.slot, entries, done, mealSwaps);
  };

  const swapItem = async (meal: SlotMeal, item: SlotItem, choice: PlannedItem) => {
    setSwapTarget(null);
    if (busyKey || !canEdit) return;
    const planned = item.planned ?? { foodId: item.foodId, qty: item.qty };
    const swaps = { ...mealSwaps };
    if (choice.foodId === planned.foodId) delete swaps[item.slot];
    else swaps[item.slot] = { foodId: choice.foodId, qty: choice.qty };

    // If this slot was already ticked, move the eaten food over to the new choice.
    let entries = dietDraft?.entries ?? [];
    if (isItemDone(meal, item)) {
      entries = applyItem(entries, item, false);
      entries = applyItem(entries, choice, true);
    }
    await persist(item.slot, entries, expandedDone(meal), swaps);
  };

  const kcalLeft = Math.max(0, MEAL_PLAN_TARGET.calories - totals.calories);
  const proteinLeftMin = Math.max(0, Number((MEAL_PLAN_TARGET.proteinMin - totals.protein_g).toFixed(1)));
  const proteinLeftMax = Math.max(0, Number((MEAL_PLAN_TARGET.proteinMax - totals.protein_g).toFixed(1)));
  const kcalPct = Math.min(100, Math.round((totals.calories / MEAL_PLAN_TARGET.calories) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein_g / MEAL_PLAN_TARGET.proteinMin) * 100));
  const overCalories = totals.calories > MEAL_PLAN_TARGET.calories;

  return (
    <div className="w-full my-6 flex flex-col gap-5">
      <div
        className="rounded-2xl border p-5 sm:p-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl border shrink-0"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--accent)' }}
          >
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold font-serif-display text-xl" style={{ color: 'var(--ink)' }}>
              Today&apos;s meal
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              3 meals · target ~{MEAL_PLAN_TARGET.calories} kcal · {MEAL_PLAN_TARGET.proteinMin} to{' '}
              {MEAL_PLAN_TARGET.proteinMax}g protein
            </p>
          </div>
        </div>

        {SHOW_DAY_PICKER && (
          <div className="flex flex-wrap gap-1.5 mt-4" role="tablist" aria-label="Preview a week">
            {([
              { key: thisWeek, label: 'This week' },
              { key: otherWeek(thisWeek), label: 'Next week' },
            ] as { key: PlanWeek; label: string }[]).map(({ key, label }) => {
              const active = key === week;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setWeek(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--ink)' : 'var(--sidebar)',
                    color: active ? 'var(--surface)' : 'var(--ink)',
                    borderColor: active ? 'var(--ink)' : 'var(--border)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {SHOW_DAY_PICKER && (
          <div className="flex flex-wrap gap-1.5 mt-2" role="tablist" aria-label="Preview a day">
            {DAY_PICKER.map(({ key, label }) => {
              const active = key === day;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setDay(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent)' : 'var(--sidebar)',
                    color: active ? '#fff' : 'var(--ink)',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {label}
                  {key === todayKey && week === thisWeek && <span className="ml-1 opacity-70">· today</span>}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Calories planned
            </p>
            <p
              className="text-2xl sm:text-3xl font-semibold font-serif-display mt-1 tabular-nums"
              style={{ color: overCalories ? 'var(--rose)' : 'var(--ink)' }}
            >
              {totals.calories}
              <span className="text-sm font-sans font-medium ml-1" style={{ color: 'var(--faint)' }}>
                / {MEAL_PLAN_TARGET.calories}
              </span>
            </p>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sidebar)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${kcalPct}%`, backgroundColor: overCalories ? 'var(--rose)' : 'var(--ink)' }}
              />
            </div>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Protein planned
            </p>
            <p className="text-2xl sm:text-3xl font-semibold font-serif-display mt-1 tabular-nums" style={{ color: 'var(--accent)' }}>
              {totals.protein_g}
              <span className="text-sm font-sans font-medium ml-1" style={{ color: 'var(--faint)' }}>
                / {MEAL_PLAN_TARGET.proteinMin} to {MEAL_PLAN_TARGET.proteinMax}g
              </span>
            </p>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sidebar)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${proteinPct}%`, backgroundColor: 'var(--accent)' }} />
            </div>
          </div>
        </div>

        <p className="text-xs font-mono-code mt-3" style={{ color: overCalories ? 'var(--rose)' : 'var(--muted)' }}>
          {overCalories
            ? `Over target by ${totals.calories - MEAL_PLAN_TARGET.calories} kcal`
            : kcalLeft > 0 || proteinLeftMin > 0
              ? `Still to plan: ~${kcalLeft} kcal${
                  proteinLeftMin > 0 ? ` · ${proteinLeftMin} to ${proteinLeftMax}g protein` : ' · protein covered'
                }`
              : 'On target'}
        </p>

        {viewingToday && (
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Eaten today
              </p>
              <p className="text-sm font-mono-code tabular-nums" style={{ color: eatenOver ? 'var(--rose)' : 'var(--ink)' }}>
                {eaten.calories} / {MEAL_PLAN_TARGET.calories} kcal ·{' '}
                <span style={{ color: 'var(--accent)' }}>{eaten.protein_g}g protein</span>
              </p>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${eatenKcalPct}%`, backgroundColor: eatenOver ? 'var(--rose)' : 'var(--accent)' }}
              />
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'var(--faint)' }}>
              Tick an item to add it to today. Tap a food to swap it if you ate something else. Same total as the Diet
              card; extras you log there count too.
            </p>
            {saveError && (
              <p className="text-xs mt-2" style={{ color: 'var(--rose)' }}>
                {saveError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {plan.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            isDone={viewingToday ? (item) => isItemDone(meal, item) : undefined}
            busyKey={busyKey}
            onToggleItem={canEdit ? (item) => void toggleItem(meal, item) : undefined}
            onPickSwap={canEdit ? (item) => setSwapTarget({ meal, item }) : undefined}
          />
        ))}
      </div>

      {swapTarget && (
        <SwapPicker
          mealLabel={swapTarget.meal.label}
          item={swapTarget.item}
          onPick={(choice) => void swapItem(swapTarget.meal, swapTarget.item, choice)}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
};
