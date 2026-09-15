# Google AI Studio — Dashboard UI Prompt

Copy everything below the line into Google AI Studio (or similar) to generate the interface.

Start date for the product: **22 August 2026**.

---

## PROMPT (copy from here)

Design a **private personal life scoreboard** web app called **Cadence**. It is a daily trainer dashboard for one user (Aman). Data is **read-only on the website** — he never types scores into the UI. Scores arrive from GitHub JSON/markdown that a coding agent updates after his voice dumps. This screen is the **mirror** he opens every day on phone and laptop.

### Product vibe
- Friendly, calm, motivating — like a good gym coach, not a corporate analytics suite
- Something he *wants* to open every night; clear at a glance in 10 seconds
- Mobile-first and fully responsive; thumb-friendly spacing
- Private / personal — no marketing fluff, no public social features, no fake “community”
- Trainer + light reflection + founder board in one composition
- Avoid purple gradients, neon glow, generic AI SaaS look, heavy card grids, emoji spam

### Visual theme — match his other tool **Atlas** exactly
Calm paper-like sage/teal system. Soft surfaces, quiet borders, moss accent.

**Fonts (same as Atlas):**
- UI: `Plus Jakarta Sans`
- Brand / display moments: `Newsreader` (serif)
- Optional mono for dates/paths: `JetBrains Mono`

**Light theme CSS variables (default):**
```
--bg: #f3f5f4;
--surface: #fbfcfa;
--sidebar: #e9eeec;
--ink: #1b2421;
--muted: #5e6b66;
--border: #d5ddd8;
--accent: #3f7f78;
--accent-hover: #346b65;
--accent-wash: #dcebe8;
--moss: #6f8f6a;
--rose: #b86b6b;
--rose-wash: #f8eded;
--faint: #a3b0a9;
```

**Dark theme (include a toggle like Atlas):**
```
--bg: #121614;
--surface: #1a1f1c;
--sidebar: #161b18;
--ink: #e8ede9;
--muted: #9aa89f;
--border: #2a322e;
--accent: #5a9e96;
--accent-hover: #6bafa6;
--accent-wash: #243532;
--moss: #8aad84;
--rose: #c98a8a;
--rose-wash: #3a2828;
--faint: #6b7872;
```

Use soft radius (8–12px), hairline borders, accent-wash for selected/highlight states. Rose for “missed / starved / alarm used” warnings only — sparingly. Moss/accent for success and hits.

### What the app tracks (from Day 1 = 2026-08-22)

**Five categories:**

1. **Body** — Gym (1–5, did he hit the gym?), Diet/cut (1–5; ~1000 kcal deficit, 130–150g+ protein)
2. **Sleep** — Fixed schedule sleep 00:00, wake 08:00 natural (no alarm); score 1–5 gentle if ~30 min late
3. **Habits** — Night brush teeth yes/no (maps to 0 or 5); habit-building, treat seriously
4. **Work** — three equal lanes:
   - **Keep-alive** — internship/company work that keeps the job
   - **Leverage** — tools/systems (Atlas, Cadence) that multiply efficiency
   - **Future-defining** — jobs, interviews, resumes, startup bets (MOST important emotionally; highlight in UI even though math weight is equal)
5. **Academics** — usually N/A; show when active (exams/assignments)

**Day Score** = simple average of all scored metrics that day (equal weight). Academics omitted when N/A. Brush as 0 or 5.

**30-day body commit** starting 22 Aug 2026: daily gym + cut. Show progress through that window.

### Layout — mobile first (must feel great on phone)

**Top bar**
- Wordmark: “Cadence” in Newsreader (or subtle serif)
- Today’s date (e.g. Sat 22 Aug 2026)
- Day number in the challenge: “Day 1 / 30” for body commit
- Dark/light toggle
- Tiny private lock or “Personal” label — no account UI needed for mock

**Hero band (one composition, not a dashboard wall)**
- Large **Day Score** (e.g. 3.8 / 5) with soft accent ring or moss fill
- One short line under it: win of the day OR “Future-defining: starved” warning in rose if that lane is 0/empty
- Compact chips: Gym hit/miss · Brush · Alarm used? · Academics quiet/active

**Category strip (horizontal scroll on mobile, row on desktop)**
Five category pills/tiles with rollup score:
- Body (avg gym+diet)
- Sleep
- Habits
- Work (avg of 3 lanes) — Future-defining sub-indicator (dot or mini bar)
- Academics (or “—” if N/A)

**Detail sections (stack on mobile)**
1. **Body** — Gym score + hit boolean; Diet score; optional protein/calories if present; 7-day mini sparkline or 7 dots
2. **Sleep** — times asleep/woke, score, alarm flag
3. **Habits** — brush checkbox visual (done/not); 7-day hit rate
4. **Work** — three equal columns/rows: Keep-alive / Leverage / Future-defining each with score 1–5 and one-line note; Future-defining visually emphasized (accent wash background)
5. **Reflection** (read-only text from data) — Wins · Friction · Tomorrow’s one commit
6. **Week at a glance** — last 7 days as a simple strip of day scores; “X of last 7 logged”
7. **30-day body track** — gym hit rate, avg diet score, days elapsed since 2026-08-22

**Empty / before first log**
Friendly empty state for dates before data exists: “Day starts 22 Aug — dump tonight in Cursor.” No scary zeros everywhere.

**Date navigation**
- Prev / next day
- Jump to today
- Optional simple calendar strip from 22 Aug onward (date-wise archive)
- URL or state like `/day/2026-08-22`

### Interaction rules (important)
- **No score editors, no forms to change metrics** on the dashboard (read-only mock is fine; show disabled or omit inputs)
- Taps expand a day or category for notes only (read-only)
- Smooth, light motion: score count-up once, soft fade on day change, sticky top bar — 2–3 intentional motions max
- Large tap targets; comfortable dark-mode night use (he logs before sleep)

### Sample data to hardcode for the mock (so it looks alive)
Invent 3–5 days starting **2026-08-22** with plausible scores so charts aren’t empty. Mark Future-defining starved on one day to show the warning state. One day with Academics active.

### Tech output preference
Single responsive HTML page (or React) with the Atlas CSS variables, Plus Jakarta Sans + Newsreader from Google Fonts, works standalone. Clean component structure. Placeholder `data/days/YYYY-MM-DD.json` shape commented so a human can wire GitHub → Netlify later.

Suggested JSON shape per day:
```json
{
  "date": "2026-08-22",
  "dayScore": 3.7,
  "gym": { "hit": true, "score": 4, "cardio": false, "note": "" },
  "diet": { "score": 4, "protein_g": 140, "deficit_ok": true, "note": "" },
  "sleep": { "asleep_at": "00:10", "woke_at": "08:05", "alarm_used": false, "score": 4 },
  "night_brush": { "done": true },
  "work": {
    "keepalive": { "score": 3, "note": "" },
    "leverage": { "score": 4, "note": "Cadence system" },
    "future": { "score": 2, "note": "" }
  },
  "academics": { "active": false, "score": null },
  "reflection": {
    "wins": [],
    "friction": "",
    "tomorrow": ""
  }
}
```

### Do NOT
- Add login, settings sprawl, or data-entry forms
- Use Inter/Roboto as primary
- Purple/indigo AI aesthetic
- Dense admin tables
- Make Future-defining easy to miss
- Punitive red everywhere — keep rose warnings rare and calm

### Success criteria
Looks like a sibling of Atlas. Readable on an iPhone in bed. In one screen he sees: Did I train? Did I eat the cut? Did I sleep on schedule? Did I brush? Did Future-defining get a rep? What’s my Day Score?

## END PROMPT
