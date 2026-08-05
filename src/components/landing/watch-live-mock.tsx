"use client";

import { useEffect, useState } from "react";
import { BotFace } from "@/components/bot-face";
import { MoveBadge, type SpeechVerdict } from "@/components/move-badge";

/**
 * Watch-section preview: a simulated round that plays itself — clock ticking,
 * viewer count drifting, speakers alternating and analysis lines appearing as
 * the round progresses.
 */

interface Moment {
  at: string;
  speaker: "barrister" | "sophie";
  verdict: SpeechVerdict;
  label: string;
  note: string;
}

const MOMENTS: Moment[] = [
  {
    at: "01:12",
    speaker: "barrister",
    verdict: "great",
    label: "Opening — For",
    note: "Frames the round on legitimacy, not turnout.",
  },
  {
    at: "03:40",
    speaker: "sophie",
    verdict: "brilliant",
    label: "Rebuttal",
    note: "Turn: a ballot cast to avoid a fine isn't political will.",
  },
  {
    at: "05:58",
    speaker: "barrister",
    verdict: "inaccuracy",
    label: "Response",
    note: "Cites a figure without a source — judge notes it.",
  },
  {
    at: "07:21",
    speaker: "sophie",
    verdict: "great",
    label: "Closing",
    note: "Collapses to autonomy vs representativeness.",
  },
];

export default function WatchLiveMock() {
  const [tick, setTick] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [viewers, setViewers] = useState(1284);

  useEffect(() => {
    const clock = setInterval(() => setSeconds((s) => s + 1), 1000);
    const beats = setInterval(() => setTick((t) => t + 1), 3400);
    const crowd = setInterval(
      () => setViewers((v) => Math.max(1180, v + Math.round((Math.random() - 0.45) * 14))),
      2600
    );
    return () => {
      clearInterval(clock);
      clearInterval(beats);
      clearInterval(crowd);
    };
  }, []);

  const shown = (tick % MOMENTS.length) + 1;
  const current = MOMENTS[shown - 1];
  const elapsed = `${Math.floor((seconds % 600) / 60)}:${((seconds % 600) % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
          <span className="flex items-center gap-1 rounded-md bg-[#e0614f] px-1.5 py-0.5 text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
          <span className="numeric text-ink-muted">{viewers.toLocaleString()} watching</span>
        </p>
        <span className="numeric rounded-lg bg-board-2 px-2 py-0.5 text-sm font-black">
          {elapsed}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold">This House would make voting compulsory</p>

      <div className="mt-3 flex items-center justify-center gap-4 sm:gap-6">
        {(
          [
            { id: "barrister", slug: "the-barrister", name: "The Barrister", side: "For" },
            { id: "sophie", slug: "sophie", name: "Sophie", side: "Against" },
          ] as const
        ).map((p) => {
          const speaking = current.speaker === p.id;
          return (
            <div key={p.id} className="text-center">
              <div
                className={`rounded-2xl p-1.5 transition-all duration-500 ${
                  speaking ? "bg-white shadow-lg ring-2 ring-[#81b64c]" : "opacity-70"
                }`}
              >
                <BotFace slug={p.slug} name={p.name} size={56} speaking={speaking} />
              </div>
              <p className="mt-1 text-[11px] font-extrabold">{p.name}</p>
              <p className="text-[10px] text-ink-muted">{p.side}</p>
            </div>
          );
        })}
      </div>

      {/* Analysis feed — entries appear as the round plays */}
      <div className="mt-3 space-y-1.5">
        {MOMENTS.slice(0, shown).map((m) => (
          <div
            key={m.at}
            className="pop-in flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-sm"
          >
            <MoveBadge verdict={m.verdict} size="sm" />
            <span className="numeric text-[10px] font-bold text-ink-muted">{m.at}</span>
            <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">
              {m.note}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] font-medium text-ink-muted">
        Simulated round · live streaming arrives with public matchmaking
      </p>
    </div>
  );
}
