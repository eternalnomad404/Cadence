/** Shared day JSON helpers for Netlify Blobs (mirrors vite-plugin-log-api). */

export type DayRecord = Record<string, unknown>;

export function emptyDay(date: string): DayRecord {
  return {
    date,
    logged: false,
    dayScore: null,
    gym: { hit: null, score: null, cardio: null, note: '' },
    weight: { morning_kg: null },
    diet: {
      score: null,
      protein_g: null,
      calories: null,
      deficit_ok: null,
      protein_ok: null,
      energy_delta: null,
      note: '',
      entries: [],
    },
    sleep: {
      asleep_at: null,
      woke_at: null,
      alarm_used: null,
      score: null,
      note: '',
    },
    night_brush: { done: null },
    work: {
      keepalive: { score: null, note: '' },
      leverage: { score: null, note: '' },
      future: { score: null, note: '' },
    },
    academics: { active: false, score: null, note: '' },
    reflection: { wins: [], friction: '', tomorrow: '', voiceDumpSnippet: '' },
  };
}

export function isDate(date: unknown): date is string {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function mergeDay(existing: DayRecord, patch: DayRecord, date: string): DayRecord {
  return {
    ...existing,
    ...patch,
    date,
    logged: existing.logged === true ? true : false,
  };
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
