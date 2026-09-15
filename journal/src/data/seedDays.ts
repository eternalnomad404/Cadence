import type { DayLog } from '../types';

/** Demo / placeholder logs until real voice dumps fill Plan/data/days/*.json */
export const SEED_DAYS_DATA: Record<string, DayLog> = {
  '2026-08-22': {
    date: '2026-08-22',
    dayScore: 3.9,
    gym: {
      hit: true,
      score: 4,
      cardio: false,
      workoutType: 'Chest & Triceps Hypertrophy',
      note: 'Incline DB press 36kg x 8, solid pump, no elbow discomfort.',
    },
    diet: {
      score: 4,
      protein_g: 146,
      calories: 1950,
      deficit_ok: true,
      note: 'Target ~1000 kcal deficit achieved. 3 eggs + whey + chicken breast.',
    },
    sleep: {
      asleep_at: '00:05',
      woke_at: '08:00',
      alarm_used: false,
      score: 4,
      note: 'Fell asleep smoothly. Natural wake right around 8 AM.',
    },
    night_brush: {
      done: true,
      note: 'Standard night routine completed before bed.',
    },
    work: {
      keepalive: {
        score: 4,
        note: 'Completed sprint review items & synced pull requests for the week.',
      },
      leverage: {
        score: 4,
        note: 'Designed Atlas v2 sync schema and initiated Cadence scoreboard repo.',
      },
      future: {
        score: 3,
        note: 'Applied to 2 founder-fellowship opportunities and updated tech stack resume bullet.',
      },
    },
    academics: {
      active: false,
      score: null,
      note: 'No assignments or exams this weekend.',
    },
    reflection: {
      wins: [
        'Day 1 of 30-day body commit locked in — no negotiations on gym or protein.',
        'Zero alarm needed; woke up refreshed.',
        'Wired up initial Atlas leverage tool concepts.',
      ],
      friction: 'Got distracted reading Twitter for 25 minutes after lunch.',
      tomorrow: 'Legs session at 11am; send 2 direct outreach emails for future bets.',
      voiceDumpSnippet: 'Voice dump 22 Aug (23:45): Strong day 1. Gym was locked in, hit 146g protein cleanly. Sleep schedule worked without alarm. Keepalive is fine, leverage strong. Tomorrow got legs and need to put dedicated focus into future-defining bets.',
    },
  },
  '2026-08-23': {
    date: '2026-08-23',
    dayScore: 3.4,
    gym: {
      hit: true,
      score: 4,
      cardio: true,
      workoutType: 'Pull + 15 min Zone 2 Incline Walk',
      note: 'Weighted pullups +20kg x 6. 15 min treadmill steady state.',
    },
    diet: {
      score: 4,
      protein_g: 138,
      calories: 1980,
      deficit_ok: true,
      note: 'Clean cut. Greek yogurt + chicken stir fry.',
    },
    sleep: {
      asleep_at: '00:35',
      woke_at: '08:18',
      alarm_used: false,
      score: 4,
      note: 'Stayed up 30m late debugging an urgent deployment issue. Woke up naturally at 8:18.',
    },
    night_brush: {
      done: true,
      note: 'Done before bedtime.',
    },
    work: {
      keepalive: {
        score: 5,
        note: 'Saved production outage at internship — fixed async memory leak in worker queues.',
      },
      leverage: {
        score: 3,
        note: 'Refined prompt chains for automated voice dump parser.',
      },
      future: {
        score: 0,
        note: 'Starved! Zero reps on personal bets or interviews due to job fire.',
      },
    },
    academics: {
      active: false,
      score: null,
      note: 'Quiet.',
    },
    reflection: {
      wins: [
        'Body commit Day 2 holds strong — 2/2 on gym and deficit cut.',
        'Clutched internship production fix without panicking.',
      ],
      friction: 'Future-defining was completely starved. Let the urgent crowd out the essential.',
      tomorrow: 'Schedule 90-minute morning lockdown block exclusively for Future-defining bets before opening Slack.',
      voiceDumpSnippet: 'Voice dump 23 Aug (23:55): Gym and diet were great, but work was all keepalive firefighting. Future-defining got zero reps. It feels bad to look at a 0 there. Tomorrow morning must protect 90 mins for bets.',
    },
  },
  '2026-08-24': {
    date: '2026-08-24',
    dayScore: 4.1,
    gym: {
      hit: true,
      score: 5,
      cardio: false,
      workoutType: 'Legs & Core Heavy',
      note: 'Barbell squats 130kg 3x5 deep. Bulgarian split squats. Brutal but finished every rep.',
    },
    diet: {
      score: 4,
      protein_g: 148,
      calories: 2020,
      deficit_ok: true,
      note: 'Carbs timed around leg workout. High satiety, 148g protein.',
    },
    sleep: {
      asleep_at: '00:10',
      woke_at: '08:00',
      alarm_used: false,
      score: 4,
      note: 'Woke at 8:00 on the dot without alarm. Deep sleep recorded.',
    },
    night_brush: {
      done: true,
      note: 'Done.',
    },
    work: {
      keepalive: {
        score: 4,
        note: 'Handled routine tickets and code review turnaround time < 1hr.',
      },
      leverage: {
        score: 4,
        note: 'Automated Atlas test harness for voice transcript embeddings.',
      },
      future: {
        score: 4,
        note: 'Protected 90m block: completed system design interview mock + followed up on 3 seed founder intros.',
      },
    },
    academics: {
      active: true,
      score: 4,
      note: 'Distributed Systems lab assignment submitted 2 days ahead of deadline.',
    },
    reflection: {
      wins: [
        'Massive rebound on Future-defining — did not let yesterday’s slip become a habit.',
        'Leg day crushed; 3/3 on body commit.',
        'Academics assignment cleared out early to free headspace.',
      ],
      friction: 'Slight energy dip around 4 PM after heavy squat session.',
      tomorrow: 'Upper push + cardio; deep work on Atlas engine and 1 startup prototype.',
      voiceDumpSnippet: 'Voice dump 24 Aug (23:50): Rebounded super hard today. Protected the future-defining block first thing in the morning and knocked out mock interview prep. Legs session was heavy. 3 days into the 30-day commit.',
    },
  },
  '2026-08-25': {
    date: '2026-08-25',
    dayScore: 4.6,
    gym: {
      hit: true,
      score: 5,
      cardio: true,
      workoutType: 'Upper Push & Pull Volume + 20 min Incline Run',
      note: 'DB Incline Bench 38kg x 8, Weighted Dips +25kg x 8, Meadows Rows 4x10. Felt strong.',
    },
    diet: {
      score: 5,
      protein_g: 154,
      calories: 1940,
      deficit_ok: true,
      note: 'Hit 154g protein, ~1050 kcal deficit. Zero cravings, dialed in.',
    },
    sleep: {
      asleep_at: '23:55',
      woke_at: '07:55',
      alarm_used: false,
      score: 5,
      note: '8 hours uninterrupted rest. Out cold before midnight, natural rise at 7:55 AM.',
    },
    night_brush: {
      done: true,
      note: 'Habit locked in.',
    },
    work: {
      keepalive: {
        score: 4,
        note: 'Clean architecture delivery on internship backend endpoint.',
      },
      leverage: {
        score: 5,
        note: 'Shipped complete Cadence scoreboard UI mirror with exact Atlas design tokens.',
      },
      future: {
        score: 4,
        note: 'Confirmed 2 upcoming founder interviews; refined pitch deck v1 narrative.',
      },
    },
    academics: {
      active: false,
      score: null,
      note: 'Quiet.',
    },
    reflection: {
      wins: [
        'Peak scoreboard day (4.6) — smooth flow across body, sleep, leverage, and future.',
        '4/4 on 30-day body commit.',
        'Zero alarm natural wake rhythm is compounding into calm focus.',
      ],
      friction: 'None of note today. Kept calm and stayed on the tracks.',
      tomorrow: 'Keep the streak rolling; active recovery cardio + startup MVP validation.',
      voiceDumpSnippet: 'Voice dump 25 Aug (23:40): Cleanest day yet. Woke up before 8 AM naturally, trained hard, hit 154g protein without hassle. Built out the Cadence mirror UI. Ready for tomorrow.',
    },
  },
};