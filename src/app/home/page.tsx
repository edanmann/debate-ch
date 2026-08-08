"use client";

import Link from "next/link";
import { getDailyPuzzle } from "@/lib/content";
import { coachNameFromSlug } from "@/lib/coach";
import { useAppState } from "@/lib/store";
import { BotFace } from "@/components/bot-face";
import {
  BotColor,
  CoachColor,
  FriendsColor,
  LearnColor,
  OnlineColor,
  TimerColor,
} from "@/components/color-icons";
import { PlayerCard } from "@/components/player-card";
import RequireAuth from "@/components/require-auth";
import { Badge, ButtonLink, Card, EmptyState, SectionTitle } from "@/components/ui";

function Dashboard() {
  const state = useAppState();
  const user = state.user!;
  const daily = getDailyPuzzle();
  const latestComplete = state.debates.find((d) => d.status === "complete");

  const actions = [
    {
      href: "/debate/quick",
      title: "Debate 10 Minutes",
      sub: "Rapid format · random motion and side",
      icon: TimerColor,
      primary: true,
    },
    {
      href: "/debate/online",
      title: "Debate Online",
      sub: "Play rated rounds against people",
      icon: OnlineColor,
    },
    {
      href: "/bots",
      title: "Debate Bots",
      sub: "45 opponents from beginner to master",
      icon: BotColor,
    },
    {
      href: "/coach",
      title: "Debate Coach",
      sub: "Practice-mode guidance from any bot",
      icon: CoachColor,
    },
    {
      href: "/debate/friend",
      title: "Debate a Friend",
      sub: "Private lobby by invitation",
      icon: FriendsColor,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Ready when you are, {user.displayName || "debater"}.
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-8">
          {/* Primary actions */}
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                  a.primary
                    ? "border-brand/60 bg-brand/10 hover:bg-brand/15 sm:col-span-2"
                    : "border-border-subtle bg-surface-1 hover:bg-surface-2"
                }`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-3">
                  <a.icon className="h-8 w-8" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{a.title}</span>
                  <span className="block truncate text-sm text-fg-muted">{a.sub}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Secondary practice cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <Badge tone="brand">Daily puzzle</Badge>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{daily.prompt}</p>
              <ButtonLink href={`/puzzles/${daily.id}`} size="sm" className="mt-3">
                Solve it
              </ButtonLink>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <LearnColor className="h-5 w-5" />
                <Badge tone="warning">Coming soon</Badge>
              </div>
              <p className="mt-2 text-sm font-medium">Interactive lessons</p>
              <p className="text-xs text-fg-muted">
                Being rebuilt to be genuinely interactive.
              </p>
              <ButtonLink href="/lessons" size="sm" variant="secondary" className="mt-2">
                Preview
              </ButtonLink>
            </Card>
            <Card className="p-4">
              <Badge tone="info">Review</Badge>
              {latestComplete ? (
                <>
                  <p className="mt-2 line-clamp-2 text-sm font-medium">
                    vs {latestComplete.botName}
                  </p>
                  <ButtonLink
                    href={`/debate/results/${latestComplete.id}`}
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                  >
                    Open review
                  </ButtonLink>
                </>
              ) : (
                <p className="mt-2 text-sm text-fg-muted">
                  Finish your first debate to unlock reviews.
                </p>
              )}
            </Card>
          </div>

          {/* Recent activity */}
          <section>
            <div className="flex items-center justify-between">
              <SectionTitle>Recent debates</SectionTitle>
              {state.debates.length > 0 && (
                <Link href="/history" className="text-sm text-brand hover:underline">
                  Full history
                </Link>
              )}
            </div>
            {state.debates.length === 0 ? (
              <EmptyState
                title="No debates yet"
                body="Your history, results and rating changes appear here after your first round."
                action={<ButtonLink href="/debate/quick">Debate 10 Minutes</ButtonLink>}
              />
            ) : (
              <div className="mt-3 space-y-2">
                {state.debates.slice(0, 5).map((d) => (
                  <Link
                    key={d.id}
                    href={
                      d.status === "complete"
                        ? `/debate/results/${d.id}`
                        : `/debate/room/${d.id}`
                    }
                    className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-3 transition-colors hover:bg-surface-2"
                  >
                    <BotFace slug={d.botSlug} name={d.botName} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        vs {d.botName}
                        <span className="ml-2 text-xs font-normal text-fg-muted">
                          {d.userSide === "for" ? "For" : "Against"} · {d.formatId}
                        </span>
                      </p>
                      <p className="truncate text-xs text-fg-muted">{d.motionText}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {d.status === "complete" && d.judgement ? (
                        <Badge
                          tone={
                            d.judgement.winner === "user"
                              ? "brand"
                              : d.judgement.winner === "bot"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {d.judgement.winner === "user"
                            ? "Won"
                            : d.judgement.winner === "bot"
                              ? "Lost"
                              : "Too close"}
                        </Badge>
                      ) : d.status === "abandoned" ? (
                        <Badge>Abandoned</Badge>
                      ) : (
                        <Badge tone="warning">Resume</Badge>
                      )}
                      <p className="numeric mt-1 text-[11px] text-fg-faint">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Progression card */}
        <aside className="space-y-4">
          <PlayerCard
            name={user.displayName || "Debater"}
            country={user.country}
            overall={state.overallElo}
            ratings={state.ratings}
            coachSlug={user.coachSlug}
            coachName={coachNameFromSlug(user.coachSlug)}
          />
          {state.ratingHistory[0] && (
            <Card className="p-4 text-sm">
              <p className="font-semibold">Last rating change</p>
              <p className="numeric mt-1 text-2xl font-black">
                {state.ratingHistory[0].previousOverall.toFixed(2)} →{" "}
                <span
                  className={
                    state.ratingHistory[0].nextOverall >=
                    state.ratingHistory[0].previousOverall
                      ? "text-brand"
                      : "text-danger"
                  }
                >
                  {state.ratingHistory[0].nextOverall.toFixed(2)}
                </span>
              </p>
              <Link href="/stats" className="mt-2 inline-block text-brand hover:underline">
                Why did it change?
              </Link>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
