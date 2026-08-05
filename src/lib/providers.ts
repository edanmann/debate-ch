import type { BotProfile, DebateRecord, JudgeResult } from "./types";
import type { BotTurnInput } from "./bot-runtime";
import { generateBotTurn } from "./bot-runtime";
import { judgeDebate } from "./judge";

/**
 * Provider-neutral AI service layer (spec §5).
 * The app depends only on these interfaces; mock implementations run with no
 * API keys. Real providers (Anthropic, others) slot in behind FLAGS.realAiProviders.
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
          reason: "This message appears to target a person rather than an argument.",
        };
      }
    }
    return { allowed: true, reason: null };
  },
};

export function getBotProvider(): DebateBotProvider {
  return mockBotProvider;
}

export function getJudgeProvider(): DebateJudgeProvider {
  return mockJudgeProvider;
}
