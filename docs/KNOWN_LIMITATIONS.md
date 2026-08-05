# Known Limitations

Everything below is deliberate milestone scoping, labelled honestly in the UI.
Nothing pretends to work.

## Mocked by design (runs without credentials)

- **Auth is device-local.** No passwords, no server sessions; the UI says so
  on both auth pages. Route guarding is client-side (`RequireAuth`); real
  session validation arrives with hosted auth.
- **Speech recognition is browser-native** (Web Speech API): Chromium-based
  browsers only, and accuracy varies. Because debates are audio-only, other
  browsers see the microphone-unavailable state rather than a text fallback.
  A hosted STT provider replaces this behind `SpeechToTextProvider`.
- **Bot voices use the device's built-in speech synthesis**, shaped by broad
  pitch/rate/language parameters. They are deliberately *not* identity
  imitations of the real people (docs/SAFETY_AND_LEGAL.md); a licensed TTS
  provider slots in behind `TextToSpeechProvider`.
- **Video mode is flagged off.** The mode selector, recording indicator and
  data model support it; WebRTC/camera capture is hosted-phase work.
- **Lessons are gated to coming-soon** by product decision — interactive or
  nothing. Seed lesson content remains in `src/data/lessons.json` for the
  rebuild.
- **Bot speeches are template-composed**, not model-generated. They are
  profile-flavoured (persona scalars, sayings, difficulty scaling, quoting the
  user's actual claims) but rhetorically repetitive across many rounds. The
  provider interface is the real contract; rooms show a "Mock AI mode" badge.
- **The judge is a transparent heuristic** over text features. It rewards
  structure/mechanisms/weighing and cannot assess truth or deep logic. Every
  result is labelled an AI-generated educational assessment.
- **Upload analysis simulates processing** and produces a clearly-labelled
  deterministic sample report; files never leave the device and are not read.
- **Watch replays are simulated exhibitions** generated from the mock runtime
  and labelled as such. Live/upcoming/following are honest empty states.
- **Friend debates** generate a real lobby link but cannot connect a second
  device without the realtime backend — stated in the lobby UI.

## Missing vs the full spec (tracked for later phases)

- Audio/video modes, MediaRecorder shell, TTS, avatar lip-sync (flags off)
- Postgres/Supabase persistence + migrations (schema designed in
  DATA_MODEL.md; localStorage implements the contract meanwhile)
- Friends graph (requests/blocking), notifications
- Admin editing, versioning/rollback, moderation queues (read-only admin
  preview exists at `/admin`)
- Analytics event abstraction (§36) — not yet wired
- Favourites UI for bots (store field exists; directory control not built)
- Playwright E2E suite (unit suite + manual walkthrough only, see TEST_PLAN)
- Error boundaries and observability hooks
- Formal accessibility audit (basics implemented: focus-visible, aria-live
  timer announcements, ARIA on progress/tabs/dialogs, reduced-motion,
  keyboard-operable controls; no axe pass yet)

## Product caveats

- Guest lesson progress "migrates" trivially because guest and account share
  the device store; real migration logic is needed once auth is hosted.
- OVR calibration (amateurs ~30, pros ~60) is untested against real users;
  the EMA parameters live in one file (`src/lib/rating.ts`) for tuning.
- The Blitz timing discrepancy between source documents is resolved per
  REQUIREMENTS_AUDIT.md §1; durations are seed config, editable without code.
- `/terms` and `/privacy` are drafts and say so; per-jurisdiction legal review
  is mandatory before commercial release of public-figure bots.
