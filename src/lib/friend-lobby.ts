/** Friend-over-network lobby + shared round state (Supabase Realtime). */

import { createClient } from "@/lib/supabase/client";
import { getFormat } from "@/lib/formats";
import { drawMotionWithPrefs, drawSide, getMotionById } from "@/lib/motions";
import { getState } from "@/lib/store";
import type { DebateSide, JudgeResult } from "@/lib/types";

export type FriendLobbyStatus =
  | "waiting"
  | "ready"
  | "in_progress"
  | "complete"
  | "abandoned";

export interface FriendSpeech {
  phaseId: string;
  phaseName: string;
  speaker: "host" | "guest";
  side: DebateSide;
  text: string;
  createdAt: number;
}

export interface FriendLobby {
  code: string;
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string;
  status: FriendLobbyStatus;
  format_id: string;
  rated: boolean;
  host_side: DebateSide;
  host_ready: boolean;
  guest_ready: boolean;
  motion_id: string | null;
  motion_text: string | null;
  phase_index: number;
  phase_remaining_sec: number;
  transcript: FriendSpeech[];
  notes: Record<string, string>;
  judgement: JudgeResult | null;
  created_at?: string;
  updated_at?: string;
}

function codeOf(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

function parseLobby(row: Record<string, unknown>): FriendLobby {
  return {
    code: String(row.code),
    host_id: String(row.host_id),
    guest_id: (row.guest_id as string | null) ?? null,
    host_name: String(row.host_name ?? ""),
    guest_name: String(row.guest_name ?? ""),
    status: row.status as FriendLobbyStatus,
    format_id: String(row.format_id ?? "bullet"),
    rated: Boolean(row.rated),
    host_side: (row.host_side as DebateSide) ?? "for",
    host_ready: Boolean(row.host_ready),
    guest_ready: Boolean(row.guest_ready),
    motion_id: (row.motion_id as string | null) ?? null,
    motion_text: (row.motion_text as string | null) ?? null,
    phase_index: Number(row.phase_index ?? 0),
    phase_remaining_sec: Number(row.phase_remaining_sec ?? 0),
    transcript: Array.isArray(row.transcript)
      ? (row.transcript as FriendSpeech[])
      : [],
    notes:
      row.notes && typeof row.notes === "object"
        ? (row.notes as Record<string, string>)
        : {},
    judgement: (row.judgement as JudgeResult | null) ?? null,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

export async function createFriendLobby(opts: {
  displayName: string;
  formatId: string;
  rated: boolean;
}): Promise<FriendLobby> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const format = getFormat(opts.formatId) ?? getFormat("bullet")!;
  const state = getState();
  const downvoted = Object.entries(state.motionVotes)
    .filter(([, v]) => v === "down")
    .map(([id]) => id);
  const motion = drawMotionWithPrefs(
    state.seenMotionIds,
    state.motionPrefs,
    downvoted
  );
  const hostSide = drawSide();
  const code = codeOf();

  const { data, error } = await supabase
    .from("friend_lobbies")
    .insert({
      code,
      host_id: user.id,
      host_name: opts.displayName || user.email || "Host",
      format_id: format.id,
      rated: opts.rated,
      host_side: hostSide,
      motion_id: motion.id,
      motion_text: motion.text,
      phase_index: 0,
      phase_remaining_sec: format.phases[0]?.durationSec ?? 30,
      status: "waiting",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create lobby");
  return parseLobby(data);
}

export async function fetchFriendLobby(
  code: string
): Promise<FriendLobby | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("friend_lobbies")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return null;
  return parseLobby(data);
}

export async function joinFriendLobby(
  code: string,
  displayName: string
): Promise<FriendLobby> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const existing = await fetchFriendLobby(code);
  if (!existing) throw new Error("Lobby not found");
  if (existing.host_id === user.id) return existing;
  if (existing.guest_id === user.id) return existing;
  if (existing.guest_id) throw new Error("Lobby is already full");
  if (existing.status !== "waiting") throw new Error("Lobby is no longer open");

  const { data, error } = await supabase
    .from("friend_lobbies")
    .update({
      guest_id: user.id,
      guest_name: displayName || user.email || "Guest",
      status: "ready",
    })
    .eq("code", code)
    .eq("status", "waiting")
    .is("guest_id", null)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not join lobby");
  return parseLobby(data);
}

export async function patchFriendLobby(
  code: string,
  patch: Partial<{
    host_ready: boolean;
    guest_ready: boolean;
    status: FriendLobbyStatus;
    phase_index: number;
    phase_remaining_sec: number;
    transcript: FriendSpeech[];
    notes: Record<string, string>;
    judgement: JudgeResult | null;
    motion_id: string;
    motion_text: string;
    phase_remaining_sec_force: number;
  }>
): Promise<FriendLobby> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { ...patch };
  delete payload.phase_remaining_sec_force;
  if (patch.phase_remaining_sec_force !== undefined) {
    payload.phase_remaining_sec = patch.phase_remaining_sec_force;
  }

  const { data, error } = await supabase
    .from("friend_lobbies")
    .update(payload)
    .eq("code", code)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not update lobby");
  return parseLobby(data);
}

/** Subscribe to lobby row changes. Returns an unsubscribe function. */
export function subscribeFriendLobby(
  code: string,
  onChange: (lobby: FriendLobby) => void
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`friend-lobby:${code}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friend_lobbies",
        filter: `code=eq.${code}`,
      },
      (payload) => {
        const row = (payload.new ?? payload.old) as Record<string, unknown> | null;
        if (row && row.code) onChange(parseLobby(row));
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function myRole(
  lobby: FriendLobby,
  userId: string | undefined
): "host" | "guest" | null {
  if (!userId) return null;
  if (lobby.host_id === userId) return "host";
  if (lobby.guest_id === userId) return "guest";
  return null;
}

export function mySide(lobby: FriendLobby, role: "host" | "guest"): DebateSide {
  if (role === "host") return lobby.host_side;
  return lobby.host_side === "for" ? "against" : "for";
}

export function opponentName(lobby: FriendLobby, role: "host" | "guest"): string {
  return role === "host" ? lobby.guest_name || "Friend" : lobby.host_name || "Friend";
}

export function myName(lobby: FriendLobby, role: "host" | "guest"): string {
  return role === "host" ? lobby.host_name : lobby.guest_name;
}

/** Map shared lobby into a DebateRecord-shaped payload for the existing judge. */
export function lobbyAsJudgeDebate(lobby: FriendLobby) {
  const motion =
    (lobby.motion_id ? getMotionById(lobby.motion_id) : null) ?? null;
  return {
    id: lobby.code,
    createdAt: Date.now(),
    botSlug: "friend-opponent",
    botName: lobby.guest_name || "Opponent",
    difficulty: "standard" as const,
    formatId: lobby.format_id,
    motionId: lobby.motion_id ?? motion?.id ?? "unknown",
    motionText: lobby.motion_text ?? motion?.text ?? "",
    userSide: lobby.host_side,
    mode: "audio" as const,
    rated: lobby.rated,
    status: "complete" as const,
    phaseIndex: lobby.phase_index,
    phaseRemainingSec: lobby.phase_remaining_sec,
    transcript: lobby.transcript.map((t) => ({
      phaseId: t.phaseId,
      phaseName: t.phaseName,
      speaker: (t.speaker === "host" ? "user" : "bot") as "user" | "bot",
      side: t.side,
      text: t.text,
      createdAt: t.createdAt,
    })),
    notes: "",
  };
}
