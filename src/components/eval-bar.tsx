"use client";

import type { LiveEval } from "@/lib/live-eval";
import { MoveBadge } from "./move-badge";

/**
 * Chess-style evaluation bar for a live debate. Vertical on desktop (like an
 * engine bar beside a board), horizontal on mobile where height is scarce.
 */
export function EvalBar({
  evaluation,
  userName,
  botName,
  compact = false,
}: {
  evaluation: LiveEval;
  userName: string;
  botName: string;
  compact?: boolean;
}) {
  const { userShare, advantage, summary, speeches } = evaluation;
  const sign = advantage > 0 ? "+" : "";

  return (
    <div className="rounded-2xl bg-board p-3 text-ink shadow-lg">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-ink-muted">
        <span className="truncate">{userName}</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e0614f]" />
          Live eval
        </span>
        <span className="truncate">{botName}</span>
      </div>

      {/* The bar itself: user's share fills from the left. */}
      <div
        className="mt-1.5 flex h-3 overflow-hidden rounded-full ring-1 ring-black/10"
        role="meter"
        aria-valuenow={userShare}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Debate evaluation: ${userName} ${userShare}%`}
      >
        <div
          className="bg-[#81b64c] transition-[width] duration-700 ease-out"
          style={{ width: `${userShare}%` }}
        />
        <div className="flex-1 bg-[#3a3835]" />
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <span
          className={`numeric text-sm font-black ${
            advantage > 0 ? "text-[#5d8a3a]" : advantage < 0 ? "text-[#c2483a]" : "text-ink-muted"
          }`}
        >
          {sign}
          {advantage.toFixed(1)}
        </span>
        <span className="text-[11px] font-semibold text-ink-muted">{summary}</span>
      </div>

      {!compact && speeches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-black/10 pt-2">
          {speeches.slice(-6).map((s) => (
            <span
              key={s.index}
              title={`${s.speaker === "user" ? userName : botName}: ${s.reason}`}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-1.5 py-1 shadow-sm"
            >
              <MoveBadge verdict={s.verdict} size="sm" />
              <span className="text-[10px] font-bold text-ink-muted">
                {s.speaker === "user" ? "You" : botName.split(" ")[0]}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
