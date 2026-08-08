"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PUZZLES } from "@/lib/content";
import { flagFor } from "@/lib/flags-emoji";
import { coachNameFromSlug } from "@/lib/coach";
import { useAppState } from "@/lib/store";
import { BotFace } from "@/components/bot-face";
import { PlayerCard } from "@/components/player-card";
import RequireAuth from "@/components/require-auth";
import { Badge, buttonClass, Card, EmptyState, SectionTitle } from "@/components/ui";

function Profile() {
  const params = useParams<{ username: string }>();
  const state = useAppState();
  const user = state.user!;
  const isMe =
    params.username === "me" ||
    params.username.toLowerCase() === user.displayName.toLowerCase();

  if (!isMe) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <EmptyState
          title={`@${params.username} isn't reachable here`}
          body="Other players' public profiles live on the hosted platform. In this local demo only your own profile exists."
          action={
            <Link href="/profile/me" className={buttonClass("primary", "md")}>
              View your profile
            </Link>
          }
        />
      </div>
    );
  }

  const solvedPuzzles = Object.values(state.puzzles.solved).filter(Boolean).length;
  const completed = state.debates.filter((d) => d.status === "complete");
  const accuracy =
    state.puzzles.attempts > 0
      ? Math.round((state.puzzles.correct / state.puzzles.attempts) * 100)
      : null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="md:w-80">
          <PlayerCard
            name={user.displayName}
            country={user.country}
            overall={state.overallElo}
            ratings={state.ratings}
            coachSlug={user.coachSlug}
            coachName={coachNameFromSlug(user.coachSlug)}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">{user.displayName}</h1>
          <p className="text-sm text-fg-muted">
            {flagFor(user.country)} {user.country || "Somewhere on Earth"} ·
            joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Debates", completed.length],
              ["Puzzles", `${solvedPuzzles}/${PUZZLES.length}`],
              ["Accuracy", accuracy === null ? "—" : `${accuracy}%`],
              ["Streak", `${state.puzzles.streak}d`],
            ].map(([label, value]) => (
              <Card key={label} className="p-3 text-center">
                <p className="numeric text-xl font-black">{value}</p>
                <p className="text-xs text-fg-muted">{label}</p>
              </Card>
            ))}
          </div>

          <SectionTitle className="mt-6">Recent rounds</SectionTitle>
          {completed.length === 0 ? (
            <p className="mt-2 text-sm text-fg-muted">
              No finished debates yet — the profile fills in as you play.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {completed.slice(0, 4).map((d) => (
                <Link
                  key={d.id}
                  href={`/debate/results/${d.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 p-3 text-sm transition-colors hover:bg-surface-2"
                >
                  <BotFace slug={d.botSlug} name={d.botName} size={32} />
                  <span className="min-w-0 flex-1 truncate">
                    vs {d.botName} · {d.motionText}
                  </span>
                  <Badge
                    tone={
                      d.judgement?.winner === "user"
                        ? "brand"
                        : d.judgement?.winner === "bot"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {d.judgement?.winner === "user"
                      ? "W"
                      : d.judgement?.winner === "bot"
                        ? "L"
                        : "="}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}
