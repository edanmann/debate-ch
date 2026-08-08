"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth/client";
import { DEFAULT_COACH_SLUG } from "@/lib/coach";
import { updateState, useAppState } from "@/lib/store";
import { buttonClass, Card } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const { user } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function createLocalProfile(trimmed: string) {
    updateState((s) => ({
      ...s,
      user: {
        id: crypto.randomUUID(),
        displayName: "",
        email: trimmed,
        country: "",
        avatar: null,
        coachSlug: DEFAULT_COACH_SLUG,
        celebration: "confetti",
        createdAt: Date.now(),
      },
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("That doesn't look like an email address.");
      return;
    }
    if (password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);

    // Create the local profile first so onboarding has something to fill in,
    // then register it with the account service when one is configured.
    createLocalProfile(trimmed);
    const res = await signUp(trimmed, password);
    setBusy(false);

    if (!res.configured) {
      setNote(
        "Saved on this device. Accounts sync across devices once a database is connected."
      );
      router.push("/onboarding");
      return;
    }
    if (!res.ok) {
      setError(res.message ?? "Could not create the account.");
      return;
    }
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Keep your rating, your history and every bot unlocked.
      </p>
      <Card className="mt-6 p-6">
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              placeholder="At least 8 characters"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className={`${buttonClass("primary", "lg")} w-full`}
          >
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        {note && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-fg-muted">{note}</p>}
      </Card>
      {user && (
        <p className="mt-4 text-sm text-fg-muted">
          You already have a profile on this device.{" "}
          <Link href="/home" className="text-brand underline">Go to your dashboard</Link>.
        </p>
      )}
      <p className="mt-4 text-center text-sm text-fg-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand underline">Log in</Link>
      </p>
    </div>
  );
}
