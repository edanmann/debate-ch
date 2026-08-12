import { describe, expect, it } from "vitest";
import { gradeSpeech } from "../debate-guidelines";

describe("gradeSpeech calibration", () => {
  it("credits a substantive rebuttal that reasons in plain language, not just textbook connectives", () => {
    const opponent =
      "Four-day week — workers love it, families love it. Iceland ran the trial with 2,500 people and output held.";
    const rebuttal =
      "Iceland is 370,000 people and mostly public-sector desk work. You can't extrapolate that to a factory floor in Ohio.";
    const { verdict } = gradeSpeech(rebuttal, opponent);
    expect(["brilliant", "great", "good"]).toContain(verdict);
  });

  it("credits a speech that explains why its impact outweighs, in natural phrasing", () => {
    const opponent = "So it's voluntary for the sector employing most people.";
    const speech =
      "Wrong. Offices are 60% of employment in developed economies. That's not a press release, that's most people's lives.";
    const { verdict } = gradeSpeech(speech, opponent);
    expect(["brilliant", "great", "good"]).toContain(verdict);
  });

  it("still blunders a bare assertion with no reasoning and no engagement", () => {
    const { verdict } = gradeSpeech("Everybody agrees productivity goes up. Everybody knows it.", "");
    expect(verdict).toBe("blunder");
  });

  it("still blunders near-silence", () => {
    const { verdict } = gradeSpeech("I agree.", "Some prior opposing speech here.");
    expect(verdict).toBe("blunder");
  });

  it("rewards a speech that directly answers the opponent's claim with a mechanism and a weighing", () => {
    const opponent = "Fine, 60%. Then tell me who covers the fifth day of customer demand.";
    const speech =
      "Because demand doesn't vanish, it spreads across the other four days, so no one needs to hire a fifth of the workforce just to cover it.";
    const { verdict } = gradeSpeech(speech, opponent);
    expect(["brilliant", "great"]).toContain(verdict);
  });
});
