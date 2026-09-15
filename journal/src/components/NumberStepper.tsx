import React from 'react';
import { Minus, Plus } from 'lucide-react';

type NumberStepperProps = {
  value: string;
  onChange: (value: string) => void;
  step?: number;
  min?: number;
  max?: number;
  /** Round stepped values to this many decimals (weight = 1). */
  decimals?: number;
  unit?: string;
  size?: 'sm' | 'lg';
  placeholder?: string;
  /** Empty field starts here when first tapping + / − */
  emptyStart?: number;
  'aria-label'?: string;
};

function stepPrecision(step: number, decimals?: number): number {
  if (typeof decimals === 'number') return decimals;
  const s = String(step);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}

function clampRound(n: number, min: number, max: number, precision: number): number {
  const rounded = Number(n.toFixed(precision));
  return Math.min(max, Math.max(min, rounded));
}

/** Clean stepped display: 78.5 stays; 78.0 → 78. */
function formatStepped(n: number, precision: number): string {
  if (precision <= 0) return String(Math.round(n));
  const fixed = n.toFixed(precision);
  return fixed.replace(/\.?0+$/, '') === '' ? '0' : fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  decimals,
  unit,
  size = 'sm',
  placeholder,
  emptyStart,
  'aria-label': ariaLabel,
}) => {
  const precision = stepPrecision(step, decimals);
  const isLg = size === 'lg';

  const bump = (dir: 1 | -1) => {
    const parsed = Number(value);
    const current =
      value.trim() !== '' && Number.isFinite(parsed) ? parsed : emptyStart ?? min;
    const next = clampRound(current + dir * step, min, max, precision);
    onChange(formatStepped(next, precision));
  };

  const handleType = (raw: string) => {
    const cleaned = raw.replace(/,/g, '');
    if (cleaned === '') {
      onChange('');
      return;
    }
    // Allow drafting decimals / partial input
    if (precision > 0 && /^-?\d*\.?\d*$/.test(cleaned)) {
      onChange(cleaned);
      return;
    }
    if (precision <= 0 && /^-?\d*$/.test(cleaned)) {
      onChange(cleaned);
      return;
    }
  };

  const btnClass = isLg
    ? 'w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer shrink-0 transition-colors'
    : 'w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 transition-colors';

  const btnStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--ink)',
  };

  const inputClass = isLg
    ? 'w-[5.5rem] text-center text-2xl font-semibold font-mono-code rounded-xl border py-2.5 px-2 bg-transparent tabular-nums'
    : 'w-12 text-center text-sm font-semibold font-mono-code rounded-lg border py-1 px-1 bg-transparent tabular-nums';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <button
        type="button"
        aria-label="Decrease"
        className={btnClass}
        style={btnStyle}
        onClick={() => bump(-1)}
      >
        <Minus className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </button>

      <div className="flex items-baseline gap-1.5 justify-center min-w-0">
        <input
          type="text"
          inputMode={precision > 0 ? 'decimal' : 'numeric'}
          enterKeyHint="done"
          autoComplete="off"
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleType(e.target.value)}
          onBlur={() => {
            if (value.trim() === '' || value === '.' || value === '-') return;
            const n = Number(value);
            if (!Number.isFinite(n)) {
              onChange('');
              return;
            }
            onChange(formatStepped(clampRound(n, min, max, precision), precision));
          }}
          className={`${inputClass} shrink-0`}
          style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}
        />
        {unit && (
          <span
            className={isLg ? 'text-sm font-medium' : 'text-[11px] truncate'}
            style={{ color: 'var(--muted)' }}
          >
            {unit}
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="Increase"
        className={btnClass}
        style={btnStyle}
        onClick={() => bump(1)}
      >
        <Plus className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  );
};
