"use client";

import { useState } from "react";
import { getDailyPuzzle, PUZZLE_TYPE_LABELS } from "@/lib/content";
import { ButtonLink } from "@/components/ui";
import { CheckIcon, CloseIcon } from "@/components/icons";

/** Interactive daily-puzzle teaser on the landing page (light board panel). */
export default function PuzzlePreview() {
  const puzzle = getDailyPuzzle();
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="rounded-3xl bg-board p-4 text-ink shadow-2xl ring-1 ring-black/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#81b64c] px-2.5 py-0.5 text-xs font-bold text-white">
          Daily puzzle
        </span>
        <span className="rounded-full bg-board-2 px-2.5 py-0.5 text-xs font-bold text-ink-muted">
          {PUZZLE_TYPE_LABELS[puzzle.type] ?? puzzle.type}
        </span>
      </div>
      {puzzle.context && (
        <p className="mt-3 text-xs text-ink-muted">{puzzle.context}</p>
      )}
      <p className="mt-2 text-sm font-bold">{puzzle.prompt}</p>
      <div className="mt-3 grid gap-2">
        {puzzle.choices.map((choice, i) => {
          const isPicked = picked === i;
          const revealed = picked !== null;
          const isAnswer = i === puzzle.answerIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => setPicked(i)}
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium shadow-sm transition-all ${
                revealed
                  ? isAnswer
                    ? "bg-[#dff0cd] ring-2 ring-[#81b64c]"
                    : isPicked
                      ? "bg-[#fadedb] ring-2 ring-[#e0614f]"
                      : "bg-white opacity-60"
                  : "bg-white hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              {revealed && isAnswer && (
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#5d8a3a]" />
              )}
              {revealed && isPicked && !isAnswer && (
                <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#c2483a]" />
              )}
              <span>{choice.text}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="pop-in mt-3 rounded-xl bg-white p-3 text-sm text-ink-muted shadow-sm">
          {puzzle.choices[picked].explanation}
          <div className="mt-3">
            <ButtonLink href="/puzzles" size="sm">
              More puzzles
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
