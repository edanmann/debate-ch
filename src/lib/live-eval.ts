import { extractFeatures, scoreUser } from "./judge";
import type { SpeechVerdict } from "@/components/move-badge";
import type { TranscriptEntry } from "./types";

/**
 * Live debate evaluation — the debating equivalent of a chess engine bar.
 *
 * Chess evaluates a position; a debate has no board, so we evaluate the
 * *record*: every speech so far is scored on the same observable features the
 * final judge uses (mechanisms, rebuttal engagement, evidence, weighing,
 * structure), and the bar shows who is ahead on that running total.
 */

export interface SpeechEval {
  /** Index into the transcript this verdict belongs to. */
  index: number;
  speaker: "user" | "bot";
  verdict: SpeechVerdict;
  /** 0..100 quality of this single speech. */
  score: number;
  /** One-line reason, shown on hover / in the feed. */
  reason: string;
}

export interface LiveEval {
  /** 0..100 — share of the round the user currently holds. */
  userShare: number;
  /** Signed advantage in "points", chess-eval style (+ user, − bot). */
  advantage: number;
  speeches: SpeechEval[];
  /** Short human summary of the current state. */
  summary: string;
}

/** Grade one speech against the features that decide rounds. */
function gradeSpeech(text: string, opponentText: string): {
  score: number;
  verdict: SpeechVerdict;
  reason: string;
} {
  const f = extractFeatures(text, opponentText, 1);
  const s = scoreUser(f);
  const score = Math.round(
    (s.argumentation + s.rebuttal + s.evidence + s.strategy + s.persuasion) / 5
  );

  // Verdict thresholds mirror the badge vocabulary used elsewhere.
  let verdict: SpeechVerdict;
  let reason: string;
  if (f.words < 12) {
    verdict = "blunder";
    reason = "Barely any content — the judge can't score silence.";
  } else if (f.mechanisms === 0 && f.evidence === 0) {
    verdict = "blunder";
    reason = "Assertion with no mechanism and no evidence.";
  } else if (score >= 62 && f.weighing > 0 && f.rebuttalMarkers > 0) {
    verdict = "brilliant";
    reason = "Answered them directly and explained why it outweighs.";
  } else if (score >= 52) {
    verdict = "great";
    reason =
      f.rebuttalMarkers > 0
        ? "Engaged the opponent's actual case."
        : "Clear claim with a real mechanism behind it.";
  } else if (score >= 40) {
    verdict = "inaccuracy";
    reason =
      f.weighing === 0
        ? "Solid points, but nothing weighed against their side."
        : "Reasonable, though the mechanism stayed thin.";
  } else {
    verdict = "blunder";
    reason = "Off-clash or unsupported — this hands ground away.";
  }
  return { score, verdict, reason };
}

const VERDICT_WEIGHT: Record<SpeechVerdict, number> = {
  brilliant: 2.0,
  great: 1.0,
  good: 0.4,
  inaccuracy: -0.6,
  mistake: -1.1,
  blunder: -1.6,
};

export function evaluateLive(transcript: TranscriptEntry[]): LiveEval {
  const speeches: SpeechEval[] = [];
  let advantage = 0;

  transcript.forEach((entry, index) => {
    // Grade each speech against everything the other side had said before it.
    const priorOpposing = transcript
      .slice(0, index)
      .filter((t) => t.speaker !== entry.speaker)
      .map((t) => t.text)
      .join(" ");
    const { score, verdict, reason } = gradeSpeech(entry.text, priorOpposing);
    speeches.push({ index, speaker: entry.speaker, verdict, score, reason });
    // A good speech from either side pushes the bar toward that side.
    const swing = VERDICT_WEIGHT[verdict];
    advantage += entry.speaker === "user" ? swing : -swing;
  });

  // Squash to a 0..100 share so the bar never pins fully to one end.
  const userShare = Math.round(100 / (1 + Math.exp(-advantage / 2.2)));

  let summary: string;
  if (speeches.length === 0) summary = "Nothing said yet — the round is level.";
  else if (Math.abs(advantage) < 0.8) summary = "Dead level. The next speech decides the shape.";
  else if (advantage >= 2.5) summary = "You're clearly ahead — protect the comparison.";
  else if (advantage > 0) summary = "You're slightly ahead on the record.";
  else if (advantage <= -2.5) summary = "You're well behind — answer their best point first.";
  else summary = "Slightly behind. One clean rebuttal turns this.";

  return {
    userShare: Math.max(4, Math.min(96, userShare)),
    advantage: +advantage.toFixed(1),
    speeches,
    summary,
  };
}
