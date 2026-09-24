import type { DayFile } from './loadDays';
import { extractGymDraft } from './gymDrafts';
import { extractDietDraft } from './dietDrafts';
import { extractWeightDraft, type WeightDraft } from './weightDrafts';
import type { HabitTimeDraft } from './habitTimeDrafts';
import type { GymLog } from '../types';
import type { DietDraft } from './foodMenu';

export type CloudOverlays = {
  gym: Record<string, GymLog>;
  diet: Record<string, DietDraft>;
  weight: Record<string, WeightDraft>;
  learning: Record<string, HabitTimeDraft>;
  outreach: Record<string, HabitTimeDraft>;
};

function extractHabit(raw: DayFile, kind: 'learning' | 'outreach'): HabitTimeDraft | null {
  const block = (raw as unknown as Record<string, unknown>)[kind];
  if (!block || typeof block !== 'object') return null;
  const hours = (block as { hours?: unknown }).hours;
  const minutes = (block as { minutes?: unknown }).minutes;
  if (typeof hours !== 'number' || typeof minutes !== 'number') return null;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return {
    hours: Math.min(12, Math.max(0, Math.round(hours))),
    minutes: Math.min(45, Math.max(0, Math.round(minutes / 15) * 15)),
  };
}

/** Live Netlify Blobs overlays — returns null offline / without Functions. */
export async function fetchCloudOverlays(): Promise<CloudOverlays | null> {
  try {
    const res = await fetch('/api/overlays', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; days?: Record<string, DayFile> };
    if (!data?.ok || !data.days) return null;

    const gym: Record<string, GymLog> = {};
    const diet: Record<string, DietDraft> = {};
    const weight: Record<string, WeightDraft> = {};
    const learning: Record<string, HabitTimeDraft> = {};
    const outreach: Record<string, HabitTimeDraft> = {};

    for (const [date, raw] of Object.entries(data.days)) {
      if (!raw || raw.logged === true) continue;
      const g = extractGymDraft(raw);
      if (g) gym[date] = g;
      const d = extractDietDraft(raw);
      if (d && (d.entries.length > 0 || d.calories > 0 || d.protein_g > 0)) diet[date] = d;
      const w = extractWeightDraft(raw);
      if (w) weight[date] = w;
      const learn = extractHabit(raw, 'learning');
      if (learn) learning[date] = learn;
      const out = extractHabit(raw, 'outreach');
      if (out) outreach[date] = out;
    }

    return { gym, diet, weight, learning, outreach };
  } catch {
    return null;
  }
}
