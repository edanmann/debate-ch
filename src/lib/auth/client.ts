"use client";

import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import { hydrateFromServer, pushPlayerState, pushProfile } from "@/lib/sync";
import { getState, logOut as localLogOut, updateState } from "@/lib/store";
import { DEFAULT_COACH_SLUG } from "@/lib/coach";

export interface AuthResult {
  ok: boolean;
  configured: boolean;
  message?: string;
  /** True when Supabase requires email confirmation before a session exists. */
  needsEmailConfirm?: boolean;
}

function siteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3001";
}

export function authConfigured(): boolean {
  try {
    return supabaseConfigured();
  } catch {
    return false;
  }
}

export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!authConfigured()) {
    return {
      ok: false,
      configured: false,
      message: "Supabase is not configured.",
    };
  }
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteOrigin()}/auth/callback`,
    },
  });
  if (error) {
    return { ok: false, configured: true, message: error.message };
  }

  if (data.user && !data.session) {
    return {
      ok: true,
      configured: true,
      needsEmailConfirm: true,
      message: "Check your email to confirm the account, then log in.",
    };
  }

  if (!data.session?.user) {
    return {
      ok: false,
      configured: true,
      message: "Could not create the session. Try logging in.",
    };
  }

  const user = data.session.user;
  updateState((s) => ({
    ...s,
    user: {
      id: user.id,
      displayName: "",
      email: email.trim().toLowerCase(),
      country: "",
      avatar: null,
      coachSlug: DEFAULT_COACH_SLUG,
      celebration: "confetti",
      createdAt: Date.now(),
    },
    archivedUser: null,
  }));
  await pushProfile();
  await pushPlayerState();
  return { ok: true, configured: true };
}

export async function logIn(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!authConfigured()) {
    return {
      ok: false,
      configured: false,
      message: "Supabase is not configured.",
    };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return {
      ok: false,
      configured: true,
      message: error.message || "Email or password is incorrect.",
    };
  }
  const ok = await hydrateFromServer();
  if (!ok) {
    return {
      ok: false,
      configured: true,
      message: "Signed in, but the profile could not be loaded.",
    };
  }
  return { ok: true, configured: true };
}

export async function logOutServer(): Promise<void> {
  if (!authConfigured()) return;
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(
  email: string
): Promise<AuthResult> {
  if (!authConfigured()) {
    return {
      ok: false,
      configured: false,
      message: "Supabase is not configured.",
    };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin()}/auth/reset`,
  });
  if (error) {
    return { ok: false, configured: true, message: error.message };
  }
  return {
    ok: true,
    configured: true,
    message: "If that email has an account, a reset link is on its way.",
  };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!authConfigured()) {
    return { ok: false, configured: false, message: "Supabase is not configured." };
  }
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, configured: true, message: error.message };
  }
  return { ok: true, configured: true };
}

/** Sign out of Supabase and clear the local user pointer. */
export async function signOutFully(): Promise<void> {
  await logOutServer();
  localLogOut();
}

/** Fire-and-forget progress push used by settings logout. */
export async function pushProgress(): Promise<void> {
  try {
    await pushProfile();
    await pushPlayerState();
  } catch {
    // Offline — local cache remains.
  }
}

export function hasDisplayName(): boolean {
  return Boolean(getState().user?.displayName);
}
