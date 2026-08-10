"use client";

import { useEffect, useRef, useState } from "react";
import { BotFace } from "@/components/bot-face";
import { MoveBadge, type SpeechVerdict } from "@/components/move-badge";
import { buttonClass } from "@/components/ui";

/**
 * Interactive Debate Review — the section's centrepiece.
 *
 * Three stages, the way a review actually runs: the result card, the review
 * summary, then a line-by-line dissection where Trump commentates every turn
 * and the evaluation bar moves with it. The debate on show is the same Trump
 * vs Musk round the hero teases, played out to its conclusion.
 */

interface Turn {
  speaker: "trump" | "musk";
  side: "For" | "Against";
  at: string;
  text: string;
  verdict: SpeechVerdict;
  /** −1 (Against winning) … +1 (For winning), after this turn. */
  evaluation: number;
  /** What the commentator says about this turn. */
  note: string;
}

const MOTION = "This House would introduce a four-day working week";

const TURNS: Turn[] = [
  {
    speaker: "trump",
    side: "For",
    at: "0:14",
    text: "Four-day week — workers love it, families love it. Iceland ran the trial with 2,500 people and output held. It's going to be tremendous.",
    verdict: "great",
    evaluation: 0.35,
    note: "That's me, folks. And notice what I did — I didn't just say people love it, I gave you a trial with a number in it. Numbers beat adjectives.",
  },
  {
    speaker: "musk",
    side: "Against",
    at: "1:02",
    text: "Iceland is 370,000 people and mostly public-sector desk work. You can't extrapolate that to a factory floor in Ohio.",
    verdict: "brilliant",
    evaluation: -0.15,
    note: "Ouch. He didn't fight my number, he fought what it covers. Concede the fact, take the inference — strongest rebuttal there is.",
  },
  {
    speaker: "trump",
    side: "For",
    at: "1:48",
    text: "Everybody agrees productivity goes up. Everybody knows it.",
    verdict: "blunder",
    evaluation: -0.55,
    note: "That's a blunder and it's mine. 'Everybody agrees' isn't evidence — the second you say it, the judge stops counting you.",
  },
  {
    speaker: "musk",
    side: "Against",
    at: "2:31",
    text: "Output per hour rising isn't total output rising. Same pay for 32 hours means unit costs go up about 20% — unless the hours get denser, and on a production line they don't.",
    verdict: "brilliant",
    evaluation: -0.9,
    note: "He just split two things that sound identical. Per-hour versus total. Miss that distinction under pressure and you lose the round right here.",
  },
  {
    speaker: "trump",
    side: "For",
    at: "3:20",
    text: "Then exempt manufacturing. Start with the offices — that's where the trials worked and that's where the burnout is.",
    verdict: "great",
    evaluation: -0.45,
    note: "Good recovery. I gave up ground I couldn't hold and kept the ground I could. Conceding on purpose isn't weakness, it's aim.",
  },
  {
    speaker: "musk",
    side: "Against",
    at: "4:05",
    text: "So it's voluntary for the sector employing most people. That's not a four-day week, that's a press release.",
    verdict: "great",
    evaluation: -0.6,
    note: "Sharp, and the room laughs. But a laugh isn't an argument — he still owes the judge the harm, and he hasn't paid it yet.",
  },
  {
    speaker: "trump",
    side: "For",
    at: "4:52",
    text: "Wrong. Offices are 60% of employment in developed economies. That's not a press release, that's most people's lives.",
    verdict: "good",
    evaluation: -0.35,
    note: "Hitting back with a number — right instinct. But I never said where it came from, so the judge writes 'unsourced' in the margin.",
  },
  {
    speaker: "musk",
    side: "Against",
    at: "5:40",
    text: "Fine, 60%. Then tell me who covers the fifth day of customer demand. Either you hire 25% more people or service drops. Which is it?",
    verdict: "brilliant",
    evaluation: -0.75,
    note: "A fork with two exits and both of them cost me. When someone builds that, you break the frame — you don't pick a door.",
  },
  {
    speaker: "trump",
    side: "For",
    at: "6:18",
    text: "You hire more people! That's called jobs. Beautiful jobs!",
    verdict: "mistake",
    evaluation: -0.95,
    note: "I picked a door, and the expensive one. I should have said demand moves too. Instead I made his case for him, with enthusiasm.",
  },
  {
    speaker: "musk",
    side: "Against",
    at: "7:04",
    text: "So it's 25% more labour for the same output. That's the debate. It's a nice idea that someone else pays for.",
    verdict: "great",
    evaluation: -1,
    note: "And that's the round. He handed the judge one sentence to repeat. Whoever writes the judge's summary usually wins it.",
  },
];

const COUNTS: { verdict: SpeechVerdict; label: string; trump: number; musk: number }[] = [
  { verdict: "brilliant", label: "Brilliant", trump: 0, musk: 3 },
  { verdict: "great", label: "Great", trump: 2, musk: 2 },
  { verdict: "good", label: "Solid", trump: 1, musk: 0 },
  { verdict: "mistake", label: "Mistake", trump: 1, musk: 0 },
  { verdict: "blunder", label: "Blunder", trump: 1, musk: 0 },
];

const SPEAKERS = {
  trump: { slug: "donald-trump", name: "Trump", score: "61.4" },
  musk: { slug: "elon-musk", name: "Musk", score: "88.2" },
} as const;

/** Evaluation history: green area is For's share of the round. */
function EvalGraph({ upTo }: { upTo: number }) {
  const W = 300;
  const H = 74;
  const PAD = 7;
  const x = (i: number) => PAD + (i / (TURNS.length - 1)) * (W - PAD * 2);
  const y = (e: number) => H * (1 - (e + 1) / 2);

  const curve = TURNS.map((t, i) => `${x(i)},${y(t.evaluation)}`).join(" ");
  const area = `${PAD},${H} ${curve} ${W - PAD},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="presentation" aria-hidden>
      <rect width={W} height={H} rx="6" fill="#4a4843" />
      <polygon points={area} fill="#81b64c" />
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
      {upTo >= 0 && (
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
      {TURNS.map((t, i) => (
        <circle
          key={t.at}
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
function EvalBar({ evaluation }: { evaluation: number }) {
  const forShare = ((evaluation + 1) / 2) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-ink-muted">
        <span>For · Trump</span>
        <span>Against · Musk</span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#4a4843]">
        <div
          className="h-full rounded-full bg-[#81b64c] transition-[width] duration-500 ease-out"
          style={{ width: `${forShare}%` }}
        />
      </div>
    </div>
  );
}

/** Always-available escape hatch back to the beginning of the review. */
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

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <BotFace slug="donald-trump" name="Trump" size={52} speaking className="shrink-0" />
      <div className="relative min-w-0 flex-1 rounded-2xl bg-white p-3 shadow-sm">
        <span className="absolute -left-1.5 top-4 h-3 w-3 rotate-45 bg-white" aria-hidden />
        <div className="relative text-[12px] font-medium leading-snug">{children}</div>
      </div>
    </div>
  );
}

export default function DebateReviewMock() {
  const [stage, setStage] = useState<"result" | "summary" | "review">("result");
  const [index, setIndex] = useState(0);
  const turn = TURNS[index];
  const activeLine = useRef<HTMLLIElement>(null);


  const restart = () => {
    setStage("result");
    setIndex(0);
  };

  // The transcript scrolls independently, so bring the current turn back into
  // view whenever it changes — otherwise stepping silently moves off-screen.
  useEffect(() => {
    activeLine.current?.scrollIntoView({ block: "nearest" });
  }, [index, stage]);

  return (
    <div className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5">
      {/* ---------------------------------------------------------------- */}
      {stage === "result" && (
        <div>
          <p className="text-center text-xl font-black">Musk wins</p>
          <p className="text-center text-xs font-bold text-ink-muted">
            {MOTION}
          </p>

          <div className="mt-3 flex items-start justify-center gap-8">
            {(["trump", "musk"] as const).map((k) => (
              <div key={k} className="text-center">
                <BotFace slug={SPEAKERS[k].slug} name={SPEAKERS[k].name} size={56} />
                <p className="mt-1 text-xs font-bold">{SPEAKERS[k].name}</p>
                <p
                  className={`numeric mt-1 rounded-lg px-3 py-1 text-lg font-black ${
                    k === "musk" ? "bg-[#81b64c] text-white" : "bg-board-2"
                  }`}
                >
                  {SPEAKERS[k].score}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-ink-muted">
                  Total score
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Bubble>
              Alright, we lost that one — and frankly the judge was very unfair.
              But let&apos;s look at it together. You&apos;ll learn a lot.
            </Bubble>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {COUNTS.filter((c) => ["brilliant", "great", "blunder"].includes(c.verdict)).map(
              (c) => (
                <div key={c.label} className="rounded-xl bg-white p-2 text-center shadow-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <MoveBadge verdict={c.verdict} size="sm" />
                    <span className="numeric text-lg font-black">{c.trump + c.musk}</span>
                  </span>
                  <p className="text-[10px] font-bold text-ink-muted">{c.label}</p>
                </div>
              )
            )}
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
            <Bubble>
              He built a lead on one distinction and never gave it back. Here&apos;s
              the whole round — every line, graded.
            </Bubble>
          </div>

          <div className="mt-3 rounded-2xl bg-white p-2.5 shadow-sm">
            <EvalGraph upTo={-1} />
          </div>

          <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-[1fr_3rem_3rem] items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink-muted">
              <span>Speakers</span>
              <span className="text-center">Trump</span>
              <span className="text-center">Musk</span>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_3rem_3rem] items-center gap-2">
              <span className="text-[11px] font-semibold">Total score</span>
              <span className="numeric rounded-lg bg-board-2 py-1 text-center text-xs font-black">
                {SPEAKERS.trump.score}
              </span>
              <span className="numeric rounded-lg bg-[#81b64c] py-1 text-center text-xs font-black text-white">
                {SPEAKERS.musk.score}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 border-t border-[#e6e4db] pt-2">
              {COUNTS.map((c) => (
                <div
                  key={c.label}
                  className="grid grid-cols-[1fr_3rem_3rem] items-center gap-2"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <MoveBadge verdict={c.verdict} size="sm" />
                    {c.label}
                  </span>
                  <span className="numeric text-center text-xs font-black">{c.trump}</span>
                  <span className="numeric text-center text-xs font-black">{c.musk}</span>
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
            <Bubble>
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
            <EvalBar evaluation={turn.evaluation} />
          </div>

          {/* Transcript — every line, jumpable */}
          <ul className="mt-3 max-h-56 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-sm">
            {TURNS.map((t, i) => (
              <li key={t.at} ref={i === index ? activeLine : undefined}>
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
                        {SPEAKERS[t.speaker].name}
                      </span>
                      <span className="numeric text-[10px] text-ink-muted">{t.at}</span>
                      <span className="text-[10px] text-ink-muted">· {t.side}</span>
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
            <EvalGraph upTo={index} />
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
              onClick={() => setIndex((i) => Math.min(TURNS.length - 1, i + 1))}
              disabled={index === TURNS.length - 1}
              className={`${buttonClass("primary", "sm")} flex-[3]`}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setIndex(TURNS.length - 1)}
              disabled={index === TURNS.length - 1}
              aria-label="Last turn"
              className={`${buttonClass("secondary", "sm")} flex-1`}
            >
              ⏭
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-ink-muted">
            Turn {index + 1} of {TURNS.length} · sample review
          </p>
        </div>
      )}
    </div>
  );
}
