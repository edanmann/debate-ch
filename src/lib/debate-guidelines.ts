import type { SpeechVerdict } from "@/components/move-badge";
import type { SkillKey } from "./types";

/**
 * The generalised debate guidelines.
 *
 * Every judging surface in the product — the live evaluation bar during a
 * round, the aggregate post-debate judgement, and the per-line Debate Review
 * — grades against this one rubric. Keeping it in a single module is what
 * makes "brilliant" mean the same thing in the live bar as it does in the
 * review afterwards: same features, same thresholds, same weights.
 *
 * It is a transparent heuristic, not a model: every signal below is
 * something a human coach could point to in the transcript, which is what
 * lets every verdict come with a stated reason instead of an opaque score.
 */

// ---------------------------------------------------------------------------
// The six skills

export const SKILL_RUBRIC: Record<SkillKey, { question: string; looksFor: string }> = {
  argumentation: {
    question: "Does each claim come with a mechanism, not just an assertion?",
    looksFor: "Causal language (\"because\", \"therefore\", \"which means\") connecting a claim to why it's true.",
  },
  rebuttal: {
    question: "Does the speech engage what the opponent actually said?",
    looksFor: "Direct references to the opponent's claims, and shared vocabulary with their case.",
  },
  evidence: {
    question: "Is anything anchored to a concrete example, study, or data point?",
    looksFor: "Named studies, statistics, or specific real-world cases rather than general claims.",
  },
  strategy: {
    question: "Does the speaker say why their impact matters more, not just that it exists?",
    looksFor: "Comparative language (\"outweighs\", \"even if\", \"the bigger impact\") that weighs one side against the other.",
  },
  delivery: {
    question: "Is the structure easy to follow?",
    looksFor: "Signposting (\"first\", \"my main point\", \"in conclusion\") and sentences short enough to track by ear.",
  },
  persuasion: {
    question: "Would this land with a judge who wasn't already convinced?",
    looksFor: "Weighing and evidence combined — the two features that predict whether a case actually moves someone.",
  },
};

// ---------------------------------------------------------------------------
// The chess-move verdict ladder

export const VERDICT_RUBRIC: Record<SpeechVerdict, { criteria: string }> = {
  brilliant: {
    criteria: "Directly answers the opponent's material and explains why it outweighs — the two hardest features to combine in one speech.",
  },
  great: {
    criteria: "A clear claim with a real mechanism, or direct engagement with the opponent's case.",
  },
  good: {
    criteria: "Solid and on-topic, but missing either a mechanism or an engagement with the other side.",
  },
  inaccuracy: {
    criteria: "Reasonable content that never weighs impacts against the other side, or leans on a thin mechanism.",
  },
  mistake: {
    criteria: "Off-clash, or answers the wrong thing — the speech spends its turn on ground that doesn't move the round.",
  },
  blunder: {
    criteria: "An assertion with no mechanism and no evidence, or a speech too short to say anything at all.",
  },
};

/** How much each verdict swings the running evaluation, chess-eval style. */
export const VERDICT_WEIGHT: Record<SpeechVerdict, number> = {
  brilliant: 2.0,
  great: 1.0,
  good: 0.4,
  inaccuracy: -0.6,
  mistake: -1.1,
  blunder: -1.6,
};

// ---------------------------------------------------------------------------
// Feature extraction — the observable signals every verdict is built from

const SIGNPOSTS = [
  "first",
  "second",
  "third",
  "finally",
  "to begin",
  "in conclusion",
  "my main point",
  "next",
];
// Deliberately generous: real speech reasons causally without always reaching
// for "because" — "so", "means", "why", "unless" carry the same job.
const MECHANISM_WORDS = [
  "because",
  "therefore",
  "so ",
  "so,",
  "since ",
  "which means",
  "that means",
  "means that",
  "leads to",
  "results in",
  "causes",
  "as a result",
  "given that",
  "the reason",
  "why",
  "unless",
  "spreads",
  "drives",
  "makes",
];
const EVIDENCE_WORDS = [
  "study",
  "studies",
  "research",
  "evidence",
  "data",
  "statistic",
  "for example",
  "example",
  "in practice",
  "case",
  "trial",
  "report",
  "survey",
  "figures",
];
const WEIGHING_WORDS = [
  "outweigh",
  "more important",
  "matters more",
  "even if",
  "comparative",
  "on balance",
  "greater",
  "bigger impact",
  "at the expense of",
  "than ",
];
// Explicit rebuttal phrasing. Most real engagement doesn't use these exact
// words though — see overlapWithOpponent, which catches it regardless.
const REBUTTAL_WORDS = ["you said", "you argued", "my opponent", "they claim", "the other side", "you claimed", "that argument", "your point", "wrong", "that's not"];

export interface TextFeatures {
  words: number;
  sentences: number;
  signposts: number;
  mechanisms: number;
  evidence: number;
  weighing: number;
  rebuttalMarkers: number;
  overlapWithOpponent: number;
  /** A concrete number (370,000 / 60% / 32 hours) is evidence even with no evidence-word nearby. */
  hasNumber: boolean;
}

function countMatches(text: string, needles: string[]): number {
  const lower = text.toLowerCase();
  return needles.reduce((acc, n) => {
    let count = 0;
    let idx = lower.indexOf(n);
    while (idx !== -1) {
      count++;
      idx = lower.indexOf(n, idx + n.length);
    }
    return acc + count;
  }, 0);
}

function contentWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4)
  );
}

export function extractFeatures(ownText: string, opponentText: string): TextFeatures {
  const words = ownText.split(/\s+/).filter(Boolean).length;
  const sentences = ownText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const own = contentWords(ownText);
  const opp = contentWords(opponentText);
  let overlap = 0;
  own.forEach((w) => {
    if (opp.has(w)) overlap++;
  });
  return {
    words,
    sentences,
    signposts: countMatches(ownText, SIGNPOSTS),
    mechanisms: countMatches(ownText, MECHANISM_WORDS),
    evidence: countMatches(ownText, EVIDENCE_WORDS),
    weighing: countMatches(ownText, WEIGHING_WORDS),
    rebuttalMarkers: countMatches(ownText, REBUTTAL_WORDS),
    overlapWithOpponent: overlap,
    hasNumber: /\d/.test(ownText),
  };
}

// ---------------------------------------------------------------------------
// Per-speech grading — the shared "one move" judge

export interface SpeechGrade {
  score: number;
  verdict: SpeechVerdict;
  reason: string;
  features: TextFeatures;
}

/**
 * Grade one speech against everything the opponent has said so far. This is
 * the single function every judging surface calls — the live bar during a
 * round and the post-debate line-by-line review both go through here, so a
 * "brilliant" always means the same thing.
 *
 * Four booleans do the real work, each backed by a generalisable signal
 * rather than one exact phrase — a speech that shares several content words
 * with the opponent's prior text counts as "engaged" even if it never says
 * "you said", because that overlap is what engagement actually looks like.
 */
export function gradeSpeech(text: string, opponentText: string): SpeechGrade {
  const f = extractFeatures(text, opponentText);
  const engaged = f.rebuttalMarkers > 0 || f.overlapWithOpponent >= 2;
  const reasoned = f.mechanisms > 0;
  const supported = f.evidence > 0 || f.hasNumber;
  const weighed = f.weighing > 0;

  const substance = Math.min(18, f.words / 20);
  let score =
    30 +
    substance +
    (reasoned ? 14 : 0) +
    (supported ? 14 : 0) +
    (engaged ? 16 : 0) +
    (weighed ? 14 : 0) +
    Math.min(8, f.signposts * 3);
  score = Math.round(Math.max(5, Math.min(97, score)));

  let verdict: SpeechVerdict;
  let reason: string;
  if (f.words < 10) {
    verdict = "blunder";
    reason = "Barely any content — the judge can't score silence.";
  } else if (!reasoned && !supported && !engaged) {
    verdict = "blunder";
    reason = "Assertion with no mechanism, no evidence and no engagement with the opponent.";
  } else if (score >= 72 && engaged && weighed) {
    verdict = "brilliant";
    reason = "Answered them directly and explained why it outweighs.";
  } else if (score >= 60) {
    verdict = "great";
    reason = engaged
      ? "Engaged the opponent's actual case with real support behind it."
      : "Clear claim with a real mechanism and evidence behind it.";
  } else if (score >= 48) {
    verdict = "good";
    reason = !engaged
      ? "On-topic, but never engaged the opponent's case directly."
      : "Engaged the opponent, but the point never got a mechanism or evidence.";
  } else if (score >= 38) {
    verdict = "inaccuracy";
    reason = !weighed
      ? "Solid points, but nothing weighed against their side."
      : "Reasonable, though the support behind it stayed thin.";
  } else {
    verdict = "mistake";
    reason = "Off-clash — this doesn't do enough to engage where the round is actually being fought.";
  }
  return { score, verdict, reason, features: f };
}

/** Bounded −1..1 squash for a running advantage, so the bar never pins flat. */
export function squashToUnit(advantage: number, steepness = 2.5): number {
  return Math.tanh(advantage / steepness);
}
