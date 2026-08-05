# Safety and Legal

Safety is architecture here, not footer decoration. What is enforced now, in
code, versus what the hosted phase adds.

## Public-figure simulation policy (enforced now)

- Every bot whose category is not Fictional Progression/Custom is flagged
  `isRealPersonSimulation` in one place (`src/lib/bots.ts`) and renders an
  **"AI simulation"** badge on cards, an explicit banner + the Bible's full
  disclaimer on profiles, a setup-screen badge, and a footer disclaimer link
  (`/safety#simulations`).
- **No likenesses**: bot art is original geometric emblems by policy; no
  photorealistic depictions, no voice cloning, no copied catchphrases.
- **Excluded concepts never render**: `getBotBySlug`/`getVisibleBots` filter
  status `excluded` (Kim Jong-un); asserted in tests. Planned bots require an
  explicit feature flag.
- Bible internal safety rules (never fabricate sources/quotes/private facts,
  never claim to be the person, aggression at arguments not users…) ship in a
  **server-only** seed file and bind any future real-model prompts.
- Commercial release still requires per-jurisdiction legal review — flagged in
  `/terms` and here; nothing in this repo constitutes that review.

## Honest AI (enforced now)

- Mock runtime: difficulty scales skill, never dishonesty; no invented
  statistics at any level; uncertainty phrased as uncertainty.
- Judge: every result carries "AI-generated educational assessment" wording;
  confidence is displayed; reasoning is itemised per skill.
- All mocked capabilities are labelled in-place (Mock AI mode, mock pipeline,
  simulated exhibitions in Watch). No fake live viewers or audience counts.

## Moderation (interface now, enforcement hosted)

`ModerationProvider` wraps user input and bot output; the mock implementation
does keyword screening and returns argue-the-argument guidance. Debate room
and results ship report controls (logged locally in demo, routed to moderator
queues when hosted). Hosted phase adds: rate limits, abuse detection,
block flows, minors protections, and human review queues.

## Motion safety (enforced now)

The library carries sensitivity/age/factual-dependence/research flags.
Sensitive motions are excluded from random rated draws. The library contains
no motions requiring endorsement of hatred, targeting private individuals, or
instructing wrongdoing. High-stakes topics get a research-bundle mechanism
(`motion_contexts`) before current-affairs motions go live.

## Political content

Bots present opposing arguments on their assigned side of approved motions.
No user profiling by sensitive traits exists anywhere in the data model, and
the analytics plan (§36) explicitly excludes transcript content and personal
data from events.

## Privacy (demo = maximal)

Demo mode stores everything on-device only; Settings offers full JSON export
and hard delete. Hosted commitments, already written into `/privacy` and the
schema: recordings never used for training without explicit opt-in, visible
recording indicator, retention fields on all media, per-item deletion,
consent stored with the waitlist email and deletable on request.
