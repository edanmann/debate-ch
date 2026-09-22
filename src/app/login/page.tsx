"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { hasDisplayName, logIn } from "@/lib/auth/client";
import { useAppState } from "@/lib/store";
import { buttonClass, Card } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth"
      ? "That sign-in link expired. Try logging in again."
      : null
  );
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const entered = email.trim().toLowerCase();
    setBusy(true);
    setError(null);

    const res = await logIn(entered, password);
    setBusy(false);

    if (!res.ok) {
      setError(res.message ?? "Email or password is incorrect.");
      return;
    }
    router.push(hasDisplayName() ? "/home" : "/onboarding");
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
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            {error && <p className="text-sm text-blunder">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className={`${buttonClass("primary", "lg")} w-full`}
            >
              {busy ? "Signing in…" : "Log in"}
            </button>
          </form>
        )}
        <p className="mt-4 text-sm text-fg-muted">
          <Link href="/forgot-password" className="text-brand underline">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          New here?{" "}
          <Link href="/signup" className="text-brand underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md animate-pulse py-12">
          <div className="h-8 w-1/2 rounded-lg bg-surface-2" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
