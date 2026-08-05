"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { presentationFor } from "@/lib/bot-presentation";
import { FLAGS } from "@/lib/flags";
import { formatClock, getFormat } from "@/lib/formats";
import { drawMotionWithPrefs, getAllMotions, getMotionById } from "@/lib/motions";
import { finalizeDebate, resignDebate } from "@/lib/results";
import { createRecognizer, sttSupported, type Recognizer } from "@/lib/stt";
import {
  endPhaseEarly,
  overallProgress,
  tickEngine,
  type EngineState,
} from "@/lib/timer-engine";
import { getState, saveDebate, useAppState, useHydrated } from "@/lib/store";
import { speakText, stopAllSpeech, ttsSupported } from "@/lib/voice";
import type { DebateRecord, TranscriptEntry } from "@/lib/types";
import { UserFace } from "@/components/user-face";
import { BotFace } from "@/components/bot-face";
import { buttonClass, Badge, ProgressBar } from "@/components/ui";

/**
 * Live audio/video debate room. Speech is the only input: the user speaks
 * (captured by speech recognition) and the bot replies with synthesised voice
 * while its cartoon face animates. There is no text mode.
 */

type Stage =
  | "loading"
  | "not-found"
  | "abandoned"
  | "redirect"
  | "prep"
  | "user-turn"
  | "bot-thinking"
  | "bot-speaking"
  | "finishing"
  | "judge-failed";

function engineOf(debate: DebateRecord, phaseCount: number): EngineState {
  return {
    phaseIndex: debate.phaseIndex,
    remainingSec: debate.phaseRemainingSec,
    finished: debate.phaseIndex >= phaseCount,
  };
}

export default function DebateRoomPage() {
  const params = useParams<{ debateId: string }>();
  const router = useRouter();
  const { user, debates } = useAppState();
  const hydrated = useHydrated();

  const debate = debates.find((d) => d.id === params.debateId) ?? null;
  const format = debate ? getFormat(debate.formatId) : null;
  const motion = debate ? getMotionById(debate.motionId) : null;
  const engine = debate && format ? engineOf(debate, format.phases.length) : null;
  const phase =
    engine && !engine.finished && format ? format.phases[engine.phaseIndex] : null;

  const [announce, setAnnounce] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [botError, setBotError] = useState(false);
  const [judgeError, setJudgeError] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [captionsOn, setCaptionsOn] = useState(true);
  const [muted, setMuted] = useState(false);
  const [panel, setPanel] = useState<"stage" | "transcript" | "notes">("stage");
  const [resigning, setResigning] = useState(false);
  const [motionPickerOpen, setMotionPickerOpen] = useState(false);

  const botRequestedFor = useRef<string | null>(null);
  const finalizing = useRef(false);
  const recognizer = useRef<Recognizer | null>(null);
  const debateRef = useRef(debate);
  const finalTextRef = useRef(finalText);
  useEffect(() => {
    debateRef.current = debate;
    finalTextRef.current = finalText;
  });

  // ---- Stage derivation ----------------------------------------------------
  let stage: Stage;
  if (!hydrated) stage = "loading";
  else if (!debate || !format) stage = "not-found";
  else if (debate.status === "complete") stage = "redirect";
  else if (debate.status === "abandoned") stage = "abandoned";
  else if (engine!.finished) stage = judgeError ? "judge-failed" : "finishing";
  else if (phase!.kind === "prep") stage = "prep";
  else if (phase!.speaker === debate.userSide) stage = "user-turn";
  else if (
    debate.transcript.some((t) => t.phaseId === phase!.id && t.speaker === "bot")
  )
    stage = "bot-speaking";
  else stage = "bot-thinking";

  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  });

  // ---- Advance -------------------------------------------------------------
  const advance = useCallback((submitSpeech?: string) => {
    const d = debateRef.current;
    if (!d) return;
    const f = getFormat(d.formatId);
    if (!f) return;
    const eng = engineOf(d, f.phases.length);
    if (eng.finished) return;
    const ph = f.phases[eng.phaseIndex];
    let transcript = d.transcript;
    if (submitSpeech !== undefined && ph.kind === "speech") {
      transcript = [
        ...d.transcript,
        {
          phaseId: ph.id,
          phaseName: ph.name,
          speaker: "user",
          side: d.userSide,
          text: submitSpeech.trim() || "(no speech delivered)",
          createdAt: Date.now(),
        } satisfies TranscriptEntry,
      ];
    }
    const { state: next } = endPhaseEarly(f, eng);
    saveDebate({
      ...d,
      transcript,
      phaseIndex: next.phaseIndex,
      phaseRemainingSec: next.remainingSec,
    });
    setFinalText("");
    setInterim("");
    const upcoming = f.phases[next.phaseIndex];
    setAnnounce(
      upcoming
        ? `${upcoming.name}. ${
            upcoming.speaker === d.userSide
              ? "Your turn to speak."
              : upcoming.speaker
                ? `${d.botName} is speaking.`
                : "Preparation time."
          }`
        : "The debate is over. The judge is deliberating."
    );
  }, []);
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });

  // ---- Microphone ----------------------------------------------------------
  const stopListening = useCallback(() => {
    recognizer.current?.stop();
    recognizer.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!sttSupported()) {
      setMicError("unsupported");
      return;
    }
    const rec = createRecognizer({
      onInterim: setInterim,
      onFinal: (text) => {
        setInterim("");
        setFinalText((prev) => (prev ? `${prev} ${text}` : text));
      },
      onError: (err) => {
        setMicError(err === "not-allowed" ? "denied" : err);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!rec) {
      setMicError("unsupported");
      return;
    }
    recognizer.current = rec;
    try {
      rec.start();
      setListening(true);
      setMicError(null);
    } catch {
      setMicError("failed");
    }
  }, []);

  // Auto-listen when the user's speaking phase begins. Deferred a tick so the
  // recogniser starts outside the render/commit path.
  useEffect(() => {
    if (stage !== "user-turn") return;
    const id = setTimeout(() => startListening(), 0);
    return () => {
      clearTimeout(id);
      stopListening();
    };
  }, [stage, startListening, stopListening]);

  // ---- Clock ---------------------------------------------------------------
  const clockRunning =
    stage === "prep" ||
    stage === "user-turn" ||
    stage === "bot-thinking" ||
    stage === "bot-speaking";
  useEffect(() => {
    if (!clockRunning) return;
    const id = setInterval(() => {
      const d = debateRef.current;
      if (!d) return;
      const f = getFormat(d.formatId);
      if (!f) return;
      const eng = engineOf(d, f.phases.length);
      if (eng.finished) return;
      const { state, events } = tickEngine(f, eng);
      for (const ev of events) {
        if (ev.type === "warning-30") setAnnounce("30 seconds remaining.");
        if (ev.type === "warning-10") setAnnounce("10 seconds remaining.");
        if (ev.type === "phase-ended") {
          advanceRef.current(
            stageRef.current === "user-turn" ? finalTextRef.current : undefined
          );
          return;
        }
      }
      saveDebate({ ...d, phaseRemainingSec: state.remainingSec });
    }, 1000);
    return () => clearInterval(id);
  }, [clockRunning]);

  // ---- Redirect completed --------------------------------------------------
  useEffect(() => {
    if (stage === "redirect" && debate) {
      router.replace(`/debate/results/${debate.id}`);
    }
  }, [stage, debate, router]);

  // ---- Bot turn: fetch, then speak -----------------------------------------
  const requestBotTurn = useCallback(async () => {
    const d = debateRef.current;
    if (!d) return;
    const f = getFormat(d.formatId);
    if (!f) return;
    const eng = engineOf(d, f.phases.length);
    if (eng.finished) return;
    const ph = f.phases[eng.phaseIndex];
    const key = `${d.id}:${ph.id}`;
    if (botRequestedFor.current === key) return;
    botRequestedFor.current = key;
    try {
      await new Promise((r) => setTimeout(r, 900));
      const res = await fetch("/api/debate/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debateId: d.id,
          botSlug: d.botSlug,
          motionId: d.motionId,
          botSide: d.userSide === "for" ? "against" : "for",
          phaseId: ph.id,
          difficulty: d.difficulty,
          transcript: d.transcript,
        }),
      });
      if (!res.ok) throw new Error("bot-unavailable");
      const { text } = (await res.json()) as { text: string };
      const latest = debateRef.current;
      if (!latest || latest.phaseIndex !== eng.phaseIndex) return;
      saveDebate({
        ...latest,
        transcript: [
          ...latest.transcript,
          {
            phaseId: ph.id,
            phaseName: ph.name,
            speaker: "bot",
            side: latest.userSide === "for" ? "against" : "for",
            text,
            createdAt: Date.now(),
          },
        ],
      });
      setBotError(false);
    } catch {
      botRequestedFor.current = null;
      setBotError(true);
    }
  }, []);

  useEffect(() => {
    if (stage !== "bot-thinking" || botError) return;
    const id = setTimeout(() => void requestBotTurn(), 0);
    return () => clearTimeout(id);
  }, [stage, botError, requestBotTurn]);

  // Speak the bot's latest line, then move on when the voice finishes.
  useEffect(() => {
    if (stage !== "bot-speaking" || !debate || !phase) return;
    const line = [...debate.transcript]
      .reverse()
      .find((t) => t.phaseId === phase.id && t.speaker === "bot");
    if (!line) return;

    const words = line.text.split(/\s+/).length;
    const fallbackMs = Math.min(30000, Math.max(6000, (words / 2.6) * 1000));
    let advanced = false;
    const go = () => {
      if (advanced) return;
      advanced = true;
      advanceRef.current();
    };
    const timer = setTimeout(go, fallbackMs);

    let handle: { cancel: () => void } | null = null;
    if (ttsSupported() && !muted) {
      handle = speakText(line.text, presentationFor(debate.botSlug).voice, {
        onEnd: () => {
          clearTimeout(timer);
          setTimeout(go, 600);
        },
        onError: () => {
          /* fall back to the timer */
        },
      });
    }
    return () => {
      clearTimeout(timer);
      handle?.cancel();
    };
  }, [stage, debate, phase, muted]);

  useEffect(() => () => stopAllSpeech(), []);

  // ---- Finalise ------------------------------------------------------------
  useEffect(() => {
    if (stage !== "finishing" || finalizing.current) return;
    finalizing.current = true;
    const d = debateRef.current;
    if (!d) return;
    (async () => {
      try {
        const done = await finalizeDebate(d);
        router.replace(`/debate/results/${done.id}`);
      } catch {
        finalizing.current = false;
        setJudgeError(true);
      }
    })();
  }, [stage, router]);

  async function doResign() {
    const d = debateRef.current;
    if (!d) return;
    setResigning(true);
    stopAllSpeech();
    stopListening();
    const done = await resignDebate(d);
    router.replace(`/debate/results/${done.id}`);
  }

  // ---- Render --------------------------------------------------------------
  if (stage === "loading" || stage === "redirect") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="animate-pulse text-fg-muted">Entering the chamber…</p>
      </div>
    );
  }

  if (stage === "not-found" || !debate || !format) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-xl font-bold">Debate not found</p>
        <p className="text-sm text-fg-muted">
          This round doesn&apos;t exist on this device.
        </p>
        <Link href="/home" className={buttonClass("primary", "lg")}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (stage === "abandoned") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-xl font-bold">This debate was abandoned</p>
        <Link href="/debate" className={buttonClass("primary", "lg")}>
          New debate
        </Link>
      </div>
    );
  }

  const userTurn = stage === "user-turn";
  const botSpeaking = stage === "bot-speaking";
  const botSide = debate.userSide === "for" ? "against" : "for";
  const isPractice = !debate.rated;
  const remaining = engine!.finished ? 0 : engine!.remainingSec;
  const phaseDuration = phase?.durationSec ?? 1;
  const warn =
    remaining <= 3 || (remaining <= 10 && phaseDuration > 20)
      ? "hard"
      : remaining <= 30 && phaseDuration > 45
        ? "soft"
        : "none";
  const timerTone =
    warn === "hard" ? "text-danger" : warn === "soft" ? "text-warning" : "text-fg";
  const spokenWords = finalText.split(/\s+/).filter(Boolean).length;
  const botLine =
    [...debate.transcript]
      .reverse()
      .find((t) => phase && t.phaseId === phase.id && t.speaker === "bot")?.text ?? "";
  const coachTip =
    isPractice && FLAGS.coachLiveAssistance && user?.coachSlug
      ? stage === "prep"
        ? "Coach: plan one claim, one mechanism, one impact. Say them out loud once before the round starts."
        : null
      : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-4 border-b border-border-subtle bg-background/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">{debate.motionText}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone={debate.userSide === "for" ? "brand" : "danger"}>
                You argue {debate.userSide === "for" ? "FOR" : "AGAINST"}
              </Badge>
              <Badge>{format.name}</Badge>
              <Badge tone={isPractice ? "info" : "neutral"}>
                {isPractice ? "Practice" : "Rated"}
              </Badge>
              <Badge tone="danger">
                ● {debate.mode === "video" ? "Video" : "Audio"}
              </Badge>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className={`numeric text-3xl font-black leading-none ${timerTone}`}>
              {formatClock(remaining)}
            </p>
            <p className="mt-0.5 text-xs text-fg-muted">{phase?.name ?? "Judging"}</p>
          </div>
        </div>
        <div className="mt-2">
          <ProgressBar value={overallProgress(format, engine!)} />
        </div>
      </header>

      <p aria-live="polite" className="sr-only">{announce}</p>

      {/* Speakers */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div
          className={`rounded-2xl p-3 text-center text-ink transition-all ${
            userTurn
              ? "bg-white shadow-lg ring-2 ring-brand"
              : "bg-board-2/90"
          }`}
        >
          <UserFace size={64}
            className="mx-auto"
            speaking={userTurn && listening}
          />
          <p className="mt-1 truncate text-sm font-bold">
            {user?.displayName ?? "You"}
          </p>
          <p className="text-xs text-ink-muted">
            {debate.userSide === "for" ? "For" : "Against"} ·{" "}
            {userTurn ? (listening ? "🎙 Live" : "Mic off") : "Listening"}
          </p>
        </div>
        <div
          className={`rounded-2xl p-3 text-center text-ink transition-all ${
            botSpeaking || stage === "bot-thinking"
              ? "bg-white shadow-lg ring-2 ring-brand"
              : "bg-board-2/90"
          }`}
        >
          <BotFace
            slug={debate.botSlug}
            name={debate.botName}
            size={64}
            className="mx-auto"
            speaking={botSpeaking}
          />
          <p className="mt-1 truncate text-sm font-bold">{debate.botName}</p>
          <p className="text-xs text-ink-muted">
            {botSide === "for" ? "For" : "Against"} ·{" "}
            {stage === "bot-thinking"
              ? "Thinking…"
              : botSpeaking
                ? "Speaking"
                : "Listening"}
          </p>
        </div>
      </div>

      {/* Panels */}
      <div className="mt-4 flex gap-1 rounded-xl bg-surface-1 p-1" role="tablist">
        {(["stage", "transcript", "notes"] as const).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={panel === p}
            onClick={() => setPanel(p)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
              panel === p ? "bg-surface-3 text-fg" : "text-fg-muted"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1">
        {panel === "transcript" && (
          <div className="space-y-2">
            {debate.transcript.length === 0 ? (
              <p className="text-sm text-fg-muted">Nothing said yet.</p>
            ) : (
              debate.transcript.map((t, i) => (
                <div key={i} className="rounded-xl bg-surface-1 p-3 text-sm">
                  <p className="text-xs font-semibold text-fg-muted">
                    {t.phaseName} ·{" "}
                    {t.speaker === "user" ? user?.displayName ?? "You" : debate.botName}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{t.text}</p>
                </div>
              ))
            )}
          </div>
        )}

        {panel === "notes" && (
          <textarea
            value={debate.notes}
            onChange={(e) => saveDebate({ ...debate, notes: e.target.value })}
            placeholder="Private scratchpad — never shown to the judge or your opponent."
            aria-label="Private notes"
            className="min-h-48 w-full rounded-xl border border-border-subtle bg-surface-1 p-3 text-sm outline-none focus:border-brand"
          />
        )}

        {panel === "stage" && (
          <>
            {stage === "prep" && motion && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border-subtle bg-surface-1 p-4">
                  <p className="text-sm font-bold">Preparation</p>
                  <p className="mt-1 text-sm text-fg-muted">
                    {motion.suggestedDefinitions}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">
                      Your side ({debate.userSide}):
                    </span>{" "}
                    {debate.userSide === "for"
                      ? motion.forContext
                      : motion.againstContext}
                  </p>
                  <details className="mt-3 text-sm text-fg-muted">
                    <summary className="cursor-pointer font-medium text-fg">
                      Beginner framework
                    </summary>
                    <p className="mt-2">
                      Claim → Mechanism → Example → Impact → Comparison.
                    </p>
                  </details>
                </div>
                {coachTip && (
                  <p className="rounded-xl border border-info/30 bg-info/10 p-3 text-sm">
                    {coachTip}
                  </p>
                )}
                {!sttSupported() && (
                  <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
                    <strong>Microphone unavailable.</strong> This browser
                    doesn&apos;t support live speech recognition, so your speeches
                    can&apos;t be captured. Debates.ch is audio-only — try Chrome
                    or Edge to debate.
                  </p>
                )}
                <textarea
                  value={debate.notes}
                  onChange={(e) => saveDebate({ ...debate, notes: e.target.value })}
                  placeholder="Sketch your case here…"
                  aria-label="Preparation notes"
                  className="min-h-32 w-full rounded-xl border border-border-subtle bg-surface-1 p-3 text-sm outline-none focus:border-brand"
                />
                {/* Motion controls stay available right up until prep ends. */}
                <div className="rounded-2xl border border-border-subtle bg-surface-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">Not feeling this motion?</p>
                    <button
                      type="button"
                      onClick={() => setMotionPickerOpen(!motionPickerOpen)}
                      className={buttonClass("secondary", "sm")}
                    >
                      {motionPickerOpen ? "Close" : "Change motion"}
                    </button>
                  </div>
                  {motionPickerOpen && (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          const s = getState();
                          const down = Object.entries(s.motionVotes)
                            .filter(([, v]) => v === "down")
                            .map(([id]) => id);
                          const next = drawMotionWithPrefs(
                            [debate.motionId],
                            s.motionPrefs,
                            down
                          );
                          saveDebate({
                            ...debate,
                            motionId: next.id,
                            motionText: next.text,
                          });
                        }}
                        className={`${buttonClass("primary", "md")} w-full`}
                      >
                        🎲 Draw a different motion
                      </button>
                      <select
                        value={debate.motionId}
                        onChange={(e) => {
                          const m = getAllMotions().find((x) => x.id === e.target.value);
                          if (m) {
                            saveDebate({ ...debate, motionId: m.id, motionText: m.text });
                          }
                        }}
                        aria-label="Pick a motion"
                        className="w-full rounded-xl border border-border-subtle bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-brand"
                      >
                        {getAllMotions().map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.category} · {m.text.slice(0, 60)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-fg-faint">
                        Topic and difficulty preferences live in Settings.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => advance()}
                  className={buttonClass("primary", "lg")}
                >
                  I&apos;m ready — start the debate
                </button>
              </div>
            )}

            {userTurn && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-brand/50 bg-surface-1 p-4 text-center">
                  <button
                    type="button"
                    onClick={() => (listening ? stopListening() : startListening())}
                    aria-pressed={listening}
                    className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-3xl transition-all ${
                      listening
                        ? "bg-danger text-white shadow-[0_0_0_10px_rgba(224,97,79,0.18)]"
                        : "bg-surface-3 text-fg-muted"
                    }`}
                  >
                    🎙
                  </button>
                  <p className="mt-2 text-sm font-bold">
                    {listening ? "Listening — speak your case" : "Microphone paused"}
                  </p>
                  <p className="numeric text-xs text-fg-muted">
                    {spokenWords} words captured
                  </p>
                </div>

                {micError && (
                  <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
                    <p className="font-semibold">
                      {micError === "denied"
                        ? "Microphone permission denied"
                        : micError === "unsupported"
                          ? "Speech recognition unavailable"
                          : "Microphone problem"}
                    </p>
                    <p className="mt-1 text-fg-muted">
                      {micError === "denied"
                        ? "Allow microphone access in your browser's address bar, then press the mic again."
                        : "Debates are audio-only. Chrome or Edge support live speech capture."}
                    </p>
                  </div>
                )}

                {captionsOn && (finalText || interim) && (
                  <div className="rounded-xl bg-surface-1 p-3 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-fg-muted">
                      Live captions
                    </p>
                    <p className="mt-1">
                      {finalText}{" "}
                      <span className="text-fg-faint">{interim}</span>
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    advance(finalText);
                  }}
                  className={`${buttonClass("primary", "md")} w-full`}
                >
                  End speech
                </button>
              </div>
            )}

            {stage === "bot-thinking" && !botError && (
              <div className="rounded-2xl border border-border-subtle bg-surface-1 p-6 text-center">
                <p className="animate-pulse text-sm text-fg-muted">
                  {debate.botName} is preparing their {phase!.name.toLowerCase()}…
                </p>
              </div>
            )}

            {stage === "bot-thinking" && botError && (
              <div className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-center">
                <p className="font-semibold">Bot temporarily unavailable</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBotError(false)}
                    className={buttonClass("primary", "md")}
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => advance()}
                    className={buttonClass("secondary", "md")}
                  >
                    Skip phase
                  </button>
                </div>
              </div>
            )}

            {botSpeaking && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border-subtle bg-surface-1 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-fg-muted">
                      {debate.botName} · {phase!.name}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-brand">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                      speaking
                    </span>
                  </div>
                  {captionsOn && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {botLine}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stopAllSpeech();
                    advance();
                  }}
                  className={buttonClass("secondary", "md")}
                >
                  Skip ahead
                </button>
              </div>
            )}

            {stage === "finishing" && (
              <div className="rounded-2xl border border-border-subtle bg-surface-1 p-8 text-center">
                <p className="animate-pulse font-semibold">
                  The judge is weighing the round…
                </p>
              </div>
            )}

            {stage === "judge-failed" && (
              <div className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-center">
                <p className="font-semibold">Judgement delayed</p>
                <button
                  type="button"
                  onClick={() => setJudgeError(false)}
                  className={`${buttonClass("primary", "md")} mt-3`}
                >
                  Retry judgement
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCaptionsOn(!captionsOn)}
            aria-pressed={captionsOn}
            className={buttonClass(captionsOn ? "secondary" : "ghost", "sm")}
          >
            CC
          </button>
          <button
            type="button"
            onClick={() => {
              setMuted(!muted);
              if (!muted) stopAllSpeech();
            }}
            aria-pressed={muted}
            className={buttonClass(muted ? "secondary" : "ghost", "sm")}
          >
            {muted ? "🔇 Voice off" : "🔊 Voice on"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setLeaving(true)}
          className={buttonClass("ghost", "sm")}
        >
          Resign
        </button>
      </footer>

      {/* Resign confirmation — deliberately discouraging */}
      {leaving && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-1 p-6">
            <p className="text-lg font-black">Resign the round?</p>
            <p className="mt-2 text-sm text-fg-muted">
              {debate.botName} takes the win
              {debate.rated ? " and you lose 0.09 OVR" : ""}. Rounds are won from
              behind more often than you&apos;d think — the closing speech exists
              for exactly this moment.
            </p>
            <p className="mt-2 text-xs text-fg-faint">
              Finishing every round, win or lose, is what good sportsmanship
              looks like here.
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => setLeaving(false)}
                className={buttonClass("primary", "lg")}
              >
                Keep debating
              </button>
              <button
                type="button"
                disabled={resigning}
                onClick={doResign}
                className={buttonClass("danger", "md")}
              >
                {resigning ? "Resigning…" : "Resign anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
