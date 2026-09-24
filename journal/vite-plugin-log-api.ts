import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

type GymPayload = {
  hit: boolean;
  score: number;
  cardio?: boolean;
  note?: string;
};

type DietPayload = {
  entries: { foodId: string; grams: number }[];
  calories: number;
  protein_g: number;
};

function readJson(filePath: string): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function emptyDay(date: string): Record<string, unknown> {
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

function mergeWrite(daysDir: string, date: string, patch: Record<string, unknown>) {
  fs.mkdirSync(daysDir, { recursive: true });
  const filePath = path.join(daysDir, `${date}.json`);
  const existing = readJson(filePath) ?? emptyDay(date);
  const next = {
    ...existing,
    ...patch,
    date,
    logged: existing.logged === true ? true : false,
  };
  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

function readBody(req: { on: (e: string, cb: (c?: Buffer) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => {
      if (c) chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Dev-only APIs so Cadence can write day JSON Cursor can read:
 * POST /api/log-gym
 * POST /api/log-diet
 * POST /api/log-weight
 * POST /api/log-habit-time
 */
export function cadenceLogApiPlugin(journalRoot: string, repoRoot: string): Plugin {
  const journalDays = path.join(journalRoot, 'data', 'days');
  const planDays = path.join(repoRoot, 'Plan', 'data', 'days');

  return {
    name: 'cadence-log-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (
          req.method !== 'POST' ||
          (req.url !== '/api/log-gym' &&
            req.url !== '/api/log-diet' &&
            req.url !== '/api/log-weight' &&
            req.url !== '/api/log-habit-time')
        ) {
          next();
          return;
        }

        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw) as {
            date?: string;
            gym?: GymPayload;
            diet?: DietPayload;
            weight?: { morning_kg: number };
            kind?: 'learning' | 'outreach';
            time?: { hours: number; minutes: number };
          };
          const date = body.date;
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Invalid date' }));
            return;
          }

          if (req.url === '/api/log-habit-time') {
            const kind = body.kind;
            const hours = body.time?.hours;
            const minutes = body.time?.minutes;
            if (kind !== 'learning' && kind !== 'outreach') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Invalid kind' }));
              return;
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
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Invalid time' }));
              return;
            }
            const time = {
              hours: Math.round(hours),
              minutes: Math.round(minutes / 15) * 15,
            };
            const patch = { [kind]: time };
            mergeWrite(journalDays, date, patch);
            mergeWrite(planDays, date, patch);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, date, kind, time }));
            return;
          }

          if (req.url === '/api/log-weight') {
            const morning_kg = body.weight?.morning_kg;
            if (typeof morning_kg !== 'number' || !Number.isFinite(morning_kg) || morning_kg <= 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Invalid weight' }));
              return;
            }
            const patch = { weight: { morning_kg: Number(morning_kg.toFixed(1)) } };
            mergeWrite(journalDays, date, patch);
            mergeWrite(planDays, date, patch);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, date, weight: patch.weight }));
            return;
          }

          if (req.url === '/api/log-gym') {
            const gym = body.gym;
            if (!gym || typeof gym.hit !== 'boolean') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Invalid gym' }));
              return;
            }
            const patch = {
              gym: {
                hit: gym.hit,
                score: gym.score,
                cardio: gym.cardio ?? false,
                note: gym.note ?? '',
              },
            };
            mergeWrite(journalDays, date, patch);
            mergeWrite(planDays, date, patch);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, date, gym: patch.gym }));
            return;
          }

          const diet = body.diet;
          if (!diet || !Array.isArray(diet.entries)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Invalid diet' }));
            return;
          }

          const existing = readJson(path.join(journalDays, `${date}.json`)) ?? emptyDay(date);
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
          const patch = { diet: dietBlock };
          mergeWrite(journalDays, date, patch);
          mergeWrite(planDays, date, patch);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, date, diet: dietBlock }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
    },
  };
}
