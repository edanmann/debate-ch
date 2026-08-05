# Test Plan

## Implemented (npm test — 30 tests, green)

**timer-engine.test.ts**
- init/countdown/phase-transition/finish semantics
- warnings fire exactly at 30/10/3 s; 30 s warning suppressed on short phases
- end-phase-early; monotonic overall progress
- format totals match advertised approximations (Bullet 120 s … Marathon 3420 s)

**rating.test.ts**
- every skill starts at 10 OVR with 0 samples
- EMA moves toward judged score; per-round delta capped; samples increment
- zero confidence → zero movement; learning rate decays with samples
- 1–100 clamping under repeated worst-case rounds
- card tiers at exact spec thresholds; reliability labels by sample count

**bot-data.test.ts**
- roster is exactly 48; 45 active / 2 planned (Mamdani, Macron) / 1 excluded
  (Kim Jong-un)
- every active bot: six stats, disclaimer, scaling, ≥3 traits, ≥3 sayings,
  example responses
- spot-checked Bible ratings (Raj 38, The Strategist 94, Mehdi Hasan 93,
  Elon Musk 83)
- motion library: ≥30 approved, ≥10 categories, both starter contexts present

**judge.test.ts**
- six scores per side within bounds, reasons present, confidence ≤ 0.9
- structured speech outscores empty speech (argumentation + rebuttal)
- deterministic per debate; winner consistent with margin
- lesson/puzzle recommendations produced; bot difficulty ordering
  (legendary > easy)

Also run in CI order: `npm run lint` (strict React hooks rules), 
`npm run typecheck`, `npm run build` — all green.

## Next: integration & E2E (Playwright)

The eight spec'd journeys (§40):
1. Guest lands and starts a lesson
2. Guest completes three lessons and hits the sign-up gate
3. User challenges Raj
4. User completes a mock Rapid debate through all phases
5. User receives results and a rating change
6. User opens a detailed stat explanation
7. User joins the matchmaking waitlist (consent recorded)
8. User uploads a demo file and watches the mocked analysis lifecycle

Plus: refresh-resume mid-phase, abandon flow never rates, bot-unavailable
retry path, judge-failure retry path, mobile viewport smoke.

## Manual verification performed

Full core loop walked in the browser (landing → signup → onboarding →
dashboard → directory → profile → setup → live Bullet round with real timer →
judgement → results → rating change on dashboard), plus directory filters and
puzzle/lesson flows. Screenshots in the session record.
