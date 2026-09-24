import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react';
import { NumberStepper } from './NumberStepper';
import { SmoothCollapse } from './SmoothCollapse';
import {
  formatHabitTime,
  saveHabitTimeLog,
  type HabitTimeDraft,
  type HabitTimeKind,
} from '../data/habitTimeDrafts';

interface TimeQuickLogProps {
  date: string;
  kind: HabitTimeKind;
  title: string;
  hint: string;
  icon: LucideIcon;
  existing?: HabitTimeDraft | null;
  onSaved: (draft: HabitTimeDraft) => void;
}

export const TimeQuickLog: React.FC<TimeQuickLogProps> = ({
  date,
  kind,
  title,
  hint,
  icon: Icon,
  existing,
  onSaved,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(!existing);
  const [hours, setHours] = useState(() => String(existing?.hours ?? 0));
  const [minutes, setMinutes] = useState(() => String(existing?.minutes ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHours(String(existing?.hours ?? 0));
    setMinutes(String(existing?.minutes ?? 0));
    setEditing(!existing);
    setError(null);
  }, [date, existing]);

  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  const canSave =
    Number.isFinite(parsedHours) &&
    Number.isFinite(parsedMinutes) &&
    parsedHours >= 0 &&
    parsedMinutes >= 0;
  const done = Boolean(existing) && !editing;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const { draft } = await saveHabitTimeLog(kind, date, parsedHours, parsedMinutes);
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
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold font-serif-display text-base" style={{ color: 'var(--ink)' }}>
              {title}
            </h4>
            {!expanded ? (
              <p className="text-xs font-mono-code mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {existing ? formatHabitTime(existing) : 'Not logged'}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {done ? 'Logged · tap to collapse' : `${hint} · tap to collapse`}
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
                  {formatHabitTime(existing!)} logged
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium underline cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => {
                    setHours(String(existing!.hours));
                    setMinutes(String(existing!.minutes));
                    setEditing(true);
                  }}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    Hours
                  </p>
                  <NumberStepper
                    value={hours}
                    onChange={setHours}
                    step={1}
                    min={0}
                    max={12}
                    unit="h"
                    size="sm"
                    aria-label={`${title} hours`}
                  />
                </div>
                <div className="space-y-2 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                    Minutes
                  </p>
                  <NumberStepper
                    value={minutes}
                    onChange={setMinutes}
                    step={15}
                    min={0}
                    max={45}
                    unit="m"
                    size="sm"
                    aria-label={`${title} minutes`}
                  />
                </div>
              </div>
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
                {saving ? 'Saving…' : 'Save time'}
              </button>
            </>
          )}
        </div>
      </SmoothCollapse>
    </div>
  );
};
