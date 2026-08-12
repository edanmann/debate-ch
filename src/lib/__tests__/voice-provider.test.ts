import { describe, expect, it } from "vitest";
import { BOT_PRESENTATION, presentationFor } from "../bot-presentation";

/**
 * Regression coverage for the OpenAI/ElevenLabs identifier bug: every bot's
 * neuralVoice was an OpenAI preset name ("onyx"), which ElevenLabs rejects
 * outright — so configuring ELEVENLABS_API_KEY silently broke every bot's
 * voice. presentationFor() must always resolve a valid, gender-matched
 * ElevenLabs id too, deterministically, whether or not one is set explicitly.
 */

const ELEVEN_ID = /^[A-Za-z0-9]{15,25}$/;

describe("presentationFor voice resolution", () => {
  it("resolves a plausible ElevenLabs id for every bot in the roster", () => {
    for (const slug of Object.keys(BOT_PRESENTATION)) {
      const { voice } = presentationFor(slug);
      expect(voice.elevenVoice, `${slug} has no elevenVoice`).toBeTruthy();
      expect(ELEVEN_ID.test(voice.elevenVoice!), `${slug}'s elevenVoice "${voice.elevenVoice}" looks wrong`).toBe(true);
    }
  });

  it("is deterministic — the same bot always resolves to the same voice", () => {
    for (const slug of Object.keys(BOT_PRESENTATION).slice(0, 10)) {
      const a = presentationFor(slug).voice.elevenVoice;
      const b = presentationFor(slug).voice.elevenVoice;
      expect(a).toBe(b);
    }
  });

  it("never reuses an OpenAI preset name as the ElevenLabs id", () => {
    const openAiNames = new Set(["alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "coral", "sage", "verse"]);
    for (const slug of Object.keys(BOT_PRESENTATION)) {
      const { voice } = presentationFor(slug);
      expect(openAiNames.has((voice.elevenVoice ?? "").toLowerCase())).toBe(false);
    }
  });

  it("falls back to a robot voice profile for an unknown slug without crashing", () => {
    const p = presentationFor("not-a-real-bot");
    expect(p.voice.elevenVoice).toBeTruthy();
  });
});
