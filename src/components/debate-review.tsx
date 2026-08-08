"use client";

import { useState } from "react";
import { reviewFor } from "@/lib/bot-reviews";
import { coachNameFromSlug } from "@/lib/coach";
import { SKILL_KEYS, SKILL_LABELS, type JudgeResult } from "@/lib/types";
import { BotFace } from "./bot-face";
import { buttonClass } from "./ui";

/**
 * The moment right after a round: the opponent reacts in character, the coach
 * stands alongside, and a single big action opens the full breakdown.
 */
export function DebateReview({
  botSlug,
  botName,
  coachSlug,
  judgement,
}: {
  botSlug: string;
  botName: string;
  coachSlug: string | null | undefined;
  judgement: JudgeResult;
}) {
  const [open, setOpen] = useState(false);
  const outcome =
    judgement.winner === "user" ? "win" : judgement.winner === "bot" ? "loss" : "draw";
  const line = reviewFor(botSlug, outcome);
  const coachName = coachNameFromSlug(coachSlug);
  const weakest = [...SKILL_KEYS].sort(
    (a, b) => judgement.user.scores[a] - judgement.user.scores[b]
  );

  return (
    <>
      {/* In-character reaction */}
      <div className="mt-6 rounded-3xl bg-board p-5 text-ink shadow-2xl ring-1 ring-black/10">
        <div className="flex items-start gap-3">
          <BotFace slug={botSlug} name={botName} size={72} speaking className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
              {botName} says
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-snug">
              “{line}”
            </p>
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

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${buttonClass("primary", "xl")} mt-4 w-full text-lg`}
        >
          📊 Debate review
        </button>
        <p className="mt-2 text-center text-[11px] font-medium text-ink-muted">
          Free plan includes 3 reviews a day — unlimited during the demo, so go
          ahead.
        </p>
      </div>

      {/* Full breakdown */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Debate review"
          onClick={() => setOpen(false)}
        >
          <div
            className="my-8 w-full max-w-lg rounded-3xl bg-board p-5 text-ink shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <BotFace
                slug={coachSlug ?? botSlug}
                name={coachName ?? botName}
                size={52}
                speaking
              />
              <div>
                <p className="text-lg font-black">Debate review</p>
                <p className="text-xs font-semibold text-ink-muted">
                  with {coachName ?? botName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close review"
                className="ml-auto rounded-lg px-2 py-1 text-ink-muted hover:bg-board-2"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
                The verdict
              </p>
              <p className="mt-1 text-sm">{judgement.explanation}</p>
            </div>

            <div className="mt-3 grid gap-2">
              {SKILL_KEYS.map((k) => (
                <div key={k} className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="flex items-center justify-between text-sm font-bold">
                    {SKILL_LABELS[k]}
                    <span className="numeric text-[#5d8a3a]">
                      {judgement.user.scores[k]}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {judgement.user.reasons[k]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
                Do this next
              </p>
              <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs text-ink-muted">
                {judgement.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>

            <p className="mt-3 text-[10px] text-ink-muted">{judgement.disclaimer}</p>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className={`${buttonClass("primary", "lg")} mt-4 w-full`}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
