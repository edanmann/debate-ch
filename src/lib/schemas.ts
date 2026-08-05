import { z } from "zod";
import { SKILL_KEYS } from "./types";

/** Zod validation for Bot Design Bible seed data (spec §15). */

const statDetail = z.object({
  rating: z.number().min(0).max(100),
  explanation: z.string().min(1),
});

const topicRating = z.object({
  topic: z.string(),
  rating: z.number().nullable(),
  explanation: z.string().nullable(),
});

const titledItem = z.object({
  title: z.string(),
  description: z.string().nullable(),
});

const saying = z.object({
  text: z.string(),
  usage: z.string().nullable(),
});

const stringMap = z.record(z.string(), z.string());

export const botProfileSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    category: z.string().min(1),
    archetype: z.string().min(1),
    overallRating: z.number().min(0).max(100).nullable(),
    oneLineSummary: z.string().min(1),
    status: z.enum(["active", "planned", "excluded"]),
    publicStats: z.partialRecord(z.enum(SKILL_KEYS), statDetail),
    personality: z.object({
      summary: z.string().nullable(),
      traits: z.record(
        z.string(),
        z.object({ rating: z.number().nullable(), label: z.string() })
      ),
    }),
    communicationStyle: stringMap,
    argumentationStyle: stringMap,
    rebuttalStyle: stringMap,
    evidenceBehaviour: stringMap,
    strategicBehaviour: stringMap,
    deliveryStyle: stringMap,
    persuasionStyle: stringMap,
    debateStageBehaviour: stringMap,
    conditionalBehaviour: stringMap,
    topicStrengths: z.array(topicRating),
    topicWeaknesses: z.array(topicRating),
    signatureTraits: z.array(titledItem),
    humorousStatements: z.array(saying),
    weaknesses: z.array(titledItem),
    defeatGuide: z.object({
      bestStrategy: z.string().nullable(),
      whatToAvoid: z.string().nullable(),
      bestQuestioningMethod: z.string().nullable(),
      mostVulnerableStatistic: z.string().nullable(),
    }),
    difficultyScaling: z.object({
      easy: z.string().nullable(),
      standard: z.string().nullable(),
      legendary: z.string().nullable(),
    }),
    examples: z.object({
      motion: z.string().nullable(),
      opening: z.string().nullable(),
      rebuttal: z.string().nullable(),
      crossExamQuestion: z.string().nullable(),
      closing: z.string().nullable(),
    }),
    publicDisclaimer: z.string().nullable(),
  })
  .superRefine((bot, ctx) => {
    // Active and planned bots must carry a complete playable profile.
    if (bot.status === "excluded") return;
    if (bot.overallRating == null) {
      ctx.addIssue({ code: "custom", message: `${bot.name}: missing overall rating` });
    }
    for (const key of SKILL_KEYS) {
      if (!bot.publicStats[key]) {
        ctx.addIssue({ code: "custom", message: `${bot.name}: missing stat ${key}` });
      }
    }
    if (!bot.difficultyScaling.standard) {
      ctx.addIssue({ code: "custom", message: `${bot.name}: missing difficulty scaling` });
    }
  });

export const botRosterSchema = z.array(botProfileSchema);

export const motionSchema = z.object({
  id: z.string(),
  text: z.string().min(10),
  category: z.string(),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  ageSuitability: z.enum(["all", "13+", "16+"]),
  factualDependence: z.enum(["low", "medium", "high"]),
  sensitive: z.boolean(),
  requiresCurrentResearch: z.boolean(),
  suggestedDefinitions: z.string(),
  forContext: z.string(),
  againstContext: z.string(),
  learningObjectives: z.array(z.string()),
  status: z.enum(["draft", "approved", "archived"]),
});

export const motionLibrarySchema = z.array(motionSchema);
