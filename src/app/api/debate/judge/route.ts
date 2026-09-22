import { NextResponse } from "next/server";
import { z } from "zod";
import { getBotBySlug } from "@/lib/bots";
import { activeAiProviderId, getJudgeProvider } from "@/lib/providers";
import type { DebateRecord } from "@/lib/types";

const transcriptEntry = z.object({
  phaseId: z.string(),
  phaseName: z.string(),
  speaker: z.enum(["user", "bot"]),
  side: z.enum(["for", "against"]),
  text: z.string(),
  createdAt: z.number(),
});

const bodySchema = z.object({
  debate: z.object({
    id: z.string(),
    createdAt: z.number(),
    botSlug: z.string(),
    botName: z.string(),
    difficulty: z.enum(["easy", "standard", "legendary"]),
    formatId: z.string(),
    motionId: z.string(),
    motionText: z.string(),
    userSide: z.enum(["for", "against"]),
    mode: z.enum(["audio", "video"]).optional(),
    rated: z.boolean(),
    status: z.enum(["in-progress", "complete", "abandoned"]),
    phaseIndex: z.number(),
    phaseRemainingSec: z.number(),
    transcript: z.array(transcriptEntry),
    notes: z.string(),
  }),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const debate = parsed.data.debate as DebateRecord;
  const bot =
    debate.botSlug === "friend-opponent"
      ? ({
          name: debate.botName || "Opponent",
          slug: "friend-opponent",
          category: "Friend",
          archetype: "Human opponent",
          overallRating: null,
          oneLineSummary: "A human debating partner.",
          status: "active",
          publicStats: {},
          personality: { summary: null, traits: {} },
          communicationStyle: {},
          argumentationStyle: {},
          rebuttalStyle: {},
          evidenceBehaviour: {},
          strategicBehaviour: {},
          deliveryStyle: {},
          persuasionStyle: {},
          debateStageBehaviour: {},
          conditionalBehaviour: {},
          topicStrengths: [],
          topicWeaknesses: [],
          signatureTraits: [],
          humorousStatements: [],
          weaknesses: [],
          defeatGuide: {
            bestStrategy: null,
            whatToAvoid: null,
            bestQuestioningMethod: null,
            mostVulnerableStatistic: null,
          },
          difficultyScaling: { easy: null, standard: null, legendary: null },
          examples: {
            motion: null,
            opening: null,
            rebuttal: null,
            crossExamQuestion: null,
            closing: null,
          },
          publicDisclaimer: null,
        } as NonNullable<ReturnType<typeof getBotBySlug>>)
      : getBotBySlug(debate.botSlug);
  if (!bot) {
    return NextResponse.json({ error: "Unknown bot" }, { status: 404 });
  }
  try {
    const result = await getJudgeProvider().judge(debate, bot);
    return NextResponse.json({ result, provider: activeAiProviderId() });
  } catch (err) {
    console.error("judge failed", err);
    return NextResponse.json(
      { error: "judge-unavailable", message: "The judge could not finish." },
      { status: 503 }
    );
  }
}
