"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adoptProfile, logIn } from "@/lib/auth/client";
import { getState, logBackIn, useAppState } from "@/lib/store";
import { buttonClass, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const entered = email.trim().toLowerCase();
    setBusy(true);
    setError(null);

    const res = await logIn(entered, password);

    if (res.configured) {
      setBusy(false);
      if (!res.ok) {
        setError(res.message ?? "Email or password is incorrect.");
        return;
      }
      // Restore everything the account had, then go straight in — no repeat
      // of onboarding for a returning player.
      adoptProfile(res.profile);
      router.push(getState().user?.displayName ? "/home" : "/onboarding");
      return;
    }

    // Demo mode: fall back to the device-local profile.
    setBusy(false);
    const existing = getState().user;
    if (existing && existing.email === entered) {
      router.push("/home");
      return;
    }
    if (logBackIn(entered)) {
      router.push(getState().user?.displayName ? "/home" : "/onboarding");
      return;
    }
    setError(
      "No account found on this device. Sign up, or connect a database to log in from anywhere."
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-fg-muted">Log in to continue your progression.</p>
      <Card className="mt-6 p-6">
        {user ? (
          <div className="space-y-4">
            <p className="text-sm">
              Signed in as <strong>{user.displayName || user.email}</strong>.
            </p>
            <Link href="/home" className={`${buttonClass("primary", "lg")} w-full`}>
              Go to dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="Your password"
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className={`${buttonClass("primary", "lg")} w-full`}
            >
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>
        )}
      </Card>
      <div className="mt-4 flex justify-between text-sm text-fg-muted">
        <Link href="/forgot-password" className="underline hover:text-fg">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-brand underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
