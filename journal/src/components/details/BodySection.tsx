import { Dumbbell, CheckCircle2, XCircle, Flame, Scale } from 'lucide-react';
import { getSurroundingDays } from '../../data/days';
import type { DayLog } from '../../types';
import { MAINTENANCE_CALORIES, energyBalance } from '../../data/calories';

export function BodySection({
  log,
  surroundingDays,
  onSelectDate,
}: {
  log: DayLog;
  surroundingDays: ReturnType<typeof getSurroundingDays>;
  onSelectDate: (date: string) => void;
}) {
  const intake = log.diet.calories ?? 0;
  const balance = energyBalance(intake);
  const morningKg = log.weight?.morning_kg;

  return (
    <section
        id="section-body"
        className="p-5 sm:p-6 rounded-2xl border transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border flex-shrink-0"
              style={{
                backgroundColor: 'var(--sidebar)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg font-serif-display leading-snug" style={{ color: 'var(--ink)' }}>
                Body & Physical Performance
              </h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Maintenance {MAINTENANCE_CALORIES} kcal · gym + cut + morning weight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-sm font-mono-code font-bold px-2.5 py-1 rounded-lg border"
              style={{
                backgroundColor: 'var(--sidebar)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              {((log.gym.score + log.diet.score) / 2).toFixed(1)} / 5.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div
            className="p-3 rounded-xl border"
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
            <p className="text-[10px] font-mono-code uppercase" style={{ color: 'var(--muted)' }}>
              Energy vs {MAINTENANCE_CALORIES}
            </p>
            <p
              className="text-lg font-semibold font-serif-display mt-0.5 tabular-nums"
              style={{
                color:
                  balance.kind === 'deficit'
                    ? 'var(--accent)'
                    : balance.kind === 'surplus'
                      ? 'var(--rose)'
                      : 'var(--ink)',
              }}
            >
              {intake > 0 ? balance.label : '—'}
            </p>
            {intake > 0 && (
              <p className="text-[10px] font-mono-code mt-0.5" style={{ color: 'var(--faint)' }}>
                Ate {intake} kcal
              </p>
            )}
          </div>
          <div
            className="p-3 rounded-xl border flex items-center gap-3"
            style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}
          >
            <Scale className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-[10px] font-mono-code uppercase" style={{ color: 'var(--muted)' }}>
                Morning weight
              </p>
              <p className="text-lg font-semibold font-mono-code tabular-nums" style={{ color: 'var(--ink)' }}>
                {typeof morningKg === 'number' ? `${morningKg.toFixed(1)} kg` : '—'}
              </p>
            </div>
          </div>
          <div
            className="p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}
          >
            <p className="text-[10px] font-mono-code uppercase" style={{ color: 'var(--muted)' }}>
              Protein
            </p>
            <p className="text-lg font-semibold font-mono-code tabular-nums" style={{ color: 'var(--accent)' }}>
              {log.diet.protein_g != null ? `${log.diet.protein_g}g` : '—'}
            </p>
          </div>
        </div>

        {/* Gym & Diet Side-by-side or Stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Gym Block */}
          <div
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: log.gym.hit ? 'var(--sidebar)' : 'var(--rose-wash)',
              borderColor: log.gym.hit ? 'var(--border)' : 'var(--rose)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-code uppercase font-semibold tracking-wider" style={{ color: 'var(--muted)' }}>
                    Gym Session
                  </span>
                  {log.gym.cardio && (
                    <span
                      className="text-[10px] font-mono-code px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--accent-wash)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }}
                    >
                      + Cardio
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {log.gym.hit ? (
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--moss)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hit</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--rose)' }}>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rest / Missed</span>
                    </span>
                  )}
                  <span
                    className="text-xs font-mono-code font-bold ml-1 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}
                  >
                    {log.gym.score}/5
                  </span>
                </div>
              </div>

              <div className="text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
                {log.gym.workoutType || 'Resistance training'}
              </div>

              {log.gym.note && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {log.gym.note}
                </p>
              )}
            </div>
          </div>

          {/* Diet Block */}
          <div
            className="p-4 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--sidebar)',
              borderColor: 'var(--border)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code uppercase font-semibold tracking-wider" style={{ color: 'var(--muted)' }}>
                  Diet & Cut Deficit
                </span>

                <div className="flex items-center gap-1.5">
                  {log.diet.deficit_ok ? (
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--moss)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>~1000 kcal Deficit</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--rose)' }}>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Deficit Missed</span>
                    </span>
                  )}
                  <span
                    className="text-xs font-mono-code font-bold ml-1 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'var(--surface)', color: 'var(--ink)' }}
                  >
                    {log.diet.score}/5
                  </span>
                </div>
              </div>

              {/* Protein & Calorie specs */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold font-mono-code" style={{ color: 'var(--ink)' }}>
                    {log.diet.protein_g}g
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    / 140g target
                  </span>
                </div>

                {log.diet.calories && (
                  <div className="text-xs font-mono-code px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    {log.diet.calories} kcal
                  </div>
                )}
              </div>

              {log.diet.note && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {log.diet.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 7-Day Mini Sparkline Strip */}
        <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border)' }}>
          <span className="font-mono-code" style={{ color: 'var(--muted)' }}>
            7-Day Body Consistency:
          </span>
          <div className="flex items-center gap-2">
            {surroundingDays.map((d) => {
              const hasGymHit = d.log?.gym.hit;
              return (
    <button
                  key={d.date}
                  onClick={() => onSelectDate(d.date)}
                  className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                  title={`${d.date}: ${hasGymHit ? 'Gym Hit' : d.log ? 'Gym Miss' : 'No log'}`}
                >
                  <span
                    className="w-4 h-4 rounded-md flex items-center justify-center border text-[9px] font-mono-code"
                    style={{
                      backgroundColor: hasGymHit
                        ? 'var(--accent)'
                        : d.log
                        ? 'var(--rose-wash)'
                        : 'var(--sidebar)',
                      borderColor: hasGymHit
                        ? 'var(--accent-hover)'
                        : d.log
                        ? 'var(--rose)'
                        : 'var(--border)',
                      color: hasGymHit ? '#ffffff' : 'var(--muted)',
                    }}
                  >
                    {hasGymHit ? 'âœ“' : d.log ? 'âœ•' : 'â€”'}
                  </span>
                  <span className="text-[10px] font-mono-code" style={{ color: d.isCurrent ? 'var(--accent)' : 'var(--muted)' }}>
                    {d.dayName.slice(0, 2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
  );
}