"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth/client";
import { buttonClass, Card } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("That doesn't look like an email address.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    const res = await requestPasswordReset(trimmed);
    setBusy(false);
    if (!res.ok) {
      setError(res.message ?? "Could not send the reset email.");
      return;
    }
    setNote(res.message ?? "Check your inbox for the reset link.");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Password reset</h1>
      <p className="mt-2 text-sm text-fg-muted">
        We will email you a link to choose a new password.
      </p>
      <Card className="mt-6 p-6">
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
          {error && <p className="text-sm text-blunder">{error}</p>}
          {note && <p className="text-sm text-brand">{note}</p>}
          <button
            type="submit"
            disabled={busy}
            className={`${buttonClass("primary", "lg")} w-full`}
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-4 text-sm text-fg-muted">
          <Link href="/login" className="text-brand underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
