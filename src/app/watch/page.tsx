import type { Metadata } from "next";
import Link from "next/link";
import { getReplays } from "@/lib/replays";
import { Badge, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Watch Debates" };

const TABS = ["replays", "live", "upcoming", "following"] as const;

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = (TABS as readonly string[]).includes(sp.tab ?? "")
    ? (sp.tab as (typeof TABS)[number])
    : "replays";
  const replays = getReplays();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Watch</h1>
      <p className="mt-2 text-fg-muted">
        Follow debates with transcripts, key clashes and judge commentary.
      </p>

      <div className="mt-6 flex gap-1 rounded-xl bg-surface-1 p-1">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/watch?tab=${t}`}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium capitalize ${
              tab === t ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {tab === "replays" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {replays.map((r) => (
              <Link
                key={r.id}
                href={`/watch/${r.id}`}
                className="rounded-2xl border border-border-subtle bg-surface-1 p-4 transition-colors hover:border-brand/40"
              >
                <div className="flex items-center gap-2">
                  <Badge tone="info">Simulated exhibition</Badge>
                  <Badge>{r.formatId}</Badge>
                </div>
                <p className="mt-2 font-bold">{r.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-fg-muted">{r.motionText}</p>
                <p className="mt-2 text-xs text-fg-faint">{r.summary}</p>
              </Link>
            ))}
          </div>
        )}
        {tab === "live" && (
          <EmptyState
            title="No live debates right now"
            body="Live streaming arrives with public matchmaking. Nothing here is faked — when you see a live round, it's real."
          />
        )}
        {tab === "upcoming" && (
          <EmptyState
            title="Nothing scheduled yet"
            body="Scheduled exhibition debates will appear here once the events system ships."
          />
        )}
        {tab === "following" && (
          <EmptyState
            title="You aren't following anyone"
            body="Follow debaters from their profiles to see their rounds here. Profiles of other players arrive with the hosted platform."
          />
        )}
      </div>
    </div>
  );
}
