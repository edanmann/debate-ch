"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/require-auth";
import { buttonClass, Card } from "@/components/ui";
import { FORMATS } from "@/lib/formats";
import {
  createFriendLobby,
  fetchFriendLobby,
  joinFriendLobby,
  subscribeFriendLobby,
  type FriendLobby,
} from "@/lib/friend-lobby";
import { useAppState } from "@/lib/store";

function FriendLobbyInner() {
  const router = useRouter();
  const search = useSearchParams();
  const joinCode = (search.get("lobby") ?? "").trim().toLowerCase();
  const { user } = useAppState();

  const [lobby, setLobby] = useState<FriendLobby | null>(null);
  const [formatId, setFormatId] = useState("bullet");
  const [rated, setRated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = useMemo(() => {
    if (!lobby || typeof window === "undefined") return "";
    return `${window.location.origin}/debate/friend?lobby=${lobby.code}`;
  }, [lobby]);

  // Guest: auto-join when ?lobby= is present.
  useEffect(() => {
    if (!user || !joinCode || lobby) return;
    let cancelled = false;
    setBusy(true);
    void (async () => {
      try {
        const existing = await fetchFriendLobby(joinCode);
        if (cancelled) return;
        if (existing && (existing.host_id === user.id || existing.guest_id === user.id)) {
          setLobby(existing);
          return;
        }
        const joined = await joinFriendLobby(
          joinCode,
          user.displayName || user.email || "Guest"
        );
        if (!cancelled) setLobby(joined);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not join lobby");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, joinCode, lobby]);

  // Realtime updates + auto-enter room when both ready / in progress.
  useEffect(() => {
    if (!lobby) return;
    const unsub = subscribeFriendLobby(lobby.code, setLobby);
    const poll = window.setInterval(() => {
      void fetchFriendLobby(lobby.code).then((row) => {
        if (row) setLobby(row);
      });
    }, 2500);
    return () => {
      unsub();
      window.clearInterval(poll);
    };
  }, [lobby?.code]);

  useEffect(() => {
    if (!lobby) return;
    if (lobby.status === "in_progress" || lobby.status === "complete") {
      router.replace(`/debate/friend/room/${lobby.code}`);
    }
  }, [lobby, router]);

  async function hostCreate() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createFriendLobby({
        displayName: user.displayName || user.email || "Host",
        formatId,
        rated,
      });
      setLobby(created);
      router.replace(`/debate/friend?lobby=${created.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create lobby");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Link remains visible for manual copy.
    }
  }

  async function enterRoom() {
    if (!lobby) return;
    router.push(`/debate/friend/room/${lobby.code}`);
  }

  const iAmHost = Boolean(user && lobby && lobby.host_id === user.id);
  const bothHere = Boolean(lobby?.guest_id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate a Friend</h1>
      <p className="mt-2 text-fg-muted">
        Share a private link. When your friend joins, you both enter the same
        live room on this account stack.
      </p>

      {!lobby && !joinCode && (
        <Card className="mt-6 space-y-4 p-6">
          <label className="block text-sm font-medium">
            Format
            <select
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm"
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
            >
              {FORMATS.filter((f) => ["bullet", "blitz", "rapid"].includes(f.id)).map(
                (f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} · {f.approxTotalLabel}
                  </option>
                )
              )}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rated}
              onChange={(e) => setRated(e.target.checked)}
            />
            Rated round (moves your OVR when you finish)
          </label>
          {error && <p className="text-sm text-blunder">{error}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => void hostCreate()}
            className={`${buttonClass("primary", "lg")} w-full`}
          >
            {busy ? "Creating…" : "Create invite link"}
          </button>
          <Link href="/bots" className={`${buttonClass("secondary", "md")} block text-center`}>
            Debate a bot instead
          </Link>
        </Card>
      )}

      {!lobby && joinCode && (
        <Card className="mt-6 p-6">
          <p className="text-sm text-fg-muted">
            {busy ? "Joining lobby…" : error ?? "Opening lobby…"}
          </p>
          {error && (
            <Link
              href="/debate/friend"
              className={`${buttonClass("secondary", "md")} mt-4 inline-flex`}
            >
              Create your own lobby
            </Link>
          )}
        </Card>
      )}

      {lobby && (
        <Card className="mt-6 space-y-4 p-6">
          <div>
            <p className="text-sm font-semibold">Invitation link</p>
            <div className="mt-2 flex gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
                {inviteLink}
              </code>
              <button
                type="button"
                onClick={() => void copyLink()}
                className={buttonClass("secondary", "md")}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-2/60 p-4 text-sm">
            <p>
              <span className="font-semibold">{lobby.host_name || "Host"}</span>
              {" · "}
              {lobby.host_side.toUpperCase()}
              {iAmHost ? " (you)" : ""}
            </p>
            <p className="mt-1">
              {lobby.guest_id ? (
                <>
                  <span className="font-semibold">
                    {lobby.guest_name || "Guest"}
                  </span>
                  {" · "}
                  {(lobby.host_side === "for" ? "against" : "for").toUpperCase()}
                  {!iAmHost ? " (you)" : ""}
                </>
              ) : (
                <span className="text-fg-muted">Waiting for your friend to open the link…</span>
              )}
            </p>
            <p className="mt-3 text-fg-muted">
              Motion: {lobby.motion_text}
            </p>
            <p className="text-fg-muted">
              Format: {lobby.format_id}
              {lobby.rated ? " · Rated" : " · Casual"}
            </p>
          </div>

          {bothHere ? (
            <button
              type="button"
              onClick={() => void enterRoom()}
              className={`${buttonClass("primary", "lg")} w-full`}
            >
              Enter debate room
            </button>
          ) : (
            <p className="text-sm text-fg-muted">
              Keep this tab open. When they join, you can enter together.
            </p>
          )}

          {error && <p className="text-sm text-blunder">{error}</p>}
        </Card>
      )}
    </div>
  );
}

export default function FriendDebatePage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="p-10 text-sm text-fg-muted">Loading…</div>}>
        <FriendLobbyInner />
      </Suspense>
    </RequireAuth>
  );
}
