import { getStore } from '@netlify/blobs';
import { emptyDay, isDate, json, mergeDay, type DayRecord } from '../lib/dayRecord';

const STORE = 'cadence-days';

async function readDay(date: string): Promise<DayRecord> {
  const store = getStore(STORE);
  const existing = await store.get(date, { type: 'json' });
  if (existing && typeof existing === 'object') {
    return existing as DayRecord;
  }
  return emptyDay(date);
}

async function writeDay(date: string, patch: DayRecord): Promise<DayRecord> {
  const store = getStore(STORE);
  const existing = await readDay(date);
  const next = mergeDay(existing, patch, date);
  await store.setJSON(date, next);
  return next;
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  return (await req.json()) as Record<string, unknown>;
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/$/, '') || '/';

  try {
    if (req.method === 'GET' && (path === '/api/overlays' || path.endsWith('/overlays'))) {
      const store = getStore(STORE);
      const listed = await store.list();
      const days: Record<string, DayRecord> = {};
      for (const blob of listed.blobs) {
        if (!isDate(blob.key)) continue;
        const value = await store.get(blob.key, { type: 'json' });
        if (value && typeof value === 'object') {
          days[blob.key] = value as DayRecord;
        }
      }
      return json({ ok: true, days });
    }

    if (req.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed' }, 405);
    }

    const body = await readBody(req);
    const date = body.date;
    if (!isDate(date)) {
      return json({ ok: false, error: 'Invalid date' }, 400);
    }

    if (path.endsWith('/log-habit-time') || path === '/api/log-habit-time') {
      const kind = body.kind;
      const time = body.time as { hours?: number; minutes?: number } | undefined;
      const hours = time?.hours;
      const minutes = time?.minutes;
      if (kind !== 'learning' && kind !== 'outreach') {
        return json({ ok: false, error: 'Invalid kind' }, 400);
      }
      if (
        typeof hours !== 'number' ||
        typeof minutes !== 'number' ||
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes) ||
        hours < 0 ||
        hours > 12 ||
        minutes < 0 ||
        minutes > 45
      ) {
        return json({ ok: false, error: 'Invalid time' }, 400);
      }
      const normalized = {
        hours: Math.round(hours),
        minutes: Math.round(minutes / 15) * 15,
      };
      await writeDay(date, { [kind]: normalized });
      return json({ ok: true, date, kind, time: normalized });
    }

    if (path.endsWith('/log-weight') || path === '/api/log-weight') {
      const weight = body.weight as { morning_kg?: number } | undefined;
      const morning_kg = weight?.morning_kg;
      if (typeof morning_kg !== 'number' || !Number.isFinite(morning_kg) || morning_kg <= 0) {
        return json({ ok: false, error: 'Invalid weight' }, 400);
      }
      const block = { morning_kg: Number(morning_kg.toFixed(1)) };
      await writeDay(date, { weight: block });
      return json({ ok: true, date, weight: block });
    }

    if (path.endsWith('/log-gym') || path === '/api/log-gym') {
      const gym = body.gym as {
        hit?: boolean;
        score?: number;
        cardio?: boolean;
        note?: string;
      } | undefined;
      if (!gym || typeof gym.hit !== 'boolean') {
        return json({ ok: false, error: 'Invalid gym' }, 400);
      }
      const block = {
        hit: gym.hit,
        score: gym.score,
        cardio: gym.cardio ?? false,
        note: gym.note ?? '',
      };
      await writeDay(date, { gym: block });
      return json({ ok: true, date, gym: block });
    }

    if (path.endsWith('/log-diet') || path === '/api/log-diet') {
      const diet = body.diet as {
        entries?: unknown[];
        calories?: number;
        protein_g?: number;
      } | undefined;
      if (!diet || !Array.isArray(diet.entries)) {
        return json({ ok: false, error: 'Invalid diet' }, 400);
      }
      const existing = await readDay(date);
      const prevDiet = (existing.diet as Record<string, unknown>) ?? {};
      const intake = typeof diet.calories === 'number' ? diet.calories : 0;
      const energy_delta = 2400 - intake;
      const dietBlock = {
        ...prevDiet,
        score: prevDiet.score ?? null,
        deficit_ok: energy_delta >= 800 ? true : energy_delta > 0 ? prevDiet.deficit_ok ?? null : false,
        protein_ok:
          typeof diet.protein_g === 'number' ? diet.protein_g >= 130 : prevDiet.protein_ok ?? null,
        note: prevDiet.note ?? '',
        entries: diet.entries,
        calories: diet.calories,
        protein_g: diet.protein_g,
        energy_delta,
        maintenance_kcal: 2400,
      };
      await writeDay(date, { diet: dietBlock });
      return json({ ok: true, date, diet: dietBlock });
    }

    return json({ ok: false, error: 'Not found' }, 404);
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
};

export const config = {
  path: [
    '/api/overlays',
    '/api/log-gym',
    '/api/log-diet',
    '/api/log-weight',
    '/api/log-habit-time',
  ],
};
