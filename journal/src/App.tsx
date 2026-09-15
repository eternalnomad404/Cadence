import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_DAYS_DATA,
  getDefaultSelectedDate,
  getTodayDateString,
} from './data/days';
import {
  loadGymDraftsFromFiles,
  mergeGymDrafts,
  readGymDraftsFromStorage,
} from './data/gymDrafts';
import {
  loadDietDraftsFromFiles,
  mergeDietDrafts,
  readDietDraftsFromStorage,
} from './data/dietDrafts';
import {
  loadDietFoodOrdersFromFiles,
  resolvePreviousDayFoodIds,
} from './data/dietMenuOrder';
import {
  loadWeightDraftsFromFiles,
  mergeWeightDrafts,
  readWeightDraftsFromStorage,
  resolveDefaultMorningKg,
  type WeightDraft,
} from './data/weightDrafts';
import type { DietDraft } from './data/foodMenu';
import { CHALLENGE_START_DATE, type GymLog } from './types';
import { TopBar } from './components/TopBar';
import { DateNavigation } from './components/DateNavigation';
import { DetailSections } from './components/DetailSections';
import { EmptyState } from './components/EmptyState';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const todayDate = getTodayDateString();

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved =
        localStorage.getItem('cadence_theme') ??
        localStorage.getItem('Cadence_theme') ??
        localStorage.getItem('azimuth_theme') ??
        localStorage.getItem('meridian_theme') ??
        localStorage.getItem('journal_theme');
      if (saved) return saved === 'dark';
      return false;
    }
    return false;
  });

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getDefaultSelectedDate(INITIAL_DAYS_DATA, CHALLENGE_START_DATE, todayDate)
  );
  const [daysData] = useState(INITIAL_DAYS_DATA);
  const [gymDrafts, setGymDrafts] = useState<Record<string, GymLog>>(() => {
    if (typeof window === 'undefined') return loadGymDraftsFromFiles();
    return mergeGymDrafts(loadGymDraftsFromFiles(), readGymDraftsFromStorage());
  });
  const [dietDrafts, setDietDrafts] = useState<Record<string, DietDraft>>(() => {
    if (typeof window === 'undefined') return loadDietDraftsFromFiles();
    return mergeDietDrafts(loadDietDraftsFromFiles(), readDietDraftsFromStorage());
  });
  const [dietFoodOrders] = useState(() => loadDietFoodOrdersFromFiles());
  const [weightDrafts, setWeightDrafts] = useState<Record<string, WeightDraft>>(() => {
    if (typeof window === 'undefined') return loadWeightDraftsFromFiles();
    return mergeWeightDrafts(loadWeightDraftsFromFiles(), readWeightDraftsFromStorage());
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('cadence_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      localStorage.setItem('cadence_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (selectedDate <= CHALLENGE_START_DATE) return;
        const parts = selectedDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const next = `${yyyy}-${mm}-${dd}`;
        if (next < CHALLENGE_START_DATE) return;
        setSelectedDate(next);
      } else if (e.key === 'ArrowRight') {
        const parts = selectedDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate]);

  const currentLog = daysData[selectedDate] || null;
  const currentGymDraft = useMemo(
    () => (currentLog ? null : gymDrafts[selectedDate] ?? null),
    [currentLog, gymDrafts, selectedDate]
  );
  const currentDietDraft = useMemo(
    () => (currentLog ? null : dietDrafts[selectedDate] ?? null),
    [currentLog, dietDrafts, selectedDate]
  );
  const previousDietFoodIds = useMemo(
    () => resolvePreviousDayFoodIds(selectedDate, dietDrafts, dietFoodOrders),
    [selectedDate, dietDrafts, dietFoodOrders]
  );
  const currentWeightDraft = useMemo(
    () => (currentLog ? null : weightDrafts[selectedDate] ?? null),
    [currentLog, weightDrafts, selectedDate]
  );
  const defaultWeight = useMemo(
    () => resolveDefaultMorningKg(selectedDate, daysData, weightDrafts),
    [selectedDate, daysData, weightDrafts]
  );

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-teal-800 selection:text-white transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
    >
      <TopBar
        currentDate={selectedDate}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 w-full max-w-none mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <DateNavigation
          currentDate={selectedDate}
          onSelectDate={(newDate) => setSelectedDate(newDate)}
          daysMap={daysData}
          todayDate={todayDate}
        />

        {currentLog ? (
          <DetailSections
            log={currentLog}
            allDays={daysData}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
          />
        ) : (
          <EmptyState
            date={selectedDate}
            gymDraft={currentGymDraft}
            dietDraft={currentDietDraft}
            previousDietFoodIds={previousDietFoodIds}
            weightDraft={currentWeightDraft}
            defaultWeightKg={defaultWeight.kg}
            weightFromPrevious={defaultWeight.fromPrevious}
            onGymSaved={(gym) => setGymDrafts((prev) => ({ ...prev, [selectedDate]: gym }))}
            onDietSaved={(diet) => setDietDrafts((prev) => ({ ...prev, [selectedDate]: diet }))}
            onWeightSaved={(weight) => setWeightDrafts((prev) => ({ ...prev, [selectedDate]: weight }))}
          />
        )}
      </main>

      <footer
        className="w-full border-t py-6 mt-12 transition-colors text-xs"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span>Cadence — private daily scoreboard</span>
            <span style={{ color: 'var(--faint)' }}>•</span>
            <span className="font-mono-code text-[11px]">Weight + gym + diet</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono-code" style={{ color: 'var(--muted)' }}>
            <span className="hidden sm:inline">Use ← / → keys to navigate days</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
