"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/auth/client";
import { hydrateFromServer } from "@/lib/sync";
import { useAppState, useHydrated } from "@/lib/store";

/**
 * Route guard: waits for hydration + session restore, then redirects to login
 * when there is no signed-in user.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAppState();
  const hydrated = useHydrated();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    void (async () => {
      if (authConfigured()) {
        const supabase = createClient();
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (sessionUser && !user) {
          await hydrateFromServer();
          if (cancelled) return;
        }
        if (!sessionUser) {
          setChecking(false);
          router.replace("/login");
          return;
        }
      } else if (!user) {
        setChecking(false);
        router.replace("/login");
        return;
      }
      if (!cancelled) setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, router]);

  if (!hydrated || checking || !user) {
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
