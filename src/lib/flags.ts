/**
 * Feature flags (spec §37). Values can be overridden with NEXT_PUBLIC_FLAG_*
 * environment variables ("true"/"false"); defaults describe the current MVP.
 */

function env(name: string, fallback: boolean): boolean {
  const v = process.env[`NEXT_PUBLIC_FLAG_${name}`];
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

export const FLAGS = {
  /** Instant public matchmaking — waitlist only for now. */
  publicMatchmaking: env("PUBLIC_MATCHMAKING", false),
  /** Live audio/video in the debate room. Text mode is the MVP. */
  liveVideo: env("LIVE_VIDEO", true),
  /** Real live-streamed debates in Watch. Seeded replays otherwise. */
  liveWatch: env("LIVE_WATCH", false),
  /** Call real AI providers instead of the mock runtime. */
  realAiProviders: env("REAL_AI_PROVIDERS", false),
  /** Real text-to-speech voices. */
  realTts: env("REAL_TTS", false),
  /** Show "Coming later" planned bots (Mamdani, Macron). */
  plannedBots: env("PLANNED_BOTS", false),
  /** Public shareable replays. */
  publicReplays: env("PUBLIC_REPLAYS", false),
  /** Payments and premium tiers. */
  payments: env("PAYMENTS", false),
  /** Real app-store links in the landing footer/app section. */
  mobileAppLinks: env("MOBILE_APP_LINKS", false),
  /** Social login buttons on auth pages. */
  socialLogin: env("SOCIAL_LOGIN", false),
  /** Coach prompts between phases during explicitly-labelled practice. */
  coachLiveAssistance: env("COACH_LIVE_ASSISTANCE", true),
} as const;

export type FlagName = keyof typeof FLAGS;
