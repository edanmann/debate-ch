"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { createDebate } from "@/lib/debate";
import { userWordCount } from "@/lib/results";
import { useAppState, useHydrated } from "@/lib/store";
import { SKILL_KEYS, SKILL_LABELS } from "@/lib/types";
import { Celebration } from "@/components/celebration";
import { DebateReview } from "@/components/debate-review";
import { UserFace } from "@/components/user-face";
import { BotFace } from "@/components/bot-face";
import { SixStatBars } from "@/components/stats";
import { Badge, buttonClass, Card, EmptyState, SectionTitle } from "@/components/ui";

export default function ResultsPage() {
  const params = useParams<{ debateId: string }>();
  const router = useRouter();
  const { user, debates } = useAppState();
  const hydrated = useHydrated();
  const debate = debates.find((d) => d.id === params.debateId) ?? null;
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  if (!hydrated) {
    return <div className="mx-auto max-w-3xl animate-pulse px-4 py-10"><div className="h-40 rounded-2xl bg-surface-2" /></div>;
  }

  if (!debate || !debate.judgement) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="No result here"
          body="This debate has no judgement on this device — it may be unfinished, abandoned, or from another browser."
          action={
            <Link href="/history" className={buttonClass("primary", "md")}>
              Open history
            </Link>
          }
        />
      </div>
    );
  }

  const j = debate.judgement;
  const won = j.winner === "user";
  const tooClose = j.winner === "too-close";

  function rematch() {
    if (!debate) return;
    const next = createDebate({
      botSlug: debate.botSlug,
      botName: debate.botName,
      difficulty: debate.difficulty,
      formatId: debate.formatId,
      rated: debate.rated,
    });
    router.push(`/debate/room/${next.id}`);
  }

  async function share() {
    if (!debate) return;
    const text = `Debates.ch — ${debate.motionText}\nMe (${debate.userSide}) vs ${debate.botName}: ${
      tooClose ? "too close to call" : won ? "I won" : `${debate.botName} won`
    } (${j.user.overall}–${j.bot.overall}).`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — nothing else to do in demo mode.
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {!tooClose && (
        <Celebration id={user?.celebration ?? "confetti"} won={won} />
      )}
      {/* Banner */}
      <Card
        className={`p-6 text-center ${
          tooClose
            ? "border-warning/50"
            : won
              ? "border-brand/60"
              : "border-danger/40"
        }`}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
          {debate.formatId} · {debate.rated ? "Rated" : "Practice"} · vs {debate.botName}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          {tooClose ? "Too close to call" : won ? "You won the round" : `${debate.botName} takes it`}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-fg-muted">{debate.motionText}</p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <UserFace size={56} className="mx-auto" />
            <p className="numeric mt-1 text-2xl font-black">{j.user.overall}</p>
          </div>
          <span className="text-fg-faint">vs</span>
          <div className="text-center">
            <BotFace slug={debate.botSlug} name={debate.botName} size={56} className="mx-auto" />
            <p className="numeric mt-1 text-2xl font-black">{j.bot.overall}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-fg-faint">
          Judge confidence: {(j.confidence * 100).toFixed(0)}%
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={rematch} className={buttonClass("primary", "md")}>
            Rematch
          </button>
          <button type="button" onClick={share} className={buttonClass("secondary", "md")}>
            {copied ? "Copied!" : "Share result"}
          </button>
          <button
            type="button"
            onClick={() => setReported(true)}
            className={buttonClass("ghost", "md")}
          >
            {reported ? "Noted — thanks" : "Report judgement issue"}
          </button>
        </div>
        {reported && (
          <p className="mt-2 text-xs text-fg-faint">
            Logged locally in demo mode; hosted builds route reports to moderators.
          </p>
        )}
      </Card>

      <DebateReview
        botSlug={debate.botSlug}
        botName={debate.botName}
        coachSlug={user?.coachSlug}
        judgement={j}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Scores */}
        <Card className="p-5">
          <SectionTitle>Your scorecard</SectionTitle>
          <p className="mt-1 text-xs text-fg-muted">
            Cream markers show {debate.botName}&apos;s scores.
          </p>
          <div className="mt-4">
            <SixStatBars stats={j.user.scores} compare={j.bot.scores} />
          </div>
          <dl className="mt-4 space-y-3 border-t border-border-subtle pt-4 text-sm">
            {SKILL_KEYS.map((k) => (
              <div key={k}>
                <dt className="font-semibold">
                  {SKILL_LABELS[k]} <span className="numeric text-fg-muted">{j.user.scores[k]}</span>
                </dt>
                <dd className="text-fg-muted">{j.user.reasons[k]}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Rating changes */}
        <Card className="p-5">
          <SectionTitle>Rating impact</SectionTitle>
          {debate.ratingChange ? (
            <>
              <p className="numeric mt-2 text-3xl font-black">
                {debate.ratingChange.previousOverall.toFixed(2)} →{" "}
                <span className={debate.ratingChange.nextOverall >= debate.ratingChange.previousOverall ? "text-brand" : "text-danger"}>
                  {debate.ratingChange.nextOverall.toFixed(2)}
                </span>{" "}
                <span className="text-base font-bold text-fg-muted">OVR</span>
              </p>
              <p className="mt-1 text-xs text-fg-muted">
                Fixed stakes: win +0.09, loss −0.09, draw 0. Skill bars below
                move separately, based on how you performed.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                {SKILL_KEYS.map((k) => {
                  const u = debate.ratingChange!.perSkill[k];
                  return (
                    <details key={k} className="rounded-xl bg-surface-2 p-3">
                      <summary className="flex cursor-pointer items-center justify-between font-medium">
                        {SKILL_LABELS[k]}
                        <span
                          className={`numeric ${u.delta > 0 ? "text-brand" : u.delta < 0 ? "text-danger" : "text-fg-muted"}`}
                        >
                          {u.previous} → {u.next} ({u.delta >= 0 ? "+" : ""}
                          {u.delta})
                        </span>
                      </summary>
                      <p className="mt-2 text-fg-muted">{u.explanation}</p>
                    </details>
                  );
                })}
              </dl>
            </>
          ) : (
            <p className="mt-2 text-sm text-fg-muted">
              {!debate.rated
                ? "Practice round — ratings never move in practice mode."
                : userWordCount(debate) === 0
                  ? "No speeches were delivered, so this round was not rated."
                  : "This round was too short to rate fairly (fewer than 40 words spoken), so ratings did not move. This also protects against rating farming."}
            </p>
          )}

          <SectionTitle className="mt-6">The decision</SectionTitle>
          <p className="mt-2 text-sm text-fg-muted">{j.explanation}</p>
        </Card>

        {/* Key moments */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>Key moments</SectionTitle>
          <dl className="mt-3 grid gap-4 text-sm md:grid-cols-2">
            {(
              [
                ["Your strongest argument", j.strongestUserArgument],
                [`${debate.botName}'s strongest argument`, j.strongestBotArgument],
                ["Most important missed rebuttal", j.mostImportantMissedRebuttal],
                ["Evidence", j.bestEvidenceUse],
                ["Unsupported claims", j.unsupportedClaims],
                ["Strategic turning point", j.strategicTurningPoint],
                ["Delivery", j.deliveryNotes],
                ["Time management", j.timeManagement],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="rounded-xl bg-surface-2 p-3">
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-1 text-fg-muted">{text}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Next steps */}
        <Card className="p-5 lg:col-span-2">
          <SectionTitle>What to do next</SectionTitle>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-fg-muted">
            {j.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            {j.recommendedPuzzleType && (
              <Link
                href={`/puzzles?type=${j.recommendedPuzzleType}`}
                className={buttonClass("primary", "md")}
              >
                Recommended puzzles
              </Link>
            )}
          </div>
        </Card>

        {/* Transcript */}
        <Card className="p-5 lg:col-span-2">
          <details>
            <summary className="cursor-pointer text-lg font-bold">
              Debate timeline &amp; transcript
            </summary>
            <div className="mt-4 space-y-2">
              {debate.transcript.map((t, i) => (
                <div key={i} className="rounded-xl bg-surface-2 p-3 text-sm">
                  <p className="flex items-center justify-between text-xs font-semibold text-fg-muted">
                    <span>
                      {t.phaseName} · {t.speaker === "user" ? user?.displayName ?? "You" : debate.botName} ({t.side})
                    </span>
                    <span className="numeric">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{t.text}</p>
                </div>
              ))}
            </div>
          </details>
        </Card>
      </div>

      <p className="mt-6 rounded-2xl border border-border-subtle bg-surface-1 p-4 text-xs text-fg-faint">
        {j.disclaimer}
      </p>

      <div className="mt-6 flex justify-between">
        <Link href="/home" className={buttonClass("ghost", "md")}>
          ← Dashboard
        </Link>
        <Badge tone="warning">Mock judge — heuristic scoring</Badge>
      </div>
    </div>
  );
}
