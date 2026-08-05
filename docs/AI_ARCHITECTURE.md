# AI Architecture

## Provider-neutral layer

`src/lib/providers.ts` defines the contracts; nothing outside it knows which
vendor (or mock) is running:

- `DebateBotProvider.generateTurn(input)` — input: bot profile, motion,
  side, phase, difficulty, full transcript, debate id
- `DebateJudgeProvider.judge(debate, bot)`
- `SpeechToTextProvider`, `TextToSpeechProvider`, `ModerationProvider`

`FLAGS.realAiProviders` selects implementations. Mock mode ships complete;
a model-backed provider (e.g. Anthropic) implements the same interfaces and
receives the same Bible-derived configuration. API routes
(`/api/debate/respond`, `/api/debate/judge`) are the only call sites, so
provider swaps never touch client code.

## Mock bot runtime (src/lib/bot-runtime.ts)

Deterministic per (debate, phase, bot): composes speeches from
- the motion's side context (its case material),
- a decision-rule frame chosen by seed,
- persona flavour from Bible personality scalars (aggression/formality/
  confidence choose the opener; low confidence adds hedging),
- signature sayings, frequency scaled by the humour scalar,
- rebuttal that quotes the user's actual longest claim,
- difficulty scaling: easy drops rebuttals and argument count; legendary adds
  anticipation and comparative weighing.

Honesty rules baked in: no invented statistics or sources at any difficulty —
difficulty raises skill, never dishonesty.

## Mock judge (src/lib/judge.ts)

Transparent feature-based rubric over the transcript:

| Dimension | Observable signals |
| --- | --- |
| Argumentation | mechanism markers (because/therefore/leads to…), substance |
| Rebuttal | opponent references + content-word overlap with their case |
| Evidence | example/data/study markers |
| Strategy | weighing language (outweigh/even if/on balance…) |
| Delivery | signposting, sentence length band |
| Persuasion | weighing + evidence + structure composite |

Bot side scores derive from Bible stats ± difficulty offset ± seeded jitter.
Winner = overall margin; |margin| < 4 → "too close to call". Confidence grows
with spoken volume and format weight, capped at 0.9. Output includes per-skill
reasons, strongest arguments (extracted sentences), missed-rebuttal call-out,
next steps, and a recommended lesson + puzzle type mapped from the weakest
skill. Every result carries the disclaimer: *"This is an AI-generated
educational assessment. Review the reasoning and evidence, not only the final
score."* Deterministic for a given debate (asserted in tests).

## Real-provider plan

1. Prompt assembly from `BotProfile` public + internal sections (internal
   safety rules are server-only seed data, never client-shipped).
2. Judge as a structured-output call scoring the same six dimensions with the
   same rubric text, validated by Zod before acceptance.
3. Moderation provider wraps user input and bot output both directions.
4. Cost limits, timeouts and fallback-to-mock configured per environment
   (admin AI-config page, hosted phase).
