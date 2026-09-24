import React, { useCallback, useEffect, useState } from 'react';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { FALLBACK_MORNING_KG, saveWeightLog, type WeightDraft } from '../data/weightDrafts';
import { useAutoSave } from '../hooks/useAutoSave';
import { NumberStepper } from './NumberStepper';
import { SmoothCollapse } from './SmoothCollapse';

interface WeightQuickLogProps {
  date: string;
  existing?: WeightDraft | null;
  defaultKg?: number;
  fromPreviousDay?: boolean;
  onSaved: (draft: WeightDraft) => void;
}

function formatKg(n: number): string {
  return Number(n.toFixed(2)).toString();
}

export const WeightQuickLog: React.FC<WeightQuickLogProps> = ({
  date,
  existing,
  defaultKg = FALLBACK_MORNING_KG,
  fromPreviousDay = false,
  onSaved,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [kg, setKg] = useState(() =>
    existing ? formatKg(existing.morning_kg) : formatKg(defaultKg)
  );
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKg(existing ? formatKg(existing.morning_kg) : formatKg(defaultKg));
    setTouched(false);
    setError(null);
  }, [date, existing, defaultKg]);

  const parsed = Number(kg);
  const valid = Number.isFinite(parsed) && parsed > 20 && parsed < 300;
  const unchanged =
    existing != null && valid && Math.abs(existing.morning_kg - parsed) < 0.005;
  // Prefill must not write until the user edits the stepper
  const ready = valid && !unchanged && (existing != null || touched);

  const persist = useCallback(async () => {
    if (!valid) return;
    setError(null);
    try {
      const { draft } = await saveWeightLog(date, parsed);
      onSaved(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  }, [date, onSaved, parsed, valid]);

  useAutoSave(date, ready, kg, persist);

  const collapsedSummary = existing
    ? `${formatKg(existing.morning_kg)} kg`
    : fromPreviousDay
      ? `${formatKg(defaultKg)} kg · from yesterday`
      : `${formatKg(defaultKg)} kg · not set`;

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
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold font-serif-display text-base" style={{ color: 'var(--ink)' }}>
              Body — Morning weight
            </h4>
            {!expanded ? (
              <p className="text-xs font-mono-code mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {collapsedSummary}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {fromPreviousDay
                  ? `Prefills yesterday (${formatKg(defaultKg)} kg) · autosaves`
                  : 'Weigh after waking · autosaves'}
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
        <div className="p-5 sm:p-6 space-y-4">
          <NumberStepper
            value={kg}
            onChange={(v) => {
              setTouched(true);
              setKg(v);
            }}
            step={0.01}
            min={30}
            max={250}
            decimals={2}
            unit="kg"
            size="lg"
            placeholder={formatKg(defaultKg)}
            emptyStart={defaultKg}
            aria-label="Morning weight in kilograms"
          />
          {error && (
            <p className="text-xs" style={{ color: 'var(--rose)' }}>
              {error}
            </p>
          )}
        </div>
      </SmoothCollapse>
    </div>
  );
};
