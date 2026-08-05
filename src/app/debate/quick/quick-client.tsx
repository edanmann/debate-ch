"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createDebate } from "@/lib/debate";
import { getState, useAppState } from "@/lib/store";
import RequireAuth from "@/components/require-auth";

/**
 * "Debate 10 Minutes" fast path: Rapid format, random motion and side, and an
 * opponent whose designed rating sits a little above the player's — enough to
 * stretch, not to flatten.
 */
function Quick({ bots }: { bots: { slug: string; name: string; rating: number }[] }) {
  const router = useRouter();
  const { user } = useAppState();
  const started = useRef(false);

  useEffect(() => {
    if (!user || started.current) return;
    started.current = true;
    const ovr = getState().overallElo;
    const target = Math.min(95, ovr + 10);
    const sorted = [...bots].sort(
      (a, b) => Math.abs(a.rating - target) - Math.abs(b.rating - target)
    );
    const pool = sorted.slice(0, 4);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const debate = createDebate({
      botSlug: pick.slug,
      botName: pick.name,
      difficulty: "standard",
      formatId: "rapid",
      rated: true,
    });
    router.replace(`/debate/room/${debate.id}`);
  }, [user, bots, router]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 text-center">
      <p className="text-lg font-bold">Finding your opponent…</p>
      <p className="text-sm text-fg-muted">
        Rapid format · the app draws your motion and side.
      </p>
    </div>
  );
}

export default function QuickStart(props: {
  bots: { slug: string; name: string; rating: number }[];
}) {
  return (
    <RequireAuth>
      <Quick {...props} />
    </RequireAuth>
  );
}
