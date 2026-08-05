# Implementation Plan

Vertical-slice order per master prompt §38. Status reflects this repository.

## Phase 1 — Foundation ✅ DONE

- Requirements audit (docs/REQUIREMENTS_AUDIT.md)
- Design tokens + Tailwind mapping (globals.css, docs/DESIGN_SYSTEM.md)
- App shell: adaptive chrome (guest header/footer ↔ app rail + bottom nav)
- Routing (~30 routes), auth guard, feature flags
- Bot Bible ingestion → validated seed JSON (48 profiles, public/internal split)
- Motion library (32), lessons (12), puzzles (20), formats config

## Phase 2 — Core product ✅ DONE

- Landing page: all 8 source sections, original composition
- Mock auth (device-local, honestly labelled) + 7-step onboarding + placement
- Dashboard: 5 primary actions, practice cards, recent activity, tiered player card
- Bot directory: search / category / tier / sort, recently-debated, 45 cards
- Bot profile: stats radar+bars, personality, style, stage/conditional
  behaviour, topics, sayings, weaknesses, defeat guide, scaling, examples,
  disclaimers, challenge/coach CTAs
- Debate setup with confirmation card; app-assigned motion and side
- Text debate room: pure timer engine, phase progression, warnings (30/10/3),
  prep scratchpad, transcript, refresh-resume, abandon flow, error states
- Mock bot runtime (server API) with per-profile flavour + difficulty scaling
- Mock judge (server API): six-dimension rubric scores with reasons,
  confidence, key moments, next steps
- Results page + EMA rating updates with per-skill explanations and
  anti-gaming safeguards

## Phase 3 — Learning ✅ DONE

- Lessons: 12 seeded, guest 3-lesson limit with local progress and
  sign-up gate; completion tracking; next-lesson chaining
- Puzzles: 20 across all 10 spec'd types; daily rotation; streak + accuracy;
  post-answer explanations for every option
- Judge → recommended lesson/puzzle wiring

## Phase 4 — Media and analysis ✅ PARTIAL (by design)

- Upload flow: drag-drop, type/size validation, consent, speakers, language ✅
- Mock analysis pipeline: 9 visible stages → clearly-labelled sample report ✅
- Watch: replays tab seeded with 8 deterministic simulated exhibitions
  (generated from the mock runtime, labelled simulated); honest empty states
  for live/upcoming/following ✅
- Audio recording (MediaRecorder), real transcription, WebRTC: ⏳ hosted phase

## Phase 5 — Social and administration ⏳ NEXT

- Done now: matchmaking waitlist with consent, friend invite-link lobby
  (honestly marked awaiting realtime backend), friends page with privacy
  defaults, read-only admin preview (roster, motions, formats, flags)
- Next: real auth (Supabase), Postgres + migrations per DATA_MODEL.md,
  friend requests/blocking, report/moderation queues, editable admin with
  versioning, analytics event abstraction (§36)

## Phase 6 — Hardening ⏳ ONGOING

- Done now: unit tests (30) green; lint (strict hooks) clean; tsc clean;
  production build green; reduced-motion support; focus-visible styles;
  aria-live timer announcements; error/empty states across routes
- Next: Playwright E2E for the eight spec'd journeys, axe audit pass,
  skeleton coverage on remaining routes, error boundaries, observability hooks

## Definition-of-done checklist (§41)

Every item either ✅ or explicitly listed in KNOWN_LIMITATIONS.md with its
honest state — no fake success states anywhere in the product.
