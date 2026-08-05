import { describe, expect, it } from "vitest";
import rawBots from "@/data/bots.public.json";
import rawMotions from "@/data/motions.json";
import { botRosterSchema, motionLibrarySchema } from "../schemas";
import { SKILL_KEYS } from "../types";

describe("Bot Design Bible seed data", () => {
  const roster = botRosterSchema.parse(rawBots);

  it("contains the full 48-concept roster", () => {
    expect(roster).toHaveLength(48);
  });

  it("has 45 active, 2 planned, 1 excluded — matching the Bible", () => {
    const by = (s: string) => roster.filter((b) => b.status === s);
    expect(by("active")).toHaveLength(45);
    expect(by("planned").map((b) => b.slug).sort()).toEqual([
      "emmanuel-macron",
      "zohran-mamdani",
    ]);
    expect(by("excluded").map((b) => b.slug)).toEqual(["kim-jong-un"]);
  });

  it("gives every active bot complete public stats and playable content", () => {
    for (const bot of roster.filter((b) => b.status === "active")) {
      expect(bot.overallRating, bot.name).toBeGreaterThan(0);
      for (const key of SKILL_KEYS) {
        expect(bot.publicStats[key]?.rating, `${bot.name}:${key}`).toBeTypeOf("number");
      }
      expect(bot.difficultyScaling.standard, bot.name).toBeTruthy();
      expect(bot.signatureTraits.length, bot.name).toBeGreaterThanOrEqual(3);
      expect(bot.humorousStatements.length, bot.name).toBeGreaterThanOrEqual(3);
      expect(bot.examples.opening, bot.name).toBeTruthy();
    }
  });

  it("keeps roster ratings inside the Bible's published bounds", () => {
    for (const bot of roster) {
      if (bot.overallRating != null) {
        expect(bot.overallRating).toBeGreaterThanOrEqual(1);
        expect(bot.overallRating).toBeLessThanOrEqual(94);
      }
    }
  });

  it("spot-checks known roster ratings from the Bible", () => {
    const by = new Map(roster.map((b) => [b.slug, b]));
    expect(by.get("raj")?.overallRating).toBe(38);
    expect(by.get("the-strategist")?.overallRating).toBe(94);
    expect(by.get("mehdi-hasan")?.overallRating).toBe(93);
    expect(by.get("elon-musk")?.overallRating).toBe(83);
  });

  it("keeps Trump's evidence stat low (product decision)", () => {
    const trump = roster.find((b) => b.slug === "donald-trump")!;
    expect(trump.publicStats.evidence!.rating).toBeLessThan(40);
  });

  it("carries no simulation disclaimers on any bot", () => {
    for (const bot of roster) {
      expect(bot.publicDisclaimer, bot.name).toBeNull();
    }
  });

  it("applies the casual-fun rating overrides (user decision, see audit §13)", () => {
    const by = new Map(roster.map((b) => [b.slug, b]));
    expect(by.get("cristiano-ronaldo")?.overallRating).toBe(58);
    expect(by.get("lionel-messi")?.overallRating).toBe(52);
    expect(by.get("ksi")?.overallRating).toBe(58);
    expect(by.get("niko-omilana")?.overallRating).toBe(60);
  });

  it("renames Zakaria to Zak and keeps Sophie's cat-chaos persona", () => {
    const by = new Map(roster.map((b) => [b.slug, b]));
    expect(by.get("zak")?.name).toBe("Zak");
    expect(by.get("zakaria")).toBeUndefined();
    expect(by.get("sophie")?.archetype.toLowerCase()).toContain("cat");
  });
});

describe("motion library", () => {
  const motions = motionLibrarySchema.parse(rawMotions);

  it("seeds at least 30 approved motions", () => {
    expect(motions.filter((m) => m.status === "approved").length).toBeGreaterThanOrEqual(30);
  });

  it("covers at least 10 categories with both starter contexts", () => {
    const cats = new Set(motions.map((m) => m.category));
    expect(cats.size).toBeGreaterThanOrEqual(10);
    for (const m of motions) {
      expect(m.forContext.length, m.id).toBeGreaterThan(20);
      expect(m.againstContext.length, m.id).toBeGreaterThan(20);
    }
  });
});
