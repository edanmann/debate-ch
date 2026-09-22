import { z } from "zod";
import type { BotTurnInput } from "./bot-runtime";
import { generateBotTurn } from "./bot-runtime";
import { JUDGE_DISCLAIMER, judgeDebate } from "./judge";
import { SKILL_KEYS, type DebateRecord, type JudgeResult } from "./types";
import type { BotProfile } from "./types";

/**
 * Provider-neutral AI service layer (spec §5).
 * Mock implementations run with no API keys. When OPENAI_API_KEY is set,
 * OpenAI backs the bot, judge and moderation behind the same interfaces.
 */

export interface DebateBotProvider {
  readonly id: string;
  generateTurn(input: BotTurnInput): Promise<string>;
}

export interface DebateJudgeProvider {
  readonly id: string;
  judge(debate: DebateRecord, bot: BotProfile): Promise<JudgeResult>;
}

export interface SpeechToTextProvider {
  readonly id: string;
  transcribe(audio: Blob): Promise<string>;
}

export interface TextToSpeechProvider {
  readonly id: string;
  speak(text: string, voiceStyle: string): Promise<ArrayBuffer>;
}

export interface ModerationProvider {
  readonly id: string;
  check(text: string): Promise<{ allowed: boolean; reason: string | null }>;
}

export function openaiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export const mockBotProvider: DebateBotProvider = {
  id: "mock",
  async generateTurn(input) {
    return generateBotTurn(input);
  },
};

export const mockJudgeProvider: DebateJudgeProvider = {
  id: "mock",
  async judge(debate, bot) {
    return judgeDebate(debate, bot);
  },
};

const BLOCKLIST_PATTERNS = [/\bkill yourself\b/i, /\bslur\b/i];

/** Minimal keyword moderation for mock mode; a real provider replaces this. */
export const mockModerationProvider: ModerationProvider = {
  id: "mock",
  async check(text) {
    for (const p of BLOCKLIST_PATTERNS) {
      if (p.test(text)) {
        return {
          allowed: false,
          reason:
            "This message appears to target a person rather than an argument.",
        };
      }
    }
    return { allowed: true, reason: null };
  },
};

const skillScores = z.object({
  argumentation: z.number(),
  rebuttal: z.number(),
  evidence: z.number(),
  strategy: z.number(),
  delivery: z.number(),
  persuasion: z.number(),
});

const skillReasons = z.object({
  argumentation: z.string(),
  rebuttal: z.string(),
  evidence: z.string(),
  strategy: z.string(),
  delivery: z.string(),
  persuasion: z.string(),
});

const judgeSchema = z.object({
  winner: z.enum(["user", "bot", "too-close"]),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  user: z.object({
    scores: skillScores,
    overall: z.number(),
    reasons: skillReasons,
  }),
  bot: z.object({
    scores: skillScores,
    overall: z.number(),
    reasons: skillReasons,
  }),
  strongestUserArgument: z.string(),
  strongestBotArgument: z.string(),
  mostImportantMissedRebuttal: z.string(),
  bestEvidenceUse: z.string(),
  unsupportedClaims: z.string(),
  strategicTurningPoint: z.string(),
  deliveryNotes: z.string(),
  timeManagement: z.string(),
  nextSteps: z.array(z.string()).min(1).max(6),
  recommendedLessonSlug: z.string().nullable(),
  recommendedPuzzleType: z.string().nullable(),
});

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeJudge(raw: z.infer<typeof judgeSchema>): JudgeResult {
  const fixSide = (side: z.infer<typeof judgeSchema>["user"]) => ({
    scores: Object.fromEntries(
      SKILL_KEYS.map((k) => [k, clampScore(side.scores[k])])
    ) as JudgeResult["user"]["scores"],
    overall: clampScore(side.overall),
    reasons: side.reasons,
  });
  return {
    winner: raw.winner,
    confidence: Math.max(0, Math.min(1, raw.confidence)),
    explanation: raw.explanation,
    user: fixSide(raw.user),
    bot: fixSide(raw.bot),
    strongestUserArgument: raw.strongestUserArgument,
    strongestBotArgument: raw.strongestBotArgument,
    mostImportantMissedRebuttal: raw.mostImportantMissedRebuttal,
    bestEvidenceUse: raw.bestEvidenceUse,
    unsupportedClaims: raw.unsupportedClaims,
    strategicTurningPoint: raw.strategicTurningPoint,
    deliveryNotes: raw.deliveryNotes,
    timeManagement: raw.timeManagement,
    nextSteps: raw.nextSteps.slice(0, 6),
    recommendedLessonSlug: raw.recommendedLessonSlug,
    recommendedPuzzleType: raw.recommendedPuzzleType,
    disclaimer: JUDGE_DISCLAIMER,
  };
}

async function openaiChat(
  messages: { role: "system" | "user"; content: string }[],
  opts: { json?: boolean; temperature?: number } = {}
): Promise<string> {
  const key = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: opts.temperature ?? 0.7,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`openai-${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("openai-empty");
  return content;
}

export const openaiBotProvider: DebateBotProvider = {
  id: "openai",
  async generateTurn(input) {
    const { bot, motion, botSide, phaseId, difficulty, transcript } = input;
    const prior = transcript
      .map(
        (t) =>
          `${t.speaker === "user" ? "User" : bot.name} (${t.side}, ${t.phaseName}): ${t.text}`
      )
      .join("\n");

    return openaiChat(
      [
        {
          role: "system",
          content: `You are a debate opponent in Debates.ch. You play a stylised AI simulation of "${bot.name}" (${bot.archetype}).
You are NOT the real person. Never claim to be them, never invent personal memories, quotes, or private facts.
Speak in first person as the simulation. Match their public rhetorical style.
Rules:
- Argue the assigned side of the motion only.
- Never invent statistics, studies, citations, or sources. Prefer mechanisms, weighing, and clear reasoning.
- Stay on the argument; never attack the person.
- Keep the speech to 90–180 words, spoken aloud (no markdown, no bullet lists).
- Difficulty "${difficulty}" raises skill and structure, never dishonesty.
Profile: ${bot.oneLineSummary}
Personality: ${bot.personality.summary ?? "n/a"}
Communication: ${JSON.stringify(bot.communicationStyle).slice(0, 500)}
Weaknesses to honour: ${(bot.weaknesses ?? []).slice(0, 3).map((w) => w.title).join(", ") || "none"}`,
        },
        {
          role: "user",
          content: `Motion: ${motion.text}
Your side: ${botSide}
Phase: ${phaseId}
${botSide === "for" ? `For context: ${motion.forContext ?? ""}` : `Against context: ${motion.againstContext ?? ""}`}

Transcript so far:
${prior || "(opening — no prior speeches)"}

Deliver your next speech now.`,
        },
      ],
      { temperature: 0.85 }
    );
  },
};

export const openaiJudgeProvider: DebateJudgeProvider = {
  id: "openai",
  async judge(debate, bot) {
    const transcript = debate.transcript
      .map(
        (t) =>
          `${t.speaker === "user" ? "User" : bot.name} (${t.side}, ${t.phaseName}): ${t.text}`
      )
      .join("\n");

    const raw = await openaiChat(
      [
        {
          role: "system",
          content: `You are the Debates.ch educational judge. Score a finished debate on six skills: argumentation, rebuttal, evidence, strategy, delivery, persuasion.
Return ONLY JSON with this shape:
{"winner":"user"|"bot"|"too-close","confidence":0-1,"explanation":string,
"user":{"scores":{six skills 0-100},"overall":0-100,"reasons":{six short strings}},
"bot":{same},
"strongestUserArgument":string,"strongestBotArgument":string,"mostImportantMissedRebuttal":string,
"bestEvidenceUse":string,"unsupportedClaims":string,"strategicTurningPoint":string,
"deliveryNotes":string,"timeManagement":string,"nextSteps":string[1-5],
"recommendedLessonSlug":string|null,"recommendedPuzzleType":string|null}
Be fair. Prefer observable transcript features. Do not invent quotes.`,
        },
        {
          role: "user",
          content: `Motion: ${debate.motionText}
User side: ${debate.userSide}
Bot: ${bot.name} (${bot.archetype})
Difficulty: ${debate.difficulty}
Format: ${debate.formatId}

Transcript:
${transcript || "(empty)"}`,
        },
      ],
      { json: true, temperature: 0.3 }
    );

    const parsed = judgeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(`judge-schema: ${parsed.error.message}`);
    }
    return normalizeJudge(parsed.data);
  },
};

export const openaiModerationProvider: ModerationProvider = {
  id: "openai-moderation",
  async check(text) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return mockModerationProvider.check(text);
    try {
      const res = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "omni-moderation-latest",
          input: text,
        }),
      });
      if (!res.ok) return mockModerationProvider.check(text);
      const data = (await res.json()) as {
        results?: { flagged?: boolean; categories?: Record<string, boolean> }[];
      };
      const result = data.results?.[0];
      if (!result?.flagged) return mockModerationProvider.check(text);
      const hit = Object.entries(result.categories ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ");
      return {
        allowed: false,
        reason: hit
          ? `This message was blocked (${hit}). Debate the argument, not the person.`
          : "This message was blocked by moderation.",
      };
    } catch {
      return mockModerationProvider.check(text);
    }
  },
};

export function getBotProvider(): DebateBotProvider {
  return openaiConfigured() ? openaiBotProvider : mockBotProvider;
}

export function getJudgeProvider(): DebateJudgeProvider {
  return openaiConfigured() ? openaiJudgeProvider : mockJudgeProvider;
}

export function getModerationProvider(): ModerationProvider {
  return openaiConfigured() ? openaiModerationProvider : mockModerationProvider;
}

export function activeAiProviderId(): string {
  return openaiConfigured() ? "openai" : "mock";
}
