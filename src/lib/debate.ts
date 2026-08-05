import { getFormat } from "./formats";
import { drawMotionWithPrefs, drawSide, getMotionById } from "./motions";
import { getState, saveDebate } from "./store";
import type { DebateRecord, Difficulty } from "./types";

/** Client-side debate creation for mock mode (the app picks motion and side). */
export function createDebate(opts: {
  botSlug: string;
  botName: string;
  difficulty: Difficulty;
  formatId: string;
  rated: boolean;
  mode?: "audio" | "video";
  /** Force a specific motion (used by the in-room motion picker). */
  motionId?: string;
}): DebateRecord {
  const format = getFormat(opts.formatId);
  if (!format) throw new Error(`Unknown format: ${opts.formatId}`);
  const state = getState();
  const downvoted = Object.entries(state.motionVotes)
    .filter(([, v]) => v === "down")
    .map(([id]) => id);
  const motion =
    (opts.motionId ? getMotionById(opts.motionId) : null) ??
    drawMotionWithPrefs(state.seenMotionIds, state.motionPrefs, downvoted);
  const debate: DebateRecord = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    botSlug: opts.botSlug,
    botName: opts.botName,
    difficulty: opts.difficulty,
    formatId: format.id,
    motionId: motion.id,
    motionText: motion.text,
    userSide: drawSide(),
    mode: opts.mode ?? "audio",
    rated: opts.rated,
    status: "in-progress",
    phaseIndex: 0,
    phaseRemainingSec: format.phases[0]?.durationSec ?? 0,
    transcript: [],
    notes: "",
  };
  saveDebate(debate);
  return debate;
}
