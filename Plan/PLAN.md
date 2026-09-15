# Cadence — Plan & Intent

Private life dashboard (**Cadence**). Voice dump to Cursor → AI structures data → commit to GitHub → Netlify shows it. No editing data on Netlify; Cursor/AI is the data-entry system.

**Status:** Frontend in `journal/` — `npm run dev` + Netlify-ready  
**Product name:** **Cadence** (user-facing; folder may remain `journal/` for git)  
**Start date:** **Saturday, 22 August 2026** (Day 1 of the system; first logged day)  
**App folder:** `journal/` (Vite + React; Netlify base directory)  
**Plan folder:** `Plan/` (this file, prompts, day JSON, resume paths)  
**Day data (GitHub / Netlify):** `journal/data/days/YYYY-MM-DD.json`  
**Day data (local Plan mirror):** `Plan/data/days/YYYY-MM-DD.json`  
**Agent rules:** `.cursor/rules/journaling-daily-update.mdc`  
**North star (money):** Current income is peanuts — ambition is to increase earnings a lot. Systems, body, sleep, and work categories exist to serve that fire without burning out the machine.  
**Privacy:** Personal only  
**Atlas:** Stays calendar + notes. Cadence is the daily scoreboard + life review. Do not merge in v1.  
**Theme:** Match Atlas visual language (sage/teal paper UI — see `Plan/prompts/google-ai-studio-dashboard.md`).

---

## What this is (and isn't)

| This is | This is not |
|---------|-------------|
| Trainer scoreboard + light reflection + founder board | A public product |
| Fed by daily voice dumps in Cursor | A form you fill on Netlify |
| GitHub as source of truth; Netlify as mirror | Manual data entry on the website |
| Metrics that compound into money/future | Guilt spreadsheet with 20 fake-precision scores |
| Start with clear categories; ship dashboard in slices | Perfect system before day 1 |

---

## Ambition (context for all metrics)

Aman is ambition-hungry. Internships keep the present alive; **leverage work** and **career/startup moves** determine how much money the future pays. Body, sleep, and small habits exist so the machine can run hard for years — not as the whole identity.

**30-day body commit** stays real (cut + gym). Other metrics run in parallel at lightweight fidelity.

---

## Categories (locked for now)

Five categories on the dashboard. Metrics live inside them.

| # | Category | What’s inside | Daily scores |
|---|----------|---------------|--------------|
| 1 | **Body** | Gym, Diet/cut | Gym 1–5, Diet 1–5 |
| 2 | **Sleep** | Fixed 12→8 schedule, no alarm | Sleep 1–5 |
| 3 | **Habits** | Night brush (more habits later) | Brush yes/no → 0 or 5 (or 0/1) |
| 4 | **Work** | Keep-alive, Leverage, Future-defining | Three scores 1–5 (one per lane) |
| 5 | **Academics** | Assignments / exams when active | 1–5 or N/A most days |

**Not categories yet (add later):** relationships, money/monthly board, integrity, focus quality, etc.

### Metric map (same thing, flat)

| Category | Metric | Daily shape |
|----------|--------|-------------|
| Body | Gym | hit + score 1–5 |
| Body | Diet / cut | score 1–5 (+ optional numbers) |
| Sleep | Schedule adherence | score 1–5 (gentle) |
| Habits | Night brush | yes/no |
| Work | Keep-alive | score 1–5 |
| Work | Leverage | score 1–5 |
| Work | Future-defining | score 1–5 |
| Academics | Schoolwork | 1–5 or N/A |

---

## Weighting (decision)

**Default for now: equal weight inside a simple Day Score — with two rules.**

### Rule A — Equal among *scored* metrics that apply today

All 1–5 metrics that exist that day count the same toward a **Day Score** (simple average).

Example active set most days:

- Gym, Diet, Sleep, Keep-alive, Leverage, Future-defining  
- Brush as 0 or 5 (so it sits on the same scale)  
- Academics **excluded** when N/A (does not drag the average)

So: **equal weightage, yes** — for whatever was actually scored that day.

### Rule B — Attention ≠ weight (founder view)

Equal math does **not** mean equal importance in life.

- **Future-defining** is still the ambition north star — dashboard should **highlight** it (badge, weekly “starved?” flag), even if its weight in the average is equal.  
- **Academics** is equal *when active*, invisible when N/A.  
- Later we can add weights (e.g. Future-defining 2×) once the habit is stable. **Not now** — unequal weights feed perfectionism and endless tuning.

### Category rollups (for the UI)

| Category score | How |
|----------------|-----|
| Body | average of Gym + Diet |
| Sleep | Sleep score |
| Habits | Brush (and later habit average) |
| Work | average of Keep-alive + Leverage + Future-defining |
| Academics | score or N/A |
| **Day Score** | average of all scored metrics that day (equal weight) |

---


## Body (30-day focus)

### Goal

- **Cut** — serious; ~**1000 kcal** deficit daily  
- **Protein** — **~130–150 g+** / day  
- **Gym daily** — show up; protect/build muscle while cutting  

### Gym

**Core:** Did I hit the gym? Weights/sets **not** tracked in v1.

| Score | Meaning |
|-------|---------|
| 1 | Missed |
| 2 | Went but barely |
| 3 | Solid session |
| 4 | Strong session |
| 5 | Gym + cardio (or full bar Aman sets) |

Fields: `gym.hit`, `gym.score`, `gym.cardio?`, `gym.note?`

### Diet

| Score | Meaning |
|-------|---------|
| 1 | Blew the plan |
| 2 | Clear misses |
| 3 | Mostly OK |
| 4 | Deficit + protein hit |
| 5 | Clean day (~1000 deficit, 130–150g+ protein) |

Fields: `diet.score`, optional calories/protein, flags, note

---

## Sleep (fixed schedule)

**Target schedule (locked intent):**

| | Time |
|--|------|
| Sleep | **12:00 midnight** |
| Wake | **08:00** (natural wake — **no alarm**) |

Rationale: balanced night work window + morning window.

### How we score (gentle — do not over-punish)

Perfectionism killer: small delays should **nudge** the score down, not nuke the day.

**Working rubric (sleep adherence 1–5):**

| Score | Rough meaning |
|-------|----------------|
| 5 | Asleep ~12, woke ~8 naturally, no alarm |
| 4 | Within ~30 min on sleep and/or wake; still natural wake |
| 3 | Off by more than ~30–60 min, or needed an alarm once |
| 2 | Significantly off schedule / alarm-dependent / short night |
| 1 | Night blew up (all-nighter energy, chaos, no real schedule) |

**Also store (when known from voice dump):**

- `sleep.asleep_at`  
- `sleep.woke_at`  
- `sleep.alarm_used` — boolean (target: always false)  
- `sleep.score` — 1–5  
- `sleep.note?`

**Primary questions in the dump:** Did I fall asleep near 12? Did I wake near 8 without an alarm?

---

## Night routine — brush teeth

Small action, **big habit** for Aman (not automatic yet). Track it seriously without overcomplicating.

| Field | Shape |
|-------|--------|
| `night_brush.done` | **yes / no** (boolean) |
| `night_brush.note?` | optional |

Optional soft score later; v1 = binary is enough. Dashboard can show **hit rate over 7/30 days** — that is the motivator.

---

## Work (three types) — naming

These are the engine. Money ambition lives here.

### 1. Keep-alive work  
**Name: Keep-alive** (alt labels: Maintenance / Day-job fuel)

Work that **keeps the present intact** — internship/company obligations so you don’t get fired and reputation stays clean.

Examples: assigned tickets, standup, shipping what ILSS / RA Foundation need, comms, deadlines that sustain the role.

### 2. Leverage work  
**Name: Leverage** (alt: Systems / Force-multiplier)

Work that **improves efficiency and capacity** — investing in the machine so every future hour pays more.

Examples: Cadence, Atlas improvements, automations, templates, personal infra, learning that multiplies output.

### 3. Future-defining work  
**Name: Future-defining** (alt: Upside / Asymmetric bets)

Work that **directly changes the money/future trajectory**.

Examples: startup/product bets, job applications, resumes, outreach, networking, interviews, portfolio moves that raise earning power.

**Design note (Aman’s framing):** Interviews, applications, resumes, and startup-building sit in the **same bucket** — both are direct bets on “how much more money will I make?”

### How we measure work daily (draft)

Not only a vague 1–5 for “work.” Prefer **per lane**:

| Lane | Daily fields (suggested) |
|------|---------------------------|
| Keep-alive | `work.keepalive.score` 1–5 **or** minutes + one line what mattered |
| Leverage | `work.leverage.score` 1–5 **or** minutes + one line |
| Future-defining | `work.future.score` 1–5 **or** minutes + one line |

**Scoring vibe (1–5 per lane):** honest “did this lane get real attention?” — not hours-as-virtue. A 30-minute interview can be a 5 on Future-defining; eight hours of busywork can be a 2 on Keep-alive if nothing real moved.

**Weekly founder lens (not every night):** Which lane starved? Future-defining must not be zero for a full week unless Keep-alive was on fire for a real reason.

---

## Academics

Separate section. **Usually light.**

- Not a daily grind metric most of the year  
- Spikes: **exam season**, occasional **assignments**  
- Fields when relevant: `academics.active` (bool), `academics.score` 1–5 or note, else skip / N/A  

Dashboard: show academics row only when `active`, or always show as grey “quiet” outside exam mode.

---

## How data gets in (product loop)

```
Fixed time (post-gym and/or pre-sleep)
    → Cursor voice dump (messy OK)
    → AI extracts all metrics + short structured entry
    → Commit / PR to private GitHub
    → Netlify rebuilds responsive dashboard
```

**Rules:**

1. No editing Cadence data on Netlify  
2. Cursor/AI = data entry  
3. GitHub = source of truth  
4. Netlify = read-only mirror  

---

## Daily ritual (draft)

**Voice dump should eventually cover (order flexible):**

1. Gym + diet  
2. Sleep (times, alarm?) + night brush  
3. Keep-alive / Leverage / Future-defining — what moved  
4. Academics only if something happened  
5. Optional: one friction, one win, tomorrow’s one commit  

**Minimum viable dump (anti-perfectionism):**  
Gym yes/no + diet honesty + sleep rough times + brush yes/no + one sentence on Future-defining (even “zero today”).

---

## Netlify dashboard (intended — grow in slices)

**Slice A — Body + sleep + brush**  
Today + 7-day + 30-day gym/diet; sleep adherence; brush hit rate  

**Slice B — Work lanes**  
Three work scores/time; weekly “Future-defining starved?” flag  

**Slice C — Academics**  
Quiet by default; loud in exam mode  

Streak framing: **“X of last 7”**, not fragile never-break chains.

---

## Build / scope discipline

| Now (document + design) | After loop exists |
|-------------------------|-------------------|
| Lock names + rubrics | Fancy charts, Atlas hooks |
| Ship data shape + ugly dashboard | Perfect calorie UX |
| Voice → files → Netlify | Extra metrics (social, mood stacks, etc.) |

---

## Open decisions

- [x] Categories locked (Body, Sleep, Habits, Work, Academics)  
- [x] Weighting: equal for now; Future-defining highlighted, not heavier in math  
- [x] Start date: **2026-08-22**  
- [x] Date-wise data: `Plan/data/days/YYYY-MM-DD.json`  
- [x] AI Studio UI prompt: `Plan/prompts/google-ai-studio-dashboard.md` (Atlas theme)  
- [x] Root layout: only `journal/` + `Plan/`  
- [ ] Maintenance calories (for concrete deficit logging)  
- [ ] Primary dump anchor: post-gym vs pre-sleep  
- [ ] Work lanes: score-only vs minutes+score  
- [ ] Repo = this `Cadence` folder on private GitHub?  
- [ ] Soften/tighten sleep rubric after 3–5 real days  

---

## One-line north star

**Talk once a day; see body, sleep, habits, and the three work lanes on Cadence — especially whether Future-defining got a rep — without typing into Netlify.**
