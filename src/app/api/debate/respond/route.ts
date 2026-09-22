import { NextResponse } from "next/server";
import { z } from "zod";
import { getBotBySlug } from "@/lib/bots";
import { getMotionById } from "@/lib/motions";
import {
  activeAiProviderId,
  getBotProvider,
  getModerationProvider,
} from "@/lib/providers";
import type { TranscriptEntry } from "@/lib/types";

const bodySchema = z.object({
  debateId: z.string().min(1),
  botSlug: z.string().min(1),
  motionId: z.string().min(1),
  botSide: z.enum(["for", "against"]),
  phaseId: z.string().min(1),
  difficulty: z.enum(["easy", "standard", "legendary"]),
  transcript: z.array(
    z.object({
      phaseId: z.string(),
      phaseName: z.string(),
      speaker: z.enum(["user", "bot"]),
      side: z.enum(["for", "against"]),
      text: z.string(),
      createdAt: z.number(),
    })
  ),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { debateId, botSlug, motionId, botSide, phaseId, difficulty, transcript } =
    parsed.data;

  const bot = getBotBySlug(botSlug);
  const motion = getMotionById(motionId);
  if (!bot || bot.status !== "active" || !motion) {
    return NextResponse.json({ error: "Unknown bot or motion" }, { status: 404 });
  }

  const lastUser = [...transcript].reverse().find((t) => t.speaker === "user");
  if (lastUser?.text) {
    const mod = await getModerationProvider().check(lastUser.text);
    if (!mod.allowed) {
      return NextResponse.json(
        { error: "moderation", message: mod.reason },
        { status: 422 }
      );
    }
  }

  try {
    const text = await getBotProvider().generateTurn({
      bot,
      motion,
      botSide,
      phaseId,
      difficulty,
      debateId,
      transcript: transcript as TranscriptEntry[],
    });

    const botMod = await getModerationProvider().check(text);
    if (!botMod.allowed) {
      return NextResponse.json(
        {
          error: "moderation",
          message: "The bot reply was blocked. Try advancing the phase again.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, provider: activeAiProviderId() });
  } catch (err) {
    console.error("bot respond failed", err);
    return NextResponse.json(
      { error: "bot-unavailable", message: "The opponent could not reply." },
      { status: 503 }
    );
  }
}
