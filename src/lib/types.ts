/** Shared domain types for Debates.ch. */

export const SKILL_KEYS = [
  "argumentation",
  "rebuttal",
  "evidence",
  "strategy",
  "delivery",
  "persuasion",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  argumentation: "Argumentation",
  rebuttal: "Rebuttal",
  evidence: "Evidence",
  strategy: "Strategy",
  delivery: "Delivery",
  persuasion: "Persuasion",
};

export type BotStatus = "active" | "planned" | "excluded";
export type Difficulty = "easy" | "standard" | "legendary";
export type DebateSide = "for" | "against";

export interface StatDetail {
  rating: number;
  explanation: string;
}

export interface TopicRating {
  topic: string;
  rating: number | null;
  explanation: string | null;
}

export interface TitledItem {
  title: string;
  description: string | null;
}

export interface SignatureSaying {
  text: string;
  usage: string | null;
}

export interface BotProfile {
  name: string;
  slug: string;
  category: string;
  archetype: string;
  overallRating: number | null;
  oneLineSummary: string;
  status: BotStatus;
  publicStats: Partial<Record<SkillKey, StatDetail>>;
  personality: {
    summary: string | null;
    traits: Record<string, { rating: number | null; label: string }>;
  };
  communicationStyle: Record<string, string>;
  argumentationStyle: Record<string, string>;
  rebuttalStyle: Record<string, string>;
  evidenceBehaviour: Record<string, string>;
  strategicBehaviour: Record<string, string>;
  deliveryStyle: Record<string, string>;
  persuasionStyle: Record<string, string>;
  debateStageBehaviour: Record<string, string>;
  conditionalBehaviour: Record<string, string>;
  topicStrengths: TopicRating[];
  topicWeaknesses: TopicRating[];
  signatureTraits: TitledItem[];
  humorousStatements: SignatureSaying[];
  weaknesses: TitledItem[];
  defeatGuide: {
    bestStrategy: string | null;
    whatToAvoid: string | null;
    bestQuestioningMethod: string | null;
    mostVulnerableStatistic: string | null;
  };
  difficultyScaling: {
    easy: string | null;
    standard: string | null;
    legendary: string | null;
  };
  examples: {
    motion: string | null;
    opening: string | null;
    rebuttal: string | null;
    crossExamQuestion: string | null;
    closing: string | null;
  };
  publicDisclaimer: string | null;
}

/** Trimmed shape shipped to client components for directory cards/filtering. */
export interface BotCardData {
  slug: string;
  name: string;
  category: string;
  archetype: string;
  overallRating: number | null;
  oneLineSummary: string;
  status: BotStatus;
  stats: Record<SkillKey, number> | null;
  signatureTraits: string[];
  mainWeakness: string | null;
  isRealPersonSimulation: boolean;
}

// ---------------------------------------------------------------------------
// Formats and timer engine

export type PhaseKind = "prep" | "speech";

export interface PhaseConfig {
  id: string;
  name: string;
  kind: PhaseKind;
  /** Which side speaks; null for preparation (both prepare privately). */
  speaker: DebateSide | null;
  durationSec: number;
  interruptionsAllowed: boolean;
  crossExamination: boolean;
  coachingAllowed: boolean;
}

export interface FormatConfig {
  id: string;
  name: string;
  tagline: string;
  approxTotalLabel: string;
  rated: boolean;
  phases: PhaseConfig[];
}

// ---------------------------------------------------------------------------
// Motions

export interface Motion {
  id: string;
  text: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  ageSuitability: "all" | "13+" | "16+";
  factualDependence: "low" | "medium" | "high";
  sensitive: boolean;
  requiresCurrentResearch: boolean;
  suggestedDefinitions: string;
  forContext: string;
  againstContext: string;
  learningObjectives: string[];
  status: "draft" | "approved" | "archived";
}

// ---------------------------------------------------------------------------
// Debates

export interface TranscriptEntry {
  phaseId: string;
  phaseName: string;
  speaker: "user" | "bot";
  side: DebateSide;
  text: string;
  createdAt: number;
}

export type DebateStatus = "in-progress" | "complete" | "abandoned";

export interface DebateRecord {
  id: string;
  createdAt: number;
  botSlug: string;
  botName: string;
  difficulty: Difficulty;
  formatId: string;
  motionId: string;
  motionText: string;
  userSide: DebateSide;
  /** Audio or video round — there are no text debates. */
  mode: "audio" | "video";
  rated: boolean;
  status: DebateStatus;
  phaseIndex: number;
  phaseRemainingSec: number;
  transcript: TranscriptEntry[];
  notes: string;
  judgement?: JudgeResult;
  ratingChange?: RatingChangeSummary;
}

// ---------------------------------------------------------------------------
// Judging

export interface SideScores {
  scores: Record<SkillKey, number>;
  overall: number;
  reasons: Record<SkillKey, string>;
}

export interface JudgeResult {
  winner: "user" | "bot" | "too-close";
  confidence: number; // 0..1
  explanation: string;
  user: SideScores;
  bot: SideScores;
  strongestUserArgument: string;
  strongestBotArgument: string;
  mostImportantMissedRebuttal: string;
  bestEvidenceUse: string;
  unsupportedClaims: string;
  strategicTurningPoint: string;
  deliveryNotes: string;
  timeManagement: string;
  nextSteps: string[];
  recommendedLessonSlug: string | null;
  recommendedPuzzleType: string | null;
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Ratings

export interface SkillRating {
  rating: number;
  samples: number;
}

export type RatingState = Record<SkillKey, SkillRating>;

export interface RatingChangeSummary {
  debateId: string;
  createdAt: number;
  perSkill: Record<
    SkillKey,
    { previous: number; next: number; delta: number; explanation: string }
  >;
  previousOverall: number;
  nextOverall: number;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Users

export type ExperienceLevel =
  | "new"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "competitive";

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  country: string;
  /** Cartoon avatar chosen in onboarding; null until the builder runs. */
  avatar?: import("@/components/cartoon-avatar").AvatarConfig | null;
  coachSlug: string | null;
  /** Celebration played when a round is won. */
  celebration?: string;
  createdAt: number;
  /** Legacy onboarding fields, retained so old saved profiles still parse. */
  experience?: ExperienceLevel;
  goals?: string[];
  preferredLengthId?: string;
}

// ---------------------------------------------------------------------------
// Lessons and puzzles

export type LessonStep =
  | { kind: "explain"; heading: string; body: string }
  | {
      kind: "question";
      prompt: string;
      choices: string[];
      answerIndex: number;
      explanation: string;
    };

export interface Lesson {
  slug: string;
  track: string;
  title: string;
  objective: string;
  minutes: number;
  steps: LessonStep[];
  nextLessonSlug: string | null;
}

export interface PuzzleChoice {
  text: string;
  explanation: string;
}

export interface Puzzle {
  id: string;
  type: string;
  skill: SkillKey;
  category: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  context: string | null;
  choices: PuzzleChoice[];
  answerIndex: number;
}

// ---------------------------------------------------------------------------
// Replays (seeded watch content)

export interface ReplayDebate {
  id: string;
  title: string;
  motionText: string;
  sideFor: string;
  sideForSlug: string;
  sideAgainst: string;
  sideAgainstSlug: string;
  formatId: string;
  simulated: true;
  summary: string;
  transcript: TranscriptEntry[];
  keyClashes: string[];
  judgeSummary: string;
}
