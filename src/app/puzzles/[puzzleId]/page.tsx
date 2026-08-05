"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPuzzle, PUZZLE_TYPE_LABELS, PUZZLES } from "@/lib/content";
import { playCorrect, playTick, playWrong } from "@/lib/sfx";
import { createRecognizer, sttSupported, type Recognizer } from "@/lib/stt";
import {
  recordPuzzleAttempt,
  todayKey,
  updateState,
  useAppState,
} from "@/lib/store";
import { SKILL_LABELS } from "@/lib/types";
import { Badge, buttonClass, Card, EmptyState } from "@/components/ui";

/** Puzzles are spoken: you get a short window to argue your answer aloud. */
const SPEAK_SECONDS = 45;
export const DAILY_PUZZLE_LIMIT = 3;

export default function PuzzlePlayerPage() {
  const params = useParams<{ puzzleId: string }>();
  const puzzle = getPuzzle(params.puzzleId);
  const state = useAppState();
  const { puzzles } = state;

  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"speak" | "choose">("speak");
  const [seconds, setSeconds] = useState(SPEAK_SECONDS);
  const [listening, setListening] = useState(false);
  const [spoken, setSpoken] = useState("");
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState(false);
  const recognizer = useRef<Recognizer | null>(null);

  const today = todayKey();
  const usedToday = state.puzzleDay === today ? state.puzzleAttemptsToday : 0;
  const outOfAttempts = usedToday >= DAILY_PUZZLE_LIMIT;

  const stopListening = useCallback(() => {
    recognizer.current?.stop();
    recognizer.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!sttSupported()) {
      setMicError(true);
      return;
    }
    const rec = createRecognizer({
      onInterim: setInterim,
      onFinal: (text) => {
        setInterim("");
        setSpoken((p) => (p ? `${p} ${text}` : text));
      },
      onError: () => {
        setMicError(true);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!rec) {
      setMicError(true);
      return;
    }
    recognizer.current = rec;
    try {
      rec.start();
      setListening(true);
      setMicError(false);
    } catch {
      setMicError(true);
    }
  }, []);

  // Countdown for the speaking window.
  useEffect(() => {
    if (phase !== "speak" || !listening) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          stopListening();
          setPhase("choose");
          return 0;
        }
        if (s <= 6) playTick();
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, listening, stopListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  if (!puzzle) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Puzzle not found"
          body="This puzzle doesn't exist."
          action={<Link href="/puzzles" className={buttonClass("primary", "md")}>All puzzles</Link>}
        />
      </div>
    );
  }

  if (outOfAttempts && picked === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-5xl">🌙</p>
        <h1 className="mt-3 text-2xl font-extrabold">That&apos;s your three for today</h1>
        <p className="mt-2 text-fg-muted">
          Three puzzles a day keeps the training sharp and the habit sustainable.
          Come back tomorrow — or go debate a bot instead.
        </p>
        <div className="mt-6 grid gap-2">
          <Link href="/bots" className={buttonClass("primary", "lg")}>Debate a bot</Link>
          <Link href="/puzzles" className={buttonClass("secondary", "lg")}>Back to puzzles</Link>
        </div>
      </div>
    );
  }

  const revealed = picked !== null;
  const idx = PUZZLES.findIndex((p) => p.id === puzzle.id);
  const nextPuzzle = PUZZLES[(idx + 1) % PUZZLES.length];

  function choose(i: number) {
    if (revealed) return;
    const correct = i === puzzle!.answerIndex;
    setPicked(i);
    stopListening();
    recordPuzzleAttempt(puzzle!.id, correct);
    updateState((s) => ({
      ...s,
      puzzleDay: today,
      puzzleAttemptsToday: (s.puzzleDay === today ? s.puzzleAttemptsToday : 0) + 1,
    }));
    if (correct) playCorrect();
    else playWrong();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{PUZZLE_TYPE_LABELS[puzzle.type]}</Badge>
        <Badge>{"★".repeat(puzzle.difficulty)}</Badge>
        <Badge tone="neutral">Trains {SKILL_LABELS[puzzle.skill]}</Badge>
        <Badge tone={usedToday >= 2 ? "warning" : "neutral"}>
          {DAILY_PUZZLE_LIMIT - usedToday} left today
        </Badge>
      </div>

      <Card className="mt-4 p-6">
        {puzzle.context && <p className="text-xs text-fg-faint">{puzzle.context}</p>}
        <h1 className="mt-1 text-lg font-bold">{puzzle.prompt}</h1>

        {/* Speak first: argue your answer aloud before the options appear. */}
        {phase === "speak" && !revealed && (
          <div className="mt-5 rounded-2xl border border-brand/40 bg-surface-2 p-5 text-center">
            <p className="text-sm font-bold">Argue it out loud first</p>
            <p className="mt-1 text-xs text-fg-muted">
              You have {SPEAK_SECONDS} seconds to say how you&apos;d rebut this.
              Then pick the strongest option.
            </p>
            <p className={`numeric mt-3 text-4xl font-black ${seconds <= 6 ? "text-danger" : ""}`}>
              {seconds}
            </p>
            <button
              type="button"
              onClick={() => (listening ? stopListening() : startListening())}
              className={`mx-auto mt-3 grid h-16 w-16 place-items-center rounded-full text-2xl transition-all ${
                listening
                  ? "bg-danger text-white shadow-[0_0_0_8px_rgba(224,97,79,0.18)]"
                  : "bg-surface-3"
              }`}
              aria-pressed={listening}
            >
              🎙
            </button>
            {(spoken || interim) && (
              <p className="mt-3 rounded-xl bg-surface-1 p-3 text-left text-sm">
                {spoken} <span className="text-fg-faint">{interim}</span>
              </p>
            )}
            {micError && (
              <p className="mt-3 text-xs text-danger">
                Microphone unavailable in this browser — you can still pick an
                answer below.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                stopListening();
                setPhase("choose");
              }}
              className={`${buttonClass("secondary", "md")} mt-4`}
            >
              {spoken ? "Done — show the options" : "Skip speaking"}
            </button>
          </div>
        )}

        {(phase === "choose" || revealed) && (
          <div className="mt-4 grid gap-2">
            {puzzle.choices.map((choice, i) => {
              const isAnswer = i === puzzle.answerIndex;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(i)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    revealed
                      ? isAnswer
                        ? "border-brand bg-brand/10"
                        : picked === i
                          ? "border-danger bg-danger/10"
                          : "border-border-subtle opacity-70"
                      : "border-border-subtle bg-surface-2 hover:border-brand/40"
                  }`}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {revealed && (
        <Card className="pop-in mt-4 p-6">
          <p className="text-xl font-black">
            {picked === puzzle.answerIndex ? "✅ Correct." : "❌ Not this time."}
          </p>
          {spoken && (
            <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">
                What you said
              </p>
              <p className="mt-1 text-fg-muted">{spoken}</p>
            </div>
          )}
          <div className="mt-3 space-y-3 text-sm">
            {puzzle.choices.map((c, i) => (
              <div key={i} className={i === puzzle.answerIndex ? "" : "text-fg-muted"}>
                <p className="font-semibold">
                  {i === puzzle.answerIndex ? "✓ Best answer" : `Option ${i + 1}`}
                </p>
                <p className={i === puzzle.answerIndex ? "text-fg-muted" : ""}>
                  {c.explanation}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="numeric text-sm text-fg-muted">
              Streak: {puzzles.streak} · Accuracy:{" "}
              {puzzles.attempts > 0
                ? `${Math.round((puzzles.correct / puzzles.attempts) * 100)}%`
                : "—"}
            </p>
            {usedToday + 1 >= DAILY_PUZZLE_LIMIT ? (
              <Link href="/bots" className={buttonClass("primary", "md")}>
                Done for today — go debate
              </Link>
            ) : (
              <Link href={`/puzzles/${nextPuzzle.id}`} className={buttonClass("primary", "md")}>
                Next puzzle
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
