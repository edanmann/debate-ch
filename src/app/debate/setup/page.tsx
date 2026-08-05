import type { Metadata } from "next";
import Link from "next/link";
import { getBotBySlug, toCardData } from "@/lib/bots";
import { ButtonLink, EmptyState } from "@/components/ui";
import SetupClient from "./setup-client";

export const metadata: Metadata = { title: "Debate Setup" };

export default async function DebateSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ bot?: string }>;
}) {
  const sp = await searchParams;
  const bot = sp.bot ? getBotBySlug(sp.bot) : null;

  if (!bot || bot.status !== "active") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Pick an opponent first"
          body="Debate setup starts from a bot. Choose one from the directory — filter by level, category or the skill you want to train."
          action={<ButtonLink href="/bots">Browse bots</ButtonLink>}
        />
        <p className="mt-4 text-center text-sm text-fg-muted">
          Want a human opponent instead?{" "}
          <Link className="text-brand underline" href="/debate/friend">
            Invite a friend
          </Link>{" "}
          or{" "}
          <Link className="text-brand underline" href="/debate/online">
            join the matchmaking waitlist
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <SetupClient bot={toCardData(bot)} />
  );
}
