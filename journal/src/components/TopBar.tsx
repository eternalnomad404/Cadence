import React from 'react';
import { Moon, Sun, Lock } from 'lucide-react';
import { formatDisplayDate, getChallengeDayNumber } from '../data/days';
import { CHALLENGE_TOTAL_DAYS } from '../types';

interface TopBarProps {
  currentDate: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onJumpToDate?: (date: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentDate,
  isDark,
  onToggleTheme,
}) => {
  const displayDate = formatDisplayDate(currentDate);
  const challenge = getChallengeDayNumber(currentDate);

  return (
    <header
      id="top-bar"
      className="sticky top-0 z-30 w-full transition-colors duration-200 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="w-full max-w-none mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <img
                  src="/cadence-icon.png"
                  alt=""
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0"
                />
                <span
                  className="text-2xl sm:text-3xl font-semibold tracking-tight font-serif-display leading-none"
                  style={{ color: 'var(--ink)' }}
                >
                  Cadence
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: 'var(--accent-wash)',
                    color: 'var(--accent)',
                    borderColor: 'var(--border)',
                  }}
                  title="Private. Data is read-only — voice dumps update Cadence via git."
                >
                  <Lock className="w-3 h-3" />
                  <span className="hidden xs:inline">Private</span>
                </span>
              </div>
              <span
                className="text-xs font-mono-code mt-0.5 tracking-tight"
                style={{ color: 'var(--muted)' }}
              >
                {displayDate}
              </span>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 30-Day challenge indicator */}
            {!challenge.isBefore && !challenge.isAfter && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                style={{
                  backgroundColor: 'var(--sidebar)',
                  color: 'var(--ink)',
                  borderColor: 'var(--border)',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--moss)' }}
                />
                <span className="font-mono-code">
                  Day {challenge.dayNumber} / {CHALLENGE_TOTAL_DAYS}
                </span>
              </div>
            )}

            {/* Dark / Light Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--sidebar)',
                color: 'var(--ink)',
                borderColor: 'var(--border)',
              }}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span className="hidden sm:inline text-xs">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <span className="hidden sm:inline text-xs">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile 30-day banner if on mobile */}
        {!challenge.isBefore && !challenge.isAfter && (
          <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>30-Day Body & Focus Commit</span>
            <span
              className="font-mono-code font-semibold px-2 py-0.5 rounded text-[11px]"
              style={{ backgroundColor: 'var(--accent-wash)', color: 'var(--accent)' }}
            >
              Day {challenge.dayNumber} / {CHALLENGE_TOTAL_DAYS}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
