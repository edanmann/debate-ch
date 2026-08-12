import { gradeSpeech, squashToUnit, VERDICT_WEIGHT } from "./debate-guidelines";
import type { SpeechVerdict } from "@/components/move-badge";
import type { DebateRecord, DebateSide } from "./types";

/**
 * Builds the data behind the post-debate Debate Review: every line treated
 * like a chess move — graded, timestamped, and given a running evaluation —
 * using the same {@link gradeSpeech} the live bar uses during the round.
 */

export interface ReviewTurn {
  index: number;
  speaker: "user" | "bot";
  side: DebateSide;
  /** Elapsed time since the round started, "m:ss". */
  at: string;
  text: string;
  verdict: SpeechVerdict;
  /** −1 (bot ahead) … +1 (user ahead), running total after this turn. */
  evaluation: number;
  /** The commentator's line on this specific turn. */
  note: string;
}

export interface VerdictCounts {
  verdict: SpeechVerdict;
  label: string;
  user: number;
  bot: number;
}

export interface DebateLineReview {
  turns: ReviewTurn[];
  counts: VerdictCounts[];
}

const VERDICT_LABELS: Record<SpeechVerdict, string> = {
  brilliant: "Brilliant",
  great: "Great",
  good: "Solid",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};

/** Reaction opener, independent of who said it — paired with the graded reason. */
const REACTION: Record<SpeechVerdict, { user: string; bot: string }> = {
  brilliant: { user: "Brilliant.", bot: "That lands." },
  great: { user: "Good one.", bot: "Sharp from them." },
  good: { user: "Solid, but not the strongest choice.", bot: "Competent, nothing more." },
  inaccuracy: { user: "Half of that worked.", bot: "There's a gap here." },
  mistake: { user: "That one drifts.", bot: "They wander off the clash here." },
  blunder: { user: "That one hurts.", bot: "They hand you ground here." },
};

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Grades every line in a completed debate, in order, the way a chess review
 * grades every move: each turn gets a verdict against the shared guidelines,
 * a reason tied to the feature that drove it, and a running evaluation so the
 * bar can move turn by turn instead of only reporting the final score.
 */
export function buildLineReview(debate: DebateRecord): DebateLineReview {
  const { transcript } = debate;
  const startedAt = transcript[0]?.createdAt ?? 0;

  const turns: ReviewTurn[] = [];
  const counts: Record<SpeechVerdict, { user: number; bot: number }> = {
    brilliant: { user: 0, bot: 0 },
    great: { user: 0, bot: 0 },
    good: { user: 0, bot: 0 },
    inaccuracy: { user: 0, bot: 0 },
    mistake: { user: 0, bot: 0 },
    blunder: { user: 0, bot: 0 },
  };

  let advantage = 0;

  transcript.forEach((entry, index) => {
    const priorOpposing = transcript
      .slice(0, index)
      .filter((t) => t.speaker !== entry.speaker)
      .map((t) => t.text)
      .join(" ");
    const { verdict, reason } = gradeSpeech(entry.text, priorOpposing);

    counts[verdict][entry.speaker]++;

    const swing = VERDICT_WEIGHT[verdict];
    advantage += entry.speaker === "user" ? swing : -swing;

    const opener = REACTION[verdict][entry.speaker];
    // "reason" already reads naturally as commentary — the opener just gives
    // it a reaction beat first, like a coach talking through the tape.
    const note = `${opener} ${reason}`;

    turns.push({
      index,
      speaker: entry.speaker,
      side: entry.side,
      at: formatElapsed(entry.createdAt - startedAt),
      text: entry.text,
      verdict,
      evaluation: +squashToUnit(advantage).toFixed(3),
      note,
    });
  });

  return {
    turns,
    counts: (Object.keys(VERDICT_LABELS) as SpeechVerdict[]).map((verdict) => ({
      verdict,
      label: VERDICT_LABELS[verdict],
      user: counts[verdict].user,
      bot: counts[verdict].bot,
    })),
  };
}
