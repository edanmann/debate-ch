import rawLessons from "@/data/lessons.json";
import rawPuzzles from "@/data/puzzles.json";
import type { Lesson, Puzzle } from "./types";

/** Lessons and puzzles are public seed content, importable on client and server. */

export const LESSONS = rawLessons as Lesson[];
export const PUZZLES = rawPuzzles as Puzzle[];

export const GUEST_LESSON_LIMIT = 3;

export function getLesson(slug: string): Lesson | null {
  return LESSONS.find((l) => l.slug === slug) ?? null;
}

export function getPuzzle(id: string): Puzzle | null {
  return PUZZLES.find((p) => p.id === id) ?? null;
}

/** Deterministic daily puzzle: rotates through the seed list by date. */
export function getDailyPuzzle(date = new Date()): Puzzle {
  const day = Math.floor(date.getTime() / 86_400_000);
  return PUZZLES[day % PUZZLES.length];
}

export const PUZZLE_TYPE_LABELS: Record<string, string> = {
  "strongest-rebuttal": "Choose the strongest rebuttal",
  "missing-mechanism": "Find the missing mechanism",
  "logical-fallacy": "Spot the fallacy",
  "best-evidence": "Select the best evidence",
  "improve-argument": "Improve the argument",
  "cross-exam-question": "Pick the decisive question",
  "rank-impacts": "Rank the impacts",
  "central-clash": "Identify the central clash",
  "repair-definition": "Repair the definition",
  "closing-comparison": "Choose the closing comparison",
};
