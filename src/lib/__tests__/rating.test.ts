import { describe, expect, it } from "vitest";
import {
  applyEloResult,
  applyJudgement,
  initialRatingState,
  learningRate,
  OVR_STAKE,
  reliabilityLabel,
  skillAverage,
  STARTING_RATING,
  tierForRating,
} from "../rating";
import { SKILL_KEYS, type SkillKey } from "../types";

function scores(n: number): Record<SkillKey, number> {
  return Object.fromEntries(SKILL_KEYS.map((k) => [k, n])) as Record<SkillKey, number>;
}

describe("rating system", () => {
  it("starts every skill at the starting rating", () => {
    const s = initialRatingState();
    for (const k of SKILL_KEYS) {
      expect(s[k].rating).toBe(STARTING_RATING);
      expect(s[k].samples).toBe(0);
    }
    expect(skillAverage(s)).toBe(STARTING_RATING);
  });

  it("moves overall OVR by fixed elo stakes", () => {
    expect(applyEloResult(35, "user", true)).toMatchObject({
      next: 35 + OVR_STAKE,
      delta: OVR_STAKE,
    });
    expect(applyEloResult(35, "bot", true).next).toBeCloseTo(35 - OVR_STAKE, 5);
    expect(applyEloResult(35, "too-close", true).delta).toBe(0);
    expect(applyEloResult(35, "user", false).delta).toBe(0);
    // Never leaves bounds.
    expect(applyEloResult(1, "bot", true).next).toBe(1);
    expect(applyEloResult(100, "user", true).next).toBe(100);
  });

  it("moves ratings toward the judged score", () => {
    const { next, updates } = applyJudgement(initialRatingState(), scores(60), {
      confidence: 0.8,
      formatWeight: 0.8,
    });
    for (const k of SKILL_KEYS) {
      expect(next[k].rating).toBeGreaterThan(STARTING_RATING);
      expect(next[k].samples).toBe(1);
      expect(updates[k].delta).toBe(next[k].rating - STARTING_RATING);
      expect(updates[k].explanation).toContain("confidence");
    }
  });

  it("caps single-round movement", () => {
    const { next } = applyJudgement(initialRatingState(), scores(100), {
      confidence: 1,
      formatWeight: 1,
    });
    for (const k of SKILL_KEYS) {
      expect(next[k].rating - STARTING_RATING).toBeLessThanOrEqual(8);
    }
  });

  it("does not move ratings at zero confidence", () => {
    const { next } = applyJudgement(initialRatingState(), scores(90), {
      confidence: 0,
      formatWeight: 1,
    });
    for (const k of SKILL_KEYS) {
      expect(next[k].rating).toBe(STARTING_RATING);
    }
  });

  it("moves less as samples accumulate", () => {
    expect(learningRate(0)).toBeGreaterThan(learningRate(10));
    expect(learningRate(500)).toBeGreaterThanOrEqual(0.08);
  });

  it("never leaves the 1-100 range", () => {
    let state = initialRatingState();
    for (let i = 0; i < 50; i++) {
      state = applyJudgement(state, scores(0), { confidence: 1, formatWeight: 1 }).next;
    }
    for (const k of SKILL_KEYS) {
      expect(state[k].rating).toBeGreaterThanOrEqual(1);
    }
  });

  it("assigns card tiers at the spec thresholds", () => {
    expect(tierForRating(49).id).toBe("dark");
    expect(tierForRating(50).id).toBe("dark-bronze");
    expect(tierForRating(60).id).toBe("light-bronze");
    expect(tierForRating(70).id).toBe("silver");
    expect(tierForRating(80).id).toBe("dark-gold");
    expect(tierForRating(90).id).toBe("light-gold");
  });

  it("labels low-sample ratings as unreliable", () => {
    expect(reliabilityLabel(0)).toMatch(/placement/i);
    expect(reliabilityLabel(2)).toMatch(/low confidence/i);
    expect(reliabilityLabel(50)).toMatch(/established/i);
  });
});
