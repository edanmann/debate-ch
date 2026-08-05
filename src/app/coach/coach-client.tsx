"use client";

import { useState } from "react";
import { updateState, useAppState } from "@/lib/store";
import type { BotCardData } from "@/lib/types";
import { BotFace } from "@/components/bot-face";
import RequireAuth from "@/components/require-auth";
import { Badge, Card } from "@/components/ui";

function CoachPicker({ bots }: { bots: BotCardData[] }) {
  const { user } = useAppState();
  const [query, setQuery] = useState("");
  const current = user?.coachSlug ?? null;

  const filtered = bots.filter((b) =>
    b.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate Coach</h1>
      <p className="mt-2 max-w-2xl text-fg-muted">
        Any bot on the roster can coach you — all 45 of them. Your coach helps
        before rounds, gives practice-mode prompts between phases, and turns
        judgements into a training plan. Rated rounds never include hidden live
        help. Change your pick anytime here or in Settings.
      </p>

      <Card className="mt-6 p-4">
        {current ? (
          <p className="text-sm">
            Current coach:{" "}
            <strong>{bots.find((b) => b.slug === current)?.name ?? current}</strong>
          </p>
        ) : (
          <p className="text-sm text-fg-muted">No coach selected yet.</p>
        )}
      </Card>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search coaches…"
        aria-label="Search coaches"
        className="mt-6 w-full max-w-sm rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((bot) => {
          const selected = current === bot.slug;
          return (
            <button
              key={bot.slug}
              type="button"
              onClick={() =>
                updateState((s) => ({
                  ...s,
                  user: s.user && {
                    ...s.user,
                    coachSlug: selected ? null : bot.slug,
                  },
                }))
              }
              aria-pressed={selected}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? "border-brand bg-brand/10"
                  : "border-border-subtle bg-surface-1 hover:border-brand/40"
              }`}
            >
              <BotFace slug={bot.slug} name={bot.name} size={48} />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-bold">
                  {bot.name}
                  {selected && <Badge tone="brand">Coach</Badge>}
                </span>
                <span className="block truncate text-xs text-fg-muted">
                  {bot.archetype}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CoachClient({ bots }: { bots: BotCardData[] }) {
  return (
    <RequireAuth>
      <CoachPicker bots={bots} />
    </RequireAuth>
  );
}
