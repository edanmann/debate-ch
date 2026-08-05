"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createDebate } from "@/lib/debate";
import { FLAGS } from "@/lib/flags";
import { FORMATS } from "@/lib/formats";
import { useAppState } from "@/lib/store";
import type { BotCardData } from "@/lib/types";
import { BotFace } from "@/components/bot-face";
import RequireAuth from "@/components/require-auth";
import { Badge, buttonClass, Card } from "@/components/ui";

function Setup({ bot }: { bot: BotCardData }) {
  const router = useRouter();
  const { user } = useAppState();
  const [formatId, setFormatId] = useState(user?.preferredLengthId ?? "rapid");
  const [rated, setRated] = useState(true);
  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [micState, setMicState] = useState<"idle" | "checking" | "ok" | "denied">("idle");
  const [confirming, setConfirming] = useState(false);
  const [starting, setStarting] = useState(false);

  const format = FORMATS.find((f) => f.id === formatId) ?? FORMATS[2];

  async function checkMic() {
    setMicState("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicState("ok");
    } catch {
      setMicState("denied");
    }
  }

  function start() {
    setStarting(true);
    const debate = createDebate({
      botSlug: bot.slug,
      botName: bot.name,
      difficulty: "standard",
      formatId: format.id,
      rated,
      mode,
    });
    router.push(`/debate/room/${debate.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Set up your round</h1>

      <Card className="mt-6 flex items-center gap-4 p-5">
        <BotFace slug={bot.slug} name={bot.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{bot.name}</p>
          <p className="text-sm text-fg-muted">
            {bot.archetype} · Rating {bot.overallRating}
          </p>
        </div>
      </Card>

      {!confirming ? (
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="font-bold">Format</h2>
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
          </section>

          <section>
            <h2 className="font-bold">Mode</h2>
            <p className="text-sm text-fg-muted">
              Debates are spoken. You&apos;ll need a microphone.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode("audio")}
                aria-pressed={mode === "audio"}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "audio"
                    ? "border-brand bg-brand/10"
                    : "border-border-subtle hover:border-brand/40"
                }`}
              >
                🎙 Audio
              </button>
              <button
                type="button"
                onClick={() => setMode("video")}
                aria-pressed={mode === "video"}
                disabled={!FLAGS.liveVideo}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "video"
                    ? "border-brand bg-brand/10"
                    : "border-border-subtle text-fg-faint"
                }`}
              >
                📹 Video {FLAGS.liveVideo ? "" : "— coming soon"}
              </button>
            </div>
            <button
              type="button"
              onClick={checkMic}
              className={`${buttonClass("secondary", "sm")} mt-3`}
            >
              {micState === "idle"
                ? "Check microphone"
                : micState === "checking"
                  ? "Checking…"
                  : micState === "ok"
                    ? "Microphone ready ✓"
                    : "Microphone blocked ✗"}
            </button>
            {micState === "denied" && (
              <p className="mt-2 text-xs text-danger">
                Allow microphone access in your browser, then check again.
                Debates.ch has no text mode.
              </p>
            )}
          </section>

          <section className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-1 p-4">
            <div>
              <p className="font-semibold">Rated round</p>
              <p className="text-sm text-fg-muted">
                {rated
                  ? "Results update your six skill ratings. No live coaching."
                  : "Practice mode — nothing counts, coaching allowed."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={rated}
              aria-label="Rated round"
              onClick={() => setRated(!rated)}
              className={`relative h-7 w-12 rounded-full transition-colors ${rated ? "bg-brand" : "bg-surface-3"}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${rated ? "left-6" : "left-1"}`}
              />
            </button>
          </section>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className={`${buttonClass("primary", "xl")} w-full`}
          >
            Review and start
          </button>
        </div>
      ) : (
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-extrabold">Final check</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-fg-muted">Opponent</dt>
              <dd className="font-semibold">{bot.name}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Format</dt>
              <dd className="font-semibold">{format.name} · {format.approxTotalLabel}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Mode</dt>
              <dd className="font-semibold">
                {mode === "video" ? "Video" : "Audio"} · {rated ? "Rated" : "Practice"}
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted">Motion &amp; side</dt>
              <dd className="font-semibold">Assigned by the app — shown at the start</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-fg-muted">What is recorded</dt>
              <dd>
                A live transcript of your spoken speeches plus your private
                notes, stored only on this device in demo mode. Audio itself is
                never uploaded. You can delete any debate from History.
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-fg-muted">
            Keep it about the arguments. Personal abuse ends rounds and, on the
            hosted platform, accounts.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={`${buttonClass("secondary", "lg")} flex-1`}
            >
              Back
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={start}
              className={`${buttonClass("primary", "lg")} flex-1`}
            >
              {starting ? "Drawing motion…" : "Start debate"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function SetupClient(props: { bot: BotCardData }) {
  return (
    <RequireAuth>
      <Setup {...props} />
    </RequireAuth>
  );
}
