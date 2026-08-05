"use client";

import { getState, updateState } from "@/lib/store";
import type { AppState } from "@/lib/store";

/**
 * Client helpers for the hosted account API. When no database is configured
 * the endpoints answer `configured: false` and the app stays device-local —
 * the UI says so rather than pretending progress is synced.
 */

export interface AuthResult {
  ok: boolean;
  /** False when the deployment has no database wired up. */
  configured: boolean;
  message?: string;
  profile?: unknown;
}

/** Everything worth restoring on another device. */
export function syncPayload(s: AppState) {
  return {
    user: s.user,
    theme: s.theme,
    overallElo: s.overallElo,
    ratings: s.ratings,
    ratingHistory: s.ratingHistory,
    debates: s.debates.slice(0, 30),
    seenMotionIds: s.seenMotionIds,
    puzzles: s.puzzles,
    motionVotes: s.motionVotes,
    favouriteBots: s.favouriteBots,
    recentBots: s.recentBots,
  };
}

async function post(path: string, body: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 503 && data?.error === "no-database") {
      return { ok: false, configured: false, message: data.message };
    }
    return {
      ok: res.ok,
      configured: true,
      message: data?.message,
      profile: data?.profile,
    };
  } catch {
    return { ok: false, configured: true, message: "Network error. Try again." };
  }
}

export function signUp(email: string, password: string) {
  return post("/api/auth/signup", {
    email,
    password,
    profile: syncPayload(getState()),
  });
}

export function logIn(email: string, password: string) {
  return post("/api/auth/login", { email, password });
}

export async function logOutServer() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Local sign-out still proceeds.
  }
}

/** Push local progress to the account (fire-and-forget). */
export async function pushProgress() {
  try {
    await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: syncPayload(getState()) }),
    });
  } catch {
    // Offline or demo mode — local state remains the source of truth.
  }
}

/** Merge a server profile into local state after a successful login. */
export function adoptProfile(profile: unknown) {
  if (!profile || typeof profile !== "object") return;
  const p = profile as Partial<AppState>;
  updateState((s) => ({
    ...s,
    ...p,
    // Never let a stale server copy wipe a richer local history.
    debates: (p.debates?.length ?? 0) >= s.debates.length ? p.debates ?? s.debates : s.debates,
    archivedUser: null,
  }));
}
