"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateState, useAppState } from "@/lib/store";
import { buttonClass } from "@/components/ui";

export default function BotActions({
  slug,
  name,
  playable,
}: {
  slug: string;
  name: string;
  playable: boolean;
}) {
  const router = useRouter();
  const { user } = useAppState();
  const isCoach = user?.coachSlug === slug;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-1 p-5">
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          disabled={!playable}
          onClick={() =>
            router.push(
              user
                ? `/debate/setup?bot=${slug}`
                : `/signup`
            )
          }
          className={buttonClass("primary", "lg")}
        >
          {playable ? `Challenge ${name}` : "Coming later"}
        </button>
        <button
          type="button"
          disabled={!playable || !user}
          onClick={() =>
            updateState((s) => ({
              ...s,
              user: s.user && { ...s.user, coachSlug: isCoach ? null : slug },
            }))
          }
          className={buttonClass("secondary", "lg")}
        >
          {!user
            ? "Sign in to choose a coach"
            : isCoach
              ? "Remove as coach"
              : "Choose as coach"}
        </button>
      </div>
      {!user && (
        <p className="mt-3 text-xs text-fg-faint">
          You can browse every bot as a guest; debating needs a free account.
        </p>
      )}
    </div>
  );
}
