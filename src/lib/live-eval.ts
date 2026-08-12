import { gradeSpeech, VERDICT_WEIGHT } from "./debate-guidelines";
import type { SpeechVerdict } from "@/components/move-badge";
import type { TranscriptEntry } from "./types";

/**
 * Live debate evaluation — the debating equivalent of a chess engine bar.
 *
 * Chess evaluates a position; a debate has no board, so we evaluate the
 * *record*: every speech so far is graded against the shared debate
 * guidelines (./debate-guidelines), and the bar shows who is ahead on the
 * running total. The post-debate line-by-line review uses the same grading
 * function, so the live bar and the review never disagree about a speech.
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
