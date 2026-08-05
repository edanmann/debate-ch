"use client";

import Link from "next/link";
import { formatOvr, OVR_STAKE, reliabilityLabel, tierForRating } from "@/lib/rating";
import { useAppState } from "@/lib/store";
import { SKILL_KEYS, SKILL_LABELS } from "@/lib/types";
import RequireAuth from "@/components/require-auth";
import { Badge, ButtonLink, Card, EmptyState, SectionTitle } from "@/components/ui";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 100},${36 - ((v - min) / range) * 32}`
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Stats() {
  const { ratings, ratingHistory, debates, overallElo } = useAppState();
  const ovr = overallElo;
  const tier = tierForRating(Math.floor(ovr));
  const overallSeries = [...ratingHistory]
    .reverse()
    .flatMap((h) => [h.previousOverall, h.nextOverall]);
  const completed = debates.filter((d) => d.status === "complete");
  const wins = completed.filter((d) => d.judgement?.winner === "user").length;
  const forRounds = completed.filter((d) => d.userSide === "for");
  const forWins = forRounds.filter((d) => d.judgement?.winner === "user").length;
  const againstRounds = completed.filter((d) => d.userSide === "against");
  const againstWins = againstRounds.filter((d) => d.judgement?.winner === "user").length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Your statistics</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">Overall</p>
          <p className="numeric mt-1 text-5xl font-black">{formatOvr(ovr)}</p>
          <Badge tone="brand" className="mt-2">{tier.label} tier</Badge>
          <p className="mt-2 text-xs text-fg-muted">
            Fixed stakes: win +{OVR_STAKE.toFixed(2)}, loss −{OVR_STAKE.toFixed(2)}, draw 0.
          </p>
          {overallSeries.length >= 2 && (
            <div className="mt-3"><Sparkline values={overallSeries} /></div>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">Record</p>
          <p className="numeric mt-1 text-3xl font-black">
            {wins}<span className="text-lg text-fg-muted">/{completed.length}</span>
          </p>
          <p className="text-sm text-fg-muted">rounds won</p>
          <p className="mt-2 text-xs text-fg-muted">
            As For: {forWins}/{forRounds.length} · As Against: {againstWins}/{againstRounds.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">Reliability</p>
          <p className="mt-2 text-sm">{reliabilityLabel(Math.max(...SKILL_KEYS.map((k) => ratings[k].samples)))}</p>
          <p className="mt-1 text-xs text-fg-muted">
            Ratings sharpen with every rated round. Short or abandoned rounds
            never count.
          </p>
        </Card>
      </div>

      <SectionTitle className="mt-8">Six skills</SectionTitle>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {SKILL_KEYS.map((k) => {
          const r = ratings[k];
          const lastChange = ratingHistory.find((h) => h.perSkill[k]?.delta !== 0);
          return (
            <Card key={k} className="p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-bold">{SKILL_LABELS[k]}</p>
                <p className="numeric text-2xl font-black">{r.rating}</p>
              </div>
              <p className="text-xs text-fg-muted">
                {r.samples} rated sample{r.samples === 1 ? "" : "s"} · {reliabilityLabel(r.samples)}
              </p>
              {lastChange?.perSkill[k] && (
                <p className="mt-2 text-xs text-fg-muted">
                  {lastChange.perSkill[k].explanation}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <SectionTitle className="mt-8">Rating changes</SectionTitle>
      {ratingHistory.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Insufficient data for rating trends"
            body="Complete a rated debate and every change will be listed here with its full explanation — no mystery numbers."
            action={<ButtonLink href="/debate/quick">Play a rated round</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {ratingHistory.slice(0, 20).map((h) => (
            <Link
              key={h.debateId + h.createdAt}
              href={`/debate/results/${h.debateId}`}
              className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-1 p-4 text-sm transition-colors hover:bg-surface-2"
            >
              <span className="text-fg-muted">
                {new Date(h.createdAt).toLocaleString()} · confidence{" "}
                {(h.confidence * 100).toFixed(0)}%
              </span>
              <span
                className={`numeric font-bold ${h.nextOverall >= h.previousOverall ? "text-brand" : "text-danger"}`}
              >
                {h.previousOverall.toFixed(2)} → {h.nextOverall.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  return (
    <RequireAuth>
      <Stats />
    </RequireAuth>
  );
}
