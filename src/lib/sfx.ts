"use client";

/**
 * Short feedback tones synthesised with the Web Audio API — no audio files to
 * ship or licence. A rising two-note chime for correct, a low buzz for wrong.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  // Browsers start the context suspended until a user gesture.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 0.18
) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startAt);
  // Quick attack, smooth decay — avoids the click of a hard stop.
  gain.gain.setValueAtTime(0.0001, c.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(peak, c.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    c.currentTime + startAt + duration
  );
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + startAt);
  osc.stop(c.currentTime + startAt + duration + 0.02);
}

/** Bright ascending chime. */
export function playCorrect() {
  tone(660, 0, 0.16);
  tone(880, 0.1, 0.22);
  tone(1320, 0.2, 0.28, "sine", 0.12);
}

/** Low, short buzz — clearly negative without being harsh. */
export function playWrong() {
  tone(200, 0, 0.22, "sawtooth", 0.1);
  tone(150, 0.12, 0.26, "sawtooth", 0.08);
}

/** Soft tick used when a timed prompt is running out. */
export function playTick() {
  tone(520, 0, 0.05, "square", 0.05);
}
