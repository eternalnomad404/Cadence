import React from 'react';
import { Check, PenLine } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import type { DietEntry } from '../data/foodMenu';
import { CUSTOM_FOOD_ID } from '../data/foodMenu';

type CustomFoodCardProps = {
  selected: boolean;
  entry?: DietEntry;
  onToggle: () => void;
  onChange: (patch: { calories?: number; protein_g?: number; note?: string }) => void;
};

export const CustomFoodCard: React.FC<CustomFoodCardProps> = ({
  selected,
  entry,
  onToggle,
  onChange,
}) => {
  const kcal = entry?.calories ?? 0;
  const protein = entry?.protein_g ?? 0;
  const note = entry?.note ?? '';

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors min-w-0 relative"
      style={{
        borderColor: selected ? 'var(--accent)' : 'var(--border)',
        backgroundColor: selected ? 'var(--accent-wash)' : 'var(--sidebar)',
      }}
    >
      <span
        className="absolute top-2 left-2 z-10 text-[9px] font-mono-code uppercase tracking-wide px-1.5 py-0.5 rounded-md border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--muted)',
        }}
      >
        Manual
      </span>

      <button type="button" onClick={onToggle} className="w-full text-left cursor-pointer">
        <div
          className="relative aspect-[4/3] overflow-hidden flex flex-col items-center justify-center gap-2"
          style={{
            background: selected
              ? 'linear-gradient(160deg, var(--accent-wash) 0%, var(--surface) 80%)'
              : 'linear-gradient(160deg, var(--sidebar) 0%, var(--surface) 80%)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <PenLine className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono-code" style={{ color: 'var(--muted)' }}>
            Manual macros
          </p>
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
            Custom
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
            Type calories &amp; protein yourself
          </p>
          <p className="text-[11px] font-mono-code mt-1.5" style={{ color: 'var(--faint)' }}>
            Anything not on the menu
          </p>
        </div>
      </button>

      {selected && (
        <div
          className="px-3 pb-3 pt-3 border-t flex flex-col gap-3 min-w-0"
          style={{ borderColor: 'var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <label className="block space-y-1">
            <span className="text-[10px] font-mono-code uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              What was it? (optional)
            </span>
            <input
              type="text"
              value={note}
              maxLength={80}
              placeholder="e.g. mom’s pulao, cafe sandwich…"
              onChange={(e) => onChange({ note: e.target.value })}
              className="w-full text-sm rounded-xl border px-3 py-2 bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
            />
          </label>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono-code uppercase tracking-wide text-center" style={{ color: 'var(--muted)' }}>
                Calories
              </p>
              <div className="flex justify-center">
                <NumberStepper
                  value={String(kcal)}
                  onChange={(raw) => {
                    if (raw.trim() === '') {
                      onChange({ calories: 0 });
                      return;
                    }
                    const n = Number(raw);
                    if (Number.isFinite(n)) onChange({ calories: Math.max(0, Math.round(n)) });
                  }}
                  step={10}
                  min={0}
                  max={5000}
                  decimals={0}
                  unit="kcal"
                  size="sm"
                  emptyStart={0}
                  aria-label="Custom calories"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono-code uppercase tracking-wide text-center" style={{ color: 'var(--muted)' }}>
                Protein
              </p>
              <div className="flex justify-center">
                <NumberStepper
                  value={String(protein)}
                  onChange={(raw) => {
                    if (raw.trim() === '') {
                      onChange({ protein_g: 0 });
                      return;
                    }
                    const n = Number(raw);
                    if (Number.isFinite(n)) onChange({ protein_g: Math.max(0, Number(n.toFixed(1))) });
                  }}
                  step={1}
                  min={0}
                  max={500}
                  decimals={1}
                  unit="g"
                  size="sm"
                  emptyStart={0}
                  aria-label="Custom protein grams"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] font-mono-code tabular-nums" style={{ color: 'var(--accent)' }}>
            Adds {kcal} kcal · {protein}g P
            <span className="sr-only"> ({CUSTOM_FOOD_ID})</span>
          </p>
        </div>
      )}
    </div>
  );
};
