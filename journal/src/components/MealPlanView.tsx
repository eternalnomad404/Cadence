import React, { useMemo, useState } from 'react';
import { Check, ClipboardList } from 'lucide-react';
import { getFoodById, macrosForEntry, type DietDraft, type DietEntry } from '../data/foodMenu';
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
  type PlanWeek,
  type PlannedMeal,
  type Weekday,
} from '../data/mealPlan';

interface MealPlanViewProps {
  date: string;
  /** Today's diet log; ticking a meal adds its foods here. */
  dietDraft?: DietDraft | null;
  onDietSaved?: (draft: DietDraft) => void;
}

const round1 = (n: number) => Number(n.toFixed(1));

/** Add (or remove) a meal's planned foods to the day's diet entries, merging by food. */
function applyMeal(entries: DietEntry[], meal: PlannedMeal, adding: boolean): DietEntry[] {
  const next = entries.map((e) => ({ ...e }));
  for (const item of meal.items) {
    const idx = next.findIndex((e) => e.foodId === item.foodId);
    if (adding) {
      if (idx >= 0) next[idx].qty = round1((next[idx].qty ?? 0) + item.qty);
      else next.push({ foodId: item.foodId, qty: item.qty });
    } else if (idx >= 0) {
      const q = round1((next[idx].qty ?? 0) - item.qty);
      if (q <= 0) next.splice(idx, 1);
      else next[idx].qty = q;
    }
  }
  return next;
}

function qtyLabel(qty: number, unitLabel: string, unit: string): string {
  if (unit === 'g') return `${qty}${unitLabel}`;
  return `${qty} ${unitLabel}${qty === 1 ? '' : 's'}`;
}

const MealCard: React.FC<{
  meal: PlannedMeal;
  done?: boolean;
  busy?: boolean;
  onToggle?: () => void;
}> = ({ meal, done = false, busy = false, onToggle }) => {
  const totals = mealTotals(meal.items);

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
          {meal.items.map((item, i) => {
            const food = getFoodById(item.foodId);
            if (!food) return null;
            const macros = macrosForEntry({ foodId: item.foodId, qty: item.qty });
            return (
              <li
                key={`${item.foodId}-${i}`}
                className="flex items-center gap-3 px-4 py-3 border-t first:border-t-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="w-16 h-12 rounded-xl overflow-hidden food-menu-plate shrink-0">
                  {food.image ? (
                    <img src={food.image} alt={food.brand} className="w-full h-full object-contain p-1" loading="lazy" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                    {food.name}
                  </p>
                  {item.note && (
                    <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      {item.note}
                    </p>
                  )}
                  <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                    {qtyLabel(item.qty, food.unitLabel, food.unit)} · {food.brand}
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono-code tabular-nums shrink-0">
                  <p style={{ color: 'var(--ink)' }}>{macros.calories} kcal</p>
                  <p style={{ color: 'var(--accent)' }}>{macros.protein_g}g P</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {onToggle && meal.items.length > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onToggle}
            disabled={busy}
            aria-pressed={done}
            className="w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-wait"
            style={{
              backgroundColor: done ? 'var(--accent)' : 'var(--accent-wash)',
              color: done ? '#fff' : 'var(--accent)',
              borderColor: 'var(--accent)',
            }}
          >
            {done && <Check className="w-4 h-4" />}
            {busy ? 'Saving...' : done ? 'Eaten · added to today (tap to undo)' : `Mark ${meal.label} as eaten`}
          </button>
        </div>
      )}
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
  const plan = useMemo(
    () => (SHOW_DAY_PICKER ? MEAL_PLAN_WEEKS[week][day] : getMealPlanForDate(date)),
    [week, day, date]
  );
  const totals = useMemo(() => dayPlanTotals(plan), [plan]);
  const [busyMeal, setBusyMeal] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Ticking meals only makes sense for the real today, not a previewed day.
  const viewingToday = !SHOW_DAY_PICKER || (week === thisWeek && day === todayKey);
  const mealsDone = useMemo(() => new Set(dietDraft?.mealsDone ?? []), [dietDraft]);
  const eaten = { calories: dietDraft?.calories ?? 0, protein_g: dietDraft?.protein_g ?? 0 };
  const eatenKcalPct = Math.min(100, Math.round((eaten.calories / MEAL_PLAN_TARGET.calories) * 100));
  const eatenOver = eaten.calories > MEAL_PLAN_TARGET.calories;

  const toggleMeal = async (meal: PlannedMeal) => {
    if (busyMeal || !onDietSaved) return;
    const adding = !mealsDone.has(meal.id);
    const entries = applyMeal(dietDraft?.entries ?? [], meal, adding);
    const nextDone = adding
      ? [...mealsDone, meal.id]
      : [...mealsDone].filter((id) => id !== meal.id);
    setBusyMeal(meal.id);
    setSaveError(null);
    try {
      const { draft } = await saveDietLog(date, entries, nextDone);
      onDietSaved(draft);
    } catch {
      setSaveError('Could not save. Try again.');
    } finally {
      setBusyMeal(null);
    }
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
              Same total as the Diet card. Marking a meal adds its foods there; extras you log in Diet count too.
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
            done={viewingToday && mealsDone.has(meal.id)}
            busy={busyMeal === meal.id}
            onToggle={viewingToday && onDietSaved ? () => void toggleMeal(meal) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
