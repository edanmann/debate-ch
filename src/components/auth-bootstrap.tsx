"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { authConfigured } from "@/lib/auth/client";
import { hydrateFromServer } from "@/lib/sync";
import { updateState } from "@/lib/store";

/**
 * Restores the Supabase session into local app state on first paint, and
 * clears the local user when the session ends.
 */
export default function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const once = useRef(false);

  useEffect(() => {
    if (once.current || !authConfigured()) return;
    once.current = true;

    const supabase = createClient();

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await hydrateFromServer();
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        updateState((s) => ({
          ...s,
          archivedUser: s.user ?? s.archivedUser,
          user: null,
        }));
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void hydrateFromServer();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
