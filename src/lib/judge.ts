import { SKILL_KEYS, type DebateRecord, type JudgeResult, type SkillKey } from "./types";
import type { BotProfile } from "./types";
import { FORMAT_RATING_WEIGHT } from "./formats";

/**
 * Mock AI judge (spec §21) — a deterministic, transparent heuristic that
 * scores observable features of the transcript. It implements the
 * DebateJudgeProvider interface so a real model-backed judge can replace it
 * behind the same contract (docs/AI_ARCHITECTURE.md). It never pretends to be
 * infallible: every result carries the standard disclaimer.
 */

export const JUDGE_DISCLAIMER =
  "This is an AI-generated educational assessment. Review the reasoning and evidence, not only the final score.";

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
const MECHANISM_WORDS = ["because", "therefore", "so ", "which means", "leads to", "results in", "causes"];
const EVIDENCE_WORDS = ["study", "studies", "research", "evidence", "data", "statistic", "for example", "example", "in practice", "case"];
const WEIGHING_WORDS = ["outweigh", "more important", "matters more", "even if", "comparative", "on balance", "greater", "bigger impact"];
const REBUTTAL_WORDS = ["you said", "you argued", "my opponent", "they claim", "the other side", "you claimed", "that argument", "your point"];

interface TextFeatures {
  words: number;
  sentences: number;
  signposts: number;
  mechanisms: number;
  evidence: number;
  weighing: number;
  rebuttalMarkers: number;
  overlapWithOpponent: number;
  speeches: number;
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

export function extractFeatures(
  ownText: string,
  opponentText: string,
  speeches: number
): TextFeatures {
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
    speeches,
  };
}

function scaled(base: number, signal: number, per: number, cap: number): number {
  return base + Math.min(cap, signal * per);
}

function clamp(n: number): number {
  return Math.round(Math.max(5, Math.min(95, n)));
}

export function scoreUser(f: TextFeatures): Record<SkillKey, number> {
  const substance = Math.min(20, f.words / 25);
  return {
    argumentation: clamp(scaled(28 + substance, f.mechanisms, 5, 25)),
    rebuttal: clamp(
      scaled(24 + substance * 0.7, f.rebuttalMarkers, 6, 22) +
        Math.min(12, f.overlapWithOpponent * 1.5)
    ),
    evidence: clamp(scaled(24 + substance * 0.6, f.evidence, 6, 30)),
    strategy: clamp(scaled(26 + substance * 0.7, f.weighing, 7, 28)),
    delivery: clamp(
      scaled(30 + substance * 0.5, f.signposts, 5, 20) +
        (f.sentences > 0 && f.words / f.sentences <= 26 ? 8 : 0)
    ),
    persuasion: clamp(
      28 +
        substance * 0.6 +
        Math.min(10, f.weighing * 4) +
        Math.min(8, f.evidence * 2) +
        Math.min(7, f.signposts * 2)
    ),
  };
}

/** Deterministic per-debate jitter so bot performance varies believably. */
function jitter(seed: string, key: string, range: number): number {
  let h = 2166136261;
  const s = seed + key;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % (range * 2 + 1)) - range;
}

const DIFFICULTY_OFFSET = { easy: -18, standard: 0, legendary: 8 } as const;

export function scoreBot(
  bot: BotProfile,
  difficulty: keyof typeof DIFFICULTY_OFFSET,
  debateId: string
): Record<SkillKey, number> {
  const out = {} as Record<SkillKey, number>;
  for (const key of SKILL_KEYS) {
    const base = bot.publicStats[key]?.rating ?? 50;
    out[key] = clamp(base + DIFFICULTY_OFFSET[difficulty] + jitter(debateId, key, 5));
  }
  return out;
}

function overall(scores: Record<SkillKey, number>): number {
  return Math.round(
    SKILL_KEYS.reduce((a, k) => a + scores[k], 0) / SKILL_KEYS.length
  );
}

const USER_REASONS: Record<SkillKey, (f: TextFeatures) => string> = {
  argumentation: (f) =>
    f.mechanisms >= 3
      ? `You explained causal links ${f.mechanisms} times — claims mostly came with mechanisms.`
      : "Several claims were asserted without a step-by-step mechanism; walk the causal chain explicitly.",
  rebuttal: (f) =>
    f.rebuttalMarkers >= 2
      ? "You engaged the opponent's material directly and by name."
      : "You rarely referenced the opponent's actual arguments; quote and answer their strongest point.",
  evidence: (f) =>
    f.evidence >= 2
      ? "You anchored claims with examples or data references."
      : "Little evidence or example use was detected; even one concrete case strengthens a claim.",
  strategy: (f) =>
    f.weighing >= 2
      ? "You compared impacts rather than just listing them."
      : "Impacts were stated but not weighed against the other side's; say why yours matters more.",
  delivery: (f) =>
    f.signposts >= 2
      ? "Clear signposting made your structure easy to follow."
      : "Structure was hard to follow; number your points and flag transitions.",
  persuasion: (f) =>
    f.weighing + f.evidence >= 3
      ? "Reasoned comparison plus concrete examples gave your case audience appeal."
      : "The case would land harder with a memorable comparison and one vivid example.",
};

const SKILL_LESSON: Record<SkillKey, string> = {
  argumentation: "argument-anatomy",
  rebuttal: "rebuttal-basics",
  evidence: "evidence-that-counts",
  strategy: "strategic-weighing",
  delivery: "clear-delivery",
  persuasion: "persuasive-closings",
};

const SKILL_PUZZLE: Record<SkillKey, string> = {
  argumentation: "missing-mechanism",
  rebuttal: "strongest-rebuttal",
  evidence: "best-evidence",
  strategy: "rank-impacts",
  delivery: "improve-argument",
  persuasion: "closing-comparison",
};

function pickSentence(text: string, containing: string[]): string | null {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 30);
  for (const s of sentences) {
    if (containing.some((c) => s.toLowerCase().includes(c))) return s.trim();
  }
  return sentences.sort((a, b) => b.length - a.length)[0]?.trim() ?? null;
}

export function judgeDebate(debate: DebateRecord, bot: BotProfile): JudgeResult {
  const userText = debate.transcript
    .filter((t) => t.speaker === "user")
    .map((t) => t.text)
    .join("\n");
  const botText = debate.transcript
    .filter((t) => t.speaker === "bot")
    .map((t) => t.text)
    .join("\n");
  const userSpeeches = debate.transcript.filter((t) => t.speaker === "user").length;

  const f = extractFeatures(userText, botText, userSpeeches);
  const userScores = scoreUser(f);
  const botScores = scoreBot(bot, debate.difficulty, debate.id);
  const userOverall = overall(userScores);
  const botOverall = overall(botScores);
  const margin = userOverall - botOverall;

  const formatWeight = FORMAT_RATING_WEIGHT[debate.formatId] ?? 0.6;
  const confidence = Math.min(
    0.9,
    0.3 + Math.min(0.3, f.words / 1200) + formatWeight * 0.25
  );

  const winner: JudgeResult["winner"] =
    Math.abs(margin) < 4 ? "too-close" : margin > 0 ? "user" : "bot";

  const userReasons = {} as Record<SkillKey, string>;
  for (const key of SKILL_KEYS) userReasons[key] = USER_REASONS[key](f);

  const botReasons = {} as Record<SkillKey, string>;
  for (const key of SKILL_KEYS) {
    botReasons[key] =
      bot.publicStats[key]?.explanation ??
      "Performed at its designed level for this difficulty.";
  }

  const weakest = [...SKILL_KEYS].sort((a, b) => userScores[a] - userScores[b]);

  const strongestUser =
    pickSentence(userText, ["because", "therefore", "means"]) ??
    "No developed argument was detected — you may have run out of time.";
  const strongestBot =
    pickSentence(botText, ["because", "therefore", "means"]) ??
    "The opponent's case was brief this round.";

  const missedRebuttal =
    f.rebuttalMarkers === 0
      ? `The opponent's core claim went unanswered: "${botText.split(/(?<=[.!?])\s+/)[0] ?? "their opening claim"}"`
      : "You engaged their case; the next step is answering their single strongest point first, not their weakest.";

  const explanation =
    winner === "too-close"
      ? `Both sides finished within a few points (${userOverall} vs ${botOverall}). Neither established a decisive comparative advantage, so this round is too close to call.`
      : winner === "user"
        ? `You outscored ${bot.name} ${userOverall} to ${botOverall}. ${userReasons[weakest[5]]} The gap came mostly from ${weakest[5]} and consistent structure.`
        : `${bot.name} outscored you ${botOverall} to ${userOverall}. The decisive gap was ${weakest[0]}: ${userReasons[weakest[0]].toLowerCase()}`;

  return {
    winner,
    confidence: Number(confidence.toFixed(2)),
    explanation,
    user: { scores: userScores, overall: userOverall, reasons: userReasons },
    bot: { scores: botScores, overall: botOverall, reasons: botReasons },
    strongestUserArgument: strongestUser,
    strongestBotArgument: strongestBot,
    mostImportantMissedRebuttal: missedRebuttal,
    bestEvidenceUse:
      f.evidence >= 2
        ? "You referenced concrete examples or data — keep tying each one back to the motion."
        : "Neither an example nor a data point anchored your case; one well-chosen case study would have helped.",
    unsupportedClaims:
      f.mechanisms < 2
        ? "Several claims were asserted without a mechanism; the judge treats unexplained claims as unproven."
        : "Most claims came with at least partial support.",
    strategicTurningPoint:
      f.weighing >= 1
        ? "The round turned on comparative weighing — the side that explained *why it matters more* controlled the close."
        : "No explicit weighing happened, so the round stayed a list-versus-list exchange.",
    deliveryNotes: userReasons.delivery,
    timeManagement:
      f.words < 80
        ? "You left substantial speaking time unused; short speeches give the judge little to score."
        : "You used your speaking time substantively.",
    nextSteps: [
      `Priority: ${weakest[0]} — ${USER_REASONS[weakest[0]](f)}`,
      `Then: ${weakest[1]} — ${USER_REASONS[weakest[1]](f)}`,
      "Rematch the same bot on Standard and aim to answer their strongest argument inside your first 30 seconds.",
    ],
    recommendedLessonSlug: SKILL_LESSON[weakest[0]],
    recommendedPuzzleType: SKILL_PUZZLE[weakest[0]],
    disclaimer: JUDGE_DISCLAIMER,
  };
}
