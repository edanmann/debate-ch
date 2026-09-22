"use client";

import { createClient } from "@/lib/supabase/client";
import { initialRatingState, STARTING_RATING } from "@/lib/rating";
import {
  defaultState,
  getState,
  updateState,
  type AppState,
  type PuzzleStats,
} from "@/lib/store";
import type {
  DebateRecord,
  RatingChangeSummary,
  RatingState,
  UserProfile,
} from "@/lib/types";

/**
 * Sync local app state with Supabase (profiles, player_state, debates).
 * localStorage remains a cache; the account is the source of truth once signed in.
 */

type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  country: string;
  coach_slug: string | null;
  avatar: UserProfile["avatar"];
  celebration: string;
  created_at: string;
};

type PlayerStateRow = {
  user_id: string;
  overall_elo: number;
  ratings: RatingState;
  rating_history: RatingChangeSummary[];
  seen_motion_ids: string[];
  puzzles: PuzzleStats;
  favourite_bots: string[];
  recent_bots: string[];
  motion_votes: Record<string, "up" | "down">;
  motion_prefs: { category: string | null; maxDifficulty: number | null };
  puzzle_day: string | null;
  puzzle_attempts_today: number;
  guest_lessons_completed: number;
  lesson_progress: AppState["lessonProgress"];
  theme: "dark" | "light";
};

function emptyPuzzles(): PuzzleStats {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    lastSolvedDay: null,
    solved: {},
  };
}

function profileFromRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name ?? "",
    email: row.email ?? "",
    country: row.country ?? "",
    avatar: row.avatar ?? null,
    coachSlug: row.coach_slug,
    celebration: row.celebration || "confetti",
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
  };
}

function playerPayload(s: AppState) {
  return {
    overall_elo: s.overallElo,
    ratings: s.ratings,
    rating_history: s.ratingHistory.slice(0, 200),
    seen_motion_ids: s.seenMotionIds,
    puzzles: s.puzzles,
    favourite_bots: s.favouriteBots,
    recent_bots: s.recentBots,
    motion_votes: s.motionVotes,
    motion_prefs: s.motionPrefs,
    puzzle_day: s.puzzleDay,
    puzzle_attempts_today: s.puzzleAttemptsToday,
    guest_lessons_completed: s.guestLessonsCompleted,
    lesson_progress: s.lessonProgress,
    theme: s.theme,
  };
}

/** Load the signed-in account into local state. Uploads local debates if the server is empty. */
export async function hydrateFromServer(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const [{ data: profile }, { data: player }, { data: debateRows }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("player_state")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("debates")
        .select("record")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(100),
    ]);

  const local = getState();
  const serverDebates = (debateRows ?? [])
    .map((r) => r.record as DebateRecord)
    .filter(Boolean);

  // First login on a browser that already has local history and an empty account.
  if (serverDebates.length === 0 && local.debates.length > 0) {
    await uploadLocalHistory(user.id, local);
  }

  const [{ data: profile2 }, { data: player2 }, { data: debates2 }] =
    serverDebates.length === 0 && local.debates.length > 0
      ? await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase
            .from("player_state")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("debates")
            .select("record")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(100),
        ])
      : [
          { data: profile },
          { data: player },
          { data: debateRows },
        ];

  const p = (profile2 ?? profile) as ProfileRow | null;
  const ps = (player2 ?? player) as PlayerStateRow | null;
  const debates = ((debates2 ?? debateRows) ?? [])
    .map((r) => r.record as DebateRecord)
    .filter(Boolean);

  const userProfile: UserProfile = p
    ? profileFromRow(p)
    : {
        id: user.id,
        displayName: "",
        email: user.email ?? "",
        country: "",
        avatar: null,
        coachSlug: null,
        celebration: "confetti",
        createdAt: Date.now(),
      };

  updateState((s) => ({
    ...s,
    user: userProfile,
    archivedUser: null,
    theme: ps?.theme === "light" ? "light" : s.theme,
    overallElo: typeof ps?.overall_elo === "number" ? ps.overall_elo : STARTING_RATING,
    ratings:
      ps?.ratings && Object.keys(ps.ratings).length > 0
        ? ps.ratings
        : initialRatingState(),
    ratingHistory: Array.isArray(ps?.rating_history) ? ps.rating_history : [],
    debates: debates.length > 0 ? debates : s.debates,
    seenMotionIds: Array.isArray(ps?.seen_motion_ids) ? ps.seen_motion_ids : [],
    puzzles:
      ps?.puzzles && typeof ps.puzzles === "object"
        ? { ...emptyPuzzles(), ...ps.puzzles }
        : emptyPuzzles(),
    favouriteBots: Array.isArray(ps?.favourite_bots) ? ps.favourite_bots : [],
    recentBots: Array.isArray(ps?.recent_bots) ? ps.recent_bots : [],
    motionVotes:
      ps?.motion_votes && typeof ps.motion_votes === "object"
        ? ps.motion_votes
        : {},
    motionPrefs: ps?.motion_prefs ?? { category: null, maxDifficulty: null },
    puzzleDay: ps?.puzzle_day ?? null,
    puzzleAttemptsToday: ps?.puzzle_attempts_today ?? 0,
    guestLessonsCompleted: ps?.guest_lessons_completed ?? 0,
    lessonProgress:
      ps?.lesson_progress && typeof ps.lesson_progress === "object"
        ? ps.lesson_progress
        : {},
  }));

  return true;
}

async function uploadLocalHistory(userId: string, local: AppState) {
  const supabase = createClient();
  if (local.user) {
    await supabase.from("profiles").upsert({
      id: userId,
      display_name: local.user.displayName,
      email: local.user.email || "",
      country: local.user.country || "",
      coach_slug: local.user.coachSlug,
      avatar: local.user.avatar ?? null,
      celebration: local.user.celebration ?? "confetti",
    });
  }
  await supabase.from("player_state").upsert({
    user_id: userId,
    ...playerPayload(local),
  });
  if (local.debates.length > 0) {
    await supabase.from("debates").upsert(
      local.debates.map((d) => ({
        id: d.id,
        user_id: userId,
        status: d.status,
        record: d,
      })),
      { onConflict: "id" }
    );
  }
}

export async function pushProfile(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const s = getState();
  if (!s.user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: s.user.displayName,
    email: s.user.email || user.email || "",
    country: s.user.country || "",
    coach_slug: s.user.coachSlug,
    avatar: s.user.avatar ?? null,
    celebration: s.user.celebration ?? "confetti",
  });
}

export async function pushPlayerState(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("player_state").upsert({
    user_id: user.id,
    ...playerPayload(getState()),
  });
}

export async function pushDebate(debate: DebateRecord): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("debates").upsert({
    id: debate.id,
    user_id: user.id,
    status: debate.status,
    record: debate,
  });
}

/** Fetch one debate from the server when it is missing locally (mid-round refresh). */
export async function fetchDebate(
  debateId: string
): Promise<DebateRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("debates")
    .select("record")
    .eq("id", debateId)
    .maybeSingle();
  if (error || !data?.record) return null;
  const record = data.record as DebateRecord;
  updateState((s) => {
    if (s.debates.some((d) => d.id === record.id)) return s;
    return { ...s, debates: [record, ...s.debates].slice(0, 100) };
  });
  return record;
}

export async function clearServerAccount(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("debates").delete().eq("user_id", user.id);
  await supabase.from("player_state").upsert({
    user_id: user.id,
    ...playerPayload(defaultState()),
  });
  await supabase.from("profiles").upsert({
    id: user.id,
    display_name: "",
    email: user.email ?? "",
    country: "",
    coach_slug: null,
    avatar: null,
    celebration: "confetti",
  });
}
