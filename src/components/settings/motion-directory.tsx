"use client";

import { useMemo, useState } from "react";
import { updateState, useAppState } from "@/lib/store";
import type { Motion } from "@/lib/types";

/**
 * Motion directory: browse the full library, rate motions up or down, and set
 * optional topic / difficulty preferences that bias the motion drawn for a
 * round. Preferences are deliberately optional — leaving them unset keeps the
 * app's own random draw.
 */
export function MotionDirectory({ motions }: { motions: Motion[] }) {
  const { motionVotes, motionPrefs } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(motions.map((m) => m.category))].sort(),
    [motions]
  );

  const shown = motions.filter((m) => {
    if (category !== "all" && m.category !== category) return false;
    if (query && !m.text.toLowerCase().includes(query.trim().toLowerCase()))
      return false;
    return true;
  });

  function vote(id: string, dir: "up" | "down") {
    updateState((s) => {
      const next = { ...s.motionVotes };
      if (next[id] === dir) delete next[id];
      else next[id] = dir;
      return { ...s, motionVotes: next };
    });
  }

  function setPref(patch: Partial<typeof motionPrefs>) {
    updateState((s) => ({ ...s, motionPrefs: { ...s.motionPrefs, ...patch } }));
  }

  return (
    <div>
      <div className="rounded-2xl bg-surface-2 p-4">
        <p className="text-sm font-bold">Preferences (optional)</p>
        <p className="mt-1 text-xs text-fg-muted">
          Leave these unset and the app picks freely, as in a real tournament.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-fg-muted">
              Topic
            </span>
            <select
              value={motionPrefs.category ?? ""}
              onChange={(e) => setPref({ category: e.target.value || null })}
              className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">Any topic</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs font-bold uppercase tracking-wide text-fg-muted">
              Max difficulty
            </span>
            <select
              value={motionPrefs.maxDifficulty ?? ""}
              onChange={(e) =>
                setPref({ maxDifficulty: e.target.value ? Number(e.target.value) : null })
              }
              className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">Any difficulty</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{"★".repeat(d)}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search motions…"
          aria-label="Search motions"
          className="w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option value="all">All topics</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-fg-muted">
        {shown.length} motion{shown.length === 1 ? "" : "s"} · your ratings help
        surface the good ones
      </p>

      <div className="mt-2 max-h-96 space-y-2 overflow-y-auto pr-1">
        {shown.map((m) => {
          const v = motionVotes[m.id];
          return (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-1 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{m.text}</p>
                <p className="mt-0.5 text-xs text-fg-muted">
                  {m.category} · {"★".repeat(m.difficulty)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => vote(m.id, "up")}
                  aria-pressed={v === "up"}
                  aria-label="Good motion"
                  className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                    v === "up" ? "bg-brand text-white" : "bg-surface-3 text-fg-muted hover:bg-surface-hover"
                  }`}
                >
                  👍
                </button>
                <button
                  type="button"
                  onClick={() => vote(m.id, "down")}
                  aria-pressed={v === "down"}
                  aria-label="Bad motion"
                  className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                    v === "down" ? "bg-danger text-white" : "bg-surface-3 text-fg-muted hover:bg-surface-hover"
                  }`}
                >
                  👎
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
