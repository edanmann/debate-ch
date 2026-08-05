import type { FormatConfig, PhaseConfig } from "./types";

/**
 * Debate formats as configuration records (spec §12).
 * The source documents disagree on exact Blitz arithmetic; these are the
 * master-prompt prototype defaults. See docs/REQUIREMENTS_AUDIT.md — durations
 * are data, not UI logic, so they can be re-seeded without code changes.
 */

function prep(durationSec: number, coachingAllowed = true): PhaseConfig {
  return {
    id: "prep",
    name: "Preparation",
    kind: "prep",
    speaker: null,
    durationSec,
    interruptionsAllowed: false,
    crossExamination: false,
    coachingAllowed,
  };
}

function speech(
  id: string,
  name: string,
  speaker: "for" | "against",
  durationSec: number
): PhaseConfig {
  return {
    id,
    name,
    kind: "speech",
    speaker,
    durationSec,
    interruptionsAllowed: false,
    crossExamination: false,
    coachingAllowed: false,
  };
}

export const FORMATS: FormatConfig[] = [
  {
    id: "bullet",
    name: "Bullet",
    tagline: "Two minutes of pure instinct.",
    approxTotalLabel: "~2 min",
    rated: true,
    phases: [
      prep(30),
      speech("opening-for", "Opening — For", "for", 30),
      speech("opening-against", "Opening — Against", "against", 30),
      speech("closing-for", "Closing — For", "for", 15),
      speech("closing-against", "Closing — Against", "against", 15),
    ],
  },
  {
    id: "blitz",
    name: "Blitz",
    tagline: "Fast rounds, sharper choices.",
    approxTotalLabel: "~4.5 min",
    rated: true,
    phases: [
      prep(60),
      speech("opening-for", "Opening — For", "for", 60),
      speech("opening-against", "Opening — Against", "against", 60),
      speech("closing-for", "Closing — For", "for", 45),
      speech("closing-against", "Closing — Against", "against", 45),
    ],
  },
  {
    id: "rapid",
    name: "Rapid",
    tagline: "The standard round. Ten focused minutes.",
    approxTotalLabel: "~10 min",
    rated: true,
    phases: [
      prep(120),
      speech("opening-for", "Opening — For", "for", 120),
      speech("opening-against", "Opening — Against", "against", 120),
      speech("closing-for", "Closing — For", "for", 120),
      speech("closing-against", "Closing — Against", "against", 120),
    ],
  },
  {
    id: "classic",
    name: "Classic",
    tagline: "Full preparation, full speeches.",
    approxTotalLabel: "~43 min",
    rated: true,
    phases: [
      prep(900),
      speech("opening-for", "Opening — For", "for", 420),
      speech("opening-against", "Opening — Against", "against", 420),
      speech("closing-for", "Closing — For", "for", 420),
      speech("closing-against", "Closing — Against", "against", 420),
    ],
  },
  {
    id: "marathon",
    name: "Marathon",
    tagline: "Openings, rebuttals, closings — the whole war.",
    approxTotalLabel: "~57 min",
    rated: true,
    phases: [
      prep(900),
      speech("opening-for", "Opening — For", "for", 420),
      speech("opening-against", "Opening — Against", "against", 420),
      speech("rebuttal-for", "Rebuttal — For", "for", 420),
      speech("rebuttal-against", "Rebuttal — Against", "against", 420),
      speech("closing-for", "Closing — For", "for", 420),
      speech("closing-against", "Closing — Against", "against", 420),
    ],
  },
];

/** Rating weight per format — longer rounds give the judge more evidence. */
export const FORMAT_RATING_WEIGHT: Record<string, number> = {
  bullet: 0.4,
  blitz: 0.6,
  rapid: 0.8,
  classic: 1.0,
  marathon: 1.0,
};

export function getFormat(id: string): FormatConfig | null {
  return FORMATS.find((f) => f.id === id) ?? null;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
