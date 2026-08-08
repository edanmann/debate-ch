import raw from "@/data/bot-reviews.json";

/**
 * In-character post-debate reactions, one set per bot, written from each
 * character's Bible profile. Every line stays constructive: the bot may be
 * smug about winning, but always points at the next improvement.
 */

export interface BotReview {
  win: string;
  loss: string;
  draw: string;
  coachIntro: string;
  quirk: string;
}

const REVIEWS = raw as Record<string, BotReview>;

const FALLBACK: BotReview = {
  win: "Good round — you took that one. Keep the structure and push harder on comparison next time.",
  loss: "That one's mine, but it was closer than the score suggests. Answer my strongest point first next round.",
  draw: "Too close to call. Neither of us weighed the round properly — whoever does that first wins the rematch.",
  coachIntro: "Let's work on one thing at a time and make it stick.",
  quirk: "",
};

export function reviewFor(
  slug: string,
  outcome: "win" | "loss" | "draw"
): string {
  const r = REVIEWS[slug] ?? FALLBACK;
  return r[outcome];
}

export function coachIntroFor(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return (REVIEWS[slug] ?? FALLBACK).coachIntro;
}

/** Short signature aside, occasionally dropped into a bot's speech. */
export function quirkFor(slug: string): string {
  return (REVIEWS[slug] ?? FALLBACK).quirk;
}
