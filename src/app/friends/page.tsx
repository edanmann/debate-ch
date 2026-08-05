"use client";

import RequireAuth from "@/components/require-auth";
import { ButtonLink, Card, EmptyState } from "@/components/ui";

function Friends() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Friends</h1>
      <p className="mt-2 text-fg-muted">
        Add friends, invite them to private debates, and control who can see
        your rounds.
      </p>

      <div className="mt-6">
        <EmptyState
          title="No friends yet"
          body="Friend search, requests and blocking run on the hosted backend. In this local demo you can still generate a private lobby link to share."
          action={<ButtonLink href="/debate/friend">Create an invite link</ButtonLink>}
        />
      </div>

      <Card className="mt-6 p-5 text-sm">
        <p className="font-semibold">Privacy defaults (enforced when hosted)</p>
        <ul className="mt-2 space-y-1.5 text-fg-muted">
          <li>• Only friends can invite you to debates.</li>
          <li>• Your replays are private unless you share them.</li>
          <li>• Your activity feed is visible to friends only.</li>
          <li>• Blocking removes all interaction both ways, silently.</li>
        </ul>
      </Card>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <RequireAuth>
      <Friends />
    </RequireAuth>
  );
}
