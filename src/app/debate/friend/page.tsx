"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppState } from "@/lib/store";
import RequireAuth from "@/components/require-auth";
import { buttonClass, Card } from "@/components/ui";

function FriendDebate() {
  const { user } = useAppState();
  const [lobbyId] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID().slice(0, 8) : "lobby"
  );
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/debate/friend?lobby=${lobbyId}`
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; the link is visible for manual copy.
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate a Friend</h1>
      <p className="mt-2 text-fg-muted">
        Private lobby, your rules: custom motion, chosen sides, custom timings,
        rated or casual.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-sm font-semibold">Your invitation link</p>
        <div className="mt-2 flex gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl bg-surface-2 px-3 py-2.5 text-sm">
            {link}
          </code>
          <button type="button" onClick={copy} className={buttonClass("secondary", "md")}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <p className="font-semibold text-warning">Waiting for a second device…</p>
          <p className="mt-1 text-fg-muted">
            Live human-vs-human lobbies need the realtime backend, which is not
            part of this local demo. The lobby link, invitation flow and room
            already work end-to-end against bots — invite {user?.displayName ? "a friend" : "someone"} once
            the hosted version ships.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/bots" className={`${buttonClass("primary", "lg")} flex-1`}>
            Debate a bot instead
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function FriendDebatePage() {
  return (
    <RequireAuth>
      <FriendDebate />
    </RequireAuth>
  );
}
