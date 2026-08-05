"use client";

import { useEffect, useState } from "react";

/**
 * Cartoon celebration played on the results screen. Whoever won gets the
 * animation — the player's chosen one when they win, a stock cheer when the
 * bot does, so losses still feel like part of the game rather than a dead end.
 */

export const CELEBRATIONS = [
  { id: "confetti", label: "Confetti", emoji: "🎉" },
  { id: "fireworks", label: "Fireworks", emoji: "🎆" },
  { id: "trophy", label: "Trophy", emoji: "🏆" },
  { id: "applause", label: "Applause", emoji: "👏" },
] as const;

export type CelebrationId = (typeof CELEBRATIONS)[number]["id"];

const PIECES = 26;

export function Celebration({
  id = "confetti",
  won,
}: {
  id?: string;
  won: boolean;
}) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 4200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;

  const chosen = CELEBRATIONS.find((c) => c.id === id) ?? CELEBRATIONS[0];
  const emoji = won ? chosen.emoji : "👏";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: PIECES }).map((_, i) => {
        // Deterministic spread so pieces don't clump; no randomness needed.
        const left = ((i * 37) % 100) + (i % 3);
        const delay = (i % 7) * 0.18;
        const duration = 2.6 + ((i % 5) * 0.35);
        const size = 18 + ((i * 13) % 16);
        return (
          <span
            key={i}
            className="celebrate-fall absolute top-[-3rem] select-none"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${size}px`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
