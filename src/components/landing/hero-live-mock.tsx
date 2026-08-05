"use client";

import { useEffect, useState } from "react";
import { BotFace } from "@/components/bot-face";
import { MoveBadge, type SpeechVerdict } from "@/components/move-badge";

/**
 * The landing hero: a light "board" panel showing a looping simulated round —
 * live countdown, alternating speakers, judge commentary and move badges.
 * Clearly labelled a simulation; every line is scripted demo content.
 */

interface Beat {
  speaker: "trump" | "musk";
  text: string;
  verdict: SpeechVerdict | null;
  judge: string;
  forShare: number; // 0..100 advantage bar
}

const BEATS: Beat[] = [
  {
    speaker: "trump",
    text: "Four-day week — workers love it, families love it. It's going to be tremendous.",
    verdict: null,
    judge: "Big audience appeal — the judge is still waiting for a mechanism.",
    forShare: 52,
  },
  {
    speaker: "musk",
    text: "Run the factory math first: compress the hours and output physics still applies.",
    verdict: "great",
    judge: "Sharp demand for the mechanism. Advantage shifts Against.",
    forShare: 44,
  },
  {
    speaker: "trump",
    text: "We'll simply work smarter and harder. Everybody agrees with me on this.",
    verdict: "blunder",
    judge: "Assertion with no support — that's a blunder.",
    forShare: 36,
  },
  {
    speaker: "trump",
    text: "The trials answer him: output held, retention soared — his physics forgot the people.",
    verdict: "brilliant",
    judge: "Brilliant rebuttal — evidence turned straight against the objection.",
    forShare: 58,
  },
];

export default function HeroLiveMock() {
  const [beatIdx, setBeatIdx] = useState(0);
  const [seconds, setSeconds] = useState(84);

  useEffect(() => {
    const clock = setInterval(
      () => setSeconds((s) => (s <= 1 ? 84 : s - 1)),
      1000
    );
    const beats = setInterval(
      () => setBeatIdx((i) => (i + 1) % BEATS.length),
      5000
    );
    return () => {
      clearInterval(clock);
      clearInterval(beats);
    };
  }, []);

  const beat = BEATS[beatIdx];
  const clock = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div
      className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-xs font-semibold text-ink-muted">
          This House would introduce a four-day working week
        </p>
        <span className="numeric shrink-0 rounded-lg bg-board-2 px-2.5 py-1 text-base font-black">
          {clock}
        </span>
      </div>

      {/* Speakers */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        {(
          [
            { id: "trump", slug: "donald-trump", name: "Trump", side: "For" },
            { id: "musk", slug: "elon-musk", name: "Musk", side: "Against" },
          ] as const
        ).map((p) => {
          const speaking = beat.speaker === p.id;
          return (
            <div
              key={p.id}
              className={`min-w-0 rounded-2xl p-3 text-center transition-all sm:p-4 ${
                speaking
                  ? "bg-white ring-2 ring-[#81b64c] shadow-lg"
                  : "bg-board-2/60"
              }`}
            >
              <BotFace
                slug={p.slug}
                name={p.name}
                size={80}
                speaking={speaking}
                className="mx-auto"
              />
              <p className="mt-2 truncate text-sm font-extrabold">{p.name}</p>
              <p
                className={`text-xs font-semibold ${speaking ? "text-[#5d8a3a]" : "text-ink-muted"}`}
              >
                {p.side} · {speaking ? "Speaking" : "Listening"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current line + badge */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-white p-3 shadow-sm">
        {beat.verdict && <MoveBadge verdict={beat.verdict} />}
        <p className="text-[13px] leading-snug">
          <span className="font-bold">
            {beat.speaker === "trump" ? "Trump:" : "Musk:"}
          </span>{" "}
          {beat.text}
        </p>
      </div>

      {/* Live judge */}
      <div className="mt-3 rounded-xl bg-board-2 p-3">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-ink-muted">
          <span>For</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e0614f]" />
            Live judging
          </span>
          <span>Against</span>
        </div>
        <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full">
          <div
            className="bg-[#81b64c] transition-all duration-700"
            style={{ width: `${beat.forShare}%` }}
          />
          <div className="flex-1 bg-[#3a3835]" />
        </div>
        <p className="mt-2 text-xs font-medium text-ink-muted">⚖ {beat.judge}</p>
      </div>

      <p className="mt-3 text-center text-[10px] font-medium text-ink-muted">
        Demo round
      </p>
    </div>
  );
}
