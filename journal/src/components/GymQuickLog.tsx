import React, { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { GymLog } from '../types';
import { saveGymLog } from '../data/gymDrafts';
import { SmoothCollapse } from './SmoothCollapse';

interface GymQuickLogProps {
  date: string;
  existing?: GymLog | null;
  onSaved: (gym: GymLog) => void;
}

function ChoiceRow({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`space-y-2 min-w-0 ${disabled ? 'opacity-40' : ''}`}>
      <p className="text-sm font-medium text-left" style={{ color: 'var(--ink)' }}>
        {label}
      </p>
      <div className="flex gap-2">
        {[true, false].map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors cursor-pointer disabled:cursor-default"
              style={{
                backgroundColor: selected ? 'var(--accent-wash)' : 'var(--sidebar)',
                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                color: selected ? 'var(--accent)' : 'var(--ink)',
              }}
            >
              {opt ? 'Yes' : 'No'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const GymQuickLog: React.FC<GymQuickLogProps> = ({ date, existing, onSaved }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(!existing);
  const [hit, setHit] = useState<boolean | null>(existing ? existing.hit : null);
  const [cardio, setCardio] = useState<boolean | null>(
    existing ? Boolean(existing.cardio) : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHit(existing ? existing.hit : null);
    setCardio(existing ? Boolean(existing.cardio) : null);
    setEditing(!existing);
  }, [date, existing]);

  const previewScore = useMemo(() => {
    if (hit === null) return null;
    if (!hit) return 1;
    if (cardio === null) return null;
    return cardio ? 5 : 4;
  }, [hit, cardio]);

  const canSave = hit === false || (hit === true && cardio !== null);
  const done = Boolean(existing) && !editing;

  const handleSave = async () => {
    if (!canSave || hit === null) return;
    setSaving(true);
    setError(null);
    try {
      const { gym } = await saveGymLog(date, hit, hit ? Boolean(cardio) : false);
      onSaved(gym);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const collapsedSummary = existing
    ? existing.hit
      ? `Yes${existing.cardio ? ' + cardio' : ''} · ${existing.score}/5`
      : `Missed · ${existing.score}/5`
    : 'Not logged';

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
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold font-serif-display text-base" style={{ color: 'var(--ink)' }}>
              Body — Gym
            </h4>
            {!expanded ? (
              <p className="text-xs font-mono-code mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                {collapsedSummary}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Quick log · tap to collapse
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
                  Hit: {existing!.hit ? 'Yes' : 'No'}
                  {existing!.hit ? ` · Cardio: ${existing!.cardio ? 'Yes' : 'No'}` : ''}
                  {' · '}
                  Score {existing!.score}/5
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium underline cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                  onClick={() => {
                    setHit(existing!.hit);
                    setCardio(existing!.hit ? Boolean(existing!.cardio) : false);
                    setEditing(true);
                  }}
                >
                  Change answers
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
                <ChoiceRow
                  label="Did you go to the gym?"
                  value={hit}
                  onChange={(v) => {
                    setHit(v);
                    if (!v) setCardio(false);
                    else setCardio(null);
                  }}
                />
                <ChoiceRow
                  label="Did you do cardio?"
                  value={cardio}
                  disabled={hit !== true}
                  onChange={setCardio}
                />
              </div>

              {previewScore !== null && (
                <p className="text-xs font-mono-code" style={{ color: 'var(--muted)' }}>
                  Gym score → <span style={{ color: 'var(--accent)' }}>{previewScore}/5</span>
                  {previewScore === 5
                    ? ' (gym + cardio)'
                    : previewScore === 4
                      ? ' (gym, no cardio)'
                      : ' (missed)'}
                </p>
              )}

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
                {saving ? 'Saving…' : 'Save gym log'}
              </button>
            </>
          )}
        </div>
      </SmoothCollapse>
    </div>
  );
};
