"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getDailyPuzzle, PUZZLE_TYPE_LABELS, PUZZLES } from "@/lib/content";
import { todayKey, useAppState } from "@/lib/store";
import { SKILL_LABELS } from "@/lib/types";
import { Badge, ButtonLink, Card } from "@/components/ui";

function PuzzlesIndex() {
  const state = useAppState();
  const { puzzles } = state;
  const usedToday =
    state.puzzleDay === todayKey() ? state.puzzleAttemptsToday : 0;
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");
  const daily = getDailyPuzzle();
  const accuracy =
    puzzles.attempts > 0
      ? Math.round((puzzles.correct / puzzles.attempts) * 100)
      : null;

  const list = typeFilter ? PUZZLES.filter((p) => p.type === typeFilter) : PUZZLES;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Puzzles</h1>
      <p className="mt-2 max-w-2xl text-fg-muted">
        Short spoken drills: argue your answer aloud, then pick the strongest
        option. Three a day — enough to build the habit, not enough to grind.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-brand/40 p-5 md:col-span-2">
          <Badge tone="brand">Today&apos;s puzzle</Badge>
          <p className="mt-2 font-semibold">{daily.prompt}</p>
          <p className="mt-1 text-xs text-fg-muted">
            {PUZZLE_TYPE_LABELS[daily.type]} · trains {SKILL_LABELS[daily.skill]}
          </p>
          <ButtonLink href={`/puzzles/${daily.id}`} className="mt-4">
            Solve the daily
          </ButtonLink>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold">Your training</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Left today</dt>
              <dd className="numeric font-bold">{Math.max(0, 3 - usedToday)}/3</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Streak</dt>
              <dd className="numeric font-bold">{puzzles.streak} day{puzzles.streak === 1 ? "" : "s"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Solved</dt>
              <dd className="numeric font-bold">
                {Object.values(puzzles.solved).filter(Boolean).length}/{PUZZLES.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Accuracy</dt>
              <dd className="numeric font-bold">{accuracy === null ? "—" : `${accuracy}%`}</dd>
            </div>
          </dl>
          {accuracy === null && (
            <p className="mt-3 text-xs text-fg-faint">
              Attempt your first puzzle to start tracking.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/puzzles"
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
            !typeFilter ? "bg-brand text-[#1e2313]" : "bg-surface-2 text-fg-muted hover:bg-surface-3"
          }`}
        >
          All types
        </Link>
        {Object.entries(PUZZLE_TYPE_LABELS).map(([type, label]) => (
          <Link
            key={type}
            href={`/puzzles?type=${type}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              typeFilter === type
                ? "bg-brand text-[#1e2313]"
                : "bg-surface-2 text-fg-muted hover:bg-surface-3"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((p) => {
          const solved = puzzles.solved[p.id];
          return (
            <Link
              key={p.id}
              href={`/puzzles/${p.id}`}
              className="rounded-2xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-brand/40"
            >
              <div className="flex items-center gap-2">
                <Badge>{PUZZLE_TYPE_LABELS[p.type]}</Badge>
                <Badge tone="neutral">{"★".repeat(p.difficulty)}</Badge>
                {solved && <Badge tone="brand">Solved</Badge>}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{p.prompt}</p>
              <p className="mt-1 text-xs text-fg-faint">
                Trains {SKILL_LABELS[p.skill]} · {p.category}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function PuzzlesPage() {
  return (
    <Suspense>
      <PuzzlesIndex />
    </Suspense>
  );
}
