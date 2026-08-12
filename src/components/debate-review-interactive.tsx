"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildLineReview, type ReviewTurn } from "@/lib/debate-line-review";
import { coachIntroFor, reviewFor } from "@/lib/bot-reviews";
import { coachNameFromSlug } from "@/lib/coach";
import type { DebateRecord, JudgeResult } from "@/lib/types";
import { BotFace } from "./bot-face";
import { UserFace } from "./user-face";
import { MoveBadge, type SpeechVerdict } from "./move-badge";
import { buttonClass } from "./ui";

/**
 * The real Debate Review — three stages, exactly like the one on debates.ch:
 * the result, a summary of the whole round, then a line-by-line dissection
 * where every speech is graded like a chess move and the evaluation bar
 * moves with it. Built on the actual transcript via {@link buildLineReview},
 * so every verdict here matches what the live bar showed during the round.
 */

/** Evaluation history: green area is the user's share of the round. */
function EvalGraph({ turns, upTo }: { turns: ReviewTurn[]; upTo: number }) {
  const W = 300;
  const H = 74;
  const PAD = 7;
  const n = turns.length;
  const x = (i: number) => (n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - PAD * 2));
  const y = (e: number) => H * (1 - (e + 1) / 2);

  const curve = turns.map((t, i) => `${x(i)},${y(t.evaluation)}`).join(" ");
  const area = n === 0 ? "" : `${PAD},${H} ${curve} ${W - PAD},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="presentation" aria-hidden>
      <rect width={W} height={H} rx="6" fill="#4a4843" />
      {area && <polygon points={area} fill="#81b64c" />}
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
      {upTo >= 0 && n > 0 && (
        <line
          x1={x(upTo)}
          y1="0"
          x2={x(upTo)}
          y2={H}
          stroke="#ffffff"
          strokeWidth="1.5"
          className="transition-all duration-300"
        />
      )}
      {turns.map((t, i) => (
        <circle
          key={t.index}
          cx={x(i)}
          cy={y(t.evaluation)}
          r={i === upTo ? 5 : 3.5}
          fill={
            t.verdict === "brilliant"
              ? "#26c2a3"
              : t.verdict === "great"
                ? "#4fa8e0"
                : t.verdict === "blunder"
                  ? "#e0614f"
                  : t.verdict === "mistake"
                    ? "#e08c3d"
                    : "#f2f0e9"
          }
          stroke="#ffffff"
          strokeWidth={i === upTo ? 1.6 : 0}
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
}

/** Live position after the selected turn, in the engine-bar idiom. */
function EvalBar({
  evaluation,
  userDisplayName,
  botName,
}: {
  evaluation: number;
  userDisplayName: string;
  botName: string;
}) {
  const userShare = ((evaluation + 1) / 2) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-ink-muted">
        <span className="truncate">{userDisplayName}</span>
        <span className="truncate">{botName}</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#4a4843]">
        <div
          className="h-full rounded-full bg-[#81b64c] transition-[width] duration-500 ease-out"
          style={{ width: `${userShare}%` }}
        />
      </div>
    </div>
  );
}

function RestartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1 rounded-lg bg-board-2 px-2 py-1 text-[11px] font-bold text-ink-muted transition-colors hover:bg-white"
    >
      <span aria-hidden>↺</span> Start over
    </button>
  );
}

function Bubble({
  slug,
  name,
  children,
}: {
  slug: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <BotFace slug={slug} name={name} size={52} speaking className="shrink-0" />
      <div className="relative min-w-0 flex-1 rounded-2xl bg-white p-3 shadow-sm">
        <span className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-white" aria-hidden />
        <div className="relative text-[12px] font-medium leading-snug">{children}</div>
      </div>
    </div>
  );
}

const RESULT_VERDICTS: SpeechVerdict[] = ["brilliant", "great", "blunder"];

export function DebateReviewInteractive({
  debate,
  judgement,
  botSlug,
  botName,
  coachSlug,
  userDisplayName,
}: {
  debate: DebateRecord;
  judgement: JudgeResult;
  botSlug: string;
  botName: string;
  coachSlug: string | null | undefined;
  userDisplayName: string;
}) {
  const { turns, counts } = useMemo(() => buildLineReview(debate), [debate]);
  const [stage, setStage] = useState<"result" | "summary" | "review">("result");
  const [index, setIndex] = useState(0);
  const activeLine = useRef<HTMLLIElement>(null);

  const narratorSlug = coachSlug ?? botSlug;
  const narratorName = coachNameFromSlug(coachSlug) ?? botName;

  useEffect(() => {
    activeLine.current?.scrollIntoView({ block: "nearest" });
  }, [index, stage]);

  if (turns.length === 0) {
    return (
      <div className="rounded-3xl bg-board p-5 text-center text-ink shadow-2xl ring-1 ring-black/10">
        <p className="text-sm font-semibold text-ink-muted">
          No speeches were recorded this round, so there&apos;s nothing to review.
        </p>
      </div>
    );
  }

  const turn = turns[Math.min(index, turns.length - 1)];
  const outcome =
    judgement.winner === "user" ? "win" : judgement.winner === "bot" ? "loss" : "draw";

  const restart = () => {
    setStage("result");
    setIndex(0);
  };

  return (
    <div className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5">
      {/* ---------------------------------------------------------------- */}
      {stage === "result" && (
        <div>
          <p className="text-center text-xl font-black">
            {judgement.winner === "too-close"
              ? "Too close to call"
              : judgement.winner === "user"
                ? "You win"
                : `${botName} wins`}
          </p>
          <p className="text-center text-xs font-bold text-ink-muted">{debate.motionText}</p>

          <div className="mt-3 flex items-start justify-center gap-8">
            <div className="text-center">
              <UserFace size={56} name={userDisplayName} />
              <p className="mt-1 truncate text-xs font-bold">{userDisplayName}</p>
              <p
                className={`numeric mt-1 rounded-lg px-3 py-1 text-lg font-black ${
                  judgement.winner === "user" ? "bg-[#81b64c] text-white" : "bg-board-2"
                }`}
              >
                {judgement.user.overall}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-ink-muted">
                Total score
              </p>
            </div>
            <div className="text-center">
              <BotFace slug={botSlug} name={botName} size={56} />
              <p className="mt-1 truncate text-xs font-bold">{botName}</p>
              <p
                className={`numeric mt-1 rounded-lg px-3 py-1 text-lg font-black ${
                  judgement.winner === "bot" ? "bg-[#81b64c] text-white" : "bg-board-2"
                }`}
              >
                {judgement.bot.overall}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-ink-muted">
                Total score
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Bubble slug={botSlug} name={botName}>
              “{reviewFor(botSlug, outcome)}”
            </Bubble>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {RESULT_VERDICTS.map((v) => {
              const c = counts.find((x) => x.verdict === v)!;
              return (
                <div key={v} className="rounded-xl bg-white p-2 text-center shadow-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveBadge verdict={v} size="sm" />
                    <span className="numeric text-lg font-black">{c.user + c.bot}</span>
                  </span>
                  <p className="text-[10px] font-bold text-ink-muted">{c.label}</p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStage("summary")}
            className={`${buttonClass("primary", "lg")} mt-3 w-full`}
          >
            Debate Review
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {stage === "summary" && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <RestartButton onClick={restart} />
            <p className="text-sm font-black">Debate Review</p>
            <span className="w-[5.25rem]" aria-hidden />
          </div>
          <div className="mt-3">
            <Bubble slug={narratorSlug} name={narratorName}>
              {coachIntroFor(coachSlug) ?? judgement.explanation}
            </Bubble>
          </div>

          <div className="mt-3 rounded-2xl bg-white p-2.5 shadow-sm">
            <EvalGraph turns={turns} upTo={-1} />
          </div>

          <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-[1fr_3rem_3rem] items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink-muted">
              <span>Speakers</span>
              <span className="truncate text-center">{userDisplayName}</span>
              <span className="truncate text-center">{botName}</span>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_3rem_3rem] items-center gap-2">
              <span className="text-[11px] font-semibold">Total score</span>
              <span
                className={`numeric rounded-lg py-1 text-center text-xs font-black ${
                  judgement.winner === "user" ? "bg-[#81b64c] text-white" : "bg-board-2"
                }`}
              >
                {judgement.user.overall}
              </span>
              <span
                className={`numeric rounded-lg py-1 text-center text-xs font-black ${
                  judgement.winner === "bot" ? "bg-[#81b64c] text-white" : "bg-board-2"
                }`}
              >
                {judgement.bot.overall}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 border-t border-[#e6e4db] pt-2">
              {counts.map((c) => (
                <div key={c.verdict} className="grid grid-cols-[1fr_3rem_3rem] items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <MoveBadge verdict={c.verdict} size="sm" />
                    {c.label}
                  </span>
                  <span className="numeric text-center text-xs font-black">{c.user}</span>
                  <span className="numeric text-center text-xs font-black">{c.bot}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStage("review");
              setIndex(0);
            }}
            className={`${buttonClass("primary", "lg")} mt-3 w-full`}
          >
            Start Review
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {stage === "review" && (
        <div>
          <div className="flex items-center justify-between gap-2">
            <RestartButton onClick={restart} />
            <p className="text-sm font-black">Debate Review</p>
            <button
              type="button"
              onClick={() => setStage("summary")}
              className="shrink-0 text-[11px] font-bold text-ink-muted underline underline-offset-2"
            >
              Summary
            </button>
          </div>

          <div className="mt-3">
            <Bubble slug={narratorSlug} name={narratorName}>
              <span className="mb-1 flex flex-wrap items-center gap-2">
                <MoveBadge verdict={turn.verdict} size="sm" withLabel />
                <span className="numeric ml-auto rounded-md bg-board-2 px-1.5 py-0.5 text-[11px] font-black">
                  {turn.evaluation > 0 ? "+" : ""}
                  {turn.evaluation.toFixed(2)}
                </span>
              </span>
              {turn.note}
            </Bubble>
          </div>

          <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
            <EvalBar
              evaluation={turn.evaluation}
              userDisplayName={userDisplayName}
              botName={botName}
            />
          </div>

          {/* Transcript — every line, jumpable */}
          <ul className="mt-3 max-h-56 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-sm">
            {turns.map((t, i) => (
              <li key={t.index} ref={i === index ? activeLine : undefined}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index}
                  className={`flex w-full items-start gap-2 rounded-xl p-2 text-left transition-colors ${
                    i === index ? "bg-[#e9edd9]" : "hover:bg-board-2"
                  }`}
                >
                  <MoveBadge verdict={t.verdict} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-black">
                        {t.speaker === "user" ? userDisplayName : botName}
                      </span>
                      <span className="numeric text-[10px] text-ink-muted">{t.at}</span>
                      <span className="text-[10px] text-ink-muted">
                        · {t.side === "for" ? "For" : "Against"}
                      </span>
                    </span>
                    <span
                      className={`block text-[11px] leading-snug ${
                        i === index ? "" : "line-clamp-1"
                      } text-ink-muted`}
                    >
                      {t.text}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2.5 rounded-2xl bg-white p-2 shadow-sm">
            <EvalGraph turns={turns} upTo={index} />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex(0)}
              disabled={index === 0}
              aria-label="First turn"
              className={`${buttonClass("secondary", "sm")} flex-1`}
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              aria-label="Previous turn"
              className={`${buttonClass("secondary", "sm")} flex-1`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(turns.length - 1, i + 1))}
              disabled={index === turns.length - 1}
              className={`${buttonClass("primary", "sm")} flex-[3]`}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setIndex(turns.length - 1)}
              disabled={index === turns.length - 1}
              aria-label="Last turn"
              className={`${buttonClass("secondary", "sm")} flex-1`}
            >
              ⏭
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-ink-muted">
            Turn {index + 1} of {turns.length}
          </p>
        </div>
      )}
    </div>
  );
}
