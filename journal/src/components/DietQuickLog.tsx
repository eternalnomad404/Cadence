import React, { useEffect, useMemo, useState } from 'react';
import { UtensilsCrossed, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import { SmoothCollapse } from './SmoothCollapse';
import {
  CUSTOM_FOOD_ID,
  type DietDraft,
  type DietEntry,
  buildDietDraft,
  getFoodById,
  isCustomFoodId,
  macrosForEntry,
  normalizeEntry,
} from '../data/foodMenu';
import { saveDietLog } from '../data/dietDrafts';
import { sortMenuByPreviousDay } from '../data/dietMenuOrder';
import { MAINTENANCE_CALORIES, energyBalance } from '../data/calories';
import { CustomFoodCard } from './CustomFoodCard';

const PROTEIN_TARGET = 140;

interface DietQuickLogProps {
  date: string;
  existing?: DietDraft | null;
  /** Food ids from yesterday’s menu log — pin those cards first. */
  previousFoodIds?: string[];
  onSaved: (draft: DietDraft) => void;
}

function clampQty(n: number, step: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  const max = step >= 10 ? 2000 : 50;
  return Math.min(max, Number(n.toFixed(1)));
}

export const DietQuickLog: React.FC<DietQuickLogProps> = ({
  date,
  existing,
  previousFoodIds = [],
  onSaved,
}) => {
  const [entries, setEntries] = useState<DietEntry[]>(() =>
    (existing?.entries ?? []).map(normalizeEntry)
  );
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(!existing);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setEntries((existing?.entries ?? []).map(normalizeEntry));
    setEditing(!existing);
    setSearch('');
    setSaveHint(null);
    setQtyDrafts({});
  }, [date, existing]);

  const draft = useMemo(() => buildDietDraft(entries), [entries]);
  const balance = useMemo(() => energyBalance(draft.calories), [draft.calories]);
  const proteinPct = Math.min(100, Math.round((draft.protein_g / PROTEIN_TARGET) * 100));
  const selectedIds = useMemo(() => new Set(entries.map((e) => e.foodId)), [entries]);
  const done = Boolean(existing) && !editing;
  const logged = existing ?? draft;
  const menuItems = useMemo(
    () => sortMenuByPreviousDay(previousFoodIds),
    [previousFoodIds]
  );
  const visibleMenuItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((food) => {
      const hay = `${food.name} ${food.brand} ${food.detail ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [menuItems, search]);

  const upsert = (foodId: string, qty: number, removeIfZero = true) => {
    const food = getFoodById(foodId);
    if (!food || food.isCustom) return;
    setEntries((prev) => {
      const q = clampQty(qty, food.step);
      const rest = prev.filter((e) => e.foodId !== foodId);
      if (q <= 0 && removeIfZero) return rest;
      return [...rest, { foodId, qty: q }];
    });
  };

  const toggleFood = (foodId: string) => {
    const food = getFoodById(foodId);
    if (!food) return;
    if (isCustomFoodId(foodId)) {
      setEntries((prev) => {
        if (prev.some((e) => e.foodId === CUSTOM_FOOD_ID)) {
          return prev.filter((e) => e.foodId !== CUSTOM_FOOD_ID);
        }
        return [...prev, { foodId: CUSTOM_FOOD_ID, qty: 1, calories: 0, protein_g: 0, note: '' }];
      });
      return;
    }
    if (selectedIds.has(foodId)) {
      setQtyDrafts((prev) => {
        const next = { ...prev };
        delete next[foodId];
        return next;
      });
      upsert(foodId, 0);
    } else upsert(foodId, food.defaultQty);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveHint(null);
    try {
      const { draft: saved, persisted } = await saveDietLog(date, entries);
      onSaved(saved);
      setEditing(false);
      setSaveHint(persisted === 'file' ? 'Saved to day file' : 'Saved on this device');
    } catch {
      setSaveHint('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const updateCustom = (patch: { calories?: number; protein_g?: number; note?: string }) => {
    setEntries((prev) => {
      const cur = prev.find((e) => e.foodId === CUSTOM_FOOD_ID);
      const next: DietEntry = {
        foodId: CUSTOM_FOOD_ID,
        qty: 1,
        calories: patch.calories ?? cur?.calories ?? 0,
        protein_g: patch.protein_g ?? cur?.protein_g ?? 0,
        note: patch.note !== undefined ? patch.note : cur?.note ?? '',
      };
      return [...prev.filter((e) => e.foodId !== CUSTOM_FOOD_ID), next];
    });
  };

  return (
    <div
      className="w-full text-left rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-5 sm:p-6 text-left cursor-pointer transition-colors"
        style={{
          background: 'linear-gradient(160deg, var(--accent-wash) 0%, var(--surface) 70%)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          transition: 'border-color 280ms ease',
        }}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl border shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold font-serif-display text-base" style={{ color: 'var(--ink)' }}>
              Body — Diet
            </h4>
            {!expanded ? (
              <p className="text-xs font-mono-code mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {existing
                  ? `${existing.calories} kcal · ${existing.protein_g}g P`
                  : 'Not logged'}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {done ? 'Logged · tap to collapse' : `Maintenance ${MAINTENANCE_CALORIES} kcal · tap to collapse`}
              </p>
            )}
          </div>
          <div
            className="p-1.5 rounded-lg border shrink-0"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--muted)',
            }}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      <SmoothCollapse open={expanded}>
        {done ? (
          <div className="p-5 sm:p-6">
            <div
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{ backgroundColor: 'var(--accent-wash)', borderColor: 'var(--accent)' }}
            >
              <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {logged.calories} kcal · {logged.protein_g}g protein · {energyBalance(logged.calories).label}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium underline cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => {
                    setEntries((existing?.entries ?? []).map(normalizeEntry));
                    setEditing(true);
                    setSaveHint(null);
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        ) : (
        <>
          <div className="px-5 sm:px-6 pt-4 pb-3">
            {saveHint && saveHint === 'Could not save' && (
              <p className="text-xs mb-3" style={{ color: 'var(--rose)' }}>
                {saveHint}
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-40"
              style={{
                backgroundColor: 'var(--accent)',
                borderColor: 'var(--accent)',
                color: '#fff',
              }}
            >
              {saving ? 'Saving…' : 'Save diet log'}
            </button>
          </div>
          <div className="px-5 sm:px-6 pt-1 pb-5">
            <div
              className="mb-3 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              style={{
                backgroundColor:
                  balance.kind === 'deficit'
                    ? 'var(--accent-wash)'
                    : balance.kind === 'surplus'
                      ? 'var(--rose-wash)'
                      : 'var(--sidebar)',
                borderColor:
                  balance.kind === 'deficit'
                    ? 'var(--accent)'
                    : balance.kind === 'surplus'
                      ? 'var(--rose)'
                      : 'var(--border)',
              }}
            >
              <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Today vs maintenance ({MAINTENANCE_CALORIES} kcal)
              </p>
              <p
                className="text-xl sm:text-2xl font-semibold font-serif-display tabular-nums"
                style={{
                  color:
                    balance.kind === 'deficit'
                      ? 'var(--accent)'
                      : balance.kind === 'surplus'
                        ? 'var(--rose)'
                        : 'var(--ink)',
                }}
              >
                {balance.label}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Calories eaten
                </p>
                <p className="text-3xl font-semibold font-serif-display mt-1 tabular-nums" style={{ color: 'var(--ink)' }}>
                  {draft.calories}
                  <span className="text-sm font-sans font-medium ml-1" style={{ color: 'var(--faint)' }}>
                    kcal
                  </span>
                </p>
              </div>
              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-[11px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Protein
                </p>
                <p className="text-3xl font-semibold font-serif-display mt-1 tabular-nums" style={{ color: 'var(--accent)' }}>
                  {draft.protein_g}
                  <span className="text-sm font-sans font-medium ml-1" style={{ color: 'var(--faint)' }}>
                    g
                  </span>
                </p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--sidebar)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${proteinPct}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
                <p className="text-[10px] mt-1 font-mono-code" style={{ color: 'var(--faint)' }}>
                  vs ~{PROTEIN_TARGET}g target
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between gap-3 px-0.5">
              <div className="min-w-0">
                <p className="text-xs font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Today&apos;s menu
                </p>
              </div>
              <button
                type="button"
                disabled={entries.length === 0}
                onClick={() => {
                  setEntries([]);
                  setSaveHint(null);
                }}
                className="text-xs font-medium cursor-pointer disabled:opacity-30 disabled:cursor-default shrink-0"
                style={{ color: 'var(--rose)' }}
              >
                Clear all
              </button>
            </div>

            <label className="flex items-center gap-2 rounded-xl border px-3 py-2 min-w-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--sidebar)' }}>
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--muted)' }} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search foods…"
                aria-label="Search foods"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
                style={{ color: 'var(--ink)' }}
              />
            </label>

            {visibleMenuItems.length === 0 ? (
              <p className="text-center text-sm py-6" style={{ color: 'var(--muted)' }}>
                No foods match “{search.trim()}”
              </p>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {visibleMenuItems.map((food) => {
                if (food.isCustom) {
                  return (
                    <CustomFoodCard
                      key={food.id}
                      selected={selectedIds.has(CUSTOM_FOOD_ID)}
                      entry={entries.find((e) => e.foodId === CUSTOM_FOOD_ID)}
                      onToggle={() => toggleFood(CUSTOM_FOOD_ID)}
                      onChange={updateCustom}
                    />
                  );
                }

                const selected = selectedIds.has(food.id);
                const entry = entries.find((e) => e.foodId === food.id);
                const qty = entry?.qty ?? food.defaultQty;
                const macros = macrosForEntry({ foodId: food.id, qty });

                return (
                  <div
                    key={food.id}
                    className="rounded-2xl border overflow-hidden transition-colors min-w-0 relative"
                    style={{
                      borderColor: selected ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: selected ? 'var(--accent-wash)' : 'var(--sidebar)',
                    }}
                  >
                    <button type="button" onClick={() => toggleFood(food.id)} className="w-full text-left cursor-pointer">
                      <div className="relative aspect-[4/3] food-menu-plate overflow-hidden">
                        <img
                          src={food.image}
                          alt={food.brand}
                          className="w-full h-full object-contain p-3"
                          loading="lazy"
                        />
                        {selected && (
                          <div
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border"
                            style={{
                              backgroundColor: 'var(--accent)',
                              borderColor: 'var(--accent)',
                              color: '#fff',
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 pt-2">
                        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
                          {food.name}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                          {food.brand}
                        </p>
                        {food.detail && (
                          <p className="text-[11px] font-mono-code mt-1.5" style={{ color: 'var(--faint)' }}>
                            {food.detail}
                          </p>
                        )}
                      </div>
                    </button>

                    {selected && (
                      <div
                        className="px-3 pb-3 pt-3 mt-0 border-t flex flex-col gap-2 min-w-0"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex justify-center w-full min-w-0">
                          <NumberStepper
                            value={qtyDrafts[food.id] ?? String(qty)}
                            onChange={(raw) => {
                              const shown = raw.trim() === '' ? '0' : raw;
                              setQtyDrafts((prev) => ({ ...prev, [food.id]: shown }));
                              if (raw.trim() === '' || raw === '.') {
                                upsert(food.id, 0, false);
                                return;
                              }
                              const n = Number(raw);
                              if (Number.isFinite(n)) upsert(food.id, n, false);
                            }}
                            step={food.step}
                            decimals={1}
                            min={0}
                            max={food.unit === 'g' ? 2000 : 50}
                            unit={
                              food.unitLabel +
                              (food.unit === 'g' || qty === 1 ? '' : 's')
                            }
                            size="sm"
                            aria-label={`${food.name} amount`}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-mono-code tabular-nums">
                          <span style={{ color: 'var(--ink)' }}>{macros.calories} kcal</span>
                          <span style={{ color: 'var(--accent)' }}>{macros.protein_g}g P</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
        )}
      </SmoothCollapse>
    </div>
  );
};
