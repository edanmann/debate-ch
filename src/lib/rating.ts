import { SKILL_KEYS, type RatingState, type SkillKey } from "./types";

/**
 * User skill-rating system (spec §22).
 * Each of the six skills updates independently via an exponential moving
 * average whose weight shrinks as more rated samples accumulate, scaled by
 * judge confidence and format weight. Transparent by design: every update
 * returns a per-skill explanation.
 */

export const STARTING_RATING = 35;
export const MIN_RATED_USER_WORDS = 40;

/**
 * Overall OVR moves chess-style with fixed stakes (product decision
 * 2026-07-31): winner +0.09, loser −0.09, draw 0. The six skills below still
 * move on judged performance — they explain *why* you win; OVR tracks
 * *whether* you win.
 */
export const OVR_STAKE = 0.09;

export function applyEloResult(
  currentOverall: number,
  winner: "user" | "bot" | "too-close",
  rated: boolean
): { next: number; delta: number; explanation: string } {
  if (!rated || winner === "too-close") {
    return {
      next: currentOverall,
      delta: 0,
      explanation:
        winner === "too-close"
          ? "Too close to call — a draw moves nobody's rating."
          : "Practice rounds never move your rating.",
    };
  }
  const delta = winner === "user" ? OVR_STAKE : -OVR_STAKE;
  const next = Math.min(100, Math.max(1, +(currentOverall + delta).toFixed(2)));
  return {
    next,
    delta: +(next - currentOverall).toFixed(2),
    explanation:
      winner === "user"
        ? `Win: +${OVR_STAKE.toFixed(2)} OVR — fixed stakes, like elo. Stack wins to climb.`
        : `Loss: −${OVR_STAKE.toFixed(2)} OVR — fixed stakes, like elo. Win it back in the rematch.`,
  };
}

/** Display OVR with decimals only once it has them. */
export function formatOvr(n: number): string {
  return Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2);
}

export function initialRatingState(): RatingState {
  const out = {} as RatingState;
  for (const key of SKILL_KEYS) {
    out[key] = { rating: STARTING_RATING, samples: 0 };
  }
  return out;
}

/** Mean of the six skills — a performance summary, distinct from elo OVR. */
export function skillAverage(state: RatingState): number {
  const sum = SKILL_KEYS.reduce((acc, k) => acc + state[k].rating, 0);
  return Math.round(sum / SKILL_KEYS.length);
}

/** Learning rate decays with experience so early debates matter more. */
export function learningRate(samples: number): number {
  return Math.min(0.5, Math.max(0.08, 0.5 / Math.sqrt(samples + 1)));
}

export interface RatingUpdateOptions {
  /** Judge confidence 0..1. */
  confidence: number;
  /** Format weight 0..1 (longer formats move ratings more). */
  formatWeight: number;
}

export interface SkillUpdate {
  previous: number;
  next: number;
  delta: number;
  explanation: string;
}

export function applyJudgement(
  state: RatingState,
  judgeScores: Record<SkillKey, number>,
  opts: RatingUpdateOptions
): { next: RatingState; updates: Record<SkillKey, SkillUpdate> } {
  const next = {} as RatingState;
  const updates = {} as Record<SkillKey, SkillUpdate>;
  const confidence = clamp01(opts.confidence);
  const formatWeight = clamp01(opts.formatWeight);
  const maxDelta = Math.max(2, Math.round(8 * formatWeight));

  for (const key of SKILL_KEYS) {
    const { rating, samples } = state[key];
    const score = Math.max(0, Math.min(100, judgeScores[key]));
    const weight = learningRate(samples) * confidence * formatWeight;
    const raw = weight * (score - rating);
    const delta = Math.round(Math.max(-maxDelta, Math.min(maxDelta, raw)));
    const updated = Math.max(1, Math.min(100, rating + delta));
    next[key] = { rating: updated, samples: samples + 1 };
    updates[key] = {
      previous: rating,
      next: updated,
      delta: updated - rating,
      explanation: explainDelta(key, rating, score, updated, confidence, samples),
    };
  }
  return { next, updates };
}

function explainDelta(
  key: SkillKey,
  previous: number,
  score: number,
  next: number,
  confidence: number,
  samples: number
): string {
  const direction =
    next > previous ? "rose" : next < previous ? "fell" : "held steady";
  const reliability =
    samples < 3
      ? "Your rating is still settling — early rounds move it more."
      : samples < 10
        ? "Ratings move moderately at your sample size."
        : "With many rated rounds, single results move ratings slowly.";
  return `The judge scored this round's ${key} at ${score}, against your rating of ${previous}, so it ${direction} to ${next} (judge confidence ${(confidence * 100).toFixed(0)}%). ${reliability}`;
}

/** Confidence label so a 2-sample rating is not presented like a 200-sample one. */
export function reliabilityLabel(samples: number): string {
  if (samples === 0) return "Unrated — placement estimate";
  if (samples < 3) return "Low confidence — very few rated rounds";
  if (samples < 10) return "Settling — based on a handful of rounds";
  return "Established";
}

export function tierForRating(rating: number): {
  id: string;
  label: string;
} {
  if (rating >= 90) return { id: "light-gold", label: "Light Gold" };
  if (rating >= 80) return { id: "dark-gold", label: "Dark Gold" };
  if (rating >= 70) return { id: "silver", label: "Silver" };
  if (rating >= 60) return { id: "light-bronze", label: "Light Bronze" };
  if (rating >= 50) return { id: "dark-bronze", label: "Dark Bronze" };
  return { id: "dark", label: "Dark" };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
