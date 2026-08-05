# Debates.ch

**Debate anyone. Improve every round.**

A full-stack debate learning, practice and competition platform: distinctive AI
opponents, a phase-timed debate room, an explaining AI judge, six-skill
progression, lessons, puzzles, replays and upload analysis.

This repository is the first complete milestone: the entire core loop —
landing → sign-up → onboarding → dashboard → bot directory → bot profile →
setup → live debate → judgement → rating change — runs end-to-end in **mock
provider mode with zero credentials**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

No environment variables are required. `.env.example` documents feature flags
and the provider keys used when real AI providers are enabled.

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Development server (Turbopack)        |
| `npm run build`     | Production build                      |
| `npm start`         | Serve the production build            |
| `npm test`          | Vitest unit suite (timer, rating, judge, seed data) |
| `npm run lint`      | ESLint (strict React hooks rules)     |
| `npm run typecheck` | TypeScript `--noEmit`                 |

## How it fits together

```
src/
├── app/                  # Next.js App Router routes (public, authed, api)
│   ├── api/debate/       # Mock bot-runtime + judge endpoints (server-side)
│   └── …                 # ~30 routes; see docs/PRODUCT_ARCHITECTURE.md
├── components/           # Chrome (nav), cards, stats, avatars, primitives
├── data/                 # Seed data: 48 bot profiles (from the Bot Design
│                         #   Bible), 32 motions, 12 lessons, 20 puzzles
└── lib/                  # Domain logic: timer engine, rating system, judge,
                          #   bot runtime, providers, schemas, local store
```

Key properties:

- **Bot roster is generated, not retyped.** `src/data/bots.public.json` was
  parsed from the Bot Design Bible and is Zod-validated at load and in tests
  (45 active, 2 planned behind a flag, 1 excluded and never rendered).
- **Formats are configuration**, not UI logic (`src/lib/formats.ts`), driving a
  pure, unit-tested phase timer engine.
- **Provider-neutral AI layer** (`src/lib/providers.ts`): the mock bot runtime
  and mock judge implement the same interfaces a model-backed provider will.
- **Local-first demo persistence**: profile, ratings, debates and progress live
  in `localStorage`; a refresh resumes a live debate mid-phase. The target
  relational schema is documented in `docs/DATA_MODEL.md`.

## Documentation

| Doc | Contents |
| --- | --- |
| `docs/REQUIREMENTS_AUDIT.md` | Source-document conflicts and chosen interpretations |
| `docs/IMPLEMENTATION_PLAN.md` | Phase plan with current status |
| `docs/PRODUCT_ARCHITECTURE.md` | Routes, layers, state, data flow |
| `docs/DESIGN_SYSTEM.md` | Tokens, type scale, components, responsive rules |
| `docs/AI_ARCHITECTURE.md` | Provider interfaces, mock runtime, judge rubric |
| `docs/DATA_MODEL.md` | Demo store shape + target relational schema |
| `docs/SAFETY_AND_LEGAL.md` | Simulation policy, moderation, privacy |
| `docs/TEST_PLAN.md` | What is tested now and what comes next |
| `docs/KNOWN_LIMITATIONS.md` | Honest list of what is mocked or missing |

## Safety posture (short version)

Public-figure bots are stylised AI simulations — labelled on every card,
profile and disclaimer; represented by original geometric emblems, never
likenesses; bound by no-fabrication rules at every difficulty. The excluded
roster concept ships as data but is never rendered. The judge labels every
result an AI-generated educational assessment.
