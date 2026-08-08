import { describe, expect, it } from "vitest";
import { chunkSpeech } from "../voice";
import { BOT_PRESENTATION, presentationFor } from "../bot-presentation";

describe("speech chunking", () => {
  it("splits into sentences so delivery has pauses", () => {
    const chunks = chunkSpeech(
      "Workers love it. Families love it. Quite frankly, we win."
    );
    expect(chunks).toHaveLength(3);
    expect(chunks[0].text).toBe("Workers love it.");
    expect(chunks[2].text).toBe("Quite frankly, we win.");
  });

  it("breaks long sentences at clause boundaries", () => {
    const long =
      "Run the factory math first, because compressing the hours does not compress the output, " +
      "and the physics of a production line still applies, which is the part that nobody in this " +
      "debate seems willing to actually discuss in any detail whatsoever.";
    const chunks = chunkSpeech(long);
    expect(chunks.length).toBeGreaterThan(1);
    // Every chunk must be short enough to dodge Chrome's ~15s truncation bug.
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(180);
  });

  it("never loses words from the original speech", () => {
    const text =
      "First, defaults decide what millions see. Second, most users never change them; that matters. Therefore control belongs with users.";
    const rejoined = chunkSpeech(text)
      .map((c) => c.text)
      .join(" ");
    const words = (s: string) => s.replace(/\s+/g, " ").trim().split(" ");
    expect(words(rejoined)).toEqual(words(text));
  });

  it("returns nothing for empty input rather than an empty utterance", () => {
    expect(chunkSpeech("   ")).toEqual([]);
  });
});

describe("bot voice profiles", () => {
  it("gives every bot a voice with sane prosody", () => {
    for (const [slug, p] of Object.entries(BOT_PRESENTATION)) {
      const v = p.voice;
      expect(v.pitch, slug).toBeGreaterThan(0);
      expect(v.pitch, slug).toBeLessThanOrEqual(2);
      expect(v.rate, slug).toBeGreaterThanOrEqual(0.5);
      expect(v.rate, slug).toBeLessThanOrEqual(1.6);
      if (v.pauseScale !== undefined) {
        expect(v.pauseScale, slug).toBeGreaterThan(0);
      }
      // A neural preset keeps characters distinct once a TTS key is set.
      expect(v.neuralVoice, slug).toBeTruthy();
    }
  });

  it("keeps same-locale headliners audibly distinct", () => {
    const trump = presentationFor("donald-trump").voice;
    const obama = presentationFor("barack-obama").voice;
    expect(trump.lang).toBe(obama.lang);
    // Same accent, but different named voice, pitch and rhythm.
    expect(trump.voiceNames?.[0]).not.toBe(obama.voiceNames?.[0]);
    expect(trump.neuralVoice).not.toBe(obama.neuralVoice);
    expect(trump.pitch).not.toBe(obama.pitch);
  });

  it("gives deliberate speakers longer pauses than rapid ones", () => {
    const trump = presentationFor("donald-trump").voice.pauseScale ?? 1;
    const shapiro = presentationFor("ben-shapiro").voice.pauseScale ?? 1;
    expect(trump).toBeGreaterThan(shapiro);
  });
});
