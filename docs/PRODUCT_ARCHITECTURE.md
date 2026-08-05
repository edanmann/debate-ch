# Product Architecture

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict ·
Tailwind CSS 4 · Zod 4 · Vitest 4. No runtime credentials required.

## Layers

```
Routes (src/app)          UI + data plumbing only
  │
Components (src/components)  Chrome, cards, stats, avatars, primitives
  │
Domain (src/lib)          Pure logic: timer-engine, rating, judge,
  │                       bot-runtime, motions, formats, schemas
  │
Providers (src/lib/providers.ts)  DebateBotProvider / DebateJudgeProvider /
  │                       SpeechToText / TextToSpeech / Moderation interfaces
  │                       with mock implementations
  │
Persistence               Demo: typed localStorage store (src/lib/store.ts)
                          Target: Postgres schema (docs/DATA_MODEL.md)
```

## Server/client split

- **Server-only** (`import "server-only"`): `lib/bots.ts` (validated roster,
  internal config stays out of the client bundle), `lib/replays.ts`.
- **API routes**: `/api/debate/respond` (bot turn), `/api/debate/judge`
  (judgement) — Zod-validated bodies; both run the mock providers server-side
  so real providers can swap in without touching clients.
- **Client**: the store (localStorage + `useSyncExternalStore`), debate room,
  dashboards. Server components pass trimmed `BotCardData` to client widgets.

## Navigation chrome

One adaptive `<Chrome>`: marketing header + footer for guests; persistent
desktop rail (9 destinations + history/settings) and 5-item mobile bottom nav
with a "More" sheet when signed in. `/debate/room/*` renders chrome-free.

## Debate-room state model

The persisted `DebateRecord` is the single source of truth — including the
clock (`phaseIndex`, `phaseRemainingSec`, saved every tick). The UI **derives**
its stage each render:

```
!hydrated → loading            status complete → redirect to results
!record   → not-found          status abandoned → abandoned screen
phase.kind prep → prep         phase.speaker === userSide → user-turn
bot phase: transcript has this phase's bot entry ? bot-review : bot-thinking
phaseIndex past end → finishing (judge) / judge-failed (retry)
```

Refresh/screen-lock therefore resumes exactly, with no duplicated state
machine to drift. The pure engine (`tickEngine`, `endPhaseEarly`) emits
warning/transition events consumed by the interval callback.

## Ratings pipeline

judge scores → `applyJudgement` (EMA, learning rate 0.5/√(n+1) clamped
[0.08, 0.5], × confidence × format weight, per-round delta cap) →
`RatingChangeSummary` with a per-skill natural-language explanation →
store history → surfaced on results, dashboard and stats pages.
Anti-gaming: practice rounds, abandoned rounds and rounds under 40 spoken
words never rate.

## Feature flags

`src/lib/flags.ts`, overridable via `NEXT_PUBLIC_FLAG_*`. Everything gated
(matchmaking, live video, planned bots, real providers…) has a coherent
off-state in the UI.
