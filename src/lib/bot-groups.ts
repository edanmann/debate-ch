import type { BotCardData } from "./types";

/**
 * Directory grouping and order (product decision 2026-07-31).
 * Progression tiers first, then Custom, then themed rosters.
 */

export const GROUP_ORDER = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Master",
  "Custom",
  "Business Leaders",
  "Politicians",
  "Football Icons",
  "Creators",
  "Political Commentators",
  "Academic Debaters",
] as const;

export type GroupName = (typeof GROUP_ORDER)[number];

/** Explicit member order inside each group, per the product spec. */
const GROUP_MEMBERS: Record<GroupName, string[]> = {
  Beginner: ["raj", "rian", "zak", "mia"],
  Intermediate: ["valentin", "alex", "valentina"],
  Advanced: ["ehan", "jack", "jan", "sophie"],
  Master: ["the-barrister", "the-professor", "the-strategist", "the-diplomat"],
  Custom: ["debate-engine"],
  "Business Leaders": ["elon-musk", "mark-zuckerberg", "steve-jobs", "warren-buffett"],
  Politicians: [
    "donald-trump",
    "barack-obama",
    "vladimir-putin",
    "zohran-mamdani",
    "fidias",
    "margaret-thatcher",
  ],
  "Football Icons": [
    "cristiano-ronaldo",
    "zlatan-ibrahimovic",
    "lionel-messi",
    "jose-mourinho",
  ],
  Creators: ["ishowspeed", "mrbeast", "pewdiepie", "ksi", "niko-omilana"],
  "Political Commentators": [
    "mehdi-hasan",
    "piers-morgan",
    "tucker-carlson",
    "ben-shapiro",
    "jordan-peterson",
  ],
  "Academic Debaters": [
    "udai-kamath",
    "jack-story",
    "mark-rothery",
    "aniket-chakravorty",
    "david-africa",
    "tobi-leung",
  ],
};

export interface BotGroup {
  name: GroupName;
  blurb: string;
  bots: BotCardData[];
}

const BLURBS: Record<GroupName, string> = {
  Beginner: "Learning the shape of an argument — and showing you theirs.",
  Intermediate: "Structured, competent, and starting to bite.",
  Advanced: "Real pressure. They track your case and punish loose claims.",
  Master: "The best in the building. Expect to be outplanned.",
  Custom: "The house engine — no personality, pure debate.",
  "Business Leaders": "First principles, big claims, bigger confidence.",
  Politicians: "Rhetoric built for rooms of thousands.",
  "Football Icons": "Here for fun. Ratings reflect debating, not football.",
  Creators: "Chaotic energy, camera instincts, surprising angles.",
  "Political Commentators": "Trained interrogators. Bring sources.",
  "Academic Debaters": "Circuit-hardened technicians of the format.",
};

export function groupBots(bots: BotCardData[]): BotGroup[] {
  const bySlug = new Map(bots.map((b) => [b.slug, b]));
  const grouped: BotGroup[] = [];
  for (const name of GROUP_ORDER) {
    const members = GROUP_MEMBERS[name]
      .map((slug) => bySlug.get(slug))
      .filter((b): b is BotCardData => Boolean(b));
    if (members.length > 0) {
      grouped.push({ name, blurb: BLURBS[name], bots: members });
    }
  }
  // Anything not explicitly placed (e.g. newly seeded bots) lands in Custom.
  const placed = new Set(Object.values(GROUP_MEMBERS).flat());
  const extras = bots.filter((b) => !placed.has(b.slug));
  if (extras.length > 0) {
    const custom = grouped.find((g) => g.name === "Custom");
    if (custom) custom.bots.push(...extras);
  }
  return grouped;
}
