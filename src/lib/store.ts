"use client";

import { useSyncExternalStore } from "react";
import { initialRatingState, STARTING_RATING } from "./rating";
import type {
  DebateRecord,
  RatingChangeSummary,
  RatingState,
  UserProfile,
} from "./types";

/**
 * Local-first application state (mock backend mode).
 * In production this maps onto the relational schema in docs/DATA_MODEL.md;
 * in mock mode everything lives in localStorage on the player's device so the
 * full product runs with zero credentials. See docs/KNOWN_LIMITATIONS.md.
 */

export interface LessonProgress {
  stepsDone: number;
  completed: boolean;
  completedAt: number | null;
}

export interface PuzzleStats {
  attempts: number;
  correct: number;
  streak: number;
  lastSolvedDay: string | null;
  solved: Record<string, boolean>;
}

export interface WaitlistEntry {
  email: string;
  consent: boolean;
  createdAt: number;
  notified: boolean;
}

export interface AnalysisJob {
  id: string;
  fileName: string;
  sizeMB: number;
  speakers: number;
  language: string;
  /** Index into the pipeline stage list; -1 means failed. */
  stage: number;
  status: "processing" | "ready" | "failed";
  createdAt: number;
}

export interface AppState {
  user: UserProfile | null;
  /** UI theme preference (settings toggle). */
  theme: "dark" | "light";
  /** Logged-out profile kept on device so logging back in restores everything. */
  archivedUser: UserProfile | null;
  /** Chess-style overall rating: fixed ±0.09 per rated win/loss. */
  overallElo: number;
  ratings: RatingState;
  ratingHistory: RatingChangeSummary[];
  debates: DebateRecord[];
  seenMotionIds: string[];
  lessonProgress: Record<string, LessonProgress>;
  guestLessonsCompleted: number;
  puzzles: PuzzleStats;
  waitlist: WaitlistEntry | null;
  favouriteBots: string[];
  recentBots: string[];
  analyses: AnalysisJob[];
  /** Player's thumbs up/down on motions, keyed by motion id. */
  motionVotes: Record<string, "up" | "down">;
  /** Optional motion preferences used when drawing a round. */
  motionPrefs: { category: string | null; maxDifficulty: number | null };
  /** Puzzle attempts used today (capped daily). */
  puzzleDay: string | null;
  puzzleAttemptsToday: number;
}

const STORAGE_KEY = "debate-ch/state/v1";

export function defaultState(): AppState {
  return {
    user: null,
    theme: "dark",
    archivedUser: null,
    overallElo: STARTING_RATING,
    ratings: initialRatingState(),
    ratingHistory: [],
    debates: [],
    seenMotionIds: [],
    lessonProgress: {},
    guestLessonsCompleted: 0,
    puzzles: {
      attempts: 0,
      correct: 0,
      streak: 0,
      lastSolvedDay: null,
      solved: {},
    },
    waitlist: null,
    favouriteBots: [],
    recentBots: [],
    analyses: [],
    motionVotes: {},
    motionPrefs: { category: null, maxDifficulty: null },
    puzzleDay: null,
    puzzleAttemptsToday: 0,
  };
}

let memory: AppState | null = null;
const listeners = new Set<() => void>();
const serverSnapshot = defaultState();

function read(): AppState {
  if (typeof window === "undefined") return serverSnapshot;
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw
      ? { ...defaultState(), ...(JSON.parse(raw) as Partial<AppState>) }
      : defaultState();
  } catch {
    memory = defaultState();
  }
  return memory;
}

function write(next: AppState) {
  memory = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be full or blocked; state stays in memory for the session.
  }
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return read();
}

export function updateState(patch: (state: AppState) => AppState) {
  write(patch(read()));
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook returning live app state. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, read, () => serverSnapshot);
}

const noopSubscribe = () => () => {};

/** True after hydration — false during SSR and the first client render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

// ---------------------------------------------------------------------------
// Convenience mutations

export function saveDebate(debate: DebateRecord) {
  updateState((s) => {
    const others = s.debates.filter((d) => d.id !== debate.id);
    return {
      ...s,
      debates: [debate, ...others].slice(0, 100),
      seenMotionIds: s.seenMotionIds.includes(debate.motionId)
        ? s.seenMotionIds
        : [...s.seenMotionIds, debate.motionId],
      recentBots: [
        debate.botSlug,
        ...s.recentBots.filter((b) => b !== debate.botSlug),
      ].slice(0, 8),
    };
  });
}

export function getDebate(id: string): DebateRecord | null {
  return read().debates.find((d) => d.id === id) ?? null;
}

export function applyRatingChange(
  next: RatingState,
  change: RatingChangeSummary,
  nextOverall: number
) {
  updateState((s) => ({
    ...s,
    ratings: next,
    overallElo: nextOverall,
    ratingHistory: [change, ...s.ratingHistory].slice(0, 200),
  }));
}

export function logOut() {
  updateState((s) => ({ ...s, archivedUser: s.user ?? s.archivedUser, user: null }));
}

/** Restore the archived profile when its email matches. */
export function logBackIn(email: string): boolean {
  const s = getState();
  if (s.archivedUser && s.archivedUser.email === email) {
    updateState((prev) => ({ ...prev, user: prev.archivedUser, archivedUser: null }));
    return true;
  }
  return false;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function recordPuzzleAttempt(puzzleId: string, correct: boolean) {
  updateState((s) => {
    const day = todayKey();
    const alreadySolvedToday = s.puzzles.lastSolvedDay === day;
    return {
      ...s,
      puzzles: {
        attempts: s.puzzles.attempts + 1,
        correct: s.puzzles.correct + (correct ? 1 : 0),
        streak: correct
          ? alreadySolvedToday
            ? s.puzzles.streak
            : s.puzzles.streak + 1
          : 0,
        lastSolvedDay: correct ? day : s.puzzles.lastSolvedDay,
        solved: { ...s.puzzles.solved, [puzzleId]: correct || s.puzzles.solved[puzzleId] === true },
      },
    };
  });
}
