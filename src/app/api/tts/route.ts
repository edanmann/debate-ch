import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Neural text-to-speech.
 *
 * The browser's built-in speechSynthesis voices are robotic — on macOS they
 * are the old compact voices, and no pitch/rate tuning makes them sound human.
 * When a provider key is configured this route returns real neural audio so
 * the bots actually sound like people; without a key it answers 503 and the
 * client falls back to browser speech.
 *
 * Voices are provider *presets* chosen to suit each character. They are not
 * clones of any real person's voice (docs/SAFETY_AND_LEGAL.md).
 */

const body = z.object({
  text: z.string().min(1).max(4000),
  /** OpenAI voice preset name (e.g. "onyx"). */
  voice: z.string().min(1).max(64),
  /** ElevenLabs voice id — a different identifier space, so a separate field. */
  elevenVoice: z.string().min(1).max(64).optional(),
  speed: z.number().min(0.5).max(1.5).optional(),
});

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;

export function ttsConfigured(): boolean {
  return Boolean(OPENAI_KEY || ELEVEN_KEY);
}

/** Reports whether neural audio is available, so the client can decide. */
export async function GET() {
  return NextResponse.json({
    configured: ttsConfigured(),
    provider: OPENAI_KEY ? "openai" : ELEVEN_KEY ? "elevenlabs" : null,
  });
}

export async function POST(request: Request) {
  if (!ttsConfigured()) {
    return NextResponse.json(
      {
        error: "no-tts",
        message:
          "Neural voices are not configured. Set OPENAI_API_KEY or ELEVENLABS_API_KEY to make bots sound human.",
      },
      { status: 503 }
    );
  }

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const { text, voice, elevenVoice, speed } = parsed.data;

  try {
    if (OPENAI_KEY) {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.TTS_MODEL ?? "gpt-4o-mini-tts",
          voice,
          input: text,
          speed: speed ?? 1,
          response_format: "mp3",
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      return new NextResponse(await res.arrayBuffer(), {
        headers: {
          "Content-Type": "audio/mpeg",
          // Identical lines recur across rounds; let the browser reuse them.
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // ElevenLabs ids and OpenAI preset names are different identifier
    // spaces — sending "onyx" here would 400 on every request, so this
    // never falls back to the OpenAI-shaped `voice` field.
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        elevenVoice ?? "21m00Tcm4TlvDq8ikWAM"
      )}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: process.env.TTS_MODEL ?? "eleven_turbo_v2_5",
        }),
      }
    );
    if (!res.ok) throw new Error(`elevenlabs ${res.status}`);
    return new NextResponse(await res.arrayBuffer(), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "tts-failed", message: "Voice service unavailable." },
      { status: 502 }
    );
  }
}
