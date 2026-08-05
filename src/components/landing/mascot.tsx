"use client";

import { useEffect, useState } from "react";
import { CartoonAvatar } from "@/components/cartoon-avatar";
import { presentationFor } from "@/lib/bot-presentation";

/**
 * A bot mascot peeking out beside a panel, gesturing, with a speech bubble
 * that types itself out so the character reads as speaking live.
 * Background-free so the character sits directly on the page.
 */
export function Mascot({
  slug,
  name,
  quote,
  side = "right",
  size = 104,
  showName = false,
}: {
  slug: string;
  name: string;
  quote: string;
  side?: "left" | "right";
  size?: number;
  showName?: boolean;
}) {
  const [chars, setChars] = useState(0);
  const [speaking, setSpeaking] = useState(true);
  // `speaking` starts true and the rAF loop only ever flips it on completion.

  // Word-by-word reveal on a rAF clock: reads as natural speech rather than a
  // stuttering per-character typewriter.
  useEffect(() => {
    const words = quote.split(" ");
    let frame = 0;
    let start = 0;
    let restart: ReturnType<typeof setTimeout>;
    const MS_PER_WORD = 230;
    const HOLD_MS = 2400;

    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      const wordsShown = Math.min(words.length, Math.floor(elapsed / MS_PER_WORD) + 1);
      setChars(words.slice(0, wordsShown).join(" ").length);
      if (wordsShown >= words.length) {
        setSpeaking(false);
        restart = setTimeout(() => {
          start = 0;
          setSpeaking(true);
          frame = requestAnimationFrame(step);
        }, HOLD_MS);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(restart);
    };
  }, [quote]);

  const p = presentationFor(slug);
  // Drop the tile background so the character floats on the page.
  const avatar = { ...p.avatar, bg: undefined };

  return (
    <div
      className={`pointer-events-none absolute -top-8 z-10 flex items-start gap-1 ${
        side === "right" ? "right-0 flex-row-reverse" : "left-0"
      }`}
    >
      <div className="drop-shadow-2xl">
        <CartoonAvatar
          config={avatar}
          name={name}
          size={size}
          speaking={speaking}
          rounded={false}
        />
        {showName && (
          <p className="-mt-1 text-center text-[10px] font-black uppercase tracking-wide text-fg-muted">
            {name}
          </p>
        )}
      </div>
      <div
        className={`relative mt-4 w-[12rem] rounded-2xl bg-white px-3 py-2 text-[11px] font-bold leading-snug text-ink shadow-xl transition-transform duration-300 ${
          speaking ? "scale-100" : "scale-[0.98]"
        } ${side === "right" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
      >
        {/* Reserve the full height so the bubble never jumps as words appear. */}
        <span className="invisible block" aria-hidden>
          {quote}
        </span>
        <span className="absolute inset-0 px-3 py-2">
          {quote.slice(0, chars)}
          {speaking && <span className="ml-0.5 inline-block animate-pulse">▌</span>}
        </span>
      </div>
    </div>
  );
}
