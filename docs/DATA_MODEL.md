# Data Model

## Demo persistence (implemented)

`src/lib/store.ts` — one versioned localStorage document
(`debate-ch/state/v1`), read through `useSyncExternalStore`:

```
AppState {
  user: UserProfile | null            // id, displayName, email, country,
                                      // experience, goals, preferredLengthId,
                                      // coachSlug, createdAt
  ratings: Record<SkillKey, { rating, samples }>
  ratingHistory: RatingChangeSummary[]   // per-skill prev/next/delta/explanation
  debates: DebateRecord[]             // full transcripts + judgement + clock
  seenMotionIds: string[]             // shuffle-without-replacement
  lessonProgress: Record<slug, { stepsDone, completed, completedAt }>
  guestLessonsCompleted: number       // 3-lesson guest gate
  puzzles: { attempts, correct, streak, lastSolvedDay, solved{} }
  waitlist: { email, consent, createdAt, notified } | null
  favouriteBots / recentBots: string[]
  analyses: AnalysisJob[]             // mocked pipeline jobs
}
```

Seed data (Zod-validated): `bots.public.json` (48), `bots.internal.json`
(server-only safety rules), `motions.json` (32), `lessons.json` (12),
`puzzles.json` (20). Replays are generated deterministically at runtime.

## Target relational schema (hosted phase)

Conventions: `id uuid pk`, `created_at/updated_at timestamptz`, soft delete via
`deleted_at` where noted, RLS on all user-owned tables (owner read/write,
admin via role claim).

**Identity & progression**
- `users` (auth id, email, status) / `profiles` (display_name, country,
  experience, avatar_url, coach_bot_id, soft-delete)
- `user_preferences` (practice length, privacy: invites/visibility/replays,
  ai_training_opt_in default false)
- `user_skill_ratings` (user_id, skill enum ×6, rating, samples)
- `user_rating_history` (user_id, debate_id, skill, previous, next, delta,
  confidence, explanation)

**Bots**
- `bot_profiles` (slug unique, name, category, archetype, status enum
  active/planned/excluded, overall_rating, public JSONB sections)
- `bot_versions` (bot_id, version, full config snapshot, author, rollback)
- `bot_difficulty_configs` (bot_id, level enum, behaviour JSONB)
- `bot_assets` (bot_id, kind, url)
- Internal runtime config in a separate column group readable only by the
  service role — never through client-facing RLS.

**Motions & formats**
- `motions` (text, category, difficulty, age_suitability, factual_dependence,
  sensitive, requires_current_research, definitions, for_context,
  against_context, objectives[], status enum draft/approved/archived)
- `motion_contexts` (motion_id, research bundle JSONB, as_of timestamptz)
- `debate_formats` / `debate_format_phases` (format_id, position, name, kind,
  speaker_side, duration_sec, interruptions, cross_exam, coaching)

**Debates**
- `debates` (format_id, motion_id, mode text/audio/video, rated, status,
  visibility, started/ended_at)
- `debate_participants` (debate_id, user_id nullable, bot_id nullable, side,
  result)
- `debate_phases` (debate_id, phase ref, started/ended, skipped)
- `speech_segments` / `transcript_segments` (participant, phase, text,
  start_ms, end_ms)
- `debate_claims` / `debate_evidence` (extracted by analysis, versioned)
- `debate_analyses` (debate_id, version, provider, prompt_version, JSONB)
- `debate_scorecards` (analysis_id, participant, skill, score, reason)
- `debate_rating_changes` (mirrors user_rating_history rows per debate)

**Learning**
- `lessons` / `lesson_steps` / `lesson_progress`
- `puzzles` / `puzzle_attempts` (user, puzzle, choice, correct, at)

**Social & ops**
- `friendships` (requester, addressee, status pending/accepted/blocked)
- `debate_invites` (lobby code, inviter, invitee/email, format, custom motion,
  expiry)
- `notifications`, `matchmaking_waitlist` (email, consent bool, consent_text,
  notified_at, delete-on-request)
- `uploaded_debates` (owner, file url, size, retention_until, consent bool)
  / `analysis_jobs` (upload_id, stage enum ×10, error, retries)
- `reports` (reporter, subject type/id, reason, status) /
  `moderation_events` / `audit_logs` (actor, action, subject, diff)
- `feature_flags` (name, enabled, conditions JSONB)

Indexes: FKs, `debates(status, created_at)`, `motions(status, category)`,
`transcript_segments(debate_id, start_ms)`, `friendships(addressee, status)`,
partial index on `bot_profiles(status) where status='active'`.

Retention: media rows carry `retention_until`; deletion jobs purge storage and
cascade analyses. Analyses are versioned, never mutated in place.
