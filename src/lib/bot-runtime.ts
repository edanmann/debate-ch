import { presentationFor } from "./bot-presentation";
import { quirkFor } from "./bot-reviews";
import type {
  BotProfile,
  DebateSide,
  Difficulty,
  Motion,
  TranscriptEntry,
} from "./types";

/**
 * Mock debate-bot runtime (spec §19) — the MockDebateBotProvider.
 * Composes profile-consistent speeches from the motion's starter contexts and
 * the bot's Bible configuration, without a paid model. Deterministic per
 * debate so replays are stable. A real provider implements the same interface
 * (docs/AI_ARCHITECTURE.md). It never invents statistics or sources.
 */

export interface BotTurnInput {
  bot: BotProfile;
  motion: Motion;
  botSide: DebateSide;
  phaseId: string;
  difficulty: Difficulty;
  transcript: TranscriptEntry[];
  debateId: string;
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: T[], seed: string): T {
  return items[hash(seed) % items.length];
}

function trait(bot: BotProfile, key: string): number {
  return bot.personality.traits[key]?.rating ?? 50;
}

/** A persona-flavoured lead-in derived from Bible personality scalars. */
function personaOpener(bot: BotProfile, seed: string): string {
  const options: string[] = [];
  if (trait(bot, "aggression") >= 70)
    options.push("Let me be direct.", "I will not soften this.");
  if (trait(bot, "formality") >= 70)
    options.push(
      "I want to take this in order.",
      "Allow me to structure this properly."
    );
  if (trait(bot, "confidence") <= 45)
    options.push("I might not say this perfectly, but the idea is sound.", "Let me try to lay this out simply.");
  if (trait(bot, "confidence") >= 80)
    options.push("This round has a clear answer.", "The core of this debate is simpler than it looks.");
  if (options.length === 0) options.push("Here is how I see this round.");
  return pick(options, seed + "opener");
}

/**
 * Occasional trash talk (product decision 2026-07-31). Gated on the Bible's
 * aggression scalar and capped in frequency, and it always targets the
 * argument — never the person (docs/SAFETY_AND_LEGAL.md).
 */
function maybeTrashTalk(bot: BotProfile, seed: string, phaseId: string): string {
  const lines = presentationFor(bot.slug).trashTalk;
  if (!lines || lines.length === 0) return "";
  const aggression = trait(bot, "aggression");
  if (aggression < 55) return "";
  // Never in the opening; roughly a third of eligible later phases.
  if (phaseId.startsWith("opening")) return "";
  const roll = hash(seed + "trash") % 100;
  if (roll >= Math.min(45, aggression / 2)) return "";
  return ` ${pick(lines, seed + "tt")}`;
}

function maybeSaying(bot: BotProfile, seed: string, chanceOutOf10: number): string {
  const humour = trait(bot, "humour");
  const adjusted = Math.round((chanceOutOf10 * humour) / 50);
  if (hash(seed + "saying") % 10 < Math.min(8, adjusted) && bot.humorousStatements.length > 0) {
    const s = pick(bot.humorousStatements, seed);
    return ` ${s.text.trim().replace(/^"|"$/g, "")}`;
  }
  return "";
}

function quotedSnippet(text: string): string {
  const sentence =
    text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 20)
      .sort((a, b) => b.length - a.length)[0] ?? text;
  const words = sentence.trim().split(/\s+/).slice(0, 14).join(" ");
  return words.replace(/[.,;:]$/, "");
}

const DECISION_RULES = [
  "which side leaves the people affected genuinely better off",
  "whether the proposed mechanism actually works in practice",
  "which world is better on balance once trade-offs are counted honestly",
  "who bears the costs when this policy meets reality",
];

function motionSubject(motion: Motion): string {
  return motion.text
    .replace(/^This House (would|believes?|supports?)\s*/i, "")
    .replace(/\.$/, "");
}

export function generateBotTurn(input: BotTurnInput): string {
  const { bot, motion, botSide, phaseId, difficulty, transcript, debateId } = input;
  const seed = `${debateId}:${phaseId}:${bot.slug}`;
  const ownCase = botSide === "for" ? motion.forContext : motion.againstContext;
  const theirCase = botSide === "for" ? motion.againstContext : motion.forContext;
  const stance = botSide === "for" ? "support" : "oppose";
  const lastUser = [...transcript].reverse().find((t) => t.speaker === "user");
  const rule = pick(DECISION_RULES, seed + "rule");
  const subject = motionSubject(motion);

  const isOpening = phaseId.startsWith("opening");
  const isRebuttal = phaseId.startsWith("rebuttal");
  const parts: string[] = [];

  if (isOpening) {
    parts.push(personaOpener(bot, seed));
    parts.push(
      `We ${stance} this motion, and the round should be decided on ${rule}.`
    );
    parts.push(ownCase);
    if (difficulty !== "easy") {
      parts.push(
        `Notice what the other side must prove to win: not that ${subject.toLowerCase()} sounds appealing, but that it survives contact with the real trade-offs.`
      );
    }
    if (difficulty === "legendary") {
      parts.push(
        `And even if you grant them their best case, weigh it: our impact reaches more people, sooner, and with fewer ways to go wrong.`
      );
    }
    parts.push(maybeSaying(bot, seed, 3).trim());
  } else if (isRebuttal || (phaseId.startsWith("closing") && lastUser && difficulty !== "easy")) {
    if (lastUser && difficulty !== "easy") {
      parts.push(
        `You argued that "${quotedSnippet(lastUser.text)}" — but that claim assumes its own mechanism instead of proving it.`
      );
      parts.push(
        `The stronger version of your side says: ${theirCase} Yet even that fails on ${rule}.`
      );
    } else {
      // Easy mode intentionally misses the rebuttal and repeats its case.
      parts.push(`Rather than chase every point, let me restate what decides this round.`);
    }
    parts.push(ownCase);
    if (!phaseId.startsWith("closing")) {
      parts.push(maybeSaying(bot, seed, 4).trim());
    }
    if (phaseId.startsWith("closing")) {
      parts.push(
        `So when you weigh both worlds, ours answers the question of ${rule} — and theirs does not.`
      );
    }
  } else {
    // Closing (or fallback).
    parts.push(
      difficulty === "easy"
        ? `To finish: ${ownCase}`
        : `Strip this debate to its core and one question remains: ${rule}.`
    );
    if (difficulty !== "easy") {
      parts.push(ownCase);
      parts.push(
        `The other side offered reasons, but never explained why their impact outweighs ours. That comparison is the round, and we win it.`
      );
    }
    parts.push(maybeSaying(bot, seed, 5).trim());
  }

  parts.push(maybeTrashTalk(bot, seed, phaseId).trim());

  // A character's signature aside, sparingly — roughly one speech in four.
  const quirk = quirkFor(bot.slug);
  if (quirk && hash(seed + "quirk") % 4 === 0) parts.push(quirk);

  let text = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  // Beginners hedge; low-adaptability bots repeat themselves a little.
  if (trait(bot, "confidence") <= 40 && difficulty !== "legendary") {
    text = text.replace("We support", "I believe we should support").replace("We oppose", "I believe we should oppose");
  }
  return text;
}
