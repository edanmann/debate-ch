# Requirements Audit

Source priority (per the master prompt): **master prompt → Bot Design Bible →
Debate App specification → engineering judgement.** This file records every
conflict or ambiguity found and the interpretation implemented. Ambiguous
values are configuration, not hard-code.

## 1. Blitz timing arithmetic (conflict)

- **App spec PDF:** Blitz = prep 2 min + opening 1 min each + closing 90 s
  each, "Total: 4.5 minutes". The stated parts sum to **7 minutes**, not 4.5.
- **Master prompt:** prep 60 s, opening 60 s each, closing 45 s each ≈ 4.5 min
  — internally consistent.
- **Decision:** master-prompt prototype defaults implemented for all five
  formats. All durations live in `src/lib/formats.ts` as seed configuration
  consumed by a generic phase engine; re-seeding requires no UI changes.
  Format totals are asserted in `timer-engine.test.ts`.

## 2. Format ranges vs fixed defaults

The PDF gives ranges ("Bullet: 1–3 mins", "Rapid: 8–10 up to 15"). Fixed
defaults from the master prompt were chosen so rated play is comparable;
variable durations remain possible for private friend debates (custom phase
durations are part of the friend-lobby design, hosted phase).

## 3. "#1 debate site" headline (conflict)

The PDF header copy claims "Debate Online on the #1 Site". The master prompt
forbids unsupported superlatives. **Decision:** credible default headline
("Debate anyone. Improve every round.") shipped; marketing copy is ordinary
page content, trivially replaceable when evidence exists.

## 4. Roster arithmetic

The Bible title page says "48 bot concepts". The roster table lists 45 Active,
2 Planned-Later (Zohran Mamdani, Emmanuel Macron), 1 Excluded (Kim Jong-un) —
which sums to 48. **Decision:** all 48 parsed and stored; active bots render;
planned bots sit behind `NEXT_PUBLIC_FLAG_PLANNED_BOTS`; the excluded concept
is data-only and code in `src/lib/bots.ts` guarantees it never renders. This is
asserted in `bot-data.test.ts`.

## 5. Landing copy differences

PDF section copy ("Debate with Bots", "unique personalities running in skill
and playstyle" [sic]) differs from the master prompt's recommended copy.
**Decision:** master-prompt copy used; PDF intent (8 sections, CTAs, guest
lesson rule, waitlist popup) fully preserved.

## 6. Starting rating and calibration

Both sources agree new users start at ~10 OVR. The PDF adds calibration
("good amateurs ~30, pros ~60") — treated as guidance for the rating engine's
pace (EMA with decaying learning rate, capped per-round movement), not a UI
requirement. Onboarding copy explicitly frames OVR as an in-app estimate, not
intelligence or worth.

## 7. Card aesthetics

The PDF asks for a card "like a FIFA card". The master prompt forbids FIFA
trade dress. **Decision:** original Debates.ch card in the app's own design
language; only the *spec'd mechanics* are kept: OVR on top, name centred,
nationality below, six stats, tier colours at the spec thresholds
(<50 dark, 50 dark bronze, 60 light bronze, 70 silver, 80 dark gold,
90 light gold — asserted in `rating.test.ts`).

## 8. Route-map duplication

The master prompt lists both public `/bots` and authed `/debate/bots` (and
`/debate/bots/[slug]`). One canonical directory (`/bots`, adaptive chrome for
guests vs signed-in users) serves both; the Debate hub links to it. A duplicate
authed alias added nothing but a second source of truth.

## 9. Repository context

The working repository contained an unrelated product (a party game). The
master prompt's "preserve the existing stack" clause therefore did not apply;
Debates.ch was scaffolded fresh (Next.js 16 App Router, TypeScript strict,
Tailwind 4, Zod 4, Vitest 4) in its own self-contained folder.

## 10. Backend in a credential-free milestone

The recommended stack includes PostgreSQL/Supabase. The master prompt equally
requires the complete product to run without paid keys and forbids misleading
imitations. **Decision:** milestone 1 is local-first: a typed `localStorage`
store implements the persistence contract; the relational schema is designed
(docs/DATA_MODEL.md) and every server touchpoint goes through provider
interfaces so the hosted backend slots in without UI rewrites. Everything
mocked is labelled in the UI ("Demo mode", "Mock AI mode", "Mock pipeline").

## 11. Public statistics vs personality scalars (observation)

Bible profiles carry both six public stats and 10 personality scalars
(aggression, humour…). Cards/profiles show public content only; personality
scalars additionally drive the mock runtime's phrasing (e.g. hedging under low
confidence, saying frequency scaled by humour). Internal safety rules are
parsed into a **separate** seed file (`bots.internal.json`) that only
server-side code may import.

## 12. Sensitive motions in rated draws

The spec requires balanced, responsibly arguable motions. Motions flagged
`sensitive: true` (2 of 32) are excluded from random rated draws in
`drawMotion()` and exist for future opt-in contexts with stronger framing.

---

## Product decisions after the first milestone (2026-07-31)

These come from the product owner directly and **override** the source
documents where they conflict.

### 13. Casual-fun rating overrides
Ronaldo 82→58, Messi 77→52, KSI 72→58, Niko Omilana 76→60. Rationale: they are
entertainment picks, not strong debaters, and Bible ratings implied otherwise.
Six public stats were shifted by the same delta so profiles stay internally
consistent; difficulty-scaling targets were re-derived. Asserted in
`bot-data.test.ts`.

### 14. Roster naming and personas
"Zakaria" → **Zak** (Morocco 🇲🇦, light skin, long curly black hair). Sophie is
explicitly the chaotic cat-lover (the Bible already had "The Chaotic Cat
Strategist" — the direction matched the source). The Barrister is female.

### 15. Overall rating is chess-style elo
OVR now moves by a **fixed ±0.09 per rated result** (win +0.09, loss −0.09,
draw 0), replacing performance-derived OVR. The six skill ratings keep the
EMA-from-judge-scores model — they explain *why* you win; OVR tracks *whether*
you win. Resignations cost OVR but never move skills.

### 16. No text debates
Debates are **audio (or video) only**. The room captures speech via the Web
Speech API and bots reply with synthesised voice; there is deliberately no
typing fallback. Where speech recognition is unavailable, the room shows the
microphone-unavailable state rather than degrading to text.

### 17. Lessons are gated to "interactive or nothing"
Quiz-card lessons were removed from the product surface. `/lessons` is an
honest coming-soon page and lesson routes redirect there; the seed content
remains in the repo for the rebuild. Judge recommendations now point at
puzzles only.

### 18. Directory structure and grouping
The bot directory follows the arcade "pick your opponent" pattern with a fixed
group order defined in `src/lib/bot-groups.ts`: Beginner, Intermediate,
Advanced, Master, Custom, Business Leaders, Politicians, Football Icons,
Creators, Political Commentators, Academic Debaters — with explicit member
ordering inside each group.

### 19. Visual direction
Rebrand **Debate.ch → Debates.ch** with a speech-bubble logo mark; neutrals
retuned to deeper greys with a pressed-edge green button treatment; colourful
multi-colour icons replace line icons in navigation; interactive demo panels
use a **light "board" surface** for contrast against the dark page; move-quality
badges (!! brilliant, ! great, ?! inaccuracy, ?? blunder) mark speech quality;
a light/dark theme toggle lives in Settings.

### 20. Character animation and gestures
All 48 bots have parametric cartoon avatars with mouth animation while
speaking. **Hand gestures are exclusive to the Trump bot** (a signature trait,
deliberately not shared with other characters), drawn as simple mitten shapes.
Trump additionally has `expressive` brow animation.

### 21. Resignation and trash talk
Players may resign at any time; the confirmation dialog deliberately
discourages it on sportsmanship grounds before allowing it. Bots deliver
occasional trash talk, gated on the Bible's aggression scalar, capped in
frequency, never in the opening phase, and always aimed at the argument.
