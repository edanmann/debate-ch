"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import RequireAuth from "@/components/require-auth";
import { buttonClass, Badge, ProgressBar } from "@/components/ui";
import { formatClock, getFormat } from "@/lib/formats";
import {
  fetchFriendLobby,
  lobbyAsJudgeDebate,
  myName,
  myRole,
  mySide,
  opponentName,
  patchFriendLobby,
  subscribeFriendLobby,
  type FriendLobby,
  type FriendSpeech,
} from "@/lib/friend-lobby";
import { createRecognizer, sttSupported, type Recognizer } from "@/lib/stt";
import {
  endPhaseEarly,
  overallProgress,
  tickEngine,
  type EngineState,
} from "@/lib/timer-engine";
import { useAppState, useHydrated } from "@/lib/store";
import type { JudgeResult } from "@/lib/types";

function engineOf(lobby: FriendLobby, phaseCount: number): EngineState {
  return {
    phaseIndex: lobby.phase_index,
    remainingSec: lobby.phase_remaining_sec,
    finished: lobby.phase_index >= phaseCount,
  };
}

function FriendRoomInner() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { user } = useAppState();
  const hydrated = useHydrated();
  const code = params.code;

  const [lobby, setLobby] = useState<FriendLobby | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [busy, setBusy] = useState(false);
  const [judgeError, setJudgeError] = useState(false);
  const [localJudgement, setLocalJudgement] = useState<JudgeResult | null>(null);

  const lobbyRef = useRef(lobby);
  const finalTextRef = useRef(finalText);
  const recognizer = useRef<Recognizer | null>(null);
  const finalizing = useRef(false);
  const tickOwner = useRef(false);

  useEffect(() => {
    lobbyRef.current = lobby;
    finalTextRef.current = finalText;
  });

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    void fetchFriendLobby(code).then((row) => {
      if (cancelled) return;
      if (!row) setLoadError("Lobby not found");
      else setLobby(row);
    });
    const unsub = subscribeFriendLobby(code, (row) => {
      if (!cancelled) setLobby(row);
    });
    const poll = window.setInterval(() => {
      void fetchFriendLobby(code).then((row) => {
        if (row && !cancelled) setLobby(row);
      });
    }, 2000);
    return () => {
      cancelled = true;
      unsub();
      window.clearInterval(poll);
    };
  }, [code]);

  const role = lobby && user ? myRole(lobby, user.id) : null;
  const format = lobby ? getFormat(lobby.format_id) : null;
  const engine = lobby && format ? engineOf(lobby, format.phases.length) : null;
  const phase =
    engine && !engine.finished && format ? format.phases[engine.phaseIndex] : null;
  const side = role ? mySide(lobby!, role) : null;
  const isMySpeech =
    Boolean(phase && phase.kind === "speech" && phase.speaker === side);
  const isPrep = phase?.kind === "prep";

  // Host owns the shared clock.
  useEffect(() => {
    if (!lobby || !format || !role || lobby.status === "complete") return;
    if (role !== "host") return;
    if (lobby.status !== "in_progress") return;
    tickOwner.current = true;
    const id = window.setInterval(() => {
      const current = lobbyRef.current;
      if (!current || current.status !== "in_progress") return;
      const f = getFormat(current.format_id);
      if (!f) return;
      const eng = engineOf(current, f.phases.length);
      if (eng.finished) return;
      const { state: next } = tickEngine(f, eng);
      if (next.remainingSec === eng.remainingSec && next.phaseIndex === eng.phaseIndex)
        return;
      void patchFriendLobby(current.code, {
        phase_index: next.phaseIndex,
        phase_remaining_sec: next.remainingSec,
      }).catch(() => undefined);
    }, 1000);
    return () => {
      window.clearInterval(id);
      tickOwner.current = false;
    };
  }, [lobby?.code, lobby?.status, role, format?.id]);

  // Auto-start when both mark ready during prep / lobby ready.
  useEffect(() => {
    if (!lobby || !role || !format) return;
    if (lobby.status === "ready" && lobby.host_ready && lobby.guest_ready) {
      void patchFriendLobby(lobby.code, {
        status: "in_progress",
        host_ready: false,
        guest_ready: false,
        phase_index: 0,
        phase_remaining_sec: format.phases[0]?.durationSec ?? 30,
      }).catch(() => undefined);
    }
  }, [lobby, role, format]);

  // Finalize when phases finish.
  useEffect(() => {
    if (!lobby || !format || !role) return;
    if (lobby.status === "complete" || lobby.judgement || localJudgement) {
      if (lobby.judgement) setLocalJudgement(lobby.judgement);
      return;
    }
    const eng = engineOf(lobby, format.phases.length);
    if (!eng.finished || finalizing.current) return;
    if (role !== "host") return;
    finalizing.current = true;
    void (async () => {
      try {
        const payload = lobbyAsJudgeDebate(lobby);
        const res = await fetch("/api/debate/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ debate: payload }),
        });
        if (!res.ok) throw new Error("judge-failed");
        const { result } = (await res.json()) as { result: JudgeResult };
        await patchFriendLobby(lobby.code, {
          status: "complete",
          judgement: result,
        });
        setLocalJudgement(result);
      } catch {
        setJudgeError(true);
        finalizing.current = false;
      }
    })();
  }, [lobby, format, role, localJudgement]);

  const markReady = useCallback(async () => {
    if (!lobby || !role) return;
    setBusy(true);
    try {
      if (lobby.status === "waiting") return;
      const patch =
        role === "host" ? { host_ready: true } : { guest_ready: true };
      // Ensure status is ready once both present.
      await patchFriendLobby(lobby.code, {
        ...patch,
        status: lobby.guest_id ? "ready" : lobby.status,
      });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not ready up");
    } finally {
      setBusy(false);
    }
  }, [lobby, role]);

  const endMySpeech = useCallback(async () => {
    const current = lobbyRef.current;
    if (!current || !role || !format) return;
    const eng = engineOf(current, format.phases.length);
    if (eng.finished) return;
    const ph = format.phases[eng.phaseIndex];
    if (!ph || ph.kind !== "speech" || ph.speaker !== mySide(current, role))
      return;

    const text = (finalTextRef.current || interim || "").trim() || "(no speech delivered)";
    recognizer.current?.stop();
    setListening(false);

    const speech: FriendSpeech = {
      phaseId: ph.id,
      phaseName: ph.name,
      speaker: role,
      side: mySide(current, role),
      text,
      createdAt: Date.now(),
    };
    const transcript = [...current.transcript, speech];
    const { state: next } = endPhaseEarly(format, eng);
    setBusy(true);
    try {
      await patchFriendLobby(current.code, {
        transcript,
        phase_index: next.phaseIndex,
        phase_remaining_sec: next.remainingSec,
        status: "in_progress",
      });
      setFinalText("");
      setInterim("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not submit speech");
    } finally {
      setBusy(false);
    }
  }, [role, format, interim]);

  // Mic for my turn.
  useEffect(() => {
    if (!isMySpeech || !lobby || lobby.status !== "in_progress") {
      recognizer.current?.stop();
      setListening(false);
      return;
    }
    if (!sttSupported()) {
      setMicError("Speech capture needs Chrome or Edge.");
      return;
    }
    setMicError(null);
    const rec = createRecognizer({
      onFinal: (t) => {
        setInterim("");
        setFinalText((prev) => (prev ? `${prev} ${t}` : t));
      },
      onInterim: setInterim,
      onError: (msg) => {
        setMicError(msg === "not-allowed" ? "Microphone permission denied." : msg);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!rec) {
      setMicError("Speech capture needs Chrome or Edge.");
      return;
    }
    recognizer.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setMicError("Could not start the microphone.");
    }
    return () => {
      rec.stop();
      recognizer.current = null;
      setListening(false);
    };
  }, [isMySpeech, lobby?.status, lobby?.phase_index]);

  // Skip prep early when both ready during in_progress prep.
  useEffect(() => {
    if (!lobby || !format || !isPrep || role !== "host") return;
    if (lobby.status !== "in_progress") return;
    if (lobby.host_ready && lobby.guest_ready) {
      const eng = engineOf(lobby, format.phases.length);
      const { state: next } = endPhaseEarly(format, eng);
      void patchFriendLobby(lobby.code, {
        host_ready: false,
        guest_ready: false,
        phase_index: next.phaseIndex,
        phase_remaining_sec: next.remainingSec,
      }).catch(() => undefined);
    }
  }, [lobby, format, isPrep, role]);

  if (!hydrated || (!lobby && !loadError)) {
    return <div className="p-10 text-sm text-fg-muted">Loading room…</div>;
  }
  if (loadError || !lobby || !format || !role || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-semibold">{loadError ?? "You are not in this lobby."}</p>
        <Link href="/debate/friend" className={`${buttonClass("primary", "md")} mt-6 inline-flex`}>
          Back to friend lobby
        </Link>
      </div>
    );
  }

  const judgement = localJudgement ?? lobby.judgement;
  const me = myName(lobby, role);
  const them = opponentName(lobby, role);
  const progress = engine ? overallProgress(format, engine) : 0;

  if (lobby.status === "complete" || judgement) {
    const iAmHost = role === "host";
    const winnerLabel =
      !judgement
        ? "…"
        : judgement.winner === "too-close"
          ? "Too close"
          : judgement.winner === "user"
            ? lobby.host_name
            : lobby.guest_name;
    const myScores = iAmHost ? judgement?.user : judgement?.bot;
    const theirScores = iAmHost ? judgement?.bot : judgement?.user;

    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">Friend debate result</h1>
        <p className="mt-2 text-fg-muted">{lobby.motion_text}</p>
        {judgeError && !judgement && (
          <p className="mt-4 text-sm text-blunder">
            Judge unavailable. Speeches are saved — retry from the lobby later.
          </p>
        )}
        {judgement && (
          <div className="mt-6 space-y-4">
            <p className="text-xl font-bold">Winner: {winnerLabel}</p>
            <p className="text-sm text-fg-muted">{judgement.explanation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 p-4">
                <p className="font-semibold">{me} (you)</p>
                <p className="text-2xl font-extrabold">{myScores?.overall ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-surface-2 p-4">
                <p className="font-semibold">{them}</p>
                <p className="text-2xl font-extrabold">{theirScores?.overall ?? "—"}</p>
              </div>
            </div>
            <p className="text-xs text-fg-muted">{judgement.disclaimer}</p>
          </div>
        )}
        <div className="mt-8 flex gap-3">
          <Link href="/home" className={buttonClass("primary", "md")}>
            Home
          </Link>
          <Link href="/debate/friend" className={buttonClass("secondary", "md")}>
            New friend lobby
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for friend / ready-up before in_progress.
  if (lobby.status === "waiting" || lobby.status === "ready") {
    const iReady = role === "host" ? lobby.host_ready : lobby.guest_ready;
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-2xl font-extrabold">Ready check</h1>
        <p className="mt-2 text-fg-muted">{lobby.motion_text}</p>
        <p className="mt-4 text-sm">
          You: <strong>{me}</strong> · {side?.toUpperCase()}
        </p>
        <p className="text-sm">
          Opponent: <strong>{them || "…"}</strong>
        </p>
        {!lobby.guest_id && (
          <p className="mt-4 text-sm text-warning">Waiting for your friend to join…</p>
        )}
        {lobby.guest_id && (
          <button
            type="button"
            disabled={busy || iReady}
            onClick={() => void markReady()}
            className={`${buttonClass("primary", "lg")} mt-6 w-full`}
          >
            {iReady ? "Waiting for opponent…" : "I'm ready — start"}
          </button>
        )}
        <button
          type="button"
          className={`${buttonClass("ghost", "md")} mt-3 w-full`}
          onClick={() => router.push(`/debate/friend?lobby=${lobby.code}`)}
        >
          Back to lobby
        </button>
      </div>
    );
  }

  const captured = `${finalText} ${interim}`.trim();
  const wordCount = captured ? captured.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 pb-28 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{lobby.motion_text}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge>You · {side?.toUpperCase()}</Badge>
            <Badge tone="neutral">{format.name}</Badge>
            {lobby.rated && <Badge tone="neutral">Rated</Badge>}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold tabular-nums">
            {formatClock(engine?.remainingSec ?? 0)}
          </p>
          <p className="text-xs text-fg-muted">{phase?.name ?? "…"}</p>
        </div>
      </div>
      <ProgressBar value={progress} className="mt-3" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl border p-4 ${
            isMySpeech ? "border-brand bg-brand/10" : "border-border-subtle bg-surface-2"
          }`}
        >
          <p className="font-semibold">{me}</p>
          <p className="text-xs text-fg-muted">
            {side?.toUpperCase()} · {isMySpeech ? "Your turn" : "Listening"}
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            !isMySpeech && phase?.kind === "speech"
              ? "border-brand bg-brand/10"
              : "border-border-subtle bg-surface-2"
          }`}
        >
          <p className="font-semibold">{them}</p>
          <p className="text-xs text-fg-muted">
            {side === "for" ? "AGAINST" : "FOR"} ·{" "}
            {!isMySpeech && phase?.kind === "speech" ? "Speaking" : "Listening"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex-1 rounded-2xl border border-border-subtle bg-surface-2 p-4">
        {isPrep && (
          <div className="space-y-3">
            <p className="font-semibold">Preparation</p>
            <p className="text-sm text-fg-muted">
              Sketch your case. Both of you must ready up to leave prep early, or
              wait for the clock.
            </p>
            <button
              type="button"
              disabled={busy || (role === "host" ? lobby.host_ready : lobby.guest_ready)}
              onClick={() => void markReady()}
              className={buttonClass("primary", "md")}
            >
              {(role === "host" ? lobby.host_ready : lobby.guest_ready)
                ? "Ready — waiting…"
                : "I'm ready"}
            </button>
          </div>
        )}

        {isMySpeech && (
          <div className="space-y-3">
            <p className="font-semibold">Your turn — speak</p>
            <p className="min-h-[5rem] text-sm leading-relaxed">
              {captured || (
                <span className="text-fg-muted">
                  {listening ? "Listening…" : "Microphone paused"}
                </span>
              )}
            </p>
            <p className="text-xs text-fg-muted">{wordCount} words captured</p>
            {micError && <p className="text-sm text-blunder">{micError}</p>}
            <button
              type="button"
              disabled={busy}
              onClick={() => void endMySpeech()}
              className={`${buttonClass("primary", "lg")} w-full`}
            >
              {busy ? "Sending…" : "End speech"}
            </button>
          </div>
        )}

        {!isPrep && !isMySpeech && phase?.kind === "speech" && (
          <div className="space-y-2">
            <p className="font-semibold">{them} is speaking</p>
            <p className="text-sm text-fg-muted">
              Their speech will appear here when they finish. Stay on this page.
            </p>
            {lobby.transcript
              .filter((t) => t.phaseId === phase.id)
              .map((t) => (
                <p key={t.createdAt} className="text-sm leading-relaxed">
                  {t.text}
                </p>
              ))}
          </div>
        )}

        {!phase && (
          <p className="text-sm text-fg-muted">Wrapping up — calling the judge…</p>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Transcript
        </p>
        <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
          {lobby.transcript.length === 0 && (
            <li className="text-fg-muted">No speeches yet.</li>
          )}
          {lobby.transcript.map((t) => (
            <li key={`${t.phaseId}-${t.createdAt}`}>
              <span className="font-semibold">
                {t.speaker === role ? me : them}
              </span>{" "}
              · {t.phaseName}
              <p className="text-fg-muted">{t.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FriendRoomPage() {
  return (
    <RequireAuth>
      <FriendRoomInner />
    </RequireAuth>
  );
}
