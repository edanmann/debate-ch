"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState, useHydrated } from "@/lib/store";
import { DebateReviewInteractive } from "@/components/debate-review-interactive";
import { buttonClass, EmptyState } from "@/components/ui";

/**
 * The full-page Debate Review — every line of a finished round graded like a
 * chess move, on its own page rather than a popup, so there's room to work
 * through the whole transcript without fighting a modal's scroll area.
 */
export default function DebateReviewPage() {
  const params = useParams<{ debateId: string }>();
  const { user, debates } = useAppState();
  const hydrated = useHydrated();
  const debate = debates.find((d) => d.id === params.debateId) ?? null;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
        <div className="h-40 rounded-2xl bg-surface-2" />
      </div>
    );
  }

  if (!debate || !debate.judgement) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="No result here"
          body="This debate has no judgement yet — it may be unfinished or abandoned."
          action={
            <Link href="/history" className={buttonClass("primary", "md")}>
              Open history
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/debate/results/${debate.id}`}
          className="text-sm font-semibold text-fg-muted hover:text-fg"
        >
          ← Back to results
        </Link>
      </div>
      <div className="mt-4">
        <DebateReviewInteractive
          debate={debate}
          judgement={debate.judgement}
          botSlug={debate.botSlug}
          botName={debate.botName}
          coachSlug={user?.coachSlug}
          userDisplayName={user?.displayName ?? "You"}
        />
      </div>
      <p className="mt-4 rounded-2xl border border-border-subtle bg-surface-1 p-4 text-xs text-fg-faint">
        {debate.judgement.disclaimer}
      </p>
    </div>
  );
}
