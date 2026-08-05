import "server-only";
import rawBots from "@/data/bots.public.json";
import { botRosterSchema } from "./schemas";
import { FLAGS } from "./flags";
import { SKILL_KEYS, type BotCardData, type BotProfile, type SkillKey } from "./types";

/**
 * Server-side access to the validated bot roster.
 * Seed data is generated from the Bot Design Bible (see scripts/README in docs).
 */

let cache: BotProfile[] | null = null;

export function getAllBots(): BotProfile[] {
  if (!cache) {
    cache = botRosterSchema.parse(rawBots) as BotProfile[];
  }
  return cache;
}

/** Bots that may ever be shown publicly. Excluded concepts are never rendered. */
export function getVisibleBots(): BotProfile[] {
  return getAllBots().filter(
    (b) =>
      b.status === "active" || (b.status === "planned" && FLAGS.plannedBots)
  );
}

export function getActiveBots(): BotProfile[] {
  return getAllBots().filter((b) => b.status === "active");
}

export function getBotBySlug(slug: string): BotProfile | null {
  const bot = getAllBots().find((b) => b.slug === slug);
  if (!bot || bot.status === "excluded") return null;
  if (bot.status === "planned" && !FLAGS.plannedBots) return null;
  return bot;
}

export function isRealPersonSimulation(bot: BotProfile): boolean {
  return (
    !bot.category.startsWith("Fictional Progression") && bot.category !== "Custom"
  );
}

export function toCardData(bot: BotProfile): BotCardData {
  const stats = {} as Record<SkillKey, number>;
  let complete = true;
  for (const key of SKILL_KEYS) {
    const s = bot.publicStats[key];
    if (!s) {
      complete = false;
      break;
    }
    stats[key] = s.rating;
  }
  return {
    slug: bot.slug,
    name: bot.name,
    category: bot.category,
    archetype: bot.archetype,
    overallRating: bot.overallRating,
    oneLineSummary: bot.oneLineSummary,
    status: bot.status,
    stats: complete ? stats : null,
    signatureTraits: bot.signatureTraits.map((t) => t.title),
    mainWeakness: bot.weaknesses[0]?.title ?? null,
    isRealPersonSimulation: isRealPersonSimulation(bot),
  };
}

export function getBotCards(): BotCardData[] {
  return getVisibleBots().map(toCardData);
}

/** Grouped categories in roster order, for directory sections and filters. */
export function getBotCategories(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const bot of getVisibleBots()) {
    const cat = bot.category.replace(" - Planned", "");
    if (!seen.has(cat)) {
      seen.add(cat);
      out.push(cat);
    }
  }
  return out;
}
