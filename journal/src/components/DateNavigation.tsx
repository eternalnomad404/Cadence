import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { CHALLENGE_START_DATE, DayLog } from '../types';
import { getTodayDateString } from '../data/days';

interface DateNavigationProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  daysMap: Record<string, DayLog>;
  todayDate?: string;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  onSelectDate,
  daysMap,
  todayDate = getTodayDateString(),
}) => {
  // Compute previous and next date strings
  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  };

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const atStart = currentDate <= CHALLENGE_START_DATE;

  const handlePrevDay = () => {
    if (atStart) return;
    const d = parseDate(currentDate);
    d.setDate(d.getDate() - 1);
    const next = formatDate(d);
    if (next < CHALLENGE_START_DATE) return;
    onSelectDate(next);
  };

  const handleNextDay = () => {
    const d = parseDate(currentDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(formatDate(d));
  };

  const handleToday = () => {
    onSelectDate(todayDate < CHALLENGE_START_DATE ? CHALLENGE_START_DATE : todayDate);
  };

  // 7 calendar days with the selected day in the center (3 before, 3 after)
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = parseDate(currentDate);
    d.setDate(d.getDate() + (i - 3));
    const dateStr = formatDate(d);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const log = daysMap[dateStr] || null;

    return {
      date: dateStr,
      dayName,
      dayNumber: d.getDate(),
      log,
      score: log?.dayScore ?? null,
      isSelected: dateStr === currentDate,
      isToday: dateStr === todayDate,
    };
  }).filter((item) => item.date >= CHALLENGE_START_DATE);

  return (
    <div className="w-full mb-6">
      {/* Top row: Prev, Today, Next buttons & Date indicator */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <button
            id="prev-day-btn"
            onClick={handlePrevDay}
            disabled={atStart}
            aria-label="Previous day"
            className="p-1.5 rounded-lg border transition-colors flex items-center justify-center hover:opacity-85 disabled:opacity-35 disabled:cursor-default disabled:hover:opacity-35 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="next-day-btn"
            onClick={handleNextDay}
            aria-label="Next day"
            className="p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center hover:opacity-85"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {currentDate !== todayDate && (
            <button
              id="jump-today-btn"
              onClick={handleToday}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ml-1"
              style={{
                backgroundColor: 'var(--accent-wash)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Today</span>
            </button>
          )}
        </div>

        <div className="text-right">
          <span className="text-xs font-mono-code" style={{ color: 'var(--muted)' }}>
            Viewing: <span className="font-semibold" style={{ color: 'var(--ink)' }}>{currentDate}</span>
          </span>
        </div>
      </div>

      {/* Date timeline pill strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:justify-between">
        {calendarDays.map((item) => {
          return (
            <button
              key={item.date}
              id={`day-tab-${item.date}`}
              onClick={() => onSelectDate(item.date)}
              className="flex-1 min-w-[56px] sm:min-w-[68px] py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center relative"
              style={{
                backgroundColor: item.isSelected ? 'var(--accent-wash)' : 'var(--surface)',
                borderColor: item.isSelected ? 'var(--accent)' : 'var(--border)',
                boxShadow: item.isSelected ? '0 0 0 1px var(--accent)' : 'none',
              }}
            >
              <span
                className="text-[10px] font-medium uppercase tracking-wider mb-0.5"
                style={{
                  color: item.isSelected ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {item.dayName}
              </span>

              <span
                className="text-sm font-mono-code font-semibold leading-tight"
                style={{
                  color: item.isSelected ? 'var(--accent-hover)' : 'var(--ink)',
                }}
              >
                {item.dayNumber}
              </span>

              <div className="mt-1.5 h-4 flex items-center justify-center">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: item.log
                      ? 'var(--moss)'
                      : item.isToday
                        ? 'var(--accent)'
                        : 'var(--faint)',
                  }}
                />
              </div>

              {item.isToday && (
                <span
                  className="absolute -top-1 right-1 w-2 h-2 rounded-full border"
                  style={{
                    backgroundColor: 'var(--accent)',
                    borderColor: 'var(--surface)',
                  }}
                  title="Today"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
