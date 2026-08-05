"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAppState, useHydrated } from "@/lib/store";

/**
 * Client-side route guard for mock-auth mode. In production this becomes
 * server-side session validation (docs/KNOWN_LIMITATIONS.md).
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAppState();
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4 py-8">
        <div className="h-8 w-1/3 rounded-lg bg-surface-2" />
        <div className="h-40 rounded-2xl bg-surface-2" />
        <div className="h-40 rounded-2xl bg-surface-2" />
      </div>
    );
  }
  return <>{children}</>;
}
