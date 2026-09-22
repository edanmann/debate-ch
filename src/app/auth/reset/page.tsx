"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePassword } from "@/lib/auth/client";
import { buttonClass, Card } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await updatePassword(password);
    setBusy(false);
    if (!res.ok) {
      setError(res.message ?? "Could not update the password.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/home"), 1200);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-sm text-fg-muted">
        You arrived here from the reset link in your email.
      </p>
      <Card className="mt-6 p-6">
        {done ? (
          <p className="text-sm text-fg-muted">Password updated. Taking you in…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
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
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
        <p className="mt-4 text-sm text-fg-muted">
          <Link href="/login" className="text-brand underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
