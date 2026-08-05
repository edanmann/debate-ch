"use client";

import { useEffect, useState } from "react";
import { BotFace } from "@/components/bot-face";

/** Phone mock: a live-looking audio round, Cristiano vs Messi, light theme. */
export default function AppPhoneMock() {
  const [seconds, setSeconds] = useState(42);
  const [speaker, setSpeaker] = useState<"ronaldo" | "messi">("ronaldo");

  useEffect(() => {
    const clock = setInterval(
      () => setSeconds((s) => (s <= 1 ? 42 : s - 1)),
      1000
    );
    const turn = setInterval(
      () => setSpeaker((s) => (s === "ronaldo" ? "messi" : "ronaldo")),
      4200
    );
    return () => {
      clearInterval(clock);
      clearInterval(turn);
    };
  }, []);

  const clock = `0:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="mx-auto w-full max-w-[18rem] rounded-[2.5rem] bg-[#1c1b19] p-3 shadow-2xl" aria-hidden>
      <div className="rounded-[2rem] bg-board p-4 text-ink">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-board-2" />
        <p className="text-center text-[10px] font-bold uppercase tracking-wide text-ink-muted">
          Audio debate · Blitz
        </p>
        <p className="mt-1 text-center text-xs font-extrabold">
          Penalty shootouts are a fair way to decide finals
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-center">
            <div
              className={`rounded-2xl p-1.5 transition-all ${
                speaker === "ronaldo" ? "bg-white shadow-md ring-2 ring-[#81b64c]" : ""
              }`}
            >
              <BotFace
                slug="cristiano-ronaldo"
                name="Ronaldo Bot"
                size={62}
                speaking={speaker === "ronaldo"}
              />
            </div>
            <p className="mt-1 text-[10px] font-bold">Ronaldo 🇵🇹</p>
            <p className="text-[9px] text-ink-muted">
              {speaker === "ronaldo" ? "Speaking" : "Listening"}
            </p>
          </div>

          <div className="pb-6 text-center">
            <p className="numeric text-2xl font-black">{clock}</p>
            <p className="text-[9px] font-bold uppercase text-ink-muted">Closing</p>
          </div>

          <div className="text-center">
            <div
              className={`rounded-2xl p-1.5 transition-all ${
                speaker === "messi" ? "bg-white shadow-md ring-2 ring-[#81b64c]" : ""
              }`}
            >
              <BotFace
                slug="lionel-messi"
                name="Messi Bot"
                size={62}
                speaking={speaker === "messi"}
              />
            </div>
            <p className="mt-1 text-[10px] font-bold">Messi 🇦🇷</p>
            <p className="text-[9px] text-ink-muted">
              {speaker === "messi" ? "Speaking" : "Listening"}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-white p-2.5 text-[10px] font-medium shadow-sm">
          {speaker === "ronaldo"
            ? "“Penalties reward the one who practised ten thousand times. That is not luck.”"
            : "“The match was ninety minutes of football. Why decide it with something else?”"}
        </div>

        <div className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-full bg-[#81b64c] text-lg shadow-[0_4px_0_#537d33]">
          🎙
        </div>
      </div>
    </div>
  );
}
