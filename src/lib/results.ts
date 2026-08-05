import { FORMAT_RATING_WEIGHT } from "./formats";
import { applyEloResult, applyJudgement, MIN_RATED_USER_WORDS } from "./rating";
import { applyRatingChange, getState, saveDebate } from "./store";
import type { DebateRecord, JudgeResult, RatingChangeSummary } from "./types";

/**
 * Finalise a completed debate: request judgement, apply rating changes when
 * the round qualifies, persist everything. Anti-gaming (spec §22): abandoned
 * or near-empty rounds never move ratings.
 */

export function userWordCount(debate: DebateRecord): number {
  return debate.transcript
    .filter((t) => t.speaker === "user")
    .map((t) => t.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function isRatable(debate: DebateRecord): boolean {
  return (
    debate.rated &&
    debate.status === "complete" &&
    userWordCount(debate) >= MIN_RATED_USER_WORDS
  );
}

export async function finalizeDebate(
  debate: DebateRecord
): Promise<DebateRecord> {
  const complete: DebateRecord = { ...debate, status: "complete" };

  const res = await fetch("/api/debate/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      debate: { ...complete, judgement: undefined, ratingChange: undefined },
    }),
  });
  if (!res.ok) throw new Error("judge-unavailable");
  const { result } = (await res.json()) as { result: JudgeResult };

  let ratingChange: RatingChangeSummary | undefined;
  if (isRatable(complete)) {
    const state = getState();
    // Overall OVR: fixed chess-style stakes on the result.
    const elo = applyEloResult(state.overallElo, result.winner, true);
    // Six skills: performance-based EMA from the judge's scores.
    const { next, updates } = applyJudgement(state.ratings, result.user.scores, {
      confidence: result.confidence,
      formatWeight: FORMAT_RATING_WEIGHT[complete.formatId] ?? 0.6,
    });
    ratingChange = {
      debateId: complete.id,
      createdAt: Date.now(),
      perSkill: updates,
      previousOverall: state.overallElo,
      nextOverall: elo.next,
      confidence: result.confidence,
    };
    applyRatingChange(next, ratingChange, elo.next);
  }

  const final: DebateRecord = { ...complete, judgement: result, ratingChange };
  saveDebate(final);
  return final;
}

/**
 * Resign mid-round: the bot takes the win, OVR takes the fixed elo loss when
 * rated, and skill ratings stay put (a resignation carries no performance
 * signal). Judge insights are still generated from whatever was said.
 */
export async function resignDebate(debate: DebateRecord): Promise<DebateRecord> {
  const complete: DebateRecord = { ...debate, status: "complete" };
  let base: JudgeResult | null = null;
  try {
    const res = await fetch("/api/debate/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        debate: { ...complete, judgement: undefined, ratingChange: undefined },
      }),
    });
    if (res.ok) base = ((await res.json()) as { result: JudgeResult }).result;
  } catch {
    // Fall through to the synthesized result below.
  }

  const zeros = Object.fromEntries(
    ["argumentation", "rebuttal", "evidence", "strategy", "delivery", "persuasion"].map(
      (k) => [k, 25]
    )
  ) as JudgeResult["user"]["scores"];
  const reasons = Object.fromEntries(
    Object.keys(zeros).map((k) => [k, "Round resigned before completion."])
  ) as JudgeResult["user"]["reasons"];

  const result: JudgeResult = {
    ...(base ?? {
      winner: "bot",
      confidence: 1,
      explanation: "",
      user: { scores: zeros, overall: 25, reasons },
      bot: { scores: { ...zeros }, overall: 50, reasons: { ...reasons } },
      strongestUserArgument: "The round ended before your case developed.",
      strongestBotArgument: `${debate.botName} held the floor when you resigned.`,
      mostImportantMissedRebuttal: "Resigned before rebuttal.",
      bestEvidenceUse: "Not enough material to assess.",
      unsupportedClaims: "Not enough material to assess.",
      strategicTurningPoint: "The resignation.",
      deliveryNotes: "Not enough material to assess.",
      timeManagement: "Round ended early by resignation.",
      nextSteps: [
        "Finish the next round even when behind — comebacks train weighing under pressure.",
      ],
      recommendedLessonSlug: null,
      recommendedPuzzleType: "strongest-rebuttal",
      disclaimer: JUDGE_DISCLAIMER_TEXT,
    }),
    winner: "bot",
    confidence: 1,
    explanation: `You resigned — the round goes to ${debate.botName}.`,
  };

  let ratingChange: RatingChangeSummary | undefined;
  if (debate.rated) {
    const state = getState();
    const elo = applyEloResult(state.overallElo, "bot", true);
    const perSkill = Object.fromEntries(
      Object.keys(zeros).map((k) => {
        const key = k as keyof typeof state.ratings;
        return [
          k,
          {
            previous: state.ratings[key].rating,
            next: state.ratings[key].rating,
            delta: 0,
            explanation: "Resignations never move skill ratings — only OVR.",
          },
        ];
      })
    ) as RatingChangeSummary["perSkill"];
    ratingChange = {
      debateId: debate.id,
      createdAt: Date.now(),
      perSkill,
      previousOverall: state.overallElo,
      nextOverall: elo.next,
      confidence: 1,
    };
    applyRatingChange(state.ratings, ratingChange, elo.next);
  }

  const final: DebateRecord = { ...complete, judgement: result, ratingChange };
  saveDebate(final);
  return final;
}

const JUDGE_DISCLAIMER_TEXT =
  "This is an AI-generated educational assessment. Review the reasoning and evidence, not only the final score.";
