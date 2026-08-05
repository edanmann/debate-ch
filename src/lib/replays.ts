import "server-only";
import { generateBotTurn } from "./bot-runtime";
import { getAllBots } from "./bots";
import { getFormat } from "./formats";
import { getMotions } from "./motions";
import type { ReplayDebate, TranscriptEntry } from "./types";

/**
 * Seeded Watch content: simulated exhibition rounds generated deterministically
 * from the mock bot runtime — clearly labelled as simulations (spec §25:
 * never fake real live users or audiences).
 */

const PAIRINGS: [string, string, string][] = [
  ["the-barrister", "sophie", "m-pol-002"],
  ["mehdi-hasan", "ben-shapiro", "m-med-001"],
  ["barack-obama", "margaret-thatcher", "m-econ-002"],
  ["elon-musk", "warren-buffett", "m-tech-001"],
  ["udai-kamath", "jack-story", "m-int-001"],
  ["the-strategist", "the-professor", "m-env-002"],
  ["mrbeast", "ksi", "m-cul-002"],
  ["jan", "valentina", "m-edu-001"],
];

let cache: ReplayDebate[] | null = null;

export function getReplays(): ReplayDebate[] {
  if (cache) return cache;
  const bots = new Map(getAllBots().map((b) => [b.slug, b]));
  const motions = new Map(getMotions().map((m) => [m.id, m]));
  const format = getFormat("blitz")!;

  cache = PAIRINGS.flatMap(([forSlug, againstSlug, motionId], i) => {
    const forBot = bots.get(forSlug);
    const againstBot = bots.get(againstSlug);
    const motion = motions.get(motionId);
    if (!forBot || !againstBot || !motion) return [];
    const id = `replay-${i + 1}`;
    const transcript: TranscriptEntry[] = [];
    let t = 0;
    for (const phase of format.phases) {
      if (phase.kind !== "speech" || !phase.speaker) continue;
      const bot = phase.speaker === "for" ? forBot : againstBot;
      transcript.push({
        phaseId: phase.id,
        phaseName: phase.name,
        speaker: "bot",
        side: phase.speaker,
        text: generateBotTurn({
          bot,
          motion,
          botSide: phase.speaker,
          phaseId: phase.id,
          difficulty: "standard",
          transcript,
          debateId: id,
        }),
        createdAt: (t += 90_000),
      });
    }
    const replay: ReplayDebate = {
      id,
      title: `${forBot.name} vs ${againstBot.name}`,
      motionText: motion.text,
      sideFor: forBot.name,
      sideForSlug: forBot.slug,
      sideAgainst: againstBot.name,
      sideAgainstSlug: againstBot.slug,
      formatId: format.id,
      simulated: true,
      summary: `${forBot.archetype} meets ${againstBot.archetype} over ${motion.category.toLowerCase()}.`,
      transcript,
      keyClashes: [
        "Who carries the burden of proof under this motion",
        "Whether the proposed mechanism survives real-world friction",
        "Which side's impact outweighs on scale and reversibility",
      ],
      judgeSummary:
        (forBot.overallRating ?? 0) >= (againstBot.overallRating ?? 0)
          ? `${forBot.name} edges the round on comparative weighing; ${againstBot.name} wins the evidence exchanges but leaves the central clash unanswered.`
          : `${againstBot.name} takes the round by controlling the decision rule; ${forBot.name} lands the cleaner rebuttals but never weighs them.`,
    };
    return [replay];
  });
  return cache;
}

export function getReplay(id: string): ReplayDebate | null {
  return getReplays().find((r) => r.id === id) ?? null;
}
