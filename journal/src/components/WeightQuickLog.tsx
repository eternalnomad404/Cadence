import React, { useEffect, useState } from 'react';
import { Scale, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { FALLBACK_MORNING_KG, saveWeightLog, type WeightDraft } from '../data/weightDrafts';
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
  return Number(n.toFixed(1)).toString();
}

export const WeightQuickLog: React.FC<WeightQuickLogProps> = ({
  date,
  existing,
  defaultKg = FALLBACK_MORNING_KG,
  fromPreviousDay = false,
  onSaved,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(!existing);
  const [kg, setKg] = useState(() =>
    existing ? formatKg(existing.morning_kg) : formatKg(defaultKg)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKg(existing ? formatKg(existing.morning_kg) : formatKg(defaultKg));
    setEditing(!existing);
  }, [date, existing, defaultKg]);

  const parsed = Number(kg);
  const canSave = Number.isFinite(parsed) && parsed > 20 && parsed < 300;
  const done = Boolean(existing) && !editing;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const { draft } = await saveWeightLog(date, parsed);
      onSaved(draft);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
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
            <Scale className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold font-serif-display text-base" style={{ color: 'var(--ink)' }}>
              Body — Morning weight
            </h4>
            {!expanded ? (
              <p className="text-xs font-mono-code mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {existing ? `${existing.morning_kg.toFixed(1)} kg` : `${formatKg(defaultKg)} kg · not saved`}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {fromPreviousDay
                  ? `Prefills yesterday (${formatKg(defaultKg)} kg) · tap to collapse`
                  : 'Weigh after waking · tap to collapse'}
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
          {done ? (
            <div
              className="rounded-xl border p-4 flex items-start gap-3"
              style={{ backgroundColor: 'var(--accent-wash)', borderColor: 'var(--accent)' }}
            >
              <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  {existing!.morning_kg.toFixed(1)} kg logged
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium underline cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => {
                    setKg(formatKg(existing!.morning_kg));
                    setEditing(true);
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <>
              <NumberStepper
                value={kg}
                onChange={setKg}
                step={0.1}
                min={30}
                max={250}
                decimals={1}
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
              <button
                type="button"
                disabled={!canSave || saving}
                onClick={handleSave}
                className="w-full py-3 rounded-xl text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  color: '#fff',
                }}
              >
                {saving ? 'Saving…' : 'Save morning weight'}
              </button>
            </>
          )}
        </div>
      </SmoothCollapse>
    </div>
  );
};
