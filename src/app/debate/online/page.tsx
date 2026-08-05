"use client";

import Link from "next/link";
import { useState } from "react";
import { FORMATS } from "@/lib/formats";
import { updateState, useAppState } from "@/lib/store";
import RequireAuth from "@/components/require-auth";
import { buttonClass, Card } from "@/components/ui";

function OnlineDebate() {
  const { user, waitlist } = useAppState();
  const [formatId, setFormatId] = useState("rapid");
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [consent, setConsent] = useState(false);
  const [joined, setJoined] = useState(false);

  function join(e: React.FormEvent) {
    e.preventDefault();
    updateState((s) => ({
      ...s,
      waitlist: { email: email.trim(), consent, createdAt: Date.now(), notified: false },
    }));
    setJoined(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Debate Online</h1>
      <p className="mt-2 text-fg-muted">
        Rated rounds against other people, matched by rating and format.
      </p>

      <h2 className="mt-6 font-bold">Choose your format</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFormatId(f.id)}
            aria-pressed={formatId === f.id}
            className={`rounded-xl border px-4 py-3 text-left transition-colors ${
              formatId === f.id
                ? "border-brand bg-brand/10"
                : "border-border-subtle bg-surface-1 hover:border-brand/40"
            }`}
          >
            <p className="flex items-baseline justify-between font-semibold">
              {f.name}
              <span className="numeric text-xs text-fg-muted">{f.approxTotalLabel}</span>
            </p>
            <p className="text-xs text-fg-muted">{f.tagline}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`${buttonClass("primary", "xl")} mt-6 w-full`}
      >
        Find an opponent
      </button>

      {waitlist && (
        <p className="mt-4 text-sm text-fg-muted">
          You&apos;re on the launch list as <strong>{waitlist.email}</strong>.
          We&apos;ll email you when instant matchmaking goes live.
        </p>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-title"
          onClick={() => setShowModal(false)}
        >
          <Card className="w-full max-w-md p-6" >
            <div onClick={(e) => e.stopPropagation()}>
              {!joined ? (
                <>
                  <h2 id="waitlist-title" className="text-xl font-extrabold">
                    Instant matchmaking is coming soon
                  </h2>
                  <p className="mt-2 text-sm text-fg-muted">
                    Join the launch list and we will notify you when it is
                    available. Until then, bots are always ready.
                  </p>
                  <form onSubmit={join} className="mt-4 space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-label="Email for launch notification"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                    <label className="flex items-start gap-2 text-xs text-fg-muted">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 accent-[#81b64c]"
                      />
                      I agree to receive one launch email about matchmaking. No
                      other marketing; my address is used for nothing else and I
                      can remove it anytime in Settings.
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className={`${buttonClass("secondary", "md")} flex-1`}
                      >
                        Not now
                      </button>
                      <button type="submit" className={`${buttonClass("primary", "md")} flex-1`}>
                        Notify me
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold">You&apos;re on the list</h2>
                  <p className="mt-2 text-sm text-fg-muted">
                    We&apos;ll email {email} when instant matchmaking launches.
                    Meanwhile, the {FORMATS.find((f) => f.id === formatId)?.name}{" "}
                    queue of bots never sleeps.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={`${buttonClass("secondary", "md")} flex-1`}
                    >
                      Close
                    </button>
                    <Link href="/bots" className={`${buttonClass("primary", "md")} flex-1`}>
                      Debate a bot now
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function OnlineDebatePage() {
  return (
    <RequireAuth>
      <OnlineDebate />
    </RequireAuth>
  );
}
