"use client";

import Link from "next/link";
import { reviewFor } from "@/lib/bot-reviews";
import { coachNameFromSlug } from "@/lib/coach";
import { SKILL_KEYS, SKILL_LABELS, type DebateRecord, type JudgeResult } from "@/lib/types";
import { BotFace } from "./bot-face";
import { buttonClass } from "./ui";

/**
 * The moment right after a round: the opponent reacts in character, the coach
 * stands alongside, and a single big action opens the full line-by-line
 * Debate Review — on its own page, not a popup, so there's room to actually
 * work through the transcript.
 */
export function DebateReview({
  debate,
  botSlug,
  botName,
  coachSlug,
  judgement,
}: {
  debate: DebateRecord;
  botSlug: string;
  botName: string;
  coachSlug: string | null | undefined;
  userDisplayName: string;
  judgement: JudgeResult;
}) {
  const outcome =
    judgement.winner === "user" ? "win" : judgement.winner === "bot" ? "loss" : "draw";
  const line = reviewFor(botSlug, outcome);
  const coachName = coachNameFromSlug(coachSlug);
  const weakest = [...SKILL_KEYS].sort(
    (a, b) => judgement.user.scores[a] - judgement.user.scores[b]
  );

  return (
    <div className="mt-6 rounded-3xl bg-board p-5 text-ink shadow-2xl ring-1 ring-black/10">
      <div className="flex items-start gap-3">
        <BotFace slug={botSlug} name={botName} size={72} speaking className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
            {botName} says
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">“{line}”</p>
        </div>
      </div>

      {coachSlug && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <BotFace slug={coachSlug} name={coachName ?? "Coach"} size={40} className="shrink-0" />
          <p className="text-xs font-medium text-ink-muted">
            <span className="font-black text-ink">{coachName} · your coach:</span>{" "}
            Focus on {SKILL_LABELS[weakest[0]].toLowerCase()} next round — that&apos;s
            where the judge marked you lowest.
          </p>
        </div>
      )}

      <Link
        href={`/debate/results/${debate.id}/review`}
        className={`${buttonClass("primary", "xl")} mt-4 w-full text-lg`}
      >
        📊 Debate review
      </Link>
      <p className="mt-2 text-center text-[11px] font-medium text-ink-muted">
        Free plan includes 3 reviews a day — unlimited during the demo, so go
        ahead.
      </p>
    </div>
  );
}
