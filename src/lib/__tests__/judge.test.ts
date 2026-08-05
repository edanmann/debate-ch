import { describe, expect, it } from "vitest";
import rawBots from "@/data/bots.public.json";
import { botRosterSchema } from "../schemas";
import { judgeDebate } from "../judge";
import { SKILL_KEYS, type BotProfile, type DebateRecord } from "../types";

const roster = botRosterSchema.parse(rawBots) as BotProfile[];
const raj = roster.find((b) => b.slug === "raj")!;

function makeDebate(userText: string): DebateRecord {
  return {
    id: "test-debate-1",
    createdAt: Date.now(),
    botSlug: "raj",
    botName: "Raj",
    difficulty: "standard",
    formatId: "rapid",
    motionId: "m-tech-001",
    motionText: "This House would require a non-algorithmic feed by default.",
    userSide: "for",
    mode: "audio",
    rated: true,
    status: "complete",
    phaseIndex: 5,
    phaseRemainingSec: 0,
    notes: "",
    transcript: [
      {
        phaseId: "opening-for",
        phaseName: "Opening — For",
        speaker: "user",
        side: "for",
        text: userText,
        createdAt: Date.now(),
      },
      {
        phaseId: "opening-against",
        phaseName: "Opening — Against",
        speaker: "bot",
        side: "against",
        text: "Ranked feeds filter harm and surface relevance because they learn from behaviour. Defaults should track competence.",
        createdAt: Date.now(),
      },
    ],
  };
}

const STRUCTURED_SPEECH = `First, defaults decide what millions see, because most users never change settings, which means the platform's choice is effectively the user's choice. For example, organ-donation rates track the default option. Therefore control should sit with users. My opponent said ranked feeds filter harm, but even if that's true, it matters more that users can opt into ranking — our world keeps both safety and choice, which outweighs their convenience case. On balance, the evidence favours autonomy.`;

describe("mock judge", () => {
  it("scores all six skills for both sides within 0-100", () => {
    const r = judgeDebate(makeDebate(STRUCTURED_SPEECH), raj);
    for (const k of SKILL_KEYS) {
      expect(r.user.scores[k]).toBeGreaterThanOrEqual(0);
      expect(r.user.scores[k]).toBeLessThanOrEqual(100);
      expect(r.bot.scores[k]).toBeGreaterThanOrEqual(0);
      expect(r.bot.scores[k]).toBeLessThanOrEqual(100);
      expect(r.user.reasons[k]).toBeTruthy();
    }
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(0.9);
    expect(r.disclaimer).toMatch(/AI-generated educational assessment/);
  });

  it("rewards structure, mechanisms and weighing over empty text", () => {
    const strong = judgeDebate(makeDebate(STRUCTURED_SPEECH), raj);
    const weak = judgeDebate(makeDebate("Feeds are bad. Just bad."), raj);
    expect(strong.user.overall).toBeGreaterThan(weak.user.overall);
    expect(strong.user.scores.argumentation).toBeGreaterThan(weak.user.scores.argumentation);
    expect(strong.user.scores.rebuttal).toBeGreaterThan(weak.user.scores.rebuttal);
  });

  it("is deterministic for the same debate", () => {
    const a = judgeDebate(makeDebate(STRUCTURED_SPEECH), raj);
    const b = judgeDebate(makeDebate(STRUCTURED_SPEECH), raj);
    expect(a).toEqual(b);
  });

  it("declares a winner consistent with the overall margin", () => {
    const r = judgeDebate(makeDebate(STRUCTURED_SPEECH), raj);
    const margin = r.user.overall - r.bot.overall;
    if (Math.abs(margin) < 4) expect(r.winner).toBe("too-close");
    else expect(r.winner).toBe(margin > 0 ? "user" : "bot");
  });

  it("recommends a lesson and puzzle type for the weakest skill", () => {
    const r = judgeDebate(makeDebate("Short speech without much in it."), raj);
    expect(r.recommendedLessonSlug).toBeTruthy();
    expect(r.recommendedPuzzleType).toBeTruthy();
    expect(r.nextSteps.length).toBeGreaterThanOrEqual(3);
  });

  it("scales bot performance with difficulty", () => {
    const easy = judgeDebate({ ...makeDebate(STRUCTURED_SPEECH), difficulty: "easy" }, raj);
    const legendary = judgeDebate(
      { ...makeDebate(STRUCTURED_SPEECH), difficulty: "legendary" },
      raj
    );
    expect(legendary.bot.overall).toBeGreaterThan(easy.bot.overall);
  });
});
